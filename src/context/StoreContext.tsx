import { FindExpenses } from "@/api/expenses/findExpenses";
import { FindMaterials } from "@/api/material/findMaterials";
import { FindProducts } from "@/api/products/findProducts";
import { FindSales } from "@/api/sales/findSales";
import type { OperationalExpense, Order, Product, RawMaterial } from "@/utils/models";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, type ReactNode } from "react";

interface StoreContextData {
    Products: Product[] | null;
    Sales: Order[] | null;
    Materials: RawMaterial[] | null;
    Expenses: OperationalExpense[] | null;
    // DashboardData: DashboardData;
    // getMaterialById: (materialId: string) => Promise<RawMaterial>;
    // getProductById: (productId: string) => Promise<Product>;
    // getSaleById: (orderId: string) => Promise<Order>;
    isPendingProduct: boolean;
    isPendingSale: boolean;
    isPendingMaterial: boolean;
    isPendingExpenses: boolean;
    // isPendingDashboard: boolean;
}

export const StoreContext = createContext<StoreContextData | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {

    const { data: findMaterialQuery, isPending: isPendingMaterial } = useQuery({
        queryKey: ["FindMaterialQuery"],
        queryFn: () => FindMaterials({ searchText: "" }),
    });

    const { data: findProductsQuery, isPending: isPendingProduct } = useQuery({
        queryKey: ["FindProductsQuery"],
        queryFn: () => FindProducts({ searchText: "" }),
    });

    const { data: findSalesQuery, isPending: isPendingSale } = useQuery({
        queryKey: ["FindSalesQuery"],
        queryFn: () => FindSales({}),
    });

    const { data: findExpensesQuery, isPending: isPendingExpenses } = useQuery({
        queryKey: ["FindExpensesQuery"],
        queryFn: () => FindExpenses({}),
    });

    return (
        <StoreContext.Provider
            value={{
                Materials: findMaterialQuery?.data ?? null,
                Products: findProductsQuery?.data ?? null,
                Sales: findSalesQuery?.data ?? null,
                Expenses: findExpensesQuery?.data ?? null,
                // DashboardData: findDashboardDataQuery?.data ?? {} as DashboardData,
                // getMaterialById,
                // getProductById,
                isPendingMaterial,
                isPendingProduct,
                isPendingSale,
                isPendingExpenses
            }}
        >
            {children}
        </StoreContext.Provider>
    )

};


export const useStore = (): StoreContextData => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error("useStore deve ser usado dentro de um AuthProvider");
    }
    return context;
};
