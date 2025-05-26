import { createSignal, For, Match, Switch } from 'solid-js';
import { type Assignment, names, Schedule, type Person } from '../../library/schedule';
import { read } from '../../library/state';

export default function Home() {
    const { people, tasks, lockedSchedule, numWeeks } = read();
    const schedule = new Schedule(new Date('01-06-2025'), people, tasks);
    console.log(lockedSchedule);
    lockedSchedule.set(
        '04-21-2025',
        {
            //@ts-ignore
            'Living Room': ['Marko', 'Gilles'],
            // Toilets: ['Dimitra'],
            Bathroom: ['Olga'],
            // Showers: ['Ivo'],
            Hallways: ['Diego'],
        } as Assignment,
    );

    // Gabriele, Danai	Mony	Kristofers	Alex	Michelle
    lockedSchedule.set(
        '04-28-2025',
        {
            //@ts-ignore
            'Living Room': ['Gabriele', 'Danai'],
            Toilets: ['Mony'],
            Bathroom: ['Kristofers'],
            Showers: ['Ivo'],
            Hallways: ['Michelle'],
        } as Assignment,
    );

    // Eva, Kristofers	Gilles	Diego	Danai	Marko	Dimitra, Estephania, Alex	Olga

    lockedSchedule.set(
        '05-05-2025',
        {} as Assignment,
    );

    lockedSchedule.set(
        '05-12-2025',
        {
            'Living Room': ['Eva', 'Kristofers'],
            Toilets: ['Gilles'],
            Bathroom: ['Diego'],
            Showers: [],
            Hallways: ['Marko'],
            Kitchen: ['Dimitra', 'Estephania', 'Alex'],
            'Laundry Room': ['Olga'],
        } as Assignment,
    );

    lockedSchedule.set(
        '05-19-2025',
        {
            'Living Room': ['Mony', 'Michelle'],
            Toilets: ['Gabriele'],
            Bathroom: ['Danai'],
            Showers: ['Danai'],
            Hallways: [],
        } as Assignment,
    );

    lockedSchedule.set(
        '05-26-2025',
        {
            'Living Room': ['Marko', 'Alex'],
            Toilets: ['Dimitra'],
            Bathroom: ['Gilles'],
            Showers: ['Olga'],
            Hallways: ['Eva'],
        } as Assignment,
    );

    schedule.lock(lockedSchedule);
    schedule.leave('Irene' as Person, '02-03-2025');
    schedule.leave('Inês' as Person, '02-03-2025');
    schedule.enter('Eva' as Person, '02-03-2025');
    schedule.enter('Danai' as Person, '02-03-2025');

    schedule.pause('Eva' as Person, '04-21-2025', 2);
    schedule.pause('Dimitra' as Person, '04-28-2025', 1);
    schedule.pause('Estephania' as Person, '04-28-2025', 1);
    schedule.pause('Michelle' as Person, '05-05-2025', 1);
    schedule.pause('Estephania' as Person, '05-26-2025', 2);
    schedule.pause('Olga' as Person, '06-02-2025', 1);

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
