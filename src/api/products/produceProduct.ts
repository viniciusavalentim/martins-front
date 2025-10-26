import api from "@/lib/axios"

interface ProduceProductProps {
    productId: string;
    quantityToProduce: number;
    observation: string;
}
interface ProduceProductResponse {
    success: boolean,
    message: string
}

export async function ProduceProduct(produceData: ProduceProductProps) {
    const endpoint = "/Products/produce";
    const response = await api.put<ProduceProductResponse>(endpoint, produceData);
    return response.data;
}