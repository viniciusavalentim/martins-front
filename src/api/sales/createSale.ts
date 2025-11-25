import api from "@/lib/axios";
import type { OrderAdditionalCost } from "@/utils/models";

interface CreateSaleRequest {
  nameCustomer?: string | null;
  phoneCustomer?: string | null;
  emailCustomer?: string | null;
  customerId?: string | null;
  orderStatus: number;
  orderItems: OrderItem[];
  observations?: string;
  additionalCosts?: OrderAdditionalCost[];
}

interface OrderItem {
  id?: string;
  name: string;
  orderId?: number;
  productId: string;
  quantity: number;
  totalRevenue: number;
  expectedProfit: number;
  realProfit: number;
  unitPrice: number;
  unitCost: number;
}

interface CreateSaleResponse {
  success: boolean;
  message: string;
}

export async function CreateSale({
  nameCustomer,
  phoneCustomer,
  emailCustomer,
  customerId,
  orderStatus,
  orderItems,
  observations,
  additionalCosts,
}: CreateSaleRequest) {
  const response = await api.post<CreateSaleResponse>("/Sale", {
    nameCustomer: nameCustomer ?? null,
    phoneCustomer: phoneCustomer ?? null,
    emailCustomer: emailCustomer ?? null,
    customerId: customerId ?? null,
    orderStatus,
    orderItems,
    observations: observations ?? "",
    additionalCosts: additionalCosts ?? null,
  });

  return response.data;
}
