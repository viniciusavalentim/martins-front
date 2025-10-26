import api from "@/lib/axios"

interface CreateExpenseRequest {
    name: string
    category: number
    amount: number
    type: number
    recurrenceInterval?: string | null
    date: string
    notes?: string | null
}

interface CreateExpenseResponse {
    success: boolean,
    message: string
}

export async function CreateExpense({
    name,
    category,
    amount,
    type,
    recurrenceInterval,
    date,
    notes
}: CreateExpenseRequest) {
    const response = await api.post<CreateExpenseResponse>("/Expense", {
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
