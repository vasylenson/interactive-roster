import {
    repeat,
    type Assignment,
    type LockedSchedule,
    type Person,
    type Task,
} from './schedule';

export type Config = {
    people: Person[];
    tasks: Task[];
    // startDate: Date;
    numWeeks: number;
    lockedSchedule: LockedSchedule;
};

let stateCache: Config | null = null;
const key = 'app:config';

export function read() {
    if (!stateCache) refresh();
    console.log({ stateCache });
    return stateCache as Config;
}

export function refresh() {
    const stateString = localStorage.getItem(key);
    stateCache = stateString
        ? (JSON.parse(stateString) as Config)
        : defaultState();
}

export function write(state: Config) {
    stateCache = state;
    localStorage.setItem(key, JSON.stringify(stateCache));
}

export function clear() {
    stateCache = null;
    localStorage.removeItem(key);
}

function defaultState(): Config {
    return {
        people: [
            'Eva',
            'Gabriele',
            'Ivo',
            'Meera',
            'Marko',
            'Lucas',
            'Gilles',
            'Estephania',
            'Dimitra',
            'Danai',
            'Kris',
            'Alex',
            'Michelle',
            'Diego',
        ],
        tasks: [
            { name: 'Living Room', people: 2, kind: repeat.weekly },
            { name: 'Toilets', people: 1, kind: repeat.weekly },
            { name: 'Bathroom', people: 1, kind: repeat.weekly },
            { name: 'Showers', people: 1, kind: repeat.weekly },
            { name: 'Hallways', people: 1, kind: repeat.weeklyWithMonthly },
            { name: 'Kitchen', people: 3, kind: repeat.monthly },
            { name: 'Laundry Room', people: 1, kind: repeat.monthly },
        ] as Task[],
        lockedSchedule: new Map(),
        numWeeks: 27,
    } as unknown as Config;
}
