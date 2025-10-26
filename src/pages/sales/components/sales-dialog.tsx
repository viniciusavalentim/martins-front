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
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle2, Plus, Trash2, Package, AlertTriangle, UserPlus, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { OrderItem, OrderStatus, Customer, Product, RawMaterial } from "@/utils/models"
import { IconPlus } from "@tabler/icons-react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { CreateCustomer } from "@/api/sales/createCustomer"
import { toast } from "sonner"
import { handleApiError } from "@/utils/helpers"
import { queryClient } from "@/lib/queryClient"
import { FindCustomers } from "@/api/sales/findCustomers"
import { CreateSale } from "@/api/sales/createSale"
import { useStore } from "@/context/StoreContext"

interface SaleDialogProps {
}


export function SaleDialog({ }: SaleDialogProps) {
    const { Products, Materials } = useStore();
    const [open, setOpenChange] = useState<boolean>(false);
    const [items, setItems] = useState<Omit<OrderItem, "id" | "orderId">[]>([])
    const [currentItem, setCurrentItem] = useState({
        productId: "",
        quantity: "1",
        unitPrice: "",
    })
    const [customerId, setCustomerId] = useState<string>("")
    const [status, setStatus] = useState<OrderStatus>("PENDING")
    const [notes, setNotes] = useState("")
    const [showNewCustomer, setShowNewCustomer] = useState(false)
    const [newCustomer, setNewCustomer] = useState({
        name: "",
        email: "",
        phone: "",
    })
    const [availabilityStatus, setAvailabilityStatus] = useState<{
        status: "available" | "insufficient" | "can_produce"
        message: string
        missingInsumos?: string[]
    } | null>(null)

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value)
    }

    const { data: findCustomersQuery, isPending: isPendingCustomer } = useQuery({
        queryKey: ["FindCustomersQuery"],
        queryFn: () => FindCustomers({ searchText: "" }),
    });

    const { mutateAsync: createCustomerFn, isPending: isPendingCreateCustomer } = useMutation({
        mutationFn: CreateCustomer,
        onSuccess(data) {
            if (data.success) {
                toast.success(data.message);
                queryClient.invalidateQueries({
                    queryKey: ["FindCustomersQuery"]
                });
            } else {
                toast.error(data.message);
            }
        },
        onError(error) {
            handleApiError(error);
        }
    });

    const { mutateAsync: createSaleFn, isPending: isPendingCreateSale } = useMutation({
        mutationFn: CreateSale,
        onSuccess(data) {
            if (data.success) {
                toast.success(data.message);
                queryClient.invalidateQueries({
                    queryKey: ["FindSalesQuery"]
                });
                setOpenChange(false);
            } else {
                toast.error(data.message || "Não foi possível criar o cliente.");
            }
        },
        onError(error) {
            handleApiError(error);
        }
    });

    const handleProductChange = (productId: string) => {
        const product = Products?.find(product => product.id === productId)
        setCurrentItem({
            ...currentItem,
            productId,
            unitPrice: product ? product.sellingPrice.toString() : "",
        })
    }

    const handleQuantityChange = (quantity: string) => {
        setCurrentItem(prev => ({ ...prev, quantity }));
    };

    useEffect(() => {
        const quantity = Number.parseFloat(currentItem.quantity) || 0;
        const productId = currentItem.productId;

        if (productId && quantity > 0) {
            const availability = checkProductAvailability(
                productId,
                quantity,
                Products,
                Materials
            );
            setAvailabilityStatus(availability);
        } else {
            setAvailabilityStatus(null);
        }
    }, [currentItem.productId, currentItem.quantity, Products, Materials]);


    const handleAddCustomer = async () => {
        if (!newCustomer.name.trim()) return

        const customer: Customer = {
            id: "",
            name: newCustomer.name,
            email: newCustomer.email || undefined,
            phone: newCustomer.phone || undefined,
            createdAt: new Date("2025-10-05"),
        }

        try {
            await createCustomerFn(customer);
        } catch (error) {
            console.error(error);
        }

        setCustomerId(customer.id.toString())
        setNewCustomer({ name: "", email: "", phone: "" })
        setShowNewCustomer(false)
    }

    const handleAddItem = () => {
        const product = Products?.find(product => product.id === currentItem.productId)
        const quantity = Number.parseFloat(currentItem.quantity)
        const unitPrice = Number.parseFloat(currentItem.unitPrice)

        if (!product || quantity <= 0 || unitPrice <= 0) {
            return
        }

        if (!availabilityStatus || availabilityStatus.status === "insufficient") {
            return
        }

        const totalRevenue = unitPrice * quantity
        const unitCost = product.totalCost
        const expectedProfit = (product.sellingPrice - product.totalCost) * quantity
        const realProfit = (unitPrice - product.totalCost) * quantity

        const newItem: Omit<OrderItem, "id" | "orderId"> = {
            productId: product.id,
            name: product.name,
            quantity,
            unitPrice,
            unitCost,
            totalRevenue,
            expectedProfit,
            realProfit,
        }

        setItems([...items, newItem])
        setCurrentItem({
            productId: "",
            quantity: "1",
            unitPrice: "",
        })
        setAvailabilityStatus(null)
    }

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (items.length === 0) {
            toast.error("Adicione pelo menos um item ao pedido")
            return
        }
        try {
            await createSaleFn({
                customerId: customerId ? customerId : undefined,
                orderStatus: (() => {
                    switch (status) {
                        case "PENDING": return 1
                        case "IN_PRODUCTION": return 2
                        case "IN_MATURING": return 3
                        case "WAITING_DELIVERY": return 4
                        case "CANCELLED": return 5
                        case "COMPLETED": return 6
                        default: return 1
                    }
                })(),
                orderItems: items,
                observations: notes,
            })
        } catch (error) {
            console.error(error)
        }

        setItems([])
        setCurrentItem({
            productId: "",
            quantity: "1",
            unitPrice: "",
        })
        setCustomerId("")
        setStatus("PENDING")
        setNotes("")
        setAvailabilityStatus(null)
    }

    const selectedProduct = currentItem.productId ? Products?.find(product => product.id === currentItem.productId) : null
    const currentQuantity = Number.parseFloat(currentItem.quantity) || 0
    const currentUnitPrice = Number.parseFloat(currentItem.unitPrice) || 0

    const cartTotal = items.reduce((sum, item) => sum + item.totalRevenue, 0)
    const cartProfit = items.reduce((sum, item) => sum + item.realProfit, 0)

    return (
        <Dialog open={open} onOpenChange={setOpenChange} >
            <DialogTrigger asChild>
                <Button variant="default" size="sm">
                    <IconPlus />
                    <span className="hidden lg:inline">Nova Venda</span>
                </Button>
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
                    <DialogTitle>Registrar Pedido</DialogTitle>
                    <DialogDescription>Adicione produtos ao carrinho e finalize o pedido</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="
                        flex flex-col flex-1 
                        overflow-y-auto 
                        px-1
                        pb-4
                        pr-2
                    ">
                    <ScrollArea className="flex-1 pr-4">
                        <div className="space-y-4 pb-4">
                            {/* Customer Selection */}
                            <Card>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="customer">Cliente (Opcional)</Label>
                                        {!showNewCustomer ? (
                                            <div className="flex gap-2">
                                                <Select value={customerId} onValueChange={setCustomerId}>
                                                    <SelectTrigger id="customer" className="flex-1">
                                                        <SelectValue placeholder="Selecione um cliente" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {isPendingCustomer ? (
                                                            <div className="flex items-center justify-center p-2">
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <SelectItem value="none">Sem cliente</SelectItem>
                                                                {findCustomersQuery?.data?.map((customer) => (
                                                                    <SelectItem key={customer.id} value={customer.id.toString()}>
                                                                        {customer.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <Button type="button" variant="outline" size="icon" onClick={() => setShowNewCustomer(true)}>
                                                    <UserPlus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 p-3 border rounded-lg">
                                                <Input
                                                    placeholder="Nome do cliente"
                                                    value={newCustomer.name}
                                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                                />
                                                <Input
                                                    placeholder="Email (opcional)"
                                                    type="email"
                                                    value={newCustomer.email}
                                                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                                />
                                                <Input
                                                    placeholder="Telefone (opcional)"
                                                    value={newCustomer.phone}
                                                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                                />
                                                <div className="flex gap-2">
                                                    <Button type="button" size="sm" onClick={handleAddCustomer} disabled={!newCustomer.name}>
                                                        Adicionar
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setShowNewCustomer(false)
                                                            setNewCustomer({ name: "", email: "", phone: "" })
                                                        }}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="status">Status do Pedido</Label>
                                        <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
                                            <SelectTrigger id="status">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PENDING">Pendente</SelectItem>
                                                <SelectItem value="IN_PRODUCTION">Em Produção</SelectItem>
                                                <SelectItem value="IN_MATURING">Em Maturação</SelectItem>
                                                <SelectItem value="WAITING_DELIVERY">Aguardando Entrega</SelectItem>
                                                <SelectItem value="CANCELLED">Cancelado</SelectItem>
                                                <SelectItem value="COMPLETED">Concluído</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Add Product Section */}
                            <Card>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="product">Adicionar Produto</Label>
                                        <Select value={currentItem.productId} onValueChange={handleProductChange}>
                                            <SelectTrigger id="product">
                                                <SelectValue placeholder="Selecione um produto" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Products?.length === 0 ? (
                                                    <div className="p-2 text-sm text-muted-foreground">Nenhum produto cadastrado</div>
                                                ) : (
                                                    Products?.map((product) => (
                                                        <SelectItem key={product.id} value={product.id}>
                                                            {product.name} - {formatCurrency(product.sellingPrice)}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {availabilityStatus && (
                                        <>
                                            {availabilityStatus.status === "insufficient" && (
                                                <Alert variant="destructive">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        <div className="font-medium mb-1">Não é possível vender este produto:</div>
                                                        <div className="text-sm">{availabilityStatus.message}</div>
                                                        {availabilityStatus.missingInsumos && (
                                                            <div className="text-xs mt-1">
                                                                Insumos faltantes: {availabilityStatus.missingInsumos.join(", ")}
                                                            </div>
                                                        )}
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                            {availabilityStatus.status === "can_produce" && (
                                                <Alert>
                                                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                                                    <AlertDescription>
                                                        <div className="font-medium mb-1 text-orange-600">
                                                            Produto será produzido automaticamente
                                                        </div>
                                                        <div className="text-sm">
                                                            Não há estoque do produto, mas há insumos suficientes. O produto será produzido
                                                            automaticamente ao finalizar o pedido (se status não for PENDENTE).
                                                        </div>
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                            {availabilityStatus.status === "available" && (
                                                <Alert>
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    <AlertDescription className="text-green-600">Produto disponível para venda</AlertDescription>
                                                </Alert>
                                            )}
                                        </>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="quantity">Quantidade</Label>
                                            <Input
                                                id="quantity"
                                                type="number"
                                                step="1"
                                                min="1"
                                                placeholder="1"
                                                value={currentItem.quantity}
                                                onChange={(e) => handleQuantityChange(e.target.value)}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="unitPrice">Preço Unitário</Label>
                                            <Input
                                                id="unitPrice"
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                placeholder="0.00"
                                                value={currentItem.unitPrice}
                                                onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {selectedProduct && currentQuantity > 0 && currentUnitPrice > 0 && (
                                        <div className="flex items-center justify-between pt-2 border-t">
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Subtotal: </span>
                                                <span className="font-medium">{formatCurrency(currentUnitPrice * currentQuantity)}</span>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={handleAddItem}
                                                disabled={!availabilityStatus || availabilityStatus.status === "insufficient"}
                                                size="sm"
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Adicionar
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Cart Items */}
                            {items.length > 0 && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">Carrinho ({items.length})</span>
                                            </div>
                                            {items.map((item, index) => (
                                                <div key={index} className="flex items-start justify-between gap-4 pb-3 border-b last:border-0">
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{item.name}</span>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {item.quantity}x {formatCurrency(item.unitPrice)} = {formatCurrency(item.totalRevenue)}
                                                        </div>
                                                        <div className="text-xs text-green-600">Lucro: {formatCurrency(item.realProfit)}</div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveItem(index)}
                                                        className="h-8 w-8"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Separator />
                                            <div className="space-y-2 pt-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Total:</span>
                                                    <span className="font-bold text-lg">{formatCurrency(cartTotal)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Lucro Total:</span>
                                                    <span className="font-medium text-green-600">{formatCurrency(cartProfit)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Notes */}
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Observações</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Observações sobre o pedido (opcional)"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="border-t pt-4 mt-4">
                        <Button type="button" variant="outline">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={items.length === 0}>
                            Finalizar Pedido ({items.length})
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


const checkProductAvailability = (
    productId: string,
    quantityDesired: number,
    products: Product[] | null,
    materials: RawMaterial[] | null
): { status: "available" | "insufficient" | "can_produce"; message: string; missingInsumos?: string[] } => {

    const product = products?.find((p) => p.id === productId);
    if (!product) {
        return { status: "insufficient", message: "Produto não encontrado" };
    }

    if (product.stockQuantity >= quantityDesired) {
        return {
            status: "available",
            message: "Produto disponível para venda",
        };
    }

    const quantityToProduce = quantityDesired - product.stockQuantity;
    const insufficientInsumos: string[] = [];

    if (!materials) {
        return { status: "insufficient", message: "Lista de insumos não carregada." };
    }

    for (const bomItem of product.billOfMaterials) {
        const liveMaterial = materials.find(m => m.id === bomItem.materialId);

        if (!liveMaterial) {
            const materialName = bomItem.material?.name || `ID ${bomItem.materialId}`;
            insufficientInsumos.push(`${materialName} (Insumo não encontrado)`);
            continue;
        }

        const materialNeeded = bomItem.quantityUsed * quantityToProduce;

        if (liveMaterial.currentStock < materialNeeded) {
            insufficientInsumos.push(
                `${liveMaterial.name} (Necessário: ${materialNeeded}, Disponível: ${liveMaterial.currentStock})`
            );
        }
    }

    if (insufficientInsumos.length > 0) {
        return {
            status: "insufficient",
            message: `Estoque de produto e insumos insuficiente. ${quantityToProduce} unidade(s) precisa(m) ser produzida(s).`,
            missingInsumos: insufficientInsumos,
        };
    }

    return {
        status: "can_produce",
        message: "Produto será produzido automaticamente",
    };
}