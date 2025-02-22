import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";

function App() {
  const tempoRoutes =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center w-full h-screen bg-background">
          <p className="text-lg">Loading...</p>
        </div>
      }
    >
      <div className="relative">
        <Home />
        {tempoRoutes}
      </div>
    </Suspense>
  );
}

export default App;
