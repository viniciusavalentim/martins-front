import { rawMaterials, reportRawMaterials } from "@/utils/mock"
import { DataTable } from "./data-table/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { List, Clock } from "lucide-react"
import { DataTableList } from "./data-table/data-table-list"

export function Inventory() {
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
                    <DataTableList data={rawMaterials} />
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                    <DataTable data={reportRawMaterials} />
                </TabsContent>
            </Tabs>
        </>
    )
}