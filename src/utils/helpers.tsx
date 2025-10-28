import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import type { Order } from "./models";
import { isAxiosError } from "axios";
import { toast } from "sonner";

const valueSchema = z.number().nullable().optional();

export function formatToBRL(value: unknown): string {
    const parsed = valueSchema.safeParse(value);

    if (!parsed.success || parsed.data === null || parsed.data === undefined) {
        return "Sem valor";
    }

    return parsed.data.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

export const getTypeBadge = (type: string) => {
    console.log(type)
    switch (type) {
        case "add":
            return (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200" >
                    Entrada
                </Badge>
            )
        case "remove":
            return (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200" >
                    Saída
                </Badge>
            )
        default:
            return <Badge variant="outline" > Ajuste </Badge>
    }
}

export const getTypeBadgeProduct = (type: string) => {
    console.log(type)
    switch (type) {
        case "sell":
            return (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200" >
                    Venda
                </Badge>
            )
        case "production":
            return (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200" >
                    Produção
                </Badge>
            )
        default:
            return <Badge variant="outline" > Ajuste </Badge>
    }
}

export const getOrderStatusBadge = (status: string | number) => {
    switch (status) {
        case "PENDING":
        case 1:
            return (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Pendente
                </Badge>
            )
        case "IN_PRODUCTION":
        case 2:
            return (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Em Produção
                </Badge>
            )
        case "IN_MATURING":
        case 3:
            return (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    Em Maturação
                </Badge>
            )
        case "WAITING_DELIVERY":
        case 4:
            return (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Aguardando Entrega
                </Badge>
            )
        case "CANCELLED":
        case 5:
            return (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    Cancelado
                </Badge>
            )
        case "COMPLETEDd":
        case 6:
            return (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Concluído
                </Badge>
            )
        default:
            return (
                <Badge variant="outline">
                    Desconhecido
                </Badge>
            )
    }
}

type EnumType =
    | "UnitOfMeasure"
    | "CostType"
    | "OrderStatus"
    | "ExpenseCategory"
    | "ExpenseType"
    | "RecurrenceInterval"


export function getEnumLabel(enumType: EnumType, value: number | string): string {
    switch (enumType) {
        // --- Unidade de Medida ---
        case "UnitOfMeasure":
            switch (value) {
                case 1: return "g";
                case 2: return "ml";
                case 3: return "un";
                default: return "";
            }

        // --- Tipo de Custo ---
        case "CostType":
            switch (value) {
                case 1: return "Valor Fixo";
                case 2: return "Percentual";
                default: return "Desconhecido";
            }

        // --- Status do Pedido ---
        case "OrderStatus":
            switch (value) {
                case 1: return "Pendente";
                case 2: return "Em Produção";
                case 3: return "Em Maturação";
                case 4: return "Cancelado";
                case 5: return "Aguardando Entrega";
                case 6: return "Completo";
                default: return "Desconhecido";
            }

        // --- Categoria de Despesa ---
        case "ExpenseCategory":
            switch (value) {
                case 1: return "Equipamentos";
                case 2: return "Utilidades";
                case 3: return "Marketing";
                case 4: return "Aluguel";
                case 5: return "Mão de Obra";
                case 6: return "Outros";
                default: return "Desconhecido";
            }

        // --- Tipo de Despesa ---
        case "ExpenseType":
            switch (value) {
                case 1: return "Única";
                case 2: return "Recorrente";
                default: return "Desconhecido";
            }

        // --- Intervalo de Recorrência ---
        case "RecurrenceInterval":
            switch (value) {
                case 1: return "Diária";
                case 2: return "Semanal";
                case 3: return "Mensal";
                case 4: return "Anual";
                default: return "Desconhecido";
            }

        default:
            return "Desconhecido";
    }
}

export function getEnumEnglishName(enumType: string, value: number | string): string {
    switch (enumType.toUpperCase()) {
        // --- Unidade de Medida ---
        case "UNITOFMEASURE":
            switch (value) {
                case 1: return "G";
                case 2: return "ML";
                case 3: return "UN";
                default: return "UNKNOWN";
            }

        // --- Tipo de Custo ---
        case "COSTTYPE":
            switch (value) {
                case 1: return "FIXED_VALUE";
                case 2: return "PERCENTAGE";
                default: return "UNKNOWN";
            }

        // --- Status do Pedido ---
        case "ORDERSTATUS":
            switch (value) {
                case 1: return "PENDING";
                case 2: return "IN_PRODUCTION";
                case 3: return "IN_MATURING";
                case 4: return "CANCELLED";
                case 5: return "AWAITING_DELIVERY";
                case 6: return "COMPLETED";
                default: return "UNKNOWN";
            }

        // --- Categoria de Despesa ---
        case "EXPENSECATEGORY":
            switch (value) {
                case 1: return "EQUIPMENT";
                case 2: return "UTILITIES";
                case 3: return "MARKETING";
                case 4: return "RENT";
                case 5: return "LABOR";
                case 6: return "OTHER";
                default: return "UNKNOWN";
            }

        // --- Tipo de Despesa ---
        case "EXPENSETYPE":
            switch (value) {
                case 1: return "ONE-TIME";
                case 2: return "RECURRING";
                default: return "UNKNOWN";
            }

        // --- Intervalo de Recorrência ---
        case "RECURRENCEINTERVAL":
            switch (value) {
                case 1: return "DAILY";
                case 2: return "WEEKLY";
                case 3: return "MONTHLY";
                case 4: return "YEARLY";
                default: return "UNKNOWN";
            }

        default:
            return "UNKNOWN";
    }
}


export function getEnumValue(enumType: EnumType, name: string): number {
    switch (enumType) {
        case "UnitOfMeasure":
            switch (name) {
                case "g": return 1
                case "ml": return 2
                case "un": return 3
                default: return 0
            }

        case "CostType":
            switch (name) {
                case "FIXED_VALUE": return 1
                case "PERCENTAGE": return 2
                default: return 0
            }

        case "OrderStatus":
            switch (name) {
                case "PENDING": return 1
                case "IN_PRODUCTION": return 2
                case "IN_MATURING": return 3
                case "CANCELLED": return 4
                case "WAITING_DELIVERY": return 5
                default: return 0
            }

        case "ExpenseCategory":
            switch (name) {
                case "equipment": return 1
                case "utilities": return 2
                case "marketing": return 3
                case "rent": return 4
                case "labor": return 5
                case "other": return 6
                default: return 0
            }

        case "ExpenseType":
            switch (name) {
                case "one-time": return 1
                case "recurring": return 2
                default: return 0
            }

        case "RecurrenceInterval":
            switch (name) {
                case "daily": return 1
                case "weekly": return 2
                case "monthly": return 3
                case "yearly": return 4
                default: return 0
            }

        default:
            return 0
    }
}


export const handleApiError = (error: unknown) => {
    if (isAxiosError(error) && error.response?.data.error) {
        toast.error(error.response.data.error)
    } else {
        toast.error("Ocorreu um erro")
    }
}

export interface MonthlySummary {
    totalRevenue: number
    totalProfit: number
    salesCount: number
    averageProfitMargin: number
}

export function calculateMonthlySummary(orders: Order[]): MonthlySummary {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthlyOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate)
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
    })

    const totalRevenue = monthlyOrders.reduce((acc, order) => acc + order.totalAmount, 0)
    const totalProfit = monthlyOrders.reduce((acc, order) => acc + order.profit, 0)
    const salesCount = monthlyOrders.length

    const averageProfitMargin =
        totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

    return {
        totalRevenue,
        totalProfit,
        salesCount,
        averageProfitMargin: Number(averageProfitMargin.toFixed(2))
    }
}