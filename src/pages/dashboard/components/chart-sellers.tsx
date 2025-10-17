"use client"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

// Mock de dados para o dashboard
const dashboardMock = {
    totalRevenue: 120500,
    totalOrders: 320,
    totalProfit: 45000,
    sellers: [
        { data: "2025-10-01", quantity: 30 },
        { data: "2025-10-02", quantity: 45 },
        { data: "2025-10-03", quantity: 38 },
        { data: "2025-10-04", quantity: 52 },
        { data: "2025-10-05", quantity: 61 },
        { data: "2025-10-06", quantity: 54 },
        { data: "2025-10-07", quantity: 70 },
    ],
    startDate: new Date("2025-10-01"),
    endDate: new Date("2025-10-07"),
};

// Configuração do gráfico
const chartConfig = {
    vendas: {
        label: "Vendas",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

function SalesChart() {
    const chartData = dashboardMock.sellers.map(item => ({
        ...item,
        data: new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }));

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Vendas no Período</CardTitle>
                <CardDescription>
                    Exibindo vendas de {dashboardMock.startDate.toLocaleDateString('pt-BR')} a {dashboardMock.endDate.toLocaleDateString('pt-BR')}
                </CardDescription>
            </CardHeader>
            <CardContent >
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            top: 5, right: 20, left: 10, bottom: 5,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="data"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Line
                            dataKey="quantity"
                            type="natural"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{
                                fill: "#3b82f6",
                            }}
                            activeDot={{
                                r: 8,
                                fill: "#2563eb",
                            }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            Tendência de alta de 15,2% neste mês <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2 leading-none text-muted-foreground">
                            Análise do período selecionado
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}

// Componente principal que exibe o dashboard
export function OrderDetails() {
    return (
        <SalesChart />
    );
}

