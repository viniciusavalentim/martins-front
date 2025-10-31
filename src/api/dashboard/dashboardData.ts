import api from "@/lib/axios"
import type { DashboardData } from "@/utils/models"

interface FindDashboardProps {
    startDate?: string
    endDate?: string
}

interface FindDashboardResponse {
    data: DashboardData
}

export async function FindDashboard({ startDate, endDate }: FindDashboardProps) {
    const response = await api.get<FindDashboardResponse>("/Dashboard", {
        params: {
            StartDate: startDate ?? "",
            EndDate: endDate ?? ""
        }
    })

    return response.data
}
