import { formatToBRL } from "@/utils/helpers";
import { BestProducts, ProductSalesChart } from "./components/chart-products-sales";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Activity, Boxes, Package, ShoppingCart, ArrowRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderDetails } from "./components/chart-sellers";
import { DatePickerWithRange } from "@/components/ui/picker-date-select";
import { useEffect, useState } from "react";
import { addDays, format, startOfMonth, subMonths } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { FindDashboard } from "@/api/dashboard/dashboardData";

export function Dashboard() {
    const currentDate = new Date();
    const startDate = startOfMonth(currentDate);
    const endDate = currentDate;
    const formattedStartDate = format(subMonths(startDate, 0), "yyyy-MM-dd");
    const formattedEndDate = format(addDays(endDate, 0), "yyyy-MM-dd");

    const [startDateToFind, setStartDateToFind] = useState(formattedStartDate);
    const [endDateToFind, setEndDateToFind] = useState(formattedEndDate);
    const [datePreset, setDatePreset] = useState<string | undefined>(undefined);

    const handleDateChange = (period: DateRange | undefined) => {
        if (period && period.from && period.to) {
            setStartDateToFind(format(period.from, "yyyy-MM-dd"));
            setEndDateToFind(format(period.to, "yyyy-MM-dd"));
            setDatePreset(undefined);
        }
    };

    const handlePresetChange = (value: string) => {
        setDatePreset(value);

        const today = new Date();
        let start: Date;
        let end: Date = today;

        if (value === "today") {
            start = today;
        } else if (value === "week") {
            start = new Date(today);
            start.setDate(today.getDate() - 7);
        } else if (value === "month") {
            start = new Date(today);
            start.setMonth(today.getMonth() - 1);
        } else {
            return;
        }

        const startStr = start.toISOString().split("T")[0];
        const endStr = end.toISOString().split("T")[0];

        setStartDateToFind(startStr);
        setEndDateToFind(endStr);
    };

    const clearFilters = () => {
        setDatePreset(undefined);
        setStartDateToFind(formattedStartDate);
        setEndDateToFind(formattedEndDate);
    };

    const { data, isFetching, refetch } = useQuery({
        queryKey: ["dashboardData", startDateToFind, endDateToFind],
        queryFn: () =>
            FindDashboard({
                startDate: startDateToFind,
                endDate: endDateToFind,
            }),
        enabled: !!startDateToFind && !!endDateToFind,
    });

    useEffect(() => {
        if (startDateToFind && endDateToFind) {
            refetch();
        }
    }, [startDateToFind, endDateToFind]);

    const showClearButton = !!datePreset || (startDateToFind !== formattedStartDate || endDateToFind !== formattedEndDate);

    const renderSkeletonCard = (color?: string) => (
        <Card className={`py-6 ${color ?? "bg-[#F6F6F6]"}`}>
            <div className="animate-pulse space-y-3 p-4">
                <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                <div className="h-8 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
            </div>
        </Card>
    );

    return (
        <>
            <div className="flex justify-end items-center gap-2">
                <DatePickerWithRange
                    classNameButton="text-foreground"
                    onDateChange={handleDateChange}
                    dateStart={startDateToFind}
                    dateEnd={endDateToFind}
                />
                <Select value={datePreset} onValueChange={handlePresetChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Hoje</SelectItem>
                        <SelectItem value="week">Última semana</SelectItem>
                        <SelectItem value="month">Último mês</SelectItem>
                    </SelectContent>
                </Select>

                {showClearButton && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 flex items-center gap-1"
                        onClick={clearFilters}
                    >
                        <X className="h-3 w-3" />
                        Limpar filtro
                    </Button>
                )}
            </div>

            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 bg-card p-2 rounded-3xl shadow">
                {isFetching ? (
                    <>
                        {renderSkeletonCard("bg-primary/80")}
                        {renderSkeletonCard()}
                        {renderSkeletonCard()}
                        {renderSkeletonCard()}
                    </>
                ) : (
                    <>
                        <Card className="bg-primary py-6 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-[18px] font-light">Receita Total</CardTitle>
                                <div className="bg-white/20 p-1.5 rounded-full text-center items-center ">
                                    <DollarSign className="h-4 w-4 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-medium">{formatToBRL(data?.data.totalRevenue.value ?? 0)}</div>
                                <p className="text-xs text-gray-300">
                                    <Badge className="text-green-200 bg-white/10">
                                        {data?.data.totalRevenue.changePercentage}%
                                    </Badge>{" "}
                                    {data?.data.totalRevenue.comparisonPeriod}
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
                                <div className="text-3xl font-medium">+{data?.data.totalOrders.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    <Badge className="text-green-500 bg-gray-400/10">
                                        {data?.data.totalOrders.changePercentage}%
                                    </Badge>{" "}
                                    {data?.data.totalOrders.comparisonPeriod}
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
                                <div className="text-3xl font-medium text-green-600">
                                    {formatToBRL(data?.data.totalProfit.value)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    <Badge className="text-green-500 bg-gray-400/10">
                                        +{data?.data.totalProfit.changePercentage}%{" "}
                                    </Badge>{" "}
                                    {data?.data.totalProfit.comparisonPeriod}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#F6F6F6] py-6">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-[18px] font-light">Despesa Total</CardTitle>
                                <div className="bg-primary/10 p-1.5 rounded-full text-center items-center ">
                                    <Activity className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-medium text-red-600">
                                    {formatToBRL(data?.data.totalExpense.value)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    <Badge className="text-red-500 bg-gray-400/10">
                                        {data?.data.totalExpense.changePercentage}%
                                    </Badge>{" "}
                                    {data?.data.totalExpense.comparisonPeriod}
                                </p>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Restante do conteúdo */}
            <div className="grid md:grid-cols-4 gap-6 items-start w-full">
                <div className="col-span-3 space-y-6">
                    <div className="w-full flex gap-4">
                        <ProductSalesChart />
                        <OrderDetails />
                    </div>
                    <div>
                        <div className="my-12"></div>
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
    );
}
