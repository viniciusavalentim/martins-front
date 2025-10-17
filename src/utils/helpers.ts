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
