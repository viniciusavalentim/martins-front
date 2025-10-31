import type { DashboardData, RawMaterial, ReportRawMaterial } from "./models";

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


//TODO: FAZER COM QUE O USUARIO POSSA RELACIONAR O CUSTOMER A VENDA OU CRIAR CUSTOMERS





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



export const reportRawMaterials: ReportRawMaterial[] = [
    {
        id: "1",
        name: "Cera de Soja",
        category: "Cera",
        supplierId: 101,
        currentStock: 2500, // em gramas
        unitOfMeasure: "g",
        totalCost: 150.0,
        unitCost: 0.06,
        lowStockThreshold: 500,
        movementType: "add",
        createdAt: "2025-10-10T09:30:00Z",
        lastUpdatedAt: new Date("2025-10-15T11:45:00Z"),
        supplier: {
            id: 101,
            name: "EcoWax Brasil",
            contactName: "Ana Rodrigues",
            phone: "(11) 98877-1122",
            email: "contato@ecowax.com.br",
            createdAt: new Date("2025-10-15T11:45:00Z"),
        },
    },
    {
        id: "2",
        name: "Essência de Lavanda",
        category: "Aromatizante",
        supplierId: 102,
        currentStock: 800, // em ml
        unitOfMeasure: "ml",
        totalCost: 96.0,
        unitCost: 0.12,
        lowStockThreshold: 100,
        movementType: "remove",
        createdAt: "2025-10-08T14:20:00Z",
        lastUpdatedAt: new Date("2025-10-17T16:00:00Z"),
        supplier: {
            id: 102,
            name: "Aromas & Essências LTDA",
            contactName: "Carlos Mendes",
            phone: "(21) 97444-2211",
            email: "vendas@aromasessencias.com",
            createdAt: new Date("2025-10-15T11:45:00Z"),
        },
    },
    {
        id: "3",
        name: "Pavio de Algodão",
        category: "Pavio",
        supplierId: 103,
        currentStock: 350, // unidades
        unitOfMeasure: "un",
        totalCost: 52.5,
        unitCost: 0.15,
        lowStockThreshold: 50,
        movementType: "add",
        createdAt: "2025-10-12T10:00:00Z",
        lastUpdatedAt: new Date("2025-10-17T13:30:00Z"),
        supplier: {
            id: 103,
            name: "Fios Naturais",
            contactName: "Juliana Castro",
            phone: "(31) 98222-3344",
            email: "contato@fiosnaturais.com.br",
            createdAt: new Date("2025-10-15T11:45:00Z"),
        },
    },
    {
        id: "4",
        name: "Corante Rosa",
        category: "Corante",
        supplierId: 104,
        currentStock: 150, // gramas
        unitOfMeasure: "g",
        totalCost: 45.0,
        unitCost: 0.3,
        lowStockThreshold: 30,
        movementType: "remove",
        createdAt: "2025-10-09T12:15:00Z",
        lastUpdatedAt: new Date("2025-10-17T09:00:00Z"),
        supplier: {
            id: 104,
            name: "ColorMix Pigmentos",
            contactName: "Rafael Lima",
            phone: "(19) 97766-5544",
            email: "vendas@colormix.com",
            createdAt: new Date("2025-10-15T11:45:00Z"),
        },
    },
    {
        id: "5",
        name: "Pote de Vidro 200ml",
        category: "Embalagem",
        supplierId: 105,
        currentStock: 120,
        unitOfMeasure: "un",
        totalCost: 180.0,
        unitCost: 1.5,
        lowStockThreshold: 40,
        movementType: "add",
        createdAt: "2025-10-11T15:00:00Z",
        lastUpdatedAt: new Date("2025-10-17T18:00:00Z"),
        supplier: {
            id: 105,
            name: "VidroArte Embalagens",
            contactName: "Beatriz Oliveira",
            phone: "(47) 96677-8899",
            email: "comercial@vidroarte.com.br",
            createdAt: new Date("2025-10-15T11:45:00Z"),
        },
    },
]


