import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import './app.css';
import MainLayout from '../../src/components/solid/MainLayout';

export default function App() {
    return (
        // <main>hello</main>
        <Router root={MainLayout}>
            <FileRoutes />
        </Router>
    );
}
