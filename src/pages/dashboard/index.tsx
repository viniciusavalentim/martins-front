import { formatToBRL } from "@/utils/helpers";
import { BestProducts, ProductSalesChart } from "./components/chart-products-sales";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, ShoppingBag, CreditCard, Activity } from "lucide-react";
import { dashboardMock } from "@/utils/mock";

export function Dashboard() {
    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatToBRL(dashboardMock.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                            +12.5% em relação ao mês passado
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatToBRL(dashboardMock.totalProfit)}</div>
                        <p className="text-xs text-muted-foreground">
                            +8.2% em relação ao mês passado
                        </p>
                    </CardContent>
                </Card>

                {/* Card: Pedidos */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{dashboardMock.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            +15.3% em relação ao mês passado
                        </p>
                    </CardContent>
                </Card>

                {/* Card: Ticket Médio */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatToBRL(dashboardMock.totalRevenue / dashboardMock.totalOrders)}</div>
                        <p className="text-xs text-muted-foreground">
                            -1.8% em relação ao mês passado
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex gap-6 w-full">
                <div className="flex-1 min-w-0 max-h-[300px]">
                    <ProductSalesChart />
                </div>
                <div className="flex-1 min-w-0 max-h-[300px]">
                    <BestProducts />
                </div>
            </div>

        </>
    )
}