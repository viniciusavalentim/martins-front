import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OperationalExpense, Product, RawMaterial } from "@/utils/models";
import { AlertCircle, AlertTriangle, CheckCircle2, Pencil } from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { CreateExpense } from "@/api/expenses/createExpense";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner";
import { getEnumEnglishName, handleApiError } from "@/utils/helpers";
import { UpdateExpense } from "@/api/expenses/updateExpense";
import { useStore } from "@/context/StoreContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExpenseDialogProps {
  expense?: OperationalExpense;
}

export function ExpenseDialog({ expense }: ExpenseDialogProps) {
  const { Products, Materials } = useStore();
  const [open, setOpenChange] = useState<boolean>();
  const [name, setName] = useState("");
  const [category, setCategory] =
    useState<OperationalExpense["category"]>("other");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"one-time" | "recurring">("one-time");
  const [recurrenceInterval, setRecurrenceInterval] =
    useState<OperationalExpense["recurrenceInterval"]>("monthly");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [orderItemId, setOrderItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [costAvailabilityStatus, setCostAvailabilityStatus] = useState<{
    status: "available" | "insufficient" | "can_produce";
    message: string;
    missingInsumos?: string[];
  } | null>(null);

  useEffect(() => {
    if (expense) {
      setName(expense.name);
      setCategory(
        getEnumEnglishName(
          "EXPENSECATEGORY",
          expense.category
        ).toLowerCase() as OperationalExpense["category"]
      );
      setAmount(expense.amount.toString());
      setType(
        getEnumEnglishName("EXPENSETYPE", expense.type).toLowerCase() as
          | "one-time"
          | "recurring"
      );
      setRecurrenceInterval(
        (getEnumEnglishName(
          "RECURRENCEINTERVAL",
          expense.recurrenceInterval || ""
        ).toLowerCase() as OperationalExpense["recurrenceInterval"]) ||
          "monthly"
      );
      setDate(expense.date.split("T")[0]);
      setNotes(expense.notes || "");
      setQuantity(expense.quantity ?? "");
      setOrderItemId(expense.productId ?? "");
    } else {
      setName("");
      setCategory("other");
      setAmount("");
      setType("one-time");
      setRecurrenceInterval("monthly");
      setDate(new Date().toISOString().split("T")[0]);
      setNotes("");
    }
  }, [expense, open]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const { mutateAsync: createExpenseFn } = useMutation({
    mutationFn: CreateExpense,
    onSuccess(data) {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({
          queryKey: ["FindExpensesQuery"],
        });
        setOpenChange(false);
      } else {
        toast.error(data.message || "Não foi possível criar a despesa.");
      }
    },
    onError(error) {
      handleApiError(error);
    },
  });

  const { mutateAsync: UpdateExpenseFn } = useMutation({
    mutationFn: UpdateExpense,
    onSuccess(data) {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({
          queryKey: ["FindExpensesQuery"],
        });
        setOpenChange(false);
      } else {
        toast.error(data.message || "Não foi possível editar a despesa.");
      }
    },
    onError(error) {
      handleApiError(error);
    },
  });

  const handleQuantityChange = (quantity: string) => {
    setQuantity(quantity);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = Number.parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return;
    }

    if (!expense) {
      try {
        await createExpenseFn({
          amount: amountNum,
          category: (() => {
            switch (category) {
              case "equipment":
                return 1;
              case "utilities":
                return 2;
              case "marketing":
                return 3;
              case "rent":
                return 4;
              case "labor":
                return 5;
              case "other":
                return 6;
              default:
                return 1;
            }
          })(),
          date,
          name,
          type: type === "one-time" ? 1 : 2,
          recurrenceInterval: (() => {
            switch (recurrenceInterval) {
              case "daily":
                return 1;
              case "monthly":
                return 2;
              case "weekly":
                return 3;
              case "yearly":
                return 4;
              default:
                return 1;
            }
          })(),
          notes,
          quantity,
          productId: orderItemId,
        });
      } catch (error) {
        console.error(error);
      }
    } else {
      await UpdateExpenseFn({
        id: expense.id,
        amount: amountNum,
        category: (() => {
          switch (category) {
            case "equipment":
              return 1;
            case "utilities":
              return 2;
            case "marketing":
              return 3;
            case "rent":
              return 4;
            case "labor":
              return 5;
            case "other":
              return 6;
            default:
              return 1;
          }
        })(),
        date,
        name,
        type: type === "one-time" ? 1 : 2,
        recurrenceInterval: (() => {
          switch (recurrenceInterval) {
            case "daily":
              return 1;
            case "monthly":
              return 2;
            case "weekly":
              return 3;
            case "yearly":
              return 4;
            default:
              return 1;
          }
        })(),
        notes,
        quantity,
        productId: orderItemId,
      });
    }
  };

  useEffect(() => {
    const quantityNumber = Number.parseFloat(quantity) || 0;
    const productId = orderItemId;

    if (productId && productId !== "none" && quantityNumber > 0) {
      const availability = checkProductAvailability(
        productId,
        quantityNumber,
        Products,
        Materials
      );
      setCostAvailabilityStatus(availability);
    } else {
      setCostAvailabilityStatus(null);
    }
  }, [orderItemId, quantity, Products, Materials]);

  return (
    <Dialog open={open} onOpenChange={setOpenChange}>
      <DialogTrigger asChild>
        {expense ? (
          <Button variant="outline" size="icon" className="gap-2">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="default" size="sm">
            <IconPlus />
            <span className="hidden lg:inline">Nova Despesa</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {expense ? "Editar Despesa" : "Nova Despesa Operacional"}
          </DialogTitle>
          <DialogDescription>
            {expense
              ? "Atualize as informações da despesa"
              : "Registre uma nova despesa operacional"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="costProduct">
              Vincular ao Produto (Custo será Custo do Produto)
            </Label>
            <Select
              value={orderItemId}
              onValueChange={(value) => {
                setOrderItemId(value);
              }}
            >
              <SelectTrigger id="costProduct">
                <SelectValue placeholder="Nenhum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {Products?.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    Nenhum produto cadastrado
                  </div>
                ) : (
                  Products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {formatCurrency(product.totalCost)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {orderItemId && orderItemId != "none" && (
              <>
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="1"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                />
              </>
            )}

            {costAvailabilityStatus && (
              <div className="pt-2">
                {costAvailabilityStatus.status === "insufficient" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium mb-1">
                        Não é possível vincular este custo:
                      </div>
                      <div className="text-sm">
                        {costAvailabilityStatus.message}
                      </div>
                      {costAvailabilityStatus.missingInsumos && (
                        <div className="text-xs mt-1">
                          Insumos faltantes:{" "}
                          {costAvailabilityStatus.missingInsumos.join(", ")}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                {costAvailabilityStatus.status === "can_produce" && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription>
                      <div className="font-medium mb-1 text-orange-600">
                        Aviso de Produção
                      </div>
                      <div className="text-sm">
                        {costAvailabilityStatus.message} A produção será
                        acionada ao finalizar a despesa.
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                {costAvailabilityStatus.status === "available" && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">
                      Produto vinculado disponível
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Nome da Despesa <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: Balança digital, Conta de luz, Anúncio Facebook..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">
                Categoria <span className="text-destructive">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={(value) =>
                  setCategory(value as OperationalExpense["category"])
                }
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipment">Equipamento</SelectItem>
                  <SelectItem value="utilities">Utilidades</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="rent">Aluguel</SelectItem>
                  <SelectItem value="labor">Mão de Obra</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Valor (R$) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">
                Tipo <span className="text-destructive">*</span>
              </Label>
              <Select
                value={type}
                onValueChange={(value) =>
                  setType(value as "one-time" | "recurring")
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">Único</SelectItem>
                  <SelectItem value="recurring">Recorrente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === "recurring" && (
              <div className="space-y-2">
                <Label htmlFor="recurrence">Recorrência</Label>
                <Select
                  value={recurrenceInterval}
                  onValueChange={(value) =>
                    setRecurrenceInterval(
                      value as OperationalExpense["recurrenceInterval"]
                    )
                  }
                >
                  <SelectTrigger id="recurrence">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">
              Data <span className="text-destructive">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Detalhes adicionais sobre a despesa..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit">{expense ? "Atualizar" : "Cadastrar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const checkProductAvailability = (
  productId: string,
  quantityDesired: number,
  products: Product[] | null,
  materials: RawMaterial[] | null
): {
  status: "available" | "insufficient" | "can_produce";
  message: string;
  missingInsumos?: string[];
} => {
  const product = products?.find((p) => p.id === productId);
  if (!product) {
    return { status: "insufficient", message: "Produto não encontrado" };
  }

  if (product.stockQuantity >= quantityDesired) {
    return {
      status: "available",
      message: "Produto disponível para venda",
    };
  }

  const quantityToProduce = quantityDesired - product.stockQuantity;
  const insufficientInsumos: string[] = [];

  if (!materials) {
    return {
      status: "insufficient",
      message: "Lista de insumos não carregada.",
    };
  }

  for (const bomItem of product.billOfMaterials) {
    const liveMaterial = materials.find((m) => m.id === bomItem.materialId);

    if (!liveMaterial) {
      const materialName = bomItem.material?.name || `ID ${bomItem.materialId}`;
      insufficientInsumos.push(`${materialName} (Insumo não encontrado)`);
      continue;
    }

    const materialNeeded = bomItem.quantityUsed * quantityToProduce;

    if (liveMaterial.currentStock < materialNeeded) {
      insufficientInsumos.push(
        `${liveMaterial.name} (Necessário: ${materialNeeded}, Disponível: ${liveMaterial.currentStock})`
      );
    }
  }

  if (insufficientInsumos.length > 0) {
    return {
      status: "insufficient",
      message: `Estoque de produto e insumos insuficiente. ${quantityToProduce} unidade(s) precisa(m) ser produzida(s).`,
      missingInsumos: insufficientInsumos,
    };
  }

  return {
    status: "can_produce",
    message: "Produto será produzido automaticamente",
  };
};
