import type { RawMaterial, UnitOfMeasure } from "@/utils/models"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconPlus } from "@tabler/icons-react"
import { Pencil } from "lucide-react"

const units: UnitOfMeasure[] = ["g", "ml", "un"]

export function InventoryDialog({ rawMaterial }: { rawMaterial?: RawMaterial | null }) {
    const [open, setOpenChange] = useState<boolean>(false);

    const [formData, setFormData] = useState({
        name: "",
        quantity: "",
        unit: "un" as UnitOfMeasure,
        totalCost: "",
        category: "",
        supplier: "",
    })

    useEffect(() => {
        if (rawMaterial) {
            setFormData({
                name: rawMaterial.name,
                quantity: rawMaterial.currentStock.toString(),
                unit: rawMaterial.unitOfMeasure,
                totalCost: rawMaterial.totalCost.toString(),
                category: rawMaterial.category || "",
                supplier: rawMaterial.supplierId ? `Fornecedor #${rawMaterial.supplierId}` : "",
            })
        } else {
            setFormData({
                name: "",
                quantity: "",
                unit: "un",
                totalCost: "",
                category: "",
                supplier: "",
            })
        }
    }, [rawMaterial, open])

    const calculateCostPerUnit = () => {
        const quantity = Number.parseFloat(formData.quantity)
        const totalCost = Number.parseFloat(formData.totalCost)
        if (quantity > 0 && totalCost >= 0) {
            return totalCost / quantity
        }
        return 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const quantity = Number.parseFloat(formData.quantity)
        const totalCost = Number.parseFloat(formData.totalCost)

        if (!formData.name || quantity <= 0 || totalCost < 0) {
            return
        }

        const costPerUnit = calculateCostPerUnit()
        console.log({
            ...formData,
            costPerUnit,
        })
    }

    const costPerUnit = calculateCostPerUnit()

    return (
        <Dialog open={open} onOpenChange={setOpenChange}>
            <DialogTrigger asChild>
                {rawMaterial ? (
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button variant="default" size="sm">
                        <IconPlus />
                        <span className="hidden lg:inline">Novo insumo</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{rawMaterial ? "Editar Insumo" : "Novo Insumo"}</DialogTitle>
                        <DialogDescription>
                            {rawMaterial ? "Atualize as informações do insumo" : "Cadastre um novo insumo no estoque"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">

                        {/* Nome */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome do Insumo *</Label>
                            <Input
                                id="name"
                                placeholder="Ex: Cera de Soja"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        {/* Categoria */}
                        <div className="grid gap-2">
                            <Label htmlFor="category">Categoria</Label>
                            <Input
                                id="category"
                                placeholder="Ex: Ceras, Essências, Embalagens"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="quantity">Quantidade *</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="unit">Unidade *</Label>
                                <Select
                                    value={formData.unit}
                                    onValueChange={(value) => setFormData({ ...formData, unit: value as UnitOfMeasure })}
                                >
                                    <SelectTrigger id="unit">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((unit) => (
                                            <SelectItem key={unit} value={unit}>
                                                {unit}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Custo total */}
                        <div className="grid gap-2">
                            <Label htmlFor="totalCost">Custo Total *</Label>
                            <Input
                                id="totalCost"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={formData.totalCost}
                                onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
                                required
                            />
                        </div>

                        {/* 👇 Seção de fornecedor */}
                        <div className="grid gap-2">
                            <Label htmlFor="supplier">Fornecedor</Label>
                            <Input
                                id="supplier"
                                placeholder="Ex: Fornecedor A, Loja de Essências..."
                                value={formData.supplier}
                                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                            />
                            {/* 🔜 futuramente aqui pode virar um <Select> de fornecedores do banco */}
                        </div>

                        {/* Custo por unidade (visualização) */}
                        {formData.quantity && formData.totalCost && (
                            <div className="rounded-lg bg-muted p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Custo por Unidade:</span>
                                    <span className="text-lg font-bold">
                                        {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        }).format(costPerUnit)}
                                        /{formData.unit}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">{rawMaterial ? "Atualizar" : "Cadastrar"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
