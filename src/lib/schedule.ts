type Item<TRecord> = TRecord[keyof TRecord];

export const repeat = {
    weekly: 'weekly',
    monthly: 'monthly',
    weeklyWithMonthly: 'weekly and monthly',
} as const;

export type Repeat = Item<typeof repeat>;

export type Task = {
    name: string;
    people: number;
    kind: Repeat;
};

type Week = {
    /** Monday of this week. */
    date: Date;
    tasks: Record<string, string[] | null>;
};

export type Counter = {
    timesDone: number;
    weeksSinceDone: number;
};

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
export function nextWeekTasks(people: readonly string[], tasks: readonly Task[], counters: Counters) {
    const availablePeople = new Set(people);
    const assignments = {} as Record<string, string[]>;

    for (const task of tasks) {
        const candidates = Array.from(availablePeople).map((person) => [person, score(person, task, counters)] as const)
            .sort(([_1, s1], [_2, s2]) => s1 - s2)
            .map(([person]) => person)
            .slice(0, task.people + 0 /** TODO: refactor to have a parameterized random spread */);

        // const seed = randomIntFromCounters(counters);
        // candidates.splice(seed % candidates.length, 1);
        assignments[task.name] = candidates;
        
        for (const candidate of candidates) {
            availablePeople.delete(candidate);
        }
    }

    updateCounters(assignments, counters);

    return assignments;
}

export function updateCounters(assignments: Record<string, string[]>, counters: Counters) {
    for (const task in assignments) {
        for (const person of assignments[task]) {
            const counter = counters[task][person];
            counter.weeksSinceDone = 1;
            counter.timesDone++;
        }
    }
}

function score(person: string, task: Task, counters: Counters) {
    let { timesDone, weeksSinceDone } = counters[task.name][person];
    const weeksSinceDoneAnyTask = Object.values(counters)
        .map((counter) => counter[person].weeksSinceDone)
        .reduce(min);

    if (task.kind === repeat.monthly) {
        weeksSinceDone /= 8;
        timesDone *= 2;
    }

    return (timesDone - weeksSinceDone * weeksSinceDone) * weeksSinceDoneAnyTask;
}

function randomIntFromCounters(counters: Counters) {
    let sum = 7;

    for (const task in counters) {
        for (const person in counters[task]) {
            const { timesDone, weeksSinceDone } = counters[task][person];
            sum += timesDone % weeksSinceDone;
        }
    }

    return sum;
}

const min = (a: number, b: number) => a < b ? a : b;