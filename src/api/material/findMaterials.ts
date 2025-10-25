import api from "@/lib/axios"
import type { RawMaterial } from "@/utils/models"

interface FindMaterialsProps {
    searchText?: string
}

interface FindMaterialsResponse {
    data: RawMaterial[]
}

export async function FindMaterials({ searchText }: FindMaterialsProps) {
    const response = await api.get<FindMaterialsResponse>("/material", {
        params: {
            searchText: searchText ? searchText : ""
        },
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
        }
    });
    return response.data;
}