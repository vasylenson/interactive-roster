import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import MainLayout from "./components/MainLayout";

export default function App() {
  return (
    // <main>hello</main>
    <Router root={MainLayout}>
      <FileRoutes />
    </Router>
  );
}
