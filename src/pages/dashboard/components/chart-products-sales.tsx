"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Pie, PieChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

// MOCKS
const productSales = [
    { date: "01/10/2025", profit: 500, revenue: 1500 },
    { date: "02/10/2025", profit: 420, revenue: 1300 },
    { date: "03/10/2025", profit: 380, revenue: 1200 },
    { date: "04/10/2025", profit: 290, revenue: 900 },
    { date: "05/10/2025", profit: 250, revenue: 800 },
    { date: "06/10/2025", profit: 220, revenue: 700 },
    { date: "07/10/2025", profit: 200, revenue: 650 },
    { date: "08/10/2025", profit: 180, revenue: 600 },
    { date: "09/10/2025", profit: 160, revenue: 550 },
    { date: "10/10/2025", profit: 440, revenue: 900 },
]

const bestProducts = [
    { name: "Vela Aromática Lavanda", quantity: 120, fill: "#3a56c7" },
    { name: "Vela Artesanal Canela", quantity: 95, fill: "#566dd5" },
    { name: "Vela de Massagem", quantity: 70, fill: "#7284e3" },
]

// CONFIGURAÇÕES
const barChartConfig = {
    profit: { label: "Lucro", color: "#3a56c7" },
    revenue: { label: "Receita", color: "#7284e3" },
} satisfies ChartConfig

const pieChartConfig = {
    quantity: { label: "Quantidade" },
    product1: { label: "Vela Aromática Lavanda", color: "var(--chart-1)" },
    product2: { label: "Vela Artesanal Canela", color: "var(--chart-2)" },
    product3: { label: "Vela de Massagem", color: "var(--chart-3)" },
} satisfies ChartConfig

// COMPONENTES
export function ProductSalesChart() {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Vendas por Dia</CardTitle>
                <CardDescription>Lucro X Receita por venda</CardDescription>
            </CardHeader>
            <CardContent>
                {/* className="mx-auto max-h-[256px]" */}
                <ChartContainer config={barChartConfig} >
                    <BarChart data={productSales}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dashed" />}
                        />
                        <Bar dataKey="profit" fill="var(--color-profit)" radius={4} />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Lucro e receita desta semana <TrendingUp className="h-4 w-4" />
                </div>
            </CardFooter>
        </Card>
    )
}

export function BestProducts() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Produtos Mais Vendidos</CardTitle>
                <CardDescription>Quantidade de vendas por produto</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={pieChartConfig}
                    className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[196px]"
                >
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie
                            data={bestProducts}
                            dataKey="quantity"
                            nameKey="name"
                            label
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                    Produtos mais vendidos da semana <TrendingUp className="h-4 w-4" />
                </div>
            </CardFooter>
        </Card>
    )
}

// USO
export function DashboardCharts() {
    return (
        <div className="grid md:grid-cols-2 gap-4">
            <ProductSalesChart />
            <BestProducts />
        </div>
    )
}
