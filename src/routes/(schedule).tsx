import { createSignal, For, Match, Switch } from "solid-js";
import {
    Assignment,
    names,
    Person,
    repeat,
    Schedule,
    Task,
} from '~/lib/schedule';

const lockedSchedule = [
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
] as unknown as Assignment[];

const tasks = [
    { name: 'Living Room', people: 2, kind: repeat.weekly },
    { name: 'Toilets', people: 1, kind: repeat.weekly },
    { name: 'Bathroom', people: 1, kind: repeat.weekly },
    { name: 'Showers', people: 1, kind: repeat.weekly },
    { name: 'Hallways', people: 1, kind: repeat.weeklyWithMonthly },
    { name: 'Kitchen', people: 3, kind: repeat.monthly },
    { name: 'Laundry Room', people: 1, kind: repeat.monthly },
] as Task[];

const people = [
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
] as Person[];

export default function Home() {
    const schedule = new Schedule(new Date('09-02-2024'), people, tasks);
    schedule.lock(lockedSchedule);
    const [weeks, setWeeks] = createSignal<number | null>(null);
    const [rows, setRows] = createSignal<[Date, string[][]][] | null>(null);
    const tasksNames = names(tasks);

    const generate = () => {
        const n = weeks();
        if (n === null) return [];
        const newRows = Array.from(schedule.assignments().take(n));
        setRows(newRows);
    };

    const clear = () => {
        setRows(null);
    };

    return (
        <div class="ml-4">
            <h1>Schedule</h1>
            <Switch>
                <Match when={rows() === null}>
                    <input
                        type="number"
                        class="m-2 p-2 border rounded w-20"
                        value={weeks() ?? 0}
                        onInput={(e) =>
                            setWeeks(Number.parseInt(e.target.value))
                        }
                    />
                    <button
                        class="m-2 p-2 rounded bg-blue-800 text-white"
                        onClick={generate}
                    >
                        Generate
                    </button>
                </Match>
                <Match when={rows() !== null}>
                    <TaskTable
                        rows={rows() as [Date, string[][]][]}
                        tasks={tasksNames}
                    />
                    <button
                        class="m-2 p-2 rounded bg-blue-800 text-white"
                        onClick={clear}
                    >
                        Clear
                    </button>
                </Match>
            </Switch>
        </div>
    );
}

function TaskTable(props: { tasks: string[]; rows: [Date, string[][]][] }) {
  return (
    <table class="border-2">
      <thead>
        <tr>
          <td class="border">Date</td>
          <For each={props.tasks}>
            {(header) => (<th class="px-2 py-1 border">{header}</th>)}
          </For>
        </tr>
      </thead>
      <tbody>
        <For each={props.rows}>
          {([date, tasks]) => (
            <tr>
              <td>
                {(console.log(date), date.toLocaleDateString())}
              </td>
              <For each={tasks}>
                {(item) => <td class="p-2 border">{item.join(', ')}</td>}
              </For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  )
}
