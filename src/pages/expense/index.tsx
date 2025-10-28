import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatToBRL } from "@/utils/helpers";
import { DollarSign, TrendingDown } from "lucide-react";
import { DataTable } from "./data-table/data-table";
import { useStore } from "@/context/StoreContext";
import { DataTableSkeleton } from "../inventory";
import { ExpenseDialog } from "./components/expense-dialog";

export function Expenses() {
    const { Expenses, isPendingExpenses } = useStore();

    const totalAmount = Expenses?.reduce((acc, expense) => acc + expense.amount, 0) ?? 0;

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
                            <div className="text-2xl font-medium text-red-600">{formatToBRL(totalAmount)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {Expenses?.length} {Expenses?.length === 1 ? "despesa registrada" : "despesas registradas"}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {
                isPendingExpenses ? (
                    <DataTableSkeleton />
                ) : Expenses && Expenses.length > 0 ? (
                    <DataTable data={Expenses} />
                ) : (
                    <div className="flex min-h-[450px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                            <DollarSign className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h2 className="mt-6 text-xl font-semibold">
                            Sem despesas até o momento
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Cadastre suas despesas por aqui.
                        </p>
                        <div className="mt-6">
                            <ExpenseDialog />
                        </div>
                    </div>
                )
            }


        </>
    )
}