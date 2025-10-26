import api from "@/lib/axios"

interface CreateCustomerRequest {
    name: string
    email?: string | null
    phone?: string | null
}

interface CreateCustomerResponse {
    success: boolean,
    message: string
}

export async function CreateCustomer({
    name,
    email,
    phone
}: CreateCustomerRequest) {
    const response = await api.post<CreateCustomerResponse>("/Sale/customer", {
        name,
        email: email ?? null,
        phone: phone ?? null
    })

    return response.data
}
