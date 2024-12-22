import { addWeek, isStartOfMonth } from './date';
import { permute, seed, subsetsOf } from './random';

export class Schedule {
    private weeks: Assignment[];
    private people: Person[];
    private tasks: Task[];
    readonly startDate: Date;

    constructor(startDate: Date, people: Person[], tasks: Task[]) {
        this.startDate = startDate;
        this.people = people;
        this.tasks = tasks;
        this.weeks = [];
    }

    pushWeek(assignment: Assignment) {
        this.weeks.push(assignment);
    }

    lock(assignments: Assignment[]) {
        for (const assignment of assignments) this.pushWeek(assignment);
    }

    get endDate() {
        const endDate = new Date();
        endDate.setDate(this.startDate.getDate() + 7 * this.weeks.length);
        return endDate;
    }

    /**
     * Iterate through the weeks of the schedule, starting at the start date,
     * and generating new weeks on demand indefinitely.
     */
    assignments() {
        const generator = function* (lockedSchedule: Assignment[], people: Person[], tasks: Task[]) {
            let counters = initCounters(people, names(tasks));
            let date = new Date('09-02-2024');
            console.log({ date });
            seed(912312423333);

            for (const week of lockedSchedule) {
                yield [date, tasks.map(({ name }) => week[name] ?? [])] as [
                    Date,
                    string[][]
                ];
                updateCounters(counters, week);
                addWeek(date);
                console.log({ date });
            }

            for (let weekNum = lockedSchedule.length; true; weekNum++)
                try {
                    if (date.toString() === new Date('12-02-2024').toString()) {
                        const ivo = 'Ivo' as Person;
                        people = people.filter((person) => person != 'Marlou');
                        people.push(ivo);
                        addPerson(ivo, counters);
                    }

                    let pool =
                        weekNum > 5 && weekNum < 10
                            ? people.filter((person) => person != 'Alex')
                            : people;
                    pool =
                        weekNum == 6
                            ? exclude(pool, ['Estephania'] as Person[])
                            : pool;

                    const assignment = nextWeekTasks(
                        pool,
                        isStartOfMonth(date) ? tasks : weekly(tasks),
                        counters
                    );
                    yield [
                        new Date(date),
                        tasks.map(({ name }) => assignment[name] ?? []),
                    ] as [Date, string[][]];
                    addWeek(date);
                } catch (e) {
                    console.log(e);
                    return;
                }
        };

        return generator(this.weeks, this.people, this.tasks);
    }
}

export const names = (tasks: Task[]) => tasks.map(({ name }) => name);

const weekly = (tasks: Task[]) =>
    tasks.filter(({ kind }) => kind !== repeat.monthly);

const exclude = (people: readonly Person[], excluded: Person[]) =>
    people.filter((person) => !excluded.includes(person));

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

type Counters = Record<TaskName, Record<Person, Counter>>;

export function initCounters(
    people: readonly Person[],
    tasks: readonly TaskName[]
) {
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
    scoreCombo: ScoreCombo = scorePeopleCombination
) {
    function getCandidates(spread: number = 3) {
        const candidates: Record<TaskName, [Person, number][]> = {};
        for (const task of tasks) {
            candidates[task.name] = Array.from(permute(people))
                .map(
                    (person) =>
                        [person, heuristic(person, task, counters)] as [
                            Person,
                            number
                        ]
                )
                .sort(([_1, score1], [_2, score2]) => score1 - score2)
                .slice(0, task.people + spread);
        }
        return candidates;
    }

    for (const spread of [3, 5, 7]) {
        const candidates = getCandidates(spread);
        // console.log({ candidates });
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
            for (const peopleAndScores of subsetsOf(
                task.people,
                candidates[task.name]
            )) {
                const assignees = peopleAndScores.map(left);
                const score =
                    peopleAndScores.map(right).reduce(add) +
                    scoreCombo(assignees);

                const assigneesSet = new Set(assignees);
                if (!people.isSupersetOf(assigneesSet)) continue; // if some people are already assigned

                const next = { ...current, [task.name]: assignees };
                const remainingPeople = people.difference(assigneesSet);

                yield* makeAssignments(
                    next,
                    currentScore + score,
                    remainingTasks,
                    remainingPeople
                );
            }
        }

        let minScore = Infinity;
        let bestAssignment = null;
        let count = 0;
        for (const [assignment, score] of makeAssignments(
            {},
            0,
            tasks,
            new Set(people)
        )) {
            if (score < minScore) {
                minScore = score;
                bestAssignment = assignment;
            }
            count++;
        }

        // console.log({ count });

        if (bestAssignment === null) continue;

        updateCounters(counters, bestAssignment);

        return bestAssignment;
    }

    throw new Error('Could not choose anything');
}

export function updateCounters(counters: Counters, assignment: Assignment) {
    for (const [taskName, people] of Object.entries(assignment)) {
        for (const person of people) {
            const counter = counters[taskName as TaskName][person];

            if (!counter) {
                console.error(
                    `No counter for ${taskName} by ${person}, skipping`
                );
                continue;
            }
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

export function addPerson(person: Person, counters: Counters) {
    for (const [taskName, taskCounters] of Object.entries(counters)) {
        const individualCounters = Object.values(taskCounters);
        const numPeople = individualCounters.length;

        let timesDone = 0;
        for (const counter of individualCounters) {
            timesDone += counter.timesDone;
        }

        timesDone = Math.floor(timesDone / numPeople);

        counters[taskName as TaskName][person] = {
            timesDone,
            weeksSinceDone: numPeople,
        };
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
    const timeTaskDoneAverage =
        Object.values(counters[task.name])
            .map(({ timesDone }) => timesDone)
            .reduce(add) / numPeople;

    timesDone -= timeTaskDoneAverage;

    if (task.kind === repeat.monthly) {
        weeksSinceDone /= 4;
        timesDone *= 2;
    }

    const a = weeksSinceDone < 7 ? 5 : 2 / weeksSinceDone;
    const b = timesDone < 5 ? 3 : 1 / timesDone;
    const c =
        weeksSinceDoneAnyTask < 2
            ? 10
            : weeksSinceDoneAnyTask < 3
            ? 3
            : 1 / weeksSinceDoneAnyTask;

    // console.log({ score: 1 + a * b + c });

    return 1 + a * b * c;
};

type ScoreCombo = (people: Person[]) => number;

const scorePeopleCombination: ScoreCombo = (people) => {
    const not = (one: string, other: string) =>
        people.includes(one as Person) && people.includes(other as Person)
            ? 100000
            : 0;

    return (
        not('Marko', 'Diego') +
        not('Marko', 'Marlou') +
        not('Marko', 'Michelle') +
        not('Marko', 'Estephania') +
        not('Olga', 'Marlou') +
        not('Olga', 'Michelle')
    );
};

const min = (a: number, b: number) => (a < b ? a : b);

const add = (a: number, b: number) => a + b;

const left = <T>([l, _]: [T, unknown]) => l;

const right = <T>([_, r]: [unknown, T]) => r;
