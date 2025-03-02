import { RouteObject } from "react-router-dom";
import Home from "./components/home";
import AuthForm from "./components/auth/AuthForm";
import DemoPage from "./components/landing/DemoPage";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/auth",
    element: <AuthForm />,
  },
  {
    path: "/demo",
    element: <DemoPage />,
  },
  {
    path: "*",
    element: <Home />,
  },
];

export default routes;
