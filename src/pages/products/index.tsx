import { products } from "@/utils/mock";
import { DataTable } from "./data-table/data-table";

export function Products() {
    return (
        <>
            <div className="lg:px-6">
                <h1 className="text-2xl font-medium ">Gestão de Produtos</h1>
                <p className="text-muted-foreground mt-1">
                    Crie produtos com receitas e precificação inteligente
                </p>
            </div>

            <DataTable data={products} />
        </>
    )
}