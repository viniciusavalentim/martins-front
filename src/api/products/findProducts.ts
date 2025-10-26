import api from "@/lib/axios"
import type { Product } from "@/utils/models"

interface FindProductsProps {
    searchText?: string
}

interface FindProductsResponse {
    data: Product[]
}

export async function FindProducts({ searchText }: FindProductsProps) {
    const response = await api.get<FindProductsResponse>("/products", {
        params: {
            searchText: searchText ? searchText : ""
        }
    });
    return response.data;
}