import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatToBRL } from "@/utils/helpers";
import { financialSummary, orders } from "@/utils/mock";
import { TrendingUp } from "lucide-react";
import { DataTable } from "./data-table/data-table";

export function Sales() {
    return (
        <>
            <div className="space-y-4 lg:px-6">
                <div>
                    <h1 className="text-2xl font-medium ">Registro de Vendas</h1>
                    <p className="text-muted-foreground mt-1">
                        Registre vendas com baixa automática de estoque
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="bg-background">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-lg font-light">Receita Total</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-medium">{formatToBRL(financialSummary.totalRevenue)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {financialSummary.totalOrders} {financialSummary.totalOrders === 1 ? "venda registrada" : "vendas registradas"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-background">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-lg font-light">Lucro Total</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-medium text-green-600">{formatToBRL(financialSummary.totalProfit)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Margem média: {financialSummary.averageMargin}%
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>


            <DataTable data={orders} />
        </>
    )
}