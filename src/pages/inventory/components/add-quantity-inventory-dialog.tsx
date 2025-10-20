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
import { PackagePlus } from "lucide-react"
import { formatToBRL } from "@/utils/helpers"

export function AddQuantityInventoryDialog({ rawMaterial }: { rawMaterial: RawMaterial }) {
    const [open, setOpenChange] = useState<boolean>(false);
    const [quantity, setQuantity] = useState("")
    const [unitCost, setUnitCost] = useState("")
    const [notes, setNotes] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const quantityNum = Number.parseFloat(quantity)
        const unitCostNum = Number.parseFloat(unitCost)

        if (isNaN(quantityNum) || quantityNum <= 0) {
            toast.error("Quantidade deve ser um número maior que zero");
            return
        }

        if (isNaN(unitCostNum) || unitCostNum <= 0) {
            toast.error("Custo unitário deve ser um número maior que zero");
            return
        }

        setQuantity("")
        setUnitCost("")
        setNotes("")
    }

    const quantityNum = Number.parseFloat(quantity)
    const unitCostNum = Number.parseFloat(unitCost)
    const totalCost = !isNaN(quantityNum) && !isNaN(unitCostNum) ? quantityNum * unitCostNum : 0

    // Calculate new weighted average
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
                                    {rawMaterial.currentStock} {rawMaterial.unitOfMeasure}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Custo Médio Atual</Label>
                                <div className="text-xl font-bold text-primary">
                                    {formatToBRL(rawMaterial.unitCost)}/{rawMaterial.unitOfMeasure}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quantity">
                                Quantidade a Adicionar ({rawMaterial.unitOfMeasure}) <span className="text-destructive">*</span>
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
                                Custo Unitário (R$/{rawMaterial.unitOfMeasure}) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="unitCost"
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder={`Ex: ${rawMaterial.unitCost.toFixed(2)}`}
                                value={unitCost}
                                onChange={(e) => setUnitCost(e.target.value)}
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
                                        {newTotalQuantity.toFixed(2)} {rawMaterial.unitOfMeasure}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t">
                                    <span className="text-sm font-medium">Novo custo médio:</span>
                                    <span className="text-lg font-bold text-primary">
                                        {formatToBRL(newAverageCost)}/{rawMaterial.unitOfMeasure}
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
                            <Button type="submit">Adicionar Estoque</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}