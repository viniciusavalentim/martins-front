import api from "@/lib/axios"
import type { ReportProduct } from "@/utils/models"

interface FindReportProductsProps {
    searchText?: string
}

interface FindReportProductsResponse {
    data: ReportProduct[]
}

export async function FindReportProducts({ searchText }: FindReportProductsProps) {
    const response = await api.get<FindReportProductsResponse>("/products/report", {
        params: {
            searchText: searchText ? searchText : ""
        }
    });
    return response.data;
}