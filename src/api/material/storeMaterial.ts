import api from "@/lib/axios"

interface CreateMaterialProps {
    name: string;
    category: string;
    currentStock: number;
    unitOfMeasure: number;
    totalCost: number;
    supplier: string | null;
}

interface CreateMaterialResponse {
    success: boolean,
    message: string
}

export async function CreateMaterial(materialData: CreateMaterialProps) {
    const endpoint = "/Material/create-material";
    const response = await api.post<CreateMaterialResponse>(endpoint, materialData);
    return response.data;
}