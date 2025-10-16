import { createBrowserRouter, Navigate } from "react-router-dom";
import Page from "./app/dashboard/page";

export const route = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/app" replace />,
    },
    {
        path: "/app",
        element: <Page />,
        children: [
            {
                path: "estoque",
                element: <Page />,
            },
            {
                path: "vendas",
                element: <Page />,
            },
            {
                path: "produtos",
                element: <Page />,
            },
        ],
    },
]);
