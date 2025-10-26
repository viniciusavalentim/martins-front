import { DataTableList } from "./data-table/data-table-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Clock, PackagePlus } from "lucide-react";
import { DataTableHistory } from "./data-table/data-table-history";
import { useStore } from "@/context/StoreContext";
import { FindReportProducts } from "@/api/products/findReportProducts";
import { useQuery } from "@tanstack/react-query";
import { DataTableSkeleton } from "../inventory";
import { ProductDialog } from "./components/product-dialog";

export function Products() {
    const { isPendingProduct, Products } = useStore();

    const { data: findReportProductsQuery, isPending: isPendingReportProduct } = useQuery({
        queryKey: ["FindReportProductsQuery"],
        queryFn: () => FindReportProducts({ searchText: "" }),
    });


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
                    {
                        isPendingProduct ? (
                            <DataTableSkeleton />
                        ) : Products && Products.length > 0 ? (
                            <DataTableList data={Products} />

                        ) : (
                            <div className="flex min-h-[450px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                    <PackagePlus className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h2 className="mt-6 text-xl font-semibold">
                                    Sem produtos criados
                                </h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Cadastre seu primeiro produto para começar a gerenciar suas vendas.
                                </p>
                                <div className="mt-6">
                                    <ProductDialog />
                                </div>
                            </div>
                        )
                    }
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                    {
                        isPendingReportProduct ? (
                            <DataTableSkeleton />
                        ) : findReportProductsQuery && findReportProductsQuery.data.length > 0 ? (
                            <DataTableHistory data={findReportProductsQuery.data} />

                        ) : (
                            <div className="flex min-h-[450px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                    <PackagePlus className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h2 className="mt-6 text-xl font-semibold">
                                    Seu Histórico está vazio
                                </h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Cadastre suas produções e vendas para ver o gerenciamento de produtos.
                                </p>
                            </div>
                        )
                    }
                </TabsContent>
            </Tabs>

        </>
    )
}