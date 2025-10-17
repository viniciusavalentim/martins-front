// ============================================================================
//                          ENTIDADES DE ESTOQUE E PRODUÇÃO
//                          (INVENTORY AND PRODUCTION ENTITIES)
// ============================================================================

/**
 * Representa a unidade de medida para os insumos.
 * Garante que apenas valores válidos sejam utilizados no sistema.
 */
export type UnitOfMeasure = 'g' | 'ml' | 'un';

/**
 * Representa um fornecedor de matéria-prima.
 */
export interface Supplier {
    id: number;
    name: string;
    contactName?: string;
    email?: string;
    phone?: string;
    createdAt: Date;
}

/**
 * Representa a matéria-prima utilizada na produção das velas (cera, pavio, etc.).
 * O coração do controle de estoque.
 */
export interface RawMaterial {
    id: string;
    name: string;
    category?: string;
    supplierId?: number;
    currentStock: number;
    unitOfMeasure: UnitOfMeasure;
    totalCost: number;
    unitCost: number; // Custo por 'g', 'ml' ou 'un'
    lowStockThreshold?: number; //Alerta de estoque minimo
    lastUpdatedAt: Date;

    // Relacionamento (opcional, para carregar dados do fornecedor)
    supplier?: Supplier;
}

/**
 * Representa o produto final (a vela) pronto para venda.
 */
export interface Product {
    id: string;
    name: string;
    description?: string;
    sellingPrice: number;
    materialCost: number; // Custo Total de Produção (apenas matéria-prima).
    totalCost: number; // Custo da matéria-prima + todos os outros custos adicionais em R$.
    totalAdditionalCosts: number; // Custo adicionais 
    stockQuantity: number; // quantidade de estoque
    profit: number; // Lucro em R$
    profitMarginPorcent: number; //% de lucro
    stockOnHand: number;
    createdAt: Date;

    // Relacionamentos (para carregar a composição completa do produto)
    billOfMaterials: ProductMaterial[];
    additionalCosts?: ProductAdditionalCost[];
}

/**
 * Tabela de junção que define a "receita" de um produto.
 * Em manufatura, isso é chamado de "Bill of Materials" (BOM).
 * Conecta um Produto a uma Matéria-Prima e especifica a quantidade.
 */
export interface ProductMaterial {
    id: number;
    productId: number;
    rawMaterialId: number;
    quantityUsed: number;

    // Relacionamento (opcional, para carregar detalhes da matéria-prima)
    rawMaterial?: RawMaterial;
}

/**
 * Define o tipo de um custo adicional, se é um valor fixo em R$
 * ou uma porcentagem sobre o preço de venda.
 */
export type CostType = 'FIXED_VALUE' | 'PERCENTAGE';

/**
 * Representa as regras de custeio e precificação de um produto,
 * como mão de obra, marketing, taxas e a margem de lucro.
 */
export interface ProductAdditionalCost {
    id: number;
    productId: number;
    description: string;
    type: CostType;
    value: number; // Pode ser R$ 5.00 (para FIXED_VALUE) ou 10.00 (para 10% em PERCENTAGE)
}


// ============================================================================
//                             ENTIDADES DE VENDAS
//                             (SALES ENTITIES)
// ============================================================================

/**
 * Representa um cliente que realiza uma compra.
 */
export interface Customer {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    createdAt: Date;
}

/**
 * Define os possíveis status de um pedido/venda.
 */
export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';

/**
 * Representa o "cabeçalho" de uma venda ou pedido.
 * Contém os totais e informações do cliente.
 */
export interface Order {
    id: number;
    customerId?: number;
    orderDate: Date;
    totalAmount: number; // Faturamento (RECEITA)
    profit: number; //Lucro em R$
    totalCost: number; // Essencial para o dashboard de lucratividade
    status: OrderStatus;

    // Relacionamentos
    customer?: Customer;
    items: OrderItem[]; // Um pedido sempre terá um ou mais itens
}

/**
 * Representa um item específico dentro de um pedido.
 * Armazena os valores "congelados" no momento da transação para garantir
 * a precisão do histórico financeiro.
 */
export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    unitPrice: number; // Preço unitário no momento da venda
    unitCost: number; // Custo unitário no momento da venda

    // Relacionamento (opcional, para carregar detalhes do produto)
    product?: Product;
}


export interface FinancialSummary {
    startDate: Date;
    endDate: Date;
    totalRevenue: number;
    totalProfit: number;
    totalOrders: number;
    averageMargin: number;
}


export interface ProductSale {
    name: string;
    profit: number;      // lucro do produto
    revenue: number;     // receita/faturamento do produto
}

export interface DashboardData {
    totalRevenue: number;            // faturamento total
    totalOrders: number;             // total de pedidos
    totalProfit: number;             // lucro total
    productSales: ProductSale[];     // vendas por produto
    bestSellers: { name: string, quantity: number }[]; // produtos mais vendidos
    startDate: Date;
    endDate: Date;
}


// ============================================================================
//                             DTOs (Data Transfer Objects)
// ============================================================================
// É uma boa prática usar DTOs para criar ou atualizar entidades. Eles representam
// os dados que são transferidos entre o cliente (front-end) e o servidor (back-end),
// omitindo campos que são gerenciados pelo banco (como 'id' e 'createdAt').

export type CreateProductDTO = Omit<Product, 'id' | 'createdAt'> & {
    // Ao criar um produto, passamos a receita e os custos juntos
    billOfMaterials: Omit<ProductMaterial, 'id' | 'productId'>[];
    additionalCosts: Omit<ProductAdditionalCost, 'id' | 'productId'>[];
};

export type CreateOrderDTO = Omit<Order, 'id' | 'orderDate' | 'totalAmount' | 'totalCost' | 'items'> & {
    items: Omit<OrderItem, 'id' | 'orderId' | 'unitPrice' | 'unitCost'>[];
};