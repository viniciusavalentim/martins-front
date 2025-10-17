import { createBrowserRouter, Navigate } from "react-router-dom";
import Page from "./app/dashboard/page";
import { Inventory } from "./pages/inventory";
import { Sales } from "./pages/sales";
import { Products } from "./pages/products";
import { Dashboard } from "./pages/dashboard";

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
                path: "",
                element: <Dashboard />,
            },
            {
                path: "estoque",
                element: <Inventory />,
            },
            {
                path: "vendas",
                element: <Sales />,
            },
            {
                path: "produtos",
                element: <Products />,
            },
        ],
    },
]);
