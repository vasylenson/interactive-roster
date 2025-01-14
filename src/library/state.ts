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
            'Inês',
            'Gabriele',
            'Ivo',
            'Olga',
            'Marko',
            'Mony',
            'Gilles',
            'Estephania',
            'Dimitra',
            'Irene',
            'Kristofers',
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
        lockedSchedule: new Map([
            [
                '01-06-2025',
                {
                    'Living Room': ['Marko', 'Gilles'],
                    Toilets: ['Mony'],
                    Bathroom: ['Ivo'],
                    Showers: ['Irene'],
                    Hallways: ['Diego'],
                    Kitchen: ['Alex', 'Inês', 'Kristofers'],
                    'Laundry Room': ['Michelle'],
                },
            ],
            [
                '01-13-2025',
                {
                    'Living Room': ['Gabriele', 'Alex'],
                    Toilets: ['Ivo'],
                    Bathroom: ['Irene'],
                    Showers: ['Marko'],
                    Hallways: ['Estephania'],
                },
            ],
        ]),
        numWeeks: 20,
    } as unknown as Config;
}
