import api from "@/lib/axios"
import type { ReportRawMaterial } from "@/utils/models"

interface FindReportMaterialsProps {
    searchText?: string
}

interface FindReportMaterialsResponse {
    data: ReportRawMaterial[]
}

export async function FindReportMaterials({ searchText }: FindReportMaterialsProps) {
    const response = await api.get<FindReportMaterialsResponse>("/material/report", {
        params: {
            searchText: searchText ? searchText : ""
        }
    });
    return response.data;
}