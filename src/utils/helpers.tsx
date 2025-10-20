import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import type { OrderStatus } from "./models";

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
