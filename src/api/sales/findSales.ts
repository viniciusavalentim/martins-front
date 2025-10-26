import api from "@/lib/axios"
import type { Order } from "@/utils/models"

interface FindSalesProps {
    customerId?: string
    status?: string
    startDate?: string
    endDate?: string
}

interface FindSalesResponse {
    data: Order[]
}

export async function FindSales({
    customerId,
    status,
    startDate,
    endDate
}: FindSalesProps) {
    const response = await api.get<FindSalesResponse>("/Sale", {
        params: {
            CustomerId: customerId || "",
            Status: status || "",
            StartDate: startDate || "",
            EndDate: endDate || ""
        }
    })

    return response.data
}
