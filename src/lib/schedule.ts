import { hash, sample, subsetsOf } from "./random";

export type Assignment = Record<TaskName, Person[]>;

type Item<TRecord> = TRecord[keyof TRecord];

export const repeat = {
    weekly: 'weekly',
    monthly: 'monthly',
    weeklyWithMonthly: 'weekly and monthly',
} as const;

export type Repeat = Item<typeof repeat>;

export type Task = {
    name: TaskName;
    people: number;
    kind: Repeat;
};

export type Counter = {
    timesDone: number;
    weeksSinceDone: number;
};

const BrandPerson = Symbol('Brand: person');
export type Person = string & { _brand: typeof BrandPerson };

const BrandTaskName = Symbol('Brand: task name');
export type TaskName = string & { _brand: typeof BrandTaskName };

type Counters = Record<string, Record<string, Counter>>;

export function initCounters(people: readonly string[], tasks: readonly string[]) {
    const counters: Counters = {};
    for (const taskName of tasks) {
        counters[taskName] = {};
        for (const person of people) {
            counters[taskName][person] = {
                timesDone: 0,
                weeksSinceDone: 100,
            };
        }
    }
    return counters;
}

/**
 * 
 * @param people considered in the selection. Don't have to be all the people mentioned in counters.
 * @param tasks 
 * @param counters are mutated
 * @returns the record of tasks to arrays of assigned people.
 */
export function nextWeekTasks(people: readonly Person[], tasks: readonly Task[], counters: Counters, heuristic: Heuristic = score) {
    const candidates: Record<TaskName, [Person, number][]> = {};
    for (const task of tasks) {
        candidates[task.name] = Array.from(people)
            .map((person) => [person, heuristic(person, task, counters)] as [Person, number])
            .sort(([_1, score1], [_2, score2]) => score1 - score2)
            .slice(0, task.people + 3);
    }

    function scorePeopleCombination(people: Person[]) {
        return 0;
    }

    function* makeAssignments(current: Assignment, currentScore: number, tasks: Task[], people: Set<Person>): Generator<Assignment> {
        if (tasks.length === 0) {
            yield current;
            return;
        }

        const [task, ...remainingTasks] = tasks;
        for (const peopleAndScores of subsetsOf(task.people, candidates[task.name])) {
            const assignees = peopleAndScores.map(left);
            const score = peopleAndScores.map(right).reduce(add) + scorePeopleCombination(assignees);

            const next = {...current, [task.name]: assignees};
            const remainingPeople = people.difference(new Set(assignees));

            yield* makeAssignments(next, currentScore + score, remainingTasks, remainingPeople)
        }
    }

    const assignments: [Record<TaskName, Person[]>, number][] = [];
    for (const task of tasks) {
        candidates[task.name];
    }

    // console.log({ assignments });

    return assignments[0][0];
}


/**
 * A function that assigns a score to a person and a task based on counters.
 * The higher the score the less likely the person will have to do the task.
 */
type Heuristic = (person: string, task: Task, counters: Counters) => number;


const score: Heuristic = (person, task, counters) => {
    let { timesDone, weeksSinceDone } = counters[task.name][person];
    const weeksSinceDoneAnyTask = Object.values(counters)
        .map((counter) => counter[person].weeksSinceDone)
        .reduce(min);

    const numPeople = Object.values(counters[task.name]).length;

    const timeTaskDoneAverage = Object.values(counters[task.name])
        .map(({ timesDone }) => timesDone)
        .reduce(add) / numPeople;

    timesDone -= timeTaskDoneAverage;

    if (task.kind === repeat.monthly) {
        weeksSinceDone /= 4;
        timesDone *= 2;
    }

    const timesDoneMultiplier = timesDone >= 2 ? 0 : (8 - timesDone * 4);

    console.log(`Times done multiplier ${timesDoneMultiplier} for ${task.name} for ${person}`)
    const anyTaskMultiplier = weeksSinceDone < 2 ? 0.3 : (weeksSinceDone / 4);

    return 1 + 10 * weeksSinceDone * timesDoneMultiplier * anyTaskMultiplier;
};

function randomIntFromCounters(counters: Counters) {
    let numbers = [];

    for (const task in counters) {
        for (const person in counters[task]) {
            const { timesDone, weeksSinceDone } = counters[task][person];
            numbers.push(timesDone);
            numbers.push(weeksSinceDone);
        }
    }

    return hash(numbers);
}

const min = (a: number, b: number) => a < b ? a : b;

const add = (a: number, b: number) => a + b;

const left = <T>([l, _]: [T, unknown]) => l;

const right = <T>([_, r]: [unknown, T]) => r;