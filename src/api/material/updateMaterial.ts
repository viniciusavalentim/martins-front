import api from "@/lib/axios"

interface EditMaterialProps {
    materialId: string;
    name: string;
    category: string;
    currentStock: number;
    unitOfMeasure: number;
    totalCost: number;
    supplier: string | null;
}

interface EditMaterialResponse {
    success: boolean;
    message: string;
}

export async function EditMaterial(materialData: EditMaterialProps) {
    const endpoint = "/Material";
    const response = await api.put<EditMaterialResponse>(endpoint, materialData);
    return response.data;
}
