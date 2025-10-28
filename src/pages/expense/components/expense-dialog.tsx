"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OperationalExpense } from "@/utils/models"
import { Pencil } from "lucide-react"
import { IconPlus } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { CreateExpense } from "@/api/expenses/createExpense"
import { queryClient } from "@/lib/queryClient"
import { toast } from "sonner"
import { getEnumEnglishName, handleApiError } from "@/utils/helpers"
import { UpdateExpense } from "@/api/expenses/updateExpense"

interface ExpenseDialogProps {
  expense?: OperationalExpense
}

export function ExpenseDialog({ expense }: ExpenseDialogProps) {
  const [open, setOpenChange] = useState<boolean>();
  const [name, setName] = useState("")
  const [category, setCategory] = useState<OperationalExpense["category"]>("other")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"one-time" | "recurring">("one-time")
  const [recurrenceInterval, setRecurrenceInterval] = useState<OperationalExpense["recurrenceInterval"]>("monthly")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (expense) {
      setName(expense.name)
      setCategory(getEnumEnglishName("EXPENSECATEGORY", expense.category).toLowerCase() as OperationalExpense["category"])
      setAmount(expense.amount.toString())
      setType(getEnumEnglishName("EXPENSETYPE", expense.type).toLowerCase() as "one-time" | "recurring")
      setRecurrenceInterval(getEnumEnglishName("RECURRENCEINTERVAL", expense.recurrenceInterval || "").toLowerCase() as OperationalExpense["recurrenceInterval"] || "monthly")
      setDate(expense.date.split("T")[0])
      setNotes(expense.notes || "")
    } else {
      setName("")
      setCategory("other")
      setAmount("")
      setType("one-time")
      setRecurrenceInterval("monthly")
      setDate(new Date().toISOString().split("T")[0])
      setNotes("")
    }
  }, [expense, open])


  const { mutateAsync: createExpenseFn } = useMutation({
    mutationFn: CreateExpense,
    onSuccess(data) {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({
          queryKey: ["FindExpensesQuery"]
        });
        setOpenChange(false);
      } else {
        toast.error(data.message || "Não foi possível criar a despesa.");
      }
    },
    onError(error) {
      handleApiError(error);
    }
  });

  const { mutateAsync: UpdateExpenseFn } = useMutation({
    mutationFn: UpdateExpense,
    onSuccess(data) {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({
          queryKey: ["FindExpensesQuery"]
        });
        setOpenChange(false);
      } else {
        toast.error(data.message || "Não foi possível editar a despesa.");
      }
    },
    onError(error) {
      handleApiError(error);
    }
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amountNum = Number.parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return
    }

    if (!expense) {
      try {
        await createExpenseFn({
          amount: amountNum,
          category: (() => {
            switch (category) {
              case "equipment": return 1
              case "utilities": return 2
              case "marketing": return 3
              case "rent": return 4
              case "labor": return 5
              case "other": return 6
              default: return 1
            }
          })(),
          date,
          name,
          type: type === "one-time" ? 1 : 2,
          recurrenceInterval: (() => {
            switch (recurrenceInterval) {
              case "daily": return 1
              case "monthly": return 2
              case "weekly": return 3
              case "yearly": return 4
              default: return 1
            }
          })(),
          notes
        })
      } catch (error) {
        console.error(error)
      }
    } else {
      await UpdateExpenseFn({
        id: expense.id,
        amount: amountNum,
        category: (() => {
          switch (category) {
            case "equipment": return 1
            case "utilities": return 2
            case "marketing": return 3
            case "rent": return 4
            case "labor": return 5
            case "other": return 6
            default: return 1
          }
        })(),
        date,
        name,
        type: type === "one-time" ? 1 : 2,
        recurrenceInterval: (() => {
          switch (recurrenceInterval) {
            case "daily": return 1
            case "monthly": return 2
            case "weekly": return 3
            case "yearly": return 4
            default: return 1
          }
        })(),
        notes
      })
    }

  }

  return (
    <Dialog open={open} onOpenChange={setOpenChange}>
      <DialogTrigger asChild>
        {expense ? (
          <Button
            variant="outline"
            size="icon"
            className="gap-2"
          >
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
          <DialogTitle>{expense ? "Editar Despesa" : "Nova Despesa Operacional"}</DialogTitle>
          <DialogDescription>
            {expense ? "Atualize as informações da despesa" : "Registre uma nova despesa operacional"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Select value={category} onValueChange={(value) => setCategory(value as OperationalExpense["category"])}>
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
              <Select value={type} onValueChange={(value) => setType(value as "one-time" | "recurring")}>
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
                  onValueChange={(value) => setRecurrenceInterval(value as OperationalExpense["recurrenceInterval"])}
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
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
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
  )
}
