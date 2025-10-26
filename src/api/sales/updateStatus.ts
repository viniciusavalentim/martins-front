import api from "@/lib/axios"

interface UpdateSaleStatusRequest {
    orderId: string
    status: number
}

interface UpdateSaleStatusResponse {
    success: boolean
    message?: string
}

export async function UpdateSaleStatus({
    orderId,
    status
}: UpdateSaleStatusRequest) {
    const response = await api.put<UpdateSaleStatusResponse>("/Sale/status", {
        orderId,
        status
    })

    return response.data
}
