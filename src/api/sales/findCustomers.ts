import api from "@/lib/axios"
import type { Customer } from "@/utils/models"

interface FindCustomersProps {
    searchText?: string
}

interface FindCustomersResponse {
    data: Customer[]
}

export async function FindCustomers({ searchText }: FindCustomersProps) {
    const response = await api.get<FindCustomersResponse>("/Sale/customer", {
        params: {
            SearchText: searchText ?? ""
        }
    })

    return response.data
}
