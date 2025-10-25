import api from "@/lib/axios"

interface UpdateMaterialStockProps {
    materialId: string;
    quantityToAdd: number;
    totalCost: number;
    supplier: string | null;
}

interface UpdateMaterialStockResponse {
    success: boolean;
    message: string;
}

export async function UpdateMaterialStock(stockData: UpdateMaterialStockProps) {
    const endpoint = "/Material/add-stock";
    const response = await api.put<UpdateMaterialStockResponse>(endpoint, stockData);
    return response.data;
}
