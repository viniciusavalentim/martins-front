import type { RawMaterial } from "@/utils/models"
import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, PackagePlus } from "lucide-react"
import { formatToBRL, getEnumLabel, handleApiError } from "@/utils/helpers"
import { useMutation } from "@tanstack/react-query"
import { UpdateMaterialStock } from "@/api/material/updateStock"
import { UpdateAllEndpoints } from "@/pages/products/components/production-product-dialog"

export function AddQuantityInventoryDialog({ rawMaterial }: { rawMaterial: RawMaterial }) {
    const [open, setOpenChange] = useState<boolean>(false);
    const [quantity, setQuantity] = useState("")
    const [totalCostValue, setTotalCostValue] = useState("")
    const [notes, setNotes] = useState("")


    const { mutateAsync: UpdateStockMaterialFn, isPending } = useMutation({
        mutationFn: UpdateMaterialStock,
        onSuccess(data) {
            if (data.success) {
                toast.success(data.message);
                UpdateAllEndpoints();
                setOpenChange(false);
            } else {
                toast.error(data.message);
            }
        },
        onError(error) {
            handleApiError(error);
        }
    });


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const quantityNum = Number.parseFloat(quantity)
        const unitCostNum = Number.parseFloat(totalCostValue) / quantityNum

        if (isNaN(quantityNum) || quantityNum <= 0) {
            toast.error("Quantidade deve ser um número maior que zero");
            return
        }

        if (isNaN(unitCostNum) || unitCostNum <= 0) {
            toast.error("Custo unitário deve ser um número maior que zero");
            return
        }

        if (!rawMaterial.id) {
            toast.error("Material não encontrado");
            return;
        }

        const totalCost = !isNaN(quantityNum) && !isNaN(unitCostNum) ? quantityNum * unitCostNum : 0

        try {
            await UpdateStockMaterialFn({
                materialId: rawMaterial.id,
                quantityToAdd: quantityNum,
                supplier: null,
                totalCost: totalCost
            })
        } catch (error) {
            console.error(error)
        }
        setOpenChange(false);
        setQuantity("")
        setTotalCostValue("")
        setNotes("")
    }

    const quantityNum = Number.parseFloat(quantity)
    const unitCostNum = Number.parseFloat(totalCostValue) / quantityNum
    const totalCost = !isNaN(quantityNum) && !isNaN(unitCostNum) ? quantityNum * unitCostNum : 0

    const currentTotalValue = rawMaterial.currentStock * rawMaterial.unitCost
    const newTotalValue = currentTotalValue + totalCost
    const newTotalQuantity = rawMaterial.currentStock + quantityNum
    const newAverageCost = !isNaN(newTotalQuantity) && newTotalQuantity > 0 ? newTotalValue / newTotalQuantity : 0

    return (
        <>
            <Dialog open={open} onOpenChange={setOpenChange}>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Adicionar estoque"
                    >
                        <PackagePlus className="h-4 w-4 text-green-600" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Adicionar Estoque</DialogTitle>
                        <DialogDescription>Adicione mais quantidade ao estoque de {rawMaterial.name}</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Estoque Atual</Label>
                                <div className="text-xl font-bold text-primary">
                                    {rawMaterial.currentStock} {getEnumLabel("UnitOfMeasure", rawMaterial.unitOfMeasure)}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Custo Médio Atual</Label>
                                <div className="text-xl font-bold text-primary">
                                    {formatToBRL(rawMaterial.unitCost)}/{getEnumLabel("UnitOfMeasure", rawMaterial.unitOfMeasure)}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quantity">
                                Quantidade a Adicionar ({getEnumLabel("UnitOfMeasure", rawMaterial.unitOfMeasure)}) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder={`Ex: 100`}
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unitCost">
                                Custo Total
                                {/* (R$/{getEnumLabel("UnitOfMeasure", rawMaterial.unitOfMeasure)}) */}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="unitCost"
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder={`Ex: ${rawMaterial.unitCost.toFixed(2)}`}
                                value={totalCostValue}
                                onChange={(e) => setTotalCostValue(e.target.value)}
                                required
                            />
                        </div>

                        {!isNaN(quantityNum) && quantityNum > 0 && !isNaN(unitCostNum) && unitCostNum > 0 && (
                            <div className="rounded-lg bg-muted p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Custo desta compra:</span>
                                    <span className="font-medium">{formatToBRL(totalCost)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Novo estoque total:</span>
                                    <span className="font-medium">
                                        {newTotalQuantity.toFixed(2)} {getEnumLabel("UnitOfMeasure", rawMaterial.unitOfMeasure)}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t">
                                    <span className="text-sm font-medium">Novo custo médio:</span>
                                    <span className="text-lg font-bold text-primary">
                                        {formatToBRL(newAverageCost)}/{getEnumLabel("UnitOfMeasure", rawMaterial.unitOfMeasure)}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="notes">Observações</Label>
                            <Textarea
                                id="notes"
                                placeholder="Ex: Compra do fornecedor X, Nota fiscal 123..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Adicionar Estoque
                                    </>
                                ) : (
                                    <>
                                        Adicionar Estoque
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}