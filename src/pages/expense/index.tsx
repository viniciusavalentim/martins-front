import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatToBRL } from "@/utils/helpers";
import { financialSummary, operationalExpenses } from "@/utils/mock";
import { TrendingDown } from "lucide-react";
import { DataTable } from "./data-table/data-table";

export function Expenses() {
    return (
        <>
            <div className="space-y-4 lg:px-6">
                <div>
                    <h1 className="text-2xl font-medium ">Registro de Despesas</h1>
                    <p className="text-muted-foreground mt-1">
                        Registre suas despesas
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="bg-background">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-lg font-light">Total de Despesas</CardTitle>
                            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-medium text-red-600">{formatToBRL(financialSummary.totalRevenue)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {financialSummary.totalOrders} {financialSummary.totalOrders === 1 ? "despesa registrada" : "despesas registradas"}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>


            <DataTable data={operationalExpenses} />
        </>
    )
}