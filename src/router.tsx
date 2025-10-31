import { createBrowserRouter, Navigate } from "react-router-dom";
import Page from "./app/dashboard/page";
import { Inventory } from "./pages/inventory";
import { Sales } from "./pages/sales";
import { Products } from "./pages/products";
import { Dashboard } from "./pages/dashboard";
import { Expenses } from "./pages/expense";
import { Production } from "./pages/production";
import { SalesPage } from "./pages/sales/components/sales-page";

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
                path: "vendas/nova-venda",
                element: <SalesPage />,
            },
            {
                path: "produtos",
                element: <Products />,
            },
            {
                path: "producao",
                element: <Production />,
            },
            {
                path: "despesas",
                element: <Expenses />,
            }
        ]
    }
]);
