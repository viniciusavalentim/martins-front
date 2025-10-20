import { Badge } from "@/components/ui/badge";
import { z } from "zod";

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

