import { ProduceProduct } from "@/api/products/produceProduct";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/queryClient";
import { getEnumLabel, handleApiError } from "@/utils/helpers";
import type { Product } from "@/utils/models"
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2, Package, Wrench } from "lucide-react"
import { useState } from "react";
import { toast } from "sonner";

interface ProductParams {
    product: Product;
}

export const formatNumber = (value: number) => {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
};

export function UpdateAllEndpoints() {
    queryClient.invalidateQueries({
        queryKey: ["FindProductsQuery"]
    });
    queryClient.invalidateQueries({
        queryKey: ["FindReportProductsQuery"]
    });
    queryClient.invalidateQueries({
        queryKey: ["FindMaterialQuery"]
    });
    queryClient.invalidateQueries({
        queryKey: ["FindReportMaterialQuery"],
    });
}


export function AddProductionProductDialog({ product }: ProductParams) {
    const [open, setOpenChange] = useState<boolean>(false);
    const [quantity, setQuantity] = useState("")
    const [notes, setNotes] = useState("")
    const [error, setError] = useState("")
    const [success,] = useState("")

    const { mutateAsync: produceProductFn, isPending: isPendingProduce } = useMutation({
        mutationFn: ProduceProduct,
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
    })

    if (!product) return null;

    const requiredMaterials = product.billOfMaterials.map((item) => {
        const rawMaterial = item.material;

        const qty = Number.parseFloat(quantity) || 0;
        const requiredQty = item.quantityUsed * qty;
        const available = rawMaterial?.currentStock || 0;
        const hasEnough = available >= requiredQty;

        return {
            name: rawMaterial?.name || "Desconhecido",
            unit: rawMaterial?.unitOfMeasure || "",
            required: requiredQty,
            available,
            hasEnough,
        };
    });

    const handleSubmit = async () => {
        if (!product) {
            setError("Produto não encontrado")
            return
        }

        try {
            await produceProductFn({
                productId: product.id,
                quantityToProduce: Number.parseFloat(quantity),
                observation: notes
            })
        } catch (error) {
            console.error(error)
        }
        setQuantity("");
    }

    return (
        <>
            <AlertDialog open={open} onOpenChange={setOpenChange}>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="gap-2 mr-2"
                    >
                        <Wrench className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[90%] md:w-full md:max-w-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Produzir Produto
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Registre a produção de <strong className="text-black">{product.name}</strong> e o sistema deduzirá automaticamente os insumos do
                            estoque
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantidade a Produzir *</Label>
                            <Input
                                id="quantity"
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="Ex: 10"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                            />
                        </div>

                        {quantity && Number.parseFloat(quantity) > 0 && (
                            <div >
                                <h4 className="font-medium mb-3">Insumos Necessários:</h4>
                                <div className="space-y-2">
                                    {requiredMaterials.map((item, index) => (
                                        <div
                                            key={index}
                                            className={`flex border items-center justify-between p-2 rounded-md ${item.hasEnough ? "bg-green-100 dark:bg-green-950/20 border-green-400" : "bg-red-100 dark:bg-red-950/20 border-red-400"
                                                }`}
                                        >
                                            <span className="font-medium text-sm">{item.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">
                                                    Necessário:{" "}
                                                    <strong>
                                                        {formatNumber(item.required)} {getEnumLabel("UnitOfMeasure", item.unit)}
                                                    </strong>
                                                </span>
                                                <span className="text-sm text-muted-foreground">|</span>
                                                <span className="text-sm">
                                                    Disponível:{" "}
                                                    <strong>
                                                        {formatNumber(item.available)} {getEnumLabel("UnitOfMeasure", item.unit)}
                                                    </strong>
                                                </span>
                                                {item.hasEnough ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="notes">Observações (opcional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Ex: Lote especial, produção de teste..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="border-green-600 bg-green-50 dark:bg-green-950/20">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-600">{success}</AlertDescription>
                            </Alert>
                        )}


                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleSubmit()} disabled={isPendingProduce}>
                                {isPendingProduce ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Produzir
                                    </>
                                ) : (
                                    <>
                                        Produzir
                                    </>
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}