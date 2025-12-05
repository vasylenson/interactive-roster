import { permute, seed, subsetsOf } from './random';

class Bag<K, V> extends Map<K, V[]> {
    add(key: K, value: V) {
        let entry = this.get(key);
        if (!entry) this.set(key, (entry = []));
        entry.push(value);
    }

    getItems(key: K) {
        return this.get(key) || [];
    }
}

class Week {
    private readonly monday: Date;

    /**
     * @param monday a date string of a format `mm-dd-yyyy`.
     * The Weed.id has the same format, so can be used to re-construct a week.
     */
    constructor(monday: string | Date) {
        this.monday = new Date(monday);
    }

    static from(week: string | Week) {
        return typeof week === 'string' ? new Week(week) : week;
    }

    /** Mutate the week to be the week after. */
    increment() {
        this.monday.setDate(this.monday.getDate() + 7);
        return this;
    }

    is(other: string | Week) {
        return Week.from(other).id === this.id;
    }

    copy() {
        return new Week(this.id);
    }

    /**
     * The week after this one.
     */
    get next() {
        return this.copy().increment();
    }

    /** Date string of the monday of this week formatted */
    get id() {
        const day = ('0' + this.monday.getDate()).slice(-2);
        const month = ('0' + (this.monday.getMonth() + 1)).slice(-2);
        const year = this.monday.getFullYear();
        return `${month}-${day}-${year}`;
    }

    /**
     * The week is at the start of the month if it contains the first monday of the month.
     */
    get isStartOfMonth() {
        return this.monday.getDate() <= 7;
    }

    get date() {
        return new Date(this.monday);
    }
}

if (window) {
    (window as any).Week = Week;
}

export type LockedSchedule = Map<string, Assignment>;

export class Schedule {
    private weeks: LockedSchedule;
    private people: Person[];
    private tasks: Task[];
    readonly startDate: Week;
    private leaves: Bag<string, Person>;
    private entrances: Bag<string, Person>;
    private pauses: Bag<string, Person>;
    private skippedWeeks: Set<Week['id']>;

    constructor(startDate: string | Date, people: Person[], tasks: Task[]) {
        this.startDate = new Week(startDate);
        this.people = people;
        this.tasks = tasks;
        this.weeks = new Map();
        this.leaves = new Bag();
        this.entrances = new Bag();
        this.pauses = new Bag();
        this.skippedWeeks = new Set();
    }

    lock(assignments: LockedSchedule) {
        for (const entry of assignments.entries()) this.weeks.set(...entry);
    }

    leave(person: Person, week: string | Week) {
        this.leaves.add(Week.from(week).id, person);
        return this;
    }

    enter(person: Person, week: string | Week) {
        this.entrances.add(Week.from(week).id, person);
    }

    pause(person: Person, week: string | Week, numWeeks: number) {
        week = Week.from(week).copy();
        for (numWeeks; numWeeks > 0; numWeeks--) {
            this.pauses.add(Week.from(week).id, person);
            week.increment();
        }
        return this;
    }

    skipWeek(week: string | Week, numWeeks = 1) {
        const weekObj = Week.from(week).copy();
        for (const _ in new Array(numWeeks).fill(null)) {
            this.skippedWeeks.add(weekObj.id);
            weekObj.increment();
        }
        return this;
    }

    availablePeople(week: string | Week, people?: Person[]) {
        const paused = this.pauses.getItems(Week.from(week).id);
        return (people ?? this.people).filter((person) => {
            return !paused.includes(person);
        });
    }

    /**
     * Iterate through the weeks of the schedule, starting at the start date,
     * and generating new weeks on demand indefinitely.
     */
    assignments() {
        const generator = function* (
            startDate: Week,
            lockedSchedule: LockedSchedule,
            people: Person[],
            tasks: Task[],
            schedule: Schedule
        ) {
            let counters = initCounters(people, names(tasks));
            let monday = startDate.copy();

            seed(91231242333);

            for (let weekNum = 0; true; weekNum++) {
                try {
                    //TODO: process changes

                    const leaves = schedule.leaves.getItems(monday.id);
                    people = people.filter((p) => !leaves.includes(p));

                    const entrances = schedule.entrances.getItems(monday.id);
                    for (const entrance of entrances) {
                        people.push(entrance);
                        addPerson(entrance, counters);
                    }

                    if (schedule.skippedWeeks.has(monday.id)) {
                        monday.increment();
                        continue;
                    }

                    // assign
                    const assignment =
                        lockedSchedule.get(monday.id) ??
                        nextWeekTasks(
                            schedule.availablePeople(monday.id, people),
                            monday.isStartOfMonth ? tasks : weekly(tasks),
                            counters
                        );

                    if (assignment) updateCounters(counters, assignment);

                    yield [
                        monday.date,
                        tasks.map(({ name }) => assignment[name] ?? []),
                    ] as [Date, string[][]];
                    monday.increment();
                } catch (e) {
                    console.log(e);
                    return;
                }
            }
        };

        return generator(
            this.startDate,
            this.weeks,
            this.people,
            this.tasks,
            this
        );
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
 * @param counters are not mutated
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
        const sortedTasks = tasks.toSorted(
            (a, b) => taskWeight(a) - taskWeight(b)
        );
        const generator = makeAssignments({}, 0, sortedTasks, new Set(people));
        for (const [assignment, score] of generator) {
            if (score < minScore) {
                minScore = score;
                bestAssignment = assignment;
            }
            count++;
        }

        if (bestAssignment === null) continue;

        return bestAssignment;
    }

    throw new Error('Could not choose anything');
}

function taskWeight(task: Task) {
    return +(task.kind === repeat.monthly) + task.people * 2;
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
        weeksSinceDone /= 6;
        timesDone *= 10;
    }

    const a = weeksSinceDone < 7 ? 5 : 2 / weeksSinceDone;
    const b = timesDone < 5 ? 3 : 1 / timesDone;
    const c =
        weeksSinceDoneAnyTask < 2
            ? 10
            : weeksSinceDoneAnyTask < 3
            ? 3
            : 1 / weeksSinceDoneAnyTask;

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
        not('Marko', 'Alex') +
        not('Marko', 'Michelle')
    );
};

const min = (a: number, b: number) => (a < b ? a : b);

const add = (a: number, b: number) => a + b;

const left = <T>([l, _]: [T, unknown]) => l;

const right = <T>([_, r]: [unknown, T]) => r;
