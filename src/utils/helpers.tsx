import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import type { OrderStatus } from "./models";
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

export const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
        case "PENDING":
            return (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Pendente
                </Badge>
            )
        case "IN_PRODUCTION":
            return (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Em Produção
                </Badge>
            )
        case "IN_MATURING":
            return (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    Em Maturação
                </Badge>
            )
        case "WAITING_DELIVERY":
            return (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Aguardando Entrega
                </Badge>
            )
        case "CANCELLED":
            return (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    Cancelado
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
                case 2: return "m";
                case 3: return "un";
                default: return "Desconhecido";
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
                default: return "Desconhecido";
            }

        // --- Categoria de Despesa ---
        case "ExpenseCategory":
            switch (value) {
                case 1: return "Equipamentos";
                case 2: return "Serviços Públicos";
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