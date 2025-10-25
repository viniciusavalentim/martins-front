import { DataTable } from "./data-table/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { List, Clock, PackagePlus } from "lucide-react"
import { DataTableList } from "./data-table/data-table-list"
import { useStore } from "@/context/StoreContext"
import { Skeleton } from "@/components/ui/skeleton"
import { InventoryDialog } from "./components/inventory-dialog"
import { FindReportMaterials } from "@/api/material/findReportMaterials"
import { useQuery } from "@tanstack/react-query"


export function DataTableSkeleton() {
    return (
        <div className="p-4 lg:px-6 space-y-3">
            <Skeleton className="h-8 w-1/4" />
            <div className="border rounded-md">
                <Skeleton className="h-12 w-full" />
                <div className="space-y-2 p-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    )
}

export function Inventory() {
    const { Materials, isPendingMaterial } = useStore();

    const { data: findReportMaterialQuery, isPending: isPendingReportMaterial } = useQuery({
        queryKey: ["FindReportMaterialQuery"],
        queryFn: () => FindReportMaterials({ searchText: "" }),
    });

    return (
        <>
            <div className="lg:px-6">
                <h1 className="text-2xl font-medium ">Gestão de Insumos</h1>
                <p className="text-muted-foreground mt-1">
                    Cadastre e gerencie seus insumos com cálculo automático de custo
                </p>
            </div>

            <Tabs defaultValue="list" className="w-full flex-col gap-6">
                <div className="flex items-center justify-between px-4 lg:px-6">
                    <TabsList className="bg-transparent border">
                        <TabsTrigger
                            value="list"
                            className="data-[state=active]:bg-accent data-[state=active]:text-primary"
                        >
                            <List className="mr-2 size-4" /> Lista
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="data-[state=active]:bg-accent data-[state=active]:text-primary"
                        >
                            <Clock className="mr-2 size-4" /> Histórico
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="list" className="mt-4">
                    {
                        isPendingMaterial ? (
                            <DataTableSkeleton />
                        ) : Materials && Materials.length > 0 ? (
                            <DataTableList data={Materials} />
                        ) : (
                            <div className="flex min-h-[450px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                    <PackagePlus className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h2 className="mt-6 text-xl font-semibold">
                                    Seu estoque está vazio
                                </h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Cadastre seu primeiro insumo para começar a gerenciar seu estoque.
                                </p>
                                <div className="mt-6">
                                    <InventoryDialog />
                                </div>
                            </div>
                        )
                    }
                </TabsContent>

                <TabsContent value="history" className="mt-4">

                    {
                        isPendingReportMaterial ? (
                            <DataTableSkeleton />
                        ) : findReportMaterialQuery && findReportMaterialQuery.data.length > 0 ? (
                            <DataTable data={findReportMaterialQuery.data} />
                        ) : (
                            <div className="flex min-h-[450px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                    <PackagePlus className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h2 className="mt-6 text-xl font-semibold">
                                    Seu Histórico está vazio
                                </h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Cadastre seu primeiro insumo para começar a gerenciar seu estoque.
                                </p>
                            </div>
                        )
                    }
                </TabsContent>
            </Tabs>
        </>
    )
}