import api from "@/lib/axios";

interface CreateExpenseRequest {
  name: string;
  category: number;
  amount: number;
  type: number;
  recurrenceInterval?: number | null;
  date: string;
  notes?: string | null;
  productId?: string | null;
  quantity?: string | null;
}

interface CreateExpenseResponse {
  success: boolean;
  message: string;
}

export async function CreateExpense({
  name,
  category,
  amount,
  type,
  recurrenceInterval,
  date,
  notes,
  productId,
  quantity,
}: CreateExpenseRequest) {
  const response = await api.post<CreateExpenseResponse>("/Expense", {
    name,
    category,
    amount,
    type,
    recurrenceInterval: recurrenceInterval ?? null,
    date,
    productId: productId ? productId : null,
    quantity: quantity ? quantity : null,
    notes: notes ?? null,
  });

  return response.data;
}
