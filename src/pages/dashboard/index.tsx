import { formatToBRL } from "@/utils/helpers";
import { BestProducts, ProductSalesChart } from "./components/chart-products-sales";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Activity, ArrowRight, Boxes, Package, ShoppingCart } from "lucide-react";
import { dashboardMock, orders } from "@/utils/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderDetails } from "./components/chart-sellers";
import { DataTable } from "../sales/data-table/data-table";

export function Dashboard() {
    return (
        <>
            <div className="grid md:grid-cols-4 gap-6 items-start w-full">
                <div className="col-span-3 space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 bg-card p-2 rounded-3xl shadow">
                        <Card className="bg-primary py-6 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-[18px] font-light">Receita Total</CardTitle>
                                <div className="bg-white/20 p-1.5 rounded-full text-center items-center ">
                                    <DollarSign className="h-4 w-4 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-medium">{formatToBRL(dashboardMock.totalRevenue)}</div>
                                <p className="text-xs text-gray-300">
                                    <Badge className="text-green-200 bg-white/10">+12.5%</Badge> em relação ao mês passado
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#F6F6F6] py-6">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-[18px] font-light">Pedidos</CardTitle>
                                <div className="bg-primary/10 p-1.5 rounded-full text-center items-center ">
                                    <ShoppingBag className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-medium">+{dashboardMock.totalOrders}</div>
                                <p className="text-xs text-muted-foreground">
                                    <Badge className="text-green-500 bg-gray-400/10">+15.3%</Badge> em relação ao mês passado
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#F6F6F6] py-6">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-[18px] font-light">Lucro Total</CardTitle>
                                <div className="bg-primary/10 p-1.5 rounded-full text-center items-center ">
                                    <Activity className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-medium text-green-600">{formatToBRL(dashboardMock.totalProfit)}</div>
                                <p className="text-xs text-muted-foreground">
                                    <Badge className="text-green-500 bg-gray-400/10">+8.2% </Badge> em relação ao mês passado
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="w-full flex gap-4">
                        <ProductSalesChart />
                        <OrderDetails />
                    </div>
                    <div >
                        <div className="my-12"></div>
                        <h1 className="px-6 my-4 text-lg font-medium">Últimas vendas</h1>
                        <DataTable data={orders} />
                    </div>
                </div>
                <div className="col-span-1 w-full space-y-4">
                    <BestProducts />

                    <div className="grid gap-6 md:grid-cols-1">
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <Boxes className="h-10 w-10 text-primary mb-2" />
                                <CardTitle>Insumos</CardTitle>
                                <CardDescription>Gerencie seu estoque de matérias-primas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full">
                                    Gerenciar Insumos
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <Package className="h-10 w-10 text-primary mb-2" />
                                <CardTitle>Produtos</CardTitle>
                                <CardDescription>Crie e precifique seus produtos</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full">
                                    Gerenciar Produtos
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <ShoppingCart className="h-10 w-10 text-primary mb-2" />
                                <CardTitle>Vendas</CardTitle>
                                <CardDescription>Registre e acompanhe suas vendas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full">
                                    Registrar Vendas
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}

{/* <Card className="bg-[#F6F6F6] py-6">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-[18px] font-light">Ticket Médio</CardTitle>
                            <div className="bg-primary/10 p-1.5 rounded-full text-center items-center ">
                                <CreditCard className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-medium">{formatToBRL(dashboardMock.totalRevenue / dashboardMock.totalOrders)}</div>
                            <p className="text-xs text-muted-foreground">
                                <Badge className="text-red-500 bg-gray-400/10">-1.8%</Badge> em relação ao mês passado
                            </p>
                        </CardContent>
</Card> */}