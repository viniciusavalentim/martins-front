import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { calculateMonthlySummary, formatToBRL, type MonthlySummary } from "@/utils/helpers";
import { TrendingUp } from "lucide-react";
import { DataTable } from "./data-table/data-table";
import { useStore } from "@/context/StoreContext";
import { useEffect, useState } from "react";
import { DataTableSkeleton } from "../inventory";
import { SaleDialog } from "./components/sales-dialog";
import { IconMoneybag } from "@tabler/icons-react";

export function Sales() {
    const { Sales, isPendingSale } = useStore();
    const [summary, setSummary] = useState<MonthlySummary>();

    useEffect(() => {
        if (Sales) {
            const calculatedSummary = calculateMonthlySummary(Sales);
            setSummary(calculatedSummary);
        }
    }, [Sales]);

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
                            <div className="text-2xl font-medium">{formatToBRL(summary?.totalRevenue)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {summary?.salesCount} {summary?.salesCount === 1 ? "venda registrada" : "vendas registradas"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-background">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-lg font-light">Lucro Total</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-medium text-green-600">{formatToBRL(summary?.totalProfit)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Margem média: {summary?.averageProfitMargin}%
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {
                isPendingSale ? (
                    <DataTableSkeleton />
                ) : Sales && Sales.length > 0 ? (
                    <DataTable data={Sales} />
                ) : (
                    <div className="flex min-h-[450px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                            <IconMoneybag className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h2 className="mt-6 text-xl font-semibold">
                            Sem vendas no momento
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Cadastre sua primeira venda para começar a gerenciar seus lucros.
                        </p>
                        <div className="mt-6">
                            <SaleDialog />
                        </div>
                    </div>
                )
            }
        </>
    )
}