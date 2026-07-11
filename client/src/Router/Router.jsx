import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../Layout/MainLayout";
import HomePage from "../pages/HomePage";
import CashIn from "../pages/CashIn/CashIn";
import CashOut from "../pages/CashOut/CashOut";
import CashReports from "../pages/Reports/CashReports";
import Setting from "../pages/Setting";
import Login from "../pages/Login";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children:[
        {
            path:"/",
            element:<HomePage />
        },
        {
            path:"/cash-in",
          element:<CashIn />
        },
        {
            path:"/cash-out",
            element:<CashOut />
        },
        {
            path:"/reports",
            element:<CashReports />
        },
        {
            path:"/settings",
            element:<Setting />
        },
    ]
  },
  {
    path: "/login",
    element: <Login />
  }
]);
