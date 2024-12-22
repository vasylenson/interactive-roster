import { repeat, type Assignment, type Person, type Task } from './schedule';

export type Config = {
    people: Person[];
    tasks: Task[];
    // startDate: Date;
    numWeeks: number;
    lockedSchedule: Assignment[];
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
            'Olga',
            'Marko',
            'Mony',
            'Marlou',
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
        lockedSchedule: [
            {
                'Living Room': ['Marko', 'Olga'],
                Toilets: ['Dimitra'],
                Bathroom: ['Gabriele'],
                Showers: ['Kristofers'],
                Hallways: ['Inês'],
                Kitchen: ['Marlou', 'Irene', 'Estephania'],
                'Laundry Room': ['Alex'],
            },
            {
                'Living Room': ['Mony', 'Michelle'],
                Toilets: ['Diego'],
                Bathroom: ['Inês'],
                Showers: ['Gabriele'],
                Hallways: ['Olga'],
            },
            {
                'Living Room': ['Inês', 'Gabriele'],
                Toilets: ['Olga'],
                Bathroom: ['Marko'],
                Showers: ['Mony'],
                Hallways: ['Marlou'],
            },
            {
                'Living Room': ['Kristofers', 'Irene'],
                Toilets: ['Marko'],
                Bathroom: ['Dimitra'],
                Showers: ['Alex'],
                Hallways: ['Gabriele'],
            },
            {
                'Living Room': [],
                Toilets: ['Irene'],
                Bathroom: ['Michelle'],
                Showers: ['Olga'],
                Hallways: ['Diego'],
                Kitchen: ['Marko', 'Kristofers', 'Gabriele'],
                'Laundry Room': ['Mony'],
            },
            {
                'Living Room': ['Marlou', 'Diego'],
                Toilets: ['Estephania'],
                Bathroom: ['Irene'],
                Showers: ['Dimitra'],
                Hallways: ['Marko'],
            },
        ] as unknown,
        numWeeks: 20,
    } as Config;
}
