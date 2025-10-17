import type { Customer, DashboardData, FinancialSummary, Order, Product, ProductAdditionalCost, ProductMaterial, RawMaterial } from "./models";

export const rawMaterials: RawMaterial[] = [
    {
        id: "1",
        name: "Cera de Soja",
        category: "Base",
        supplierId: 1,
        currentStock: 25000, // em gramas
        unitOfMeasure: "g",
        totalCost: 1125,
        unitCost: 0.045, // R$ 0,045 por grama
        lowStockThreshold: 5000,
        lastUpdatedAt: new Date("2025-10-15"),
        supplier: {
            id: 1,
            name: "EcoCeras Brasil", email: "vendas@aromas.com",
            createdAt: new Date("2025-10-16"),
            phone: "11 99555-2222",
        },
    },
    {
        id: "2",
        name: "Essência de Lavanda",
        category: "Fragrância",
        supplierId: 2,
        currentStock: 8000, // em ml
        unitOfMeasure: "ml",
        totalCost: 960,
        unitCost: 0.12, // R$ 0,12 por ml
        lowStockThreshold: 2000,
        lastUpdatedAt: new Date("2025-10-14"),
        supplier: {
            id: 2,
            name: "Aromas & Essências", email: "vendas@aromas.com",
            createdAt: new Date("2025-10-16"),
            phone: "21 98877-3344",
        },
    },
    {
        id: "3",
        name: "Pavio de Algodão nº2",
        category: "Acessório",
        supplierId: 3,
        currentStock: 1200, // unidades
        unitOfMeasure: "un",
        totalCost: 300,
        unitCost: 0.25, // R$ 0,25 por unidade
        lowStockThreshold: 200,
        lastUpdatedAt: new Date("2025-10-16"),
        supplier: {
            id: 3,
            name: "Lume Componentes",
            phone: "31 97777-8888",
            email: "vendas@aromas.com",
            createdAt: new Date("2025-10-16")
        },
    },
];

export const productMaterials: ProductMaterial[] = [
    {
        id: 1,
        productId: 1,
        rawMaterialId: 1, // Cera de Soja
        quantityUsed: 150, // g
        rawMaterial: rawMaterials.find((m) => m.id === "1"),
    },
    {
        id: 2,
        productId: 1,
        rawMaterialId: 2, // Essência de Lavanda
        quantityUsed: 10, // ml
        rawMaterial: rawMaterials.find((m) => m.id === "2"),
    },
    {
        id: 3,
        productId: 1,
        rawMaterialId: 3, // Pavio
        quantityUsed: 1, // un
        rawMaterial: rawMaterials.find((m) => m.id === "3"),
    },

    {
        id: 4,
        productId: 2,
        rawMaterialId: 1,
        quantityUsed: 160,
        rawMaterial: rawMaterials.find((m) => m.id === "1"),
    },
    {
        id: 5,
        productId: 2,
        rawMaterialId: 2,
        quantityUsed: 8,
        rawMaterial: rawMaterials.find((m) => m.id === "2"),
    },
    {
        id: 6,
        productId: 2,
        rawMaterialId: 3,
        quantityUsed: 1,
        rawMaterial: rawMaterials.find((m) => m.id === "3"),
    },

    {
        id: 7,
        productId: 3,
        rawMaterialId: 1,
        quantityUsed: 180,
        rawMaterial: rawMaterials.find((m) => m.id === "1"),
    },
    {
        id: 8,
        productId: 3,
        rawMaterialId: 2,
        quantityUsed: 12,
        rawMaterial: rawMaterials.find((m) => m.id === "2"),
    },
    {
        id: 9,
        productId: 3,
        rawMaterialId: 3,
        quantityUsed: 1,
        rawMaterial: rawMaterials.find((m) => m.id === "3"),
    },
];

// === Custos adicionais ===
export const productAdditionalCosts: ProductAdditionalCost[] = [
    {
        id: 1,
        productId: 1,
        description: "Etiqueta personalizada",
        type: "FIXED_VALUE",
        value: 1.5,
    },
    {
        id: 2,
        productId: 2,
        description: "Embalagem decorativa",
        type: "FIXED_VALUE",
        value: 2.0,
    },
    {
        id: 3,
        productId: 3,
        description: "Custo de energia elétrica",
        type: "PERCENTAGE",
        value: 5.0, // 5%
    },
];


//TODO: FAZER COM QUE O USUARIO POSSA RELACIONAR O CUSTOMER A VENDA OU CRIAR CUSTOMERS


export const products: Product[] = [
    {
        id: "1",
        name: "Vela Aromática de Lavanda",
        description: "Vela artesanal feita com cera de soja, essência de lavanda e pavio de algodão.",

        // --- CONSTANTES ---
        sellingPrice: 45.0,
        materialCost: (() => {
            const cera = 150 * 0.045; // 150g a R$0,045/g = 6.75
            const essencia = 10 * 0.12; // 10ml a R$0,12/ml = 1.2
            const pavio = 1 * 0.25; // 1 unid a R$0,25 = 0.25
            return cera + essencia + pavio; // total 8.2
        })(),
        totalAdditionalCosts: 1.5, // energia + embalagem
        totalCost: (() => {
            const material = 8.2;
            const adicionais = 1.5;
            return material + adicionais; // 9.7
        })(),
        profit: (() => {
            const sellingPrice = 45.0;
            const totalCost = 9.7;
            return sellingPrice - totalCost; // 35.3
        })(),
        profitMarginPorcent: (() => ((45.0 - 9.7) / 45.0) * 100)(), // 78.4%

        stockQuantity: 25,
        stockOnHand: 25,
        createdAt: new Date("2025-10-10"),

        billOfMaterials: productMaterials.filter(m => m.productId === 1),
        additionalCosts: productAdditionalCosts.filter(c => c.productId === 1),
    },

    {
        id: "2",
        name: "Vela de Baunilha & Lavanda",
        description: "Vela relaxante com toque doce, feita com cera vegetal e fragrância suave.",

        sellingPrice: 48.0,
        materialCost: (() => {
            const cera = 160 * 0.045; // 7.2
            const essencia = 8 * 0.12; // 0.96
            const pavio = 1 * 0.25; // 0.25
            return cera + essencia + pavio; // 8.41
        })(),
        totalAdditionalCosts: 2.0, // vidro + etiqueta
        totalCost: (() => {
            const material = 8.41;
            const adicionais = 2.0;
            return material + adicionais; // 10.41
        })(),
        profit: (() => 48.0 - 10.41)(), // 37.59
        profitMarginPorcent: (() => ((48.0 - 10.41) / 48.0) * 100)(), // 78.3%

        stockQuantity: 18,
        stockOnHand: 18,
        createdAt: new Date("2025-10-08"),

        billOfMaterials: productMaterials.filter(m => m.productId === 2),
        additionalCosts: productAdditionalCosts.filter(c => c.productId === 2),
    },

    {
        id: "3",
        name: "Vela Floral de Lavanda Premium",
        description: "Vela premium com aroma intenso de lavanda, feita com cera pura e acabamento artesanal.",

        sellingPrice: 55.0,
        materialCost: (() => {
            const cera = 180 * 0.045; // 8.1
            const essencia = 12 * 0.12; // 1.44
            const pavio = 1 * 0.25; // 0.25
            return cera + essencia + pavio; // 9.79
        })(),
        totalAdditionalCosts: (() => {
            const energia = 0.5;
            const embalagem = 1.0;
            const rotulo = 0.8;
            return energia + embalagem + rotulo; // 2.3
        })(),
        totalCost: (() => {
            const material = 9.79;
            const adicionais = 2.3;
            return material + adicionais; // 12.09
        })(),
        profit: (() => 55.0 - 12.09)(), // 42.91
        profitMarginPorcent: (() => ((55.0 - 12.09) / 55.0) * 100)(), // 78.0%

        stockQuantity: 12,
        stockOnHand: 12,
        createdAt: new Date("2025-10-12"),

        billOfMaterials: productMaterials.filter(m => m.productId === 3),
        additionalCosts: productAdditionalCosts.filter(c => c.productId === 3),
    },
];


export const customers: Customer[] = [
    {
        id: 1,
        name: "Carolina Luz",
        email: "carol.luz@email.com",
        phone: "11999999999",
        createdAt: new Date("2025-10-05"),
    },
    {
        id: 2,
        name: "Estúdio Aroma & Bem-Estar",
        email: "contato@aromabemestar.com",
        phone: "11988888888",
        createdAt: new Date("2025-10-06"),
    },
];

export const orders: Order[] = [
    {
        id: 1,
        customerId: 1,
        customer: customers[0],
        orderDate: new Date("2025-10-13"),
        totalAmount: 93.0, // 2 velas de lavanda
        totalCost: 19.4, // 9.7 * 2
        profit: 73.6, // 93 - 19.4
        status: "PAID",
        items: [
            {
                id: 1,
                orderId: 1,
                productId: 1,
                quantity: 2,
                unitPrice: 45.0,
                unitCost: 9.7,
                product: products[0],
            },
        ],
    },
    {
        id: 2,
        customerId: 2,
        customer: customers[1],
        orderDate: new Date("2025-10-14"),
        totalAmount: 151.0, // 1 de baunilha + 2 premium
        totalCost: 34.59, // 10.41 + 12.09 * 2
        profit: 116.41, // 151 - 34.59
        status: "SHIPPED",
        items: [
            {
                id: 2,
                orderId: 2,
                productId: 2,
                quantity: 1,
                unitPrice: 48.0,
                unitCost: 10.41,
                product: products[1],
            },
            {
                id: 3,
                orderId: 2,
                productId: 3,
                quantity: 2,
                unitPrice: 55.0,
                unitCost: 12.09,
                product: products[2],
            },
        ],
    },
    {
        id: 3,
        // Pedido sem cliente (ex: venda de balcão)
        orderDate: new Date("2025-10-15"),
        totalAmount: 45.0, // 1 vela simples
        totalCost: 9.7,
        profit: 35.3,
        status: "PENDING",
        items: [
            {
                id: 4,
                orderId: 3,
                productId: 1,
                quantity: 1,
                unitPrice: 45.0,
                unitCost: 9.7,
                product: products[0],
            },
        ],
    },
];

export const dashboardMock: DashboardData = {
    totalRevenue: 120500,
    totalOrders: 320,
    totalProfit: 45000,
    productSales: [
        { name: "Vela Aromática Lavanda", profit: 5000, revenue: 15000 },
        { name: "Vela Aromática Baunilha", profit: 4200, revenue: 13000 },
        { name: "Vela Artesanal Canela", profit: 3800, revenue: 12000 },
        { name: "Vela de Massagem", profit: 2900, revenue: 9000 },
        { name: "Vela Decorativa Rosa", profit: 2500, revenue: 8000 },
        { name: "Vela Decorativa Azul", profit: 2200, revenue: 7000 },
        { name: "Vela de Citronela", profit: 2000, revenue: 6500 },
        { name: "Vela de Chocolate", profit: 1800, revenue: 6000 },
        { name: "Vela de Café", profit: 1600, revenue: 5500 },
        { name: "Vela de Lavanda Mini", profit: 12400, revenue: 5000 },
    ],
    sellers: [
        { data: "2025-10-01", quantity: 30 },
        { data: "2025-10-02", quantity: 20 },
        { data: "2025-10-03", quantity: 10 },
    ],
    bestSellers: [
        { name: "Vela Aromática Lavanda", quantity: 30 },
        { name: "Vela Aromática Baunilha", quantity: 20 },
        { name: "Vela Artesanal Canela", quantity: 10 },
    ],
    startDate: new Date("2025-10-01"),
    endDate: new Date("2025-10-17"),
};

export const financialSummary: FinancialSummary = (() => {
    const startDate = new Date("2025-10-10");
    const endDate = new Date("2025-10-17");

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalProfit = orders.reduce((sum, o) => sum + o.profit, 0);
    const totalOrders = orders.length;

    const averageMargin =
        totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
        startDate,
        endDate,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalProfit: Number(totalProfit.toFixed(2)),
        totalOrders,
        averageMargin: Number(averageMargin.toFixed(2)),
    };
})();