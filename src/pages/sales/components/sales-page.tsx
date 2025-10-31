import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle2, Plus, Trash2, Package, AlertTriangle, UserPlus, Loader2, ArrowLeft, DollarSign, BarChart3 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { OrderItem, OrderStatus, Customer, Product, RawMaterial, OrderAdditionalCost } from "@/utils/models"
import { useMutation, useQuery } from "@tanstack/react-query"
import { CreateCustomer } from "@/api/sales/createCustomer"
import { toast } from "sonner"
import { handleApiError } from "@/utils/helpers"
import { queryClient } from "@/lib/queryClient"
import { FindCustomers } from "@/api/sales/findCustomers"
import { CreateSale } from "@/api/sales/createSale"
import { useStore } from "@/context/StoreContext"
import { UpdateAllEndpoints } from "@/pages/products/components/production-product-dialog"
import { useNavigate } from "react-router-dom"

export function SalesPage() {
    const { Products, Materials } = useStore();
    const navigate = useNavigate();
    const [items, setItems] = useState<Omit<OrderItem, "id" | "orderId">[]>([])
    const [additionalCosts, setAdditionalCosts] = useState<Omit<OrderAdditionalCost, "id" | "orderId">[]>([])
    const [currentItem, setCurrentItem] = useState({
        productId: "",
        quantity: "1",
        unitPrice: "",
    })
    const [currentCost, setCurrentCost] = useState({
        description: "",
        amount: "",
        orderItemId: "none",
        category: "other" as OrderAdditionalCost["category"],
        quantity: "1",
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
    } | null>(null);

    const [costAvailabilityStatus, setCostAvailabilityStatus] = useState<{
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

    const { data: findCustomersQuery, isPending: isPendingCustomer, refetch: refetchCustomers } = useQuery({
        queryKey: ["FindCustomersQuery"],
        queryFn: () => FindCustomers({ searchText: "" }),
    });

    const { mutateAsync: createCustomerFn } = useMutation({
        mutationFn: CreateCustomer,
        async onSuccess(data) {
            if (data.success) {
                toast.success(data.message);
                await queryClient.invalidateQueries({ queryKey: ["FindCustomersQuery"] });
                const newData = await refetchCustomers();
                const lastCustomer = newData.data?.data?.slice(-1)[0];
                setCustomerId(lastCustomer?.id || "");
            } else {
                toast.error(data.message);
            }
        },
        onError(error) {
            handleApiError(error);
        }
    });

    const { mutateAsync: createSaleFn } = useMutation({
        mutationFn: CreateSale,
        onSuccess(data) {
            if (data.success) {
                toast.success(data.message);
                queryClient.invalidateQueries({
                    queryKey: ["FindSalesQuery"]
                });
                UpdateAllEndpoints();
                navigate(-1);
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

    useEffect(() => {
        const isLinked = currentCost.orderItemId !== "none";
        if (isLinked) {
            const linkedItem = items.find(item => item.productId === currentCost.orderItemId);
            const itemCost = linkedItem ? linkedItem.unitCost : 0;
            const quantity = Number.parseFloat(currentCost.quantity) || 0;

            const calculatedAmount = itemCost * quantity;
            setCurrentCost(prev => ({
                ...prev,
                amount: calculatedAmount.toString()
            }));
        }
    }, [currentCost.orderItemId, currentCost.quantity, items]);

    useEffect(() => {
        const quantity = Number.parseFloat(currentCost.quantity) || 0;
        const productId = currentCost.orderItemId;

        if (productId && productId !== "none" && quantity > 0) {
            const availability = checkProductAvailability(
                productId,
                quantity,
                Products,
                Materials
            );
            setCostAvailabilityStatus(availability);
        } else {
            setCostAvailabilityStatus(null);
        }
    }, [currentCost.orderItemId, currentCost.quantity, Products, Materials]);

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

    const handleAddCost = () => {
        const amount = Number.parseFloat(currentCost.amount)
        if (!currentCost.description.trim() || amount <= 0) {
            return
        }

        const isLinked = currentCost.orderItemId !== "none";
        if (isLinked && (!costAvailabilityStatus || costAvailabilityStatus.status === "insufficient")) {
            toast.error("Não é possível adicionar o custo. Verifique a disponibilidade do produto vinculado.");
            return;
        }

        const newCost: Omit<OrderAdditionalCost, "id" | "orderId"> = {
            description: currentCost.description,
            amount,
            orderItemId: currentCost.orderItemId === "none" ? undefined : currentCost.orderItemId,
            category: currentCost.category,
            quantity: currentCost.orderItemId !== "none" ? Number.parseFloat(currentCost.quantity) : undefined,
        }

        setAdditionalCosts([...additionalCosts, newCost])

        setCurrentCost({
            description: "",
            amount: "",
            orderItemId: "none",
            category: "other",
            quantity: "1",
        })
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
                additionalCosts: additionalCosts.map(cost => ({
                    ...cost,
                    id: "",
                    orderId: "",
                    category: (() => {
                        switch (cost.category) {
                            case "shipping": return 1
                            case "packaging": return 2
                            case "delivery": return 3
                            case "custom": return 4
                            case "other": return 5
                            default: return null
                        }
                    })() as any,
                })),
                observations: notes,
            })
        } catch (error) {
            console.error(error)
        }

        setItems([])
        setAdditionalCosts([])
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

    const handleRemoveCost = (index: number) => {
        setAdditionalCosts(additionalCosts.filter((_, i) => i !== index))
    }

    const selectedProduct = currentItem.productId ? Products?.find(product => product.id === currentItem.productId) : null
    const currentQuantity = Number.parseFloat(currentItem.quantity) || 0
    const currentUnitPrice = Number.parseFloat(currentItem.unitPrice) || 0

    const cartTotal = items.reduce((sum, item) => sum + item.totalRevenue, 0)
    const cartProfit = items.reduce((sum, item) => sum + item.realProfit, 0)

    const totalAdditionalCost = additionalCosts.reduce((sum, cost) => sum + cost.amount, 0)
    const totalProductCost = cartTotal - cartProfit // Custo total apenas dos produtos
    const totalCost = totalProductCost + totalAdditionalCost // Custo (Produto + Adicionais)
    const totalProfit = cartProfit - totalAdditionalCost // Lucro Final (Receita - Custo Total)

    // Helper para o formulário de custo
    const isCostLinked = currentCost.orderItemId !== "none";

    return (
        <>
            <div className="space-y-4 lg:px-6">
                <div>
                    <Button variant={"ghost"} onClick={() => navigate(-1)}>
                        <ArrowLeft />
                        Voltar
                    </Button>
                </div>
                <div>
                    <h1 className="text-2xl font-medium ">Registrar Pedido</h1>
                    <p className="text-muted-foreground mt-1">
                        Adicione produtos ao carrinho e finalize o pedido
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 pb-4">
                        {/* Customer Selection */}
                        <Card>
                            <CardContent className=" space-y-4">
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
                            <CardContent className="space-y-4">
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

                        {items.length > 0 && (
                            <Card>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Custos Adicionais</span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="costDescription">Descrição</Label>
                                            <Input
                                                id="costDescription"
                                                placeholder="Ex: Frete, Embalagem especial"
                                                value={currentCost.description}
                                                onChange={(e) => setCurrentCost({ ...currentCost, description: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            {isCostLinked ? (
                                                <>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="costQuantity">Quantidade</Label>
                                                        <Input
                                                            id="costQuantity"
                                                            type="number"
                                                            step="1"
                                                            min="1"
                                                            placeholder="1"
                                                            value={currentCost.quantity}
                                                            onChange={(e) => setCurrentCost({ ...currentCost, quantity: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="costAmount">Valor</Label>
                                                        <Input
                                                            id="costAmount"
                                                            type="number"
                                                            placeholder="0.00"
                                                            value={currentCost.amount}
                                                            disabled={true}
                                                            readOnly={true}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="grid gap-2 col-span-2">
                                                    <Label htmlFor="costAmount">Valor</Label>
                                                    <Input
                                                        id="costAmount"
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        placeholder="0.00"
                                                        value={currentCost.amount}
                                                        disabled={false}
                                                        onChange={(e) => setCurrentCost({ ...currentCost, amount: e.target.value })}
                                                    />
                                                </div>
                                            )}

                                            <div className="grid gap-2">
                                                <Label htmlFor="costCategory">Categoria</Label>
                                                <Select
                                                    value={currentCost.category}
                                                    onValueChange={(value) =>
                                                        setCurrentCost({ ...currentCost, category: value as OrderAdditionalCost["category"] })
                                                    }
                                                >
                                                    <SelectTrigger id="costCategory">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="shipping">Frete</SelectItem>
                                                        <SelectItem value="packaging">Embalagem</SelectItem>
                                                        <SelectItem value="delivery">Entrega</SelectItem>
                                                        <SelectItem value="custom">Personalização</SelectItem>
                                                        <SelectItem value="other">Outro</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="costProduct">Vincular ao Produto (Custo será Custo do Produto)</Label>
                                            <Select
                                                value={currentCost.orderItemId}
                                                onValueChange={(value) => {
                                                    const isUnlinking = value === "none";
                                                    setCurrentCost({
                                                        ...currentCost,
                                                        orderItemId: value,
                                                        amount: isUnlinking ? "" : currentCost.amount,
                                                        quantity: isUnlinking ? "1" : currentCost.quantity,
                                                    })
                                                }}
                                            >
                                                <SelectTrigger id="costProduct">
                                                    <SelectValue placeholder="Nenhum" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Nenhum</SelectItem>
                                                    {items.map((item, index) => (
                                                        <SelectItem key={index} value={item.productId}>
                                                            {item.name} (Custo: {formatCurrency(item.unitCost)})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {costAvailabilityStatus && (
                                            <div className="pt-2">
                                                {costAvailabilityStatus.status === "insufficient" && (
                                                    <Alert variant="destructive">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertDescription>
                                                            <div className="font-medium mb-1">Não é possível vincular este custo:</div>
                                                            <div className="text-sm">{costAvailabilityStatus.message}</div>
                                                            {costAvailabilityStatus.missingInsumos && (
                                                                <div className="text-xs mt-1">
                                                                    Insumos faltantes: {costAvailabilityStatus.missingInsumos.join(", ")}
                                                                </div>
                                                            )}
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                                {costAvailabilityStatus.status === "can_produce" && (
                                                    <Alert>
                                                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                                                        <AlertDescription>
                                                            <div className="font-medium mb-1 text-orange-600">
                                                                Aviso de Produção
                                                            </div>
                                                            <div className="text-sm">
                                                                {costAvailabilityStatus.message} A produção será acionada ao finalizar o pedido.
                                                            </div>
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                                {costAvailabilityStatus.status === "available" && (
                                                    <Alert>
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                        <AlertDescription className="text-green-600">Produto vinculado disponível</AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>
                                        )}

                                        <Button
                                            type="button"
                                            onClick={handleAddCost}
                                            disabled={
                                                !currentCost.description.trim() ||
                                                Number.parseFloat(currentCost.amount) <= 0 ||
                                                (isCostLinked && (!costAvailabilityStatus || costAvailabilityStatus.status === "insufficient"))
                                            }
                                            size="sm"
                                            variant="outline"
                                            className="w-full bg-transparent"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Adicionar Custo
                                        </Button>
                                    </div>

                                    {additionalCosts.length > 0 && (
                                        <>
                                            <Separator />
                                            <div className="space-y-2">
                                                {additionalCosts.map((cost, index) => {
                                                    const linkedItem = cost.orderItemId
                                                        ? items.find((i) => i.productId === cost.orderItemId)
                                                        : null
                                                    return (
                                                        <div key={index} className="flex items-start justify-between gap-4 text-sm">
                                                            <div className="flex-1">
                                                                <div className="font-medium">{cost.description}</div>
                                                                {linkedItem && (
                                                                    <div className="text-xs text-muted-foreground">Vinculado a: {linkedItem.name}</div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-destructive">({formatCurrency(cost.amount)})</span>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleRemoveCost(index)}
                                                                    className="h-6 w-6"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {items.length > 0 && (
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <BarChart3 className="h-5 w-5" />
                                        Resumo do Pedido
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Receita (Total em Produtos):</span>
                                            <span className="font-medium">{formatCurrency(cartTotal)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Custo dos Produtos:</span>
                                            <span className="font-medium">{formatCurrency(totalProductCost)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Custos Adicionais:</span>
                                            <span className="font-medium">{formatCurrency(totalAdditionalCost)}</span>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-base">
                                            <span className="font-semibold text-muted-foreground">Custo Total:</span>
                                            <span className="font-semibold">{formatCurrency(totalCost)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xl">
                                            <span className="font-bold">Lucro Final:</span>
                                            <span className="font-bold text-green-600">{formatCurrency(totalProfit)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Notes */}
                        <Card>
                            <CardContent className="space-y-4">
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
                            </CardContent>
                        </Card>

                    </div>
                    <div className="border-t pt-4 mt-4 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={items.length === 0}>
                            Finalizar Pedido ({items.length})
                        </Button>
                    </div>
                </form>
            </div>
        </>
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