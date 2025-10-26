import api from "@/lib/axios"
import type { ProductAdditionalCost, ProductMaterial } from "@/utils/models";


interface CreateProductProps {
    name: string;
    description: string;
    profitMarginPorcent: number;
    sellingPrice: number;
    billOfMaterials: ProductMaterial[];
    additionalCosts: ProductAdditionalCost[];
}

interface CreateProductResponse {
    success: boolean,
    message: string
}

export async function CreateProduct(productData: CreateProductProps) {
    const endpoint = "/Products";
    const response = await api.post<CreateProductResponse>(endpoint, productData);
    return response.data;
}