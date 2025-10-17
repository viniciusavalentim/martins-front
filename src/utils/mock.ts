import type { Product, ProductAdditionalCost, ProductMaterial, RawMaterial } from "./models";

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
export const products: Product[] = [
    {
        id: "1",
        name: "Vela Aromática de Lavanda",
        description: "Vela artesanal feita com cera de soja, essência de lavanda e pavio de algodão.",
        sellingPrice: 45.0,
        materialCost: 150 * 0.045 + 10 * 0.12 + 1 * 0.25, // 8.8
        totalCost: 8.8 + 1.5, // 10.3
        profit: 45.0 - 10.3, // 34.7
        profitMargin: ((45.0 - 10.3) / 45.0) * 100, // 77.1%
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
        materialCost: 160 * 0.045 + 8 * 0.12 + 1 * 0.25, // 8.97
        totalCost: 8.97 + 2.0, // 10.97
        profit: 48.0 - 10.97, // 37.03
        profitMargin: ((48.0 - 10.97) / 48.0) * 100, // 77.1%
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
        materialCost: 180 * 0.045 + 12 * 0.12 + 1 * 0.25, // 9.81
        totalCost: 9.81 * 1.05, // 10.30 (energia +5%)
        profit: 55.0 - 10.3, // 44.7
        profitMargin: ((55.0 - 10.3) / 55.0) * 100, // 81.3%
        stockOnHand: 12,
        createdAt: new Date("2025-10-12"),
        billOfMaterials: productMaterials.filter(m => m.productId === 3),
        additionalCosts: productAdditionalCosts.filter(c => c.productId === 3),
    },
];
