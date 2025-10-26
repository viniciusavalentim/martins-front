import api from "@/lib/axios"
import type { OperationalExpense } from "@/utils/models"

interface FindExpensesProps {
    category?: string
    startDate?: string
    endDate?: string
    searchText?: string
}

interface FindExpensesResponse {
    data: OperationalExpense[]
}

export async function FindExpenses({
    category,
    startDate,
    endDate,
    searchText
}: FindExpensesProps) {
    const response = await api.get<FindExpensesResponse>("/Expense", {
        params: {
            Category: category ?? "",
            StartDate: startDate ?? "",
            EndDate: endDate ?? "",
            SearchText: searchText ?? ""
        }
    })

    return response.data
}
