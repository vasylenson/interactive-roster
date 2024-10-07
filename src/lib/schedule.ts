import { permute, subsetsOf } from "./random";

export type Assignment = { [task: TaskName]: Person[] };

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

type Counters = Record<TaskName, Record<Person, Counter>>;

export function initCounters(people: readonly Person[], tasks: readonly TaskName[]) {
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
export function nextWeekTasks(
    people: readonly Person[],
    tasks: readonly Task[],
    counters: Counters,
    heuristic: Heuristic = score,
    scoreCombo: ScoreCombo = scorePeopleCombination,
) {
    function getCandidates(spread: number = 3) {
        const candidates: Record<TaskName, [Person, number][]> = {};
        for (const task of tasks) {
            candidates[task.name] = Array.from(permute(people))
                .map((person) => [person, heuristic(person, task, counters)] as [Person, number])
                .sort(([_1, score1], [_2, score2]) => score1 - score2)
                .slice(0, task.people + 4);
        }
        return candidates;
    }

    for (const spread of [2, 5, 7]) {
        const candidates = getCandidates(spread);
        function* makeAssignments(
            current: Assignment,
            currentScore: number,
            tasks: readonly Task[],
            people: Set<Person>
        ): Generator<[Assignment, number]> {
            if (tasks.length === 0) {
                yield [current, currentScore] as const;
                return;
            }

            const [task, ...remainingTasks] = tasks;
            for (const peopleAndScores of subsetsOf(task.people, candidates[task.name])) {
                const assignees = peopleAndScores.map(left);
                const score = peopleAndScores.map(right).reduce(add) + scoreCombo(assignees);

                const assigneesSet = new Set(assignees);
                if (!people.isSupersetOf(assigneesSet)) continue; // if some people are already assigned 

                const next = {...current, [task.name]: assignees};
                const remainingPeople = people.difference(assigneesSet);

                yield* makeAssignments(next, currentScore + score, remainingTasks, remainingPeople)
            }
        }

        let minScore = Infinity;
        let bestAssignment = null;
        let count = 0;
        for (const [assignment, score] of makeAssignments({}, 0, tasks, new Set(people))) {
            if (score < minScore) {
                minScore = score;
                bestAssignment = assignment;
            }
            count++;
        }

        console.log({ count });
        
        if (bestAssignment === null) continue;

        updateCounters(counters, bestAssignment);

        return bestAssignment;
    }

    throw new Error("Could not choose anything");
}

function updateCounters(counters: Counters, assignment: Assignment) {
    for (const [taskName, people] of Object.entries(assignment)) {
        for (const person of people) {
            const counter = counters[taskName as TaskName][person];
            counter.timesDone++;
            counter.weeksSinceDone = 0;
        }
    }

    // pass a week for all counters
    for (const taskCounters of Object.values(counters)) {
        for (const counter of Object.values(taskCounters)) {
            counter.weeksSinceDone++;
        }
    }
}


/**
 * A function that assigns a score to a person and a task based on counters.
 * The higher the score the less likely the person will have to do the task.
 */
type Heuristic = (person: Person, task: Task, counters: Counters) => number;


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

    const a = weeksSinceDone < 7 ? 5 : 2 / weeksSinceDone;
    const b = timesDone < 5 ? 3 : 1 / timesDone;
    const c = weeksSinceDoneAnyTask < 2 ? 10 : weeksSinceDoneAnyTask < 3 ? 3 : 1 / weeksSinceDoneAnyTask;

    // console.log({ score: 1 + a * b + c });

    return 1 + a * b * c;
};

type ScoreCombo = (people: Person[]) => number;

const scorePeopleCombination: ScoreCombo = (_) => 0;

const min = (a: number, b: number) => a < b ? a : b;

const add = (a: number, b: number) => a + b;

const left = <T>([l, _]: [T, unknown]) => l;

const right = <T>([_, r]: [unknown, T]) => r;