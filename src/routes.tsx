import { RouteObject } from "react-router-dom";
import Home from "./components/home";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "*",
    element: <Home />,
  },
];

export default routes;
