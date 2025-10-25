import { FindMaterials } from "@/api/material/findMaterials";
import type { DashboardData, Order, Product, RawMaterial } from "@/utils/models";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface StoreContextData {
    // Products: Product[] | null;
    // Sales: Order[] | null;
    Materials: RawMaterial[] | null;
    // DashboardData: DashboardData;
    // getMaterialById: (materialId: string) => Promise<RawMaterial>;
    // getProductById: (productId: string) => Promise<Product>;
    // getSaleById: (orderId: string) => Promise<Order>;
    // isPendingProduct: boolean;
    // isPendingSale: boolean;
    isPendingMaterial: boolean;
    // isPendingDashboard: boolean;
}

export const StoreContext = createContext<StoreContextData | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
    const { data: findMaterialQuery, isPending: isPendingMaterial } = useQuery({
        queryKey: ["FindMaterialQuery"],
        queryFn: () => FindMaterials({ searchText: "" }),
    });

    return (
        <StoreContext.Provider
            value={{
                Materials: findMaterialQuery?.data ?? null,
                isPendingMaterial
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
