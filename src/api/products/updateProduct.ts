import api from "@/lib/axios"
import type { ProductAdditionalCost, ProductMaterial } from "@/utils/models";


interface UpdateProductProps {
    productId: string;
    name: string;
    description: string;
    profitMarginPorcent: number;
    sellingPrice: number;
    billOfMaterials: ProductMaterial[];
    additionalCosts: ProductAdditionalCost[];
}

interface UpdateProductResponse {
    success: boolean,
    message: string
}

export async function UpdateProduct(productData: UpdateProductProps) {
    const endpoint = "/Products";
    const response = await api.put<UpdateProductResponse>(endpoint, productData);
    return response.data;
}