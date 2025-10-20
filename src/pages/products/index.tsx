import { products, reportProducts } from "@/utils/mock";
import { DataTableList } from "./data-table/data-table-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Clock } from "lucide-react";
import { DataTableHistory } from "./data-table/data-table-history";

export function Products() {
    return (
        <>
            <div className="lg:px-6">
                <h1 className="text-2xl font-medium ">Gestão de Produtos</h1>
                <p className="text-muted-foreground mt-1">
                    Crie produtos com receitas e precificação inteligente
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
                    <DataTableList data={products} />
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                    <DataTableHistory data={reportProducts} />
                </TabsContent>
            </Tabs>

        </>
    )
}