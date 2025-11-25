import api from "@/lib/axios";

interface UpdateExpenseRequest {
  id: string;
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

interface UpdateExpenseResponse {
  success: boolean;
  message: string;
}

export async function UpdateExpense({
  id,
  name,
  category,
  amount,
  type,
  recurrenceInterval,
  date,
  notes,
  productId,
  quantity,
}: UpdateExpenseRequest) {
  const response = await api.put<UpdateExpenseResponse>("/Expense", {
    id,
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
