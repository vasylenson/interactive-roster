import { createSignal, For, Match, Show, Switch } from 'solid-js';
import { names, Schedule, type Person } from '../../library/schedule';
import { read } from '../../library/state';

export default function Home() {
    const { people, tasks, lockedSchedule, numWeeks } = read();
    const schedule = new Schedule(new Date('09-01-2025'), people, tasks);
    console.log(lockedSchedule);

    schedule.pause('Dimitra' as Person, '10-20-2025', 1);
    schedule.leave('Dimitra' as Person, '12-1-2025');
    schedule.leave('Danai' as Person, '12-1-2025');
    schedule.enter('Diba' as Person, '12-1-2025');

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
                        people={people}
                    />
                </Match>
            </Switch>
        </div>
    );
}

function TaskTable(props: {
    people: Person[];
    tasks: string[];
    rows: [Date, string[][]][];
}) {
    return (
        <table>
            <thead>
                <tr>
                    <td class="border-2">Date</td>
                    <For each={props.tasks}>
                        {(header) => (
                            <th class="px-2 py-1 border-2">{header}</th>
                        )}
                    </For>
                </tr>
            </thead>
            <tbody>
                <For each={props.rows}>
                    {([date, tasks]) => (
                        <tr>
                            <td class="border" classList={{'bg-amber-300': isCurrent(date)}}>{date.toLocaleDateString()}</td>
                            <For each={tasks}>
                                {(item) => (
                                    <td class="p-2 border">
                                        {item.join(', ')}
                                    </td>
                                )}
                            </For>
                            <td>{op(props.people)}</td>
                        </tr>
                    )}
                </For>
            </tbody>
        </table>
    );
}

function op(people: Person[]) {
    const [expanded, setExpanded] = createSignal(false);
    const [person, setPerson] = createSignal<string | null>(null);
    const [search, setSearch] = createSignal('');
    let inputRef!: HTMLInputElement;

    const expand = () => {
        setExpanded(true);
        setTimeout(() => inputRef.focus());
    };
    return (
        <>
            {!expanded() ? (
                <button
                    type="button"
                    class="p-2 border-0 hover:opacity-100 transition-all"
                    classList={{ 'opacity-0': !expanded() }}
                    on:click={expand}
                >
                    [away...]
                </button>
            ) : (
                <div class="relative ml-2">
                    <div on:focusout={() => setExpanded(false)}>
                        <input
                            type="text"
                            ref={inputRef}
                            placeholder="who is away?"
                            class="p-1 focus:outline-none"
                            on:input={(e) => setSearch(e.target.value)}
                        />
                        <button
                            type="button"
                            class="text-red-500 px-2 ml-2"
                            on:click={() => setExpanded(false)}
                        >
                            [cancel]
                        </button>
                    </div>
                    <Show when={search().length > 0}>
                        <ul class="absolute bg-white p-1 z-20 flex flex-col">
                            <For
                                each={people.filter((person) =>
                                    person
                                        .toLowerCase()
                                        .includes(search().toLowerCase())
                                )}
                            >
                                {(person) => (
                                    <button
                                        type="button"
                                        class="block hover:bg-slate-200 cursor-pointer"
                                        on:click={() => setPerson(person)}
                                    >
                                        {person}
                                    </button>
                                )}
                            </For>
                        </ul>
                    </Show>
                </div>
            )}
        </>
    );
}

function isCurrent(date: Date) {
    const today = new Date();
    return isSameWeek(today, date);
}

function isSameWeek(d1: Date, d2: Date, weekStartsOn = 0) {
  const date1 = new Date(d1);
  const date2 = new Date(d2);

  const startOfWeek = (date: Date) => {
    const diff = (date.getDay() + 7 - weekStartsOn) % 7;
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    start.setDate(date.getDate() - diff);
    return start;
  };

  const s1 = startOfWeek(date1);
  const s2 = startOfWeek(date2);

  return s1.getTime() === s2.getTime();
}
