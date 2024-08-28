import { createSignal, For, Match, Switch } from "solid-js";
import { initCounters, nextWeekTasks, repeat, Task } from "~/lib/schedule";

const tasks = [
  { name: 'Living Room', people: 2, kind: repeat.weekly },
  { name: 'Toilets', people: 1, kind: repeat.weekly },
  { name: 'Bathroom', people: 1, kind: repeat.weekly },
  { name: 'Showers', people: 1, kind: repeat.weekly },
  { name: 'Hallways', people: 1, kind: repeat.weeklyWithMonthly },
  { name: 'Kitchen', people: 3, kind: repeat.monthly },
  { name: 'Laundry Room', people: 1, kind: repeat.monthly },
];

const people = [
  'Inês',
  'Gabrielle',
  'Roos',
  'Olga',
  'Marko',
  'Mony',
  'Marlou',
  'Estephania',
  'Daan',
  'Irene',
  'Kristofers',
  'Alex',
  'Michelle',
  'Diego',
] as const;

function* generateSchedule(numWeeks: number, people: readonly string[], tasks: Task[]) {
  let counters = initCounters(people, names(tasks));
  for (let i = 0; i < numWeeks; i++) {
    const assignment = nextWeekTasks(people, i % 4 === 0 ? tasks : weekly(tasks), counters);
    yield tasks.map(({ name }) => assignment[name] ?? []);//.concat([[JSON.stringify(counters)]]);
  }
}

const names = (tasks: Task[]) => tasks.map(({ name }) => name);

const weekly = (tasks: Task[]) => tasks.filter(({ kind }) => kind !== repeat.monthly)

export default function Home() {
  const [weeks, setWeeks] = createSignal<number | null>(null);
  const [rows, setRows] = createSignal<string[][][] | null>(null);
  const tasksNames = names(tasks);
  // tasksNames.push('counters');

  const generate = () => {
    const n = weeks();
    if (n === null) return [];
    setRows(Array.from(generateSchedule(n, people, tasks)));
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
            onInput={(e) => setWeeks(Number.parseInt(e.target.value))}
          />
          <button class="m-2 p-2 rounded bg-blue-800 text-white" onClick={generate}>Generate</button>
        </Match>
        <Match when={rows() !== null}>
          <TaskTable
            rows={rows() as string[][][]}
            tasks={tasksNames}
          />
          <button class="m-2 p-2 rounded bg-blue-800 text-white" onClick={clear}>Clear</button>
        </Match>
      </Switch>
    </div>
  );
}

function TaskTable(props: { tasks: string[]; rows: string[][][] }) {
  return (
    <table class="border-2">
      <thead>
        <tr>
          <For each={props.tasks}>
            {(header) => (<th class="px-2 py-1 border">{header}</th>)}
          </For>
        </tr>
      </thead>
      <tbody>
        <For each={props.rows}>
          {(row) => (
            <tr>
              <For each={row}>
                {(item) => <td class="p-2 border">{item.join(', ')}</td>}
              </For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  )
}
