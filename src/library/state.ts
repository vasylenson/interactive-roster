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
        lockedSchedule: new Map(lo),
        numWeeks: 27,
    } as unknown as Config;
}

const lo = [
    [
        '09-01-2025',
        {
            Toilets: ['Kris'],
            Bathroom: ['Gilles'],
            Showers: ['Eva'],
            Hallways: ['Diego'],
            'Laundry Room': ['Estephania'],
            'Living Room': ['Dimitra', 'Lucas'],
            Kitchen: ['Marko', 'Danai', 'Ivo'],
        },
    ],
    [
        '09-08-2025',
        {
            Toilets: ['Michelle'],
            Bathroom: ['Meera'],
            Showers: ['Gabriele'],
            Hallways: ['Alex'],
            'Living Room': ['Marko', 'Danai'],
        },
    ],
    [
        '09-15-2025',
        {
            Toilets: ['Ivo'],
            Bathroom: ['Dimitra'],
            Showers: ['Lucas'],
            Hallways: ['Eva'],
            'Living Room': ['Estephania', 'Diego'],
        },
    ],
    [
        '09-22-2025',
        {
            Toilets: ['Gilles'],
            Bathroom: ['Kris'],
            Showers: ['Danai'],
            Hallways: ['Michelle'],
            'Living Room': ['Meera', 'Alex'],
        },
    ],
    [
        '09-29-2025',
        {
            Toilets: ['Eva'],
            Bathroom: ['Lucas'],
            Showers: ['Marko'],
            Hallways: ['Dimitra'],
            'Living Room': ['Gabriele', 'Ivo'],
        },
    ],
    [
        '10-06-2025',
        {
            Toilets: ['Alex'],
            Bathroom: ['Michelle'],
            Showers: ['Kris'],
            Hallways: ['Gabriele'],
            'Laundry Room': ['Danai'],
            'Living Room': ['Gilles', 'Eva'],
            Kitchen: ['Estephania', 'Diego', 'Meera'],
        },
    ],
    [
        '10-13-2025',
        {
            Toilets: ['Marko'],
            Bathroom: ['Ivo'],
            Showers: ['Dimitra'],
            Hallways: ['Lucas'],
            'Living Room': ['Michelle', 'Kris'],
        },
    ],
    [
        '10-20-2025',
        {
            Toilets: ['Gabriele'],
            Bathroom: ['Alex'],
            Showers: ['Estephania'],
            Hallways: ['Meera'],
            'Living Room': ['Lucas', 'Danai'],
        },
    ],
    [
        '10-27-2025',
        {
            Toilets: ['Diego'],
            Bathroom: ['Eva'],
            Showers: ['Gilles'],
            Hallways: ['Ivo'],
            'Living Room': ['Dimitra', 'Marko'],
        },
    ],
    [
        '11-03-2025',
        {
            Toilets: ['Meera'],
            Bathroom: ['Danai'],
            Showers: ['Ivo'],
            Hallways: ['Gilles'],
            'Laundry Room': ['Gabriele'],
            'Living Room': ['Estephania', 'Kris'],
            Kitchen: ['Michelle', 'Alex', 'Lucas'],
        },
    ],
    [
        '11-10-2025',
        {
            Toilets: ['Dimitra'],
            Bathroom: ['Marko'],
            Showers: ['Michelle'],
            Hallways: ['Kris'],
            'Living Room': ['Diego', 'Alex'],
        },
    ],
    [
        '11-17-2025',
        {
            Toilets: ['Danai'],
            Bathroom: ['Gabriele'],
            Showers: ['Eva'],
            Hallways: ['Estephania'],
            'Living Room': ['Meera', 'Ivo'],
        },
    ],
    [
        '11-24-2025',
        {
            Toilets: ['Estephania'],
            Bathroom: ['Diego'],
            Showers: ['Alex'],
            Hallways: ['Marko'],
            'Living Room': ['Gilles', 'Lucas'],
        },
    ],
    [
        '12-01-2025',
        {
            Toilets: ['Lucas'],
            Bathroom: ['Estephania'],
            Showers: ['Diego'],
            Hallways: ['Eva'],
            'Laundry Room': ['Meera'],
            'Living Room': ['Diba', 'Michelle'],
            Kitchen: ['Kris', 'Gabriele', 'Gilles'],
        },
    ],
] satisfies [string, Record<string, string[]>][];