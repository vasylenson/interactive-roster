import { createSignal, For, Match, Switch } from 'solid-js';
import { names, Schedule, type Person } from '../../library/schedule';
import { read } from '../../library/state';

export default function Home() {
    const { people, tasks, lockedSchedule, numWeeks } = read();
    const schedule = new Schedule(new Date('09-01-2025'), people, tasks);
    console.log(lockedSchedule);

    const [weeks, setWeeks] = createSignal<number | null>(numWeeks);
    const [rows, setRows] = createSignal<[Date, string[][]][] | null>(null);
    const tasksNames = names(tasks);

    const generate = () => {
        const n = weeks();
        if (n === null) return [];
        const newRows = Array.from(schedule.assignments().take(n));

        setRows(newRows);
    };

    generate();

    return (
        <div class="ml-4">
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
                        {(header) => <th class="px-2 py-1 border">{header}</th>}
                    </For>
                </tr>
            </thead>
            <tbody>
                <For each={props.rows}>
                    {([date, tasks]) => (
                        <tr>
                            <td>{date.toLocaleDateString()}</td>
                            <For each={tasks}>
                                {(item) => (
                                    <td class="p-2 border">
                                        {item.join(', ')}
                                    </td>
                                )}
                            </For>
                        </tr>
                    )}
                </For>
            </tbody>
        </table>
    );
}
