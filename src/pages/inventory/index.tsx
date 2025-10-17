import { rawMaterials } from "@/utils/mock"
import { DataTable } from "./data-table/data-table"

export function Inventory() {
    return (
        <>
            <div className="lg:px-6">
                <h1 className="text-2xl font-medium ">Gestão de Insumos</h1>
                <p className="text-muted-foreground mt-1">
                    Cadastre e gerencie seus insumos com cálculo automático de custo
                </p>

            </div>
            <DataTable data={rawMaterials} />
        </>
    )
}