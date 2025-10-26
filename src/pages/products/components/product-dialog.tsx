import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Calculator, Pencil, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Product, ProductAdditionalCost, ProductMaterial } from "@/utils/models"
import { formatToBRL, getEnumLabel, handleApiError } from "@/utils/helpers"
import { DialogTrigger } from "@radix-ui/react-dialog"
import { IconPlus } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { CreateProduct } from "@/api/products/storeProduct"
import { toast } from "sonner"
import { useStore } from "@/context/StoreContext"
import { UpdateProduct } from "@/api/products/updateProduct"
import { UpdateAllEndpoints } from "./production-product-dialog"

interface ProductDialogProps {
    product?: Product | null
}

export function ProductDialog({ product }: ProductDialogProps) {
    const [open, setOpenChange] = useState<boolean>(false);
    const { Materials } = useStore();

    console.log("Materials in ProductDialog:", Materials);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        profitMargin: "30",
    })
    const [productMaterial, setProductMaterial] = useState<ProductMaterial[]>([])
    const [additionalCosts, setAdditionalCosts] = useState<ProductAdditionalCost[]>([])

    useEffect(() => {
        if (product) {

            const payloadCosts = product.additionalCosts?.map(cost => {
                return {
                    ...cost,
                    type: cost.type == String(1) ? "FIXED_VALUE" : "PERCENTAGE"
                };
            });

            setFormData({
                name: product.name,
                description: product.description || "",
                profitMargin: product.profitMarginPorcent.toString(),
            })
            setProductMaterial(product.billOfMaterials)
            setAdditionalCosts(payloadCosts as unknown as ProductAdditionalCost[])
        } else {
            setFormData({
                name: "",
                description: "",
                profitMargin: "30",
            })
            setProductMaterial([])
            setAdditionalCosts([])
        }
    }, [product, open])


    const { mutateAsync: createProductFn, isPending: isPendingCreate } = useMutation({
        mutationFn: CreateProduct,
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

    const { mutateAsync: updateProductFn, isPending: isPendingUpdate } = useMutation({
        mutationFn: UpdateProduct,
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

    const calculateRecipeCost = () => {
        return productMaterial.reduce((total, item) => {
            const insumo = item.material;
            if (insumo) {
                return total + insumo.unitCost * item.quantityUsed
            }
            return total
        }, 0)
    }

    const calculateAdditionalCostsTotal = (baseCost: number) => {
        return additionalCosts.reduce((total, cost) => {
            if (cost.type === "FIXED_VALUE") {
                return total + cost.value
            };
            return total + (baseCost * cost.value) / 100;
        }, 0)
    }

    const calculatePricing = () => {
        const recipeCost = calculateRecipeCost()
        const additionalCostsTotal = calculateAdditionalCostsTotal(recipeCost)
        const ctp = recipeCost + additionalCostsTotal
        const profitMargin = Number.parseFloat(formData.profitMargin) || 0
        const sellingPrice = ctp * (1 + profitMargin / 100)

        return { recipeCost, additionalCostsTotal, ctp, sellingPrice }
    }

    const addRecipeItem = () => {
        if (Materials?.length === 0) return
        setProductMaterial([...productMaterial, { id: "", productId: "", quantityUsed: 0, materialId: Date.now().toString() }])
    }

    const updateRecipeItem = (index: number, field: keyof ProductMaterial, value: string | number) => {
        const newRecipe = [...productMaterial]
        newRecipe[index] = { ...newRecipe[index], [field]: value }
        setProductMaterial(newRecipe)
    }

    const updateRecipeItemId = (index: number, value: string) => {
        const newRecipe = [...productMaterial]
        newRecipe[index] = { ...newRecipe[index], material: Materials?.find(x => x.id === value), quantityUsed: 0, id: "", materialId: value }
        setProductMaterial(newRecipe)
    }

    const removeRecipeItem = (index: number) => {
        setProductMaterial(productMaterial.filter((_, i) => i !== index))
    }

    const addAdditionalCost = () => {
        setAdditionalCosts([...(additionalCosts ?? []), { id: "", type: "FIXED_VALUE", value: 0, description: "", productId: "" }])
    }

    const updateAdditionalCost = (index: number, field: keyof ProductAdditionalCost, value: string | number) => {
        const newCosts = [...additionalCosts]
        newCosts[index] = { ...newCosts[index], [field]: value }
        setAdditionalCosts(newCosts)
    }

    const removeAdditionalCost = (index: number) => {
        setAdditionalCosts(additionalCosts.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || productMaterial.length === 0) {
            return
        }

        const { ctp, sellingPrice } = calculatePricing()

        const productData = {
            name: formData.name,
            description: formData.description || undefined,
            productMaterial,
            additionalCosts,
            ctp,
            profitMargin: Number.parseFloat(formData.profitMargin),
            sellingPrice,
        }

        const payloadCosts = productData.additionalCosts.map(cost => {
            return {
                ...cost,
                type: cost.type === "FIXED_VALUE" ? 1 : 2
            };
        });

        if (!product) {
            try {
                await createProductFn({
                    additionalCosts: payloadCosts as unknown as ProductAdditionalCost[],
                    billOfMaterials: productData.productMaterial,
                    description: productData.description || "",
                    name: productData.name,
                    profitMarginPorcent: productData.profitMargin,
                    sellingPrice: productData.sellingPrice
                })
            } catch (error) {
                console.error(error)
            }
        } else {
            try {
                await updateProductFn({
                    productId: product.id,
                    additionalCosts: payloadCosts as unknown as ProductAdditionalCost[],
                    billOfMaterials: productData.productMaterial,
                    description: productData.description || "",
                    name: productData.name,
                    profitMarginPorcent: productData.profitMargin,
                    sellingPrice: productData.sellingPrice
                })
            } catch (error) {
                console.error(error)
            }
        }
    }

    const { recipeCost, additionalCostsTotal, ctp, sellingPrice } = calculatePricing()
    const unitProfit = sellingPrice - ctp

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value)
    }

    return (
        <Dialog open={open} onOpenChange={setOpenChange}>
            <DialogTrigger asChild>
                {product ? (
                    <Button
                        variant="outline"
                        size="icon"
                        className="gap-2"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button variant="default" size="sm">
                        <IconPlus />
                        <span className="hidden lg:inline">Novo produto</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent
                className="
                    w-[95vw] 
                    max-w-md 
                    md:max-w-3xl 
                    lg:max-w-4xl 
                    max-h-[80vh] 
                    flex flex-col 
                    bg-card
                    overflow-hidden
                "
            >
                <DialogHeader>
                    <DialogTitle>{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
                    <DialogDescription>
                        {product ? "Atualize as informações do produto" : "Crie um produto com receita e precificação"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="
                        flex flex-col flex-1 
                        overflow-y-auto 
                        px-1
                        pb-4
                        pr-2
                    "
                >
                    <div className="grid gap-6 py-4">
                        {/* Basic Info */}
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome do Produto *</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Vela Aromática Lavanda 200g"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Descrição opcional do produto"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Recipe */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Receita do Produto *</CardTitle>
                                    <Button type="button" variant="outline" size="sm" onClick={addRecipeItem}>
                                        <Plus className="h-4 w-4 mr-1" />
                                        Adicionar Insumo
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {productMaterial.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Adicione insumos para criar a receita
                                    </p>
                                ) : (
                                    productMaterial.map((item, index) => {
                                        const insumo = item.material
                                        const itemCost = insumo ? insumo.unitCost * item.quantityUsed : 0
                                        return (
                                            <div key={index} className="flex gap-2 items-end">
                                                <div className="flex-1 grid gap-2">
                                                    <Label className="text-xs">Insumo</Label>
                                                    <Select
                                                        value={item.materialId}
                                                        onValueChange={(value) => updateRecipeItemId(index, value)}
                                                    >
                                                        <SelectTrigger className="min-w-[180px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Materials?.map((insumo) => (
                                                                <SelectItem key={insumo.id} value={insumo.id}>
                                                                    {insumo.name} ({formatCurrency(insumo.unitCost)}/{getEnumLabel("UnitOfMeasure", insumo.unitOfMeasure)})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="w-32 grid gap-2">
                                                    <Label className="text-xs">Quantidade ({getEnumLabel("UnitOfMeasure", item.material?.unitOfMeasure || "")})</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        value={item.quantityUsed}
                                                        onChange={(e) => updateRecipeItem(index, "quantityUsed", Number.parseFloat(e.target.value))}
                                                    />
                                                </div>
                                                <div className="w-32 grid gap-2">
                                                    <Label className="text-xs">Custo</Label>
                                                    <Input value={formatToBRL(itemCost)} disabled />
                                                </div>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeRecipeItem(index)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        )
                                    })
                                )}
                                {productMaterial.length > 0 && (
                                    <div className="pt-2 border-t">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span>Custo da Receita:</span>
                                            <span>{formatToBRL(recipeCost)}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Additional Costs */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Custos Adicionais</CardTitle>
                                    <Button type="button" variant="outline" size="sm" onClick={addAdditionalCost}>
                                        <Plus className="h-4 w-4 mr-1" />
                                        Adicionar Custo
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {additionalCosts.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Adicione custos como mão de obra, marketing, etc.
                                    </p>
                                ) : (
                                    additionalCosts.map((cost, index) => (
                                        <div key={cost.id} className="flex gap-2 items-end">
                                            <div className="flex-1 grid gap-2">
                                                <Label className="text-xs">Descrição</Label>
                                                <Input
                                                    placeholder="Ex: Mão de obra"
                                                    value={cost.description}
                                                    onChange={(e) => updateAdditionalCost(index, "description", e.target.value)}
                                                />
                                            </div>
                                            <div className="w-58 grid gap-2">
                                                <Label className="text-xs">Tipo</Label>
                                                <Select
                                                    value={cost.type}
                                                    onValueChange={(value) => updateAdditionalCost(index, "type", value)}
                                                >
                                                    <SelectTrigger className="min-w-[180px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="FIXED_VALUE">Fixo (R$)</SelectItem>
                                                        <SelectItem value="PERCENTAGE">Percentual (%)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="w-32 grid gap-2">
                                                <Label className="text-xs">Valor</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={cost.value}
                                                    onChange={(e) => updateAdditionalCost(index, "value", Number.parseFloat(e.target.value))}
                                                />
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeAdditionalCost(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Calculator className="h-4 w-4" />
                                    Precificação
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="profitMargin">Margem de Lucro (%)</Label>
                                    <Input
                                        id="profitMargin"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={formData.profitMargin}
                                        onChange={(e) => setFormData({ ...formData, profitMargin: e.target.value })}
                                    />
                                </div>

                                <Separator />

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Custo da Receita:</span>
                                        <span>{formatCurrency(recipeCost)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Custos Adicionais:</span>
                                        <span>{formatToBRL(additionalCostsTotal)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-medium">
                                        <span>CTP (Custo Total do Produto):</span>
                                        <span>{formatCurrency(ctp)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Margem de Lucro ({formData.profitMargin}%):</span>
                                        <span>{formatCurrency(unitProfit)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Preço de Venda:</span>
                                        <span className="text-primary">{formatCurrency(sellingPrice)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <DialogFooter className="mt-4 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={(!formData.name || productMaterial.length === 0) || isPendingCreate || isPendingUpdate}>
                            {isPendingUpdate || isPendingCreate ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {product ? "Atualizando..." : "Cadastrando..."}
                                </>
                            ) : (
                                <>
                                    {product ? "Atualizar" : "Cadastrar"}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
