import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Package, Droplets, Truck, AlertCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useStore } from "@/context/StoreContext"
import type { OrderStatus } from "@/utils/models"
import { useState } from "react"
import { getEnumEnglishName, getEnumValue, handleApiError } from "@/utils/helpers"
import { useMutation } from "@tanstack/react-query"
import { UpdateSaleStatus } from "@/api/sales/updateStatus"
import { toast } from "sonner"
import { queryClient } from "@/lib/queryClient"

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value)
}

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

export function Production() {
    // Assumindo que seu store provê o 'setSales' para atualizar o estado
    const { Sales, Products } = useStore()
    const [selectedTab, setSelectedTab] = useState<OrderStatus>("PENDING")

    const ordersByStatus = {
        PENDING: (Sales || []).filter((o) => getEnumEnglishName("OrderStatus", Number(o.status)) === "PENDING"),
        IN_PRODUCTION: (Sales || []).filter((o) => getEnumEnglishName("OrderStatus", Number(o.status)) === "IN_PRODUCTION"),
        IN_MATURING: (Sales || []).filter((o) => getEnumEnglishName("OrderStatus", Number(o.status)) === "IN_MATURING"),
        WAITING_DELIVERY: (Sales || []).filter((o) => getEnumEnglishName("OrderStatus", Number(o.status)) === "WAITING_DELIVERY"),
    }

    const { mutateAsync: updateStatustFn } = useMutation({
        mutationFn: UpdateSaleStatus,
        onSuccess(data) {
            if (data.success) {
                toast.success(data.message);
                queryClient.invalidateQueries({
                    queryKey: ["FindSalesQuery"]
                });
            } else {
                toast.error(data.message);
            }
        },
        onError(error) {
            handleApiError(error);
        }
    });

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        const order = Sales?.find((o) => o.id === orderId)
        if (!order || !Sales) return

        const originalStringStatus = getEnumEnglishName("OrderStatus", Number(order.status))
        const newNumericStatus = getEnumValue("OrderStatus", newStatus)

        // const newSales = Sales.map((o) =>
        //     o.id === orderId ? { ...o, status: newNumericStatus } : o,
        // )

        try {
            await updateStatustFn({
                orderId,
                status: newNumericStatus
            })
        } catch (error) {
            console.error(error)
        }

        if (originalStringStatus === "PENDING" && newStatus !== "PENDING") {
            order.items.forEach((item) => {
                const product = Products?.find((p) => p.id === item.productId)
                if (product) {
                    console.log(` - Baixando ${item.quantity} de ${product.name}`)
                }
            })
        }
    }

    const renderOrderTable = (orderList: typeof Sales) => {
        if (orderList?.length === 0) {
            return (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Nenhum pedido neste status</p>
                </div>
            )
        }

        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pedido</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Produtos</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orderList && orderList
                            .sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime())
                            .map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">#{order.id}</TableCell>
                                    <TableCell className="text-sm">{formatDate(order.orderDate)}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">{order.customer?.name || "Cliente não informado"}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="text-sm">
                                                    <span className="font-medium">{item.quantity}x</span> {item.name}
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(order.totalAmount)}</TableCell>
                                    <TableCell className="text-right">
                                        <Select
                                            value={
                                                !isNaN(Number(order.status))
                                                    ? getEnumEnglishName("OrderStatus", Number(order.status))
                                                    : order.status
                                            }
                                            onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                                        >
                                            <SelectTrigger className="w-[180px] ml-auto">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PENDING">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        Pendente
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="IN_PRODUCTION">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4" />
                                                        Em Produção
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="IN_MATURING">
                                                    <div className="flex items-center gap-2">
                                                        <Droplets className="h-4 w-4" />
                                                        Em Maturação
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="WAITING_DELIVERY">
                                                    <div className="flex items-center gap-2">
                                                        <Truck className="h-4 w-4" />
                                                        Aguardando Entrega
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="CANCELLED">
                                                    <div className="flex items-center gap-2">
                                                        <AlertCircle className="h-4 w-4" />
                                                        Cancelado
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-4 lg:px-6">
                <div>
                    <h1 className="text-2xl font-medium ">Fila de Produção</h1>
                    <p className="text-muted-foreground mt-1">
                        Acompanhe e atualize o status dos pedidos
                    </p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Fila de Produção</CardTitle>
                        <CardDescription></CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as OrderStatus)}>
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="PENDING" className="gap-2">
                                    <Clock className="h-4 w-4" />
                                    Pendentes
                                    {ordersByStatus.PENDING?.length !== 0 && (
                                        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs font-medium">
                                            {ordersByStatus.PENDING?.length ?? 0}
                                        </span>
                                    )}
                                </TabsTrigger>

                                <TabsTrigger value="IN_PRODUCTION" className="gap-2">
                                    <Package className="h-4 w-4" />
                                    Em Produção
                                    {ordersByStatus.IN_PRODUCTION?.length !== 0 && (
                                        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs font-medium">
                                            {ordersByStatus.IN_PRODUCTION?.length ?? 0}
                                        </span>
                                    )}
                                </TabsTrigger>

                                <TabsTrigger value="IN_MATURING" className="gap-2">
                                    <Droplets className="h-4 w-4" />
                                    Em Maturação
                                    {ordersByStatus.IN_MATURING?.length !== 0 && (
                                        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs font-medium">
                                            {ordersByStatus.IN_MATURING?.length ?? 0}
                                        </span>
                                    )}
                                </TabsTrigger>

                                <TabsTrigger value="WAITING_DELIVERY" className="gap-2">
                                    <Truck className="h-4 w-4" />
                                    Aguardando Entrega
                                    {ordersByStatus.WAITING_DELIVERY?.length !== 0 && (
                                        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs font-medium">
                                            {ordersByStatus.WAITING_DELIVERY?.length ?? 0}
                                        </span>
                                    )}

                                </TabsTrigger>
                            </TabsList>


                            <TabsContent value="PENDING" className="mt-6">
                                {renderOrderTable(ordersByStatus.PENDING)}
                            </TabsContent>

                            <TabsContent value="IN_PRODUCTION" className="mt-6">
                                {renderOrderTable(ordersByStatus.IN_PRODUCTION)}
                            </TabsContent>

                            <TabsContent value="IN_MATURING" className="mt-6">
                                {renderOrderTable(ordersByStatus.IN_MATURING)}
                            </TabsContent>

                            <TabsContent value="WAITING_DELIVERY" className="mt-6">
                                {renderOrderTable(ordersByStatus.WAITING_DELIVERY)}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

        </>
    )
}