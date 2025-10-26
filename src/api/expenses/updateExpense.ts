import api from "@/lib/axios"

interface UpdateExpenseRequest {
    id: string
    name: string
    category: number
    amount: number
    type: number
    recurrenceInterval?: string | null
    date: string
    notes?: string | null
}

interface UpdateExpenseResponse {
    success: boolean,
    message: string
}

export async function UpdateExpense({
    id,
    name,
    category,
    amount,
    type,
    recurrenceInterval,
    date,
    notes
}: UpdateExpenseRequest) {
    const response = await api.put<UpdateExpenseResponse>("/Expense", {
        id,
        name,
        category,
        amount,
        type,
        recurrenceInterval: recurrenceInterval ?? null,
        date,
        notes: notes ?? null
    })

    return response.data
}
