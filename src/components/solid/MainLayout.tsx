import { ParentProps } from "solid-js";

export default function MainLayout({ children }: ParentProps) {
    return (
        <div class="grid grid-cols-[240px_4fr] h-full min-h-screen items-stretch">
            <nav class="bg-sky-800 p-2 text-white">
                <h2 class="text-2xl font-bold border-b-2 pb-4">Schommelbank Cleaning Schedule</h2>
                <ul class="text-lg fond-semibold mt-4">
                    <li><a href="/">Home</a></li>
                    <li><a href="/config">Config</a></li>
                </ul>
            </nav>
            <main>{children}</main>
        </div>
    );
}