import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLayoutColumns,
} from "@tabler/icons-react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { Checkbox } from "@/components/ui/checkbox"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs"
import { DollarSign, Search, ShoppingBag, User } from "lucide-react"
import type { Order } from "@/utils/models"
import { formatToBRL, getOrderStatusBadge, handleApiError } from "@/utils/helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@radix-ui/react-separator"
import { SaleDialog } from "../components/sales-dialog"
import { useMutation } from "@tanstack/react-query"
import { UpdateSaleStatus } from "@/api/sales/updateStatus"
import { queryClient } from "@/lib/queryClient"
import { toast } from "sonner"

const columnLabels: Record<string, string> = {
  name: "Nome",
  category: "Categoria",
  currentStock: "Estoque Atual",
  unitCost: "Custo Unitário",
  lowStockThreshold: "Estoque Mínimo",
  lastUpdatedAt: "Última Atualização",
}

const HIDDEN_COLUMNS = ["select", "actions", "drag"];

const OrderDetailCards: React.FC<{ order: Order }> = ({ order }) => {

  if (!order) {
    return (
      <>Pedido inválido</>
    )
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      {/* Card de Informações do Cliente (só aparece se o cliente existir no pedido) */}
      {order.customer && (
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{order.customer.name}</p>
              <p className="text-muted-foreground">{order.customer.email}</p>
              <p className="text-muted-foreground">{order.customer.phone}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card com os Itens do Pedido */}
      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Itens do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start text-sm">
                <div>
                  <p className="font-medium">{item.product?.name || "Produto não encontrado"}</p>
                  <p className="text-muted-foreground">
                    {item.quantity} x {formatToBRL(item.unitPrice)}
                  </p>
                </div>
                <span className="font-medium">
                  {formatToBRL(item.quantity * item.unitPrice)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Card com o Resumo Financeiro do Pedido */}
      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Custo Total do Pedido:</span>
              <span>{formatToBRL(order.totalCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Lucro do Pedido:</span>
              <span className="font-medium text-green-600">{formatToBRL(order.profit)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Valor Total:</span>
              <span className="text-primary">{formatToBRL(order.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getStatusText(statusNumber: number): string {
  switch (statusNumber) {
    case 1:
      return "PENDING"
    case 2:
      return "IN_PRODUCTION"
    case 3:
      return "IN_MATURING"
    case 4:
      return "WAITING_DELIVERY"
    case 5:
      return "CANCELLED"
    case 6:
      return "COMPLETED"
    default:
      return "PENDING"
  }
}

const StatusCell = ({ row, onUpdate }: { row: any; onUpdate: (id: string, status: string) => void }) => {
  const [isEditing, setIsEditing] = React.useState(false)
  const [selectedStatus, setSelectedStatus] = React.useState<string | number>(getStatusText(row.original.status))

  const handleChange = (value: string) => {
    setSelectedStatus(value)
    setIsEditing(false)
    onUpdate(row.original.id, value)
  }

  return (
    <>
      {isEditing ? (
        <Select value={String(selectedStatus)} onValueChange={handleChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pendente</SelectItem>
            <SelectItem value="IN_PRODUCTION">Em Produção</SelectItem>
            <SelectItem value="IN_MATURING">Em Maturação</SelectItem>
            <SelectItem value="WAITING_DELIVERY">Aguardando Entrega</SelectItem>
            <SelectItem value="CANCELLED">Cancelado</SelectItem>
            <SelectItem value="COMPLETED">Concluído</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <div onClick={() => setIsEditing(true)} className="cursor-pointer">
          {getOrderStatusBadge(selectedStatus)}
        </div>
      )}
    </>
  )
}

function DraggableRow({ row }: { row: Row<Order> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <>
      <TableRow
        ref={setNodeRef}
        data-state={row.getIsSelected() && "selected"}
        data-dragging={isDragging}
        className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
        style={{
          transform: CSS.Transform.toString(transform),
          transition: transition,
        }}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
      {row.getIsExpanded() && (
        <TableRow className="hover:bg-card/30">
          <TableCell colSpan={row.getVisibleCells().length} >
            <OrderDetailCards order={row.original} />
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export function DataTable({
  data: initialData,
}: {
  data: Order[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )


  const columns: ColumnDef<Order>[] = [
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => {
        return row.getCanExpand() ? (
          <button
            {...{
              onClick: row.getToggleExpandedHandler(),
              style: { cursor: 'pointer' },
            }}
          >
            <Badge variant="outline" className="text-muted-foreground p-2">
              {row.getIsExpanded() ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
            </Badge>
          </button>
        ) : null
      },
    },
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "orderDate",
      header: "Data",
      cell: ({ row }) => {
        const date = new Date(row.original.orderDate);
        const formattedDate = date.toLocaleDateString('pt-BR');
        const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return `${formattedDate} às ${formattedTime}`;
      },
    },
    {
      accessorKey: "items",
      header: "Qtd. Produtos",
      cell: ({ row }) => (
        <>
          {row.original.items.length}
        </>
      ),
    },
    {
      accessorKey: "totalCost",
      header: "Custo total Venda",
      cell: ({ row }) => (
        <>
          {formatToBRL(row.original.totalCost)}
        </>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Receita",
      cell: ({ row }) => (
        <>
          {formatToBRL(row.original.totalAmount)}
        </>
      ),
    },
    {
      accessorKey: "profit",
      header: "Lucro Liquido",
      cell: ({ row }) => (
        <>
          <span className="text-green-600 font-medium">
            {formatToBRL(row.original.profit)}
          </span>
        </>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusCell
          row={row}
          onUpdate={(id, newStatus) => handleStatusUpdate(id, newStatus)}
        />
      ),
    }
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableExpanding: true,
    enableRowSelection: true,
    getRowId: (row) => row.id.toString(),
    getRowCanExpand: () => true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  const { mutateAsync: updateStatustFn } = useMutation({
    mutationFn: UpdateSaleStatus,
    onSuccess(data) {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({
          queryKey: ["FindSalesQuery"]
        });
      } else {
        toast.error(data.message);
      }
    },
    onError(error) {
      handleApiError(error);
    }
  });

  const handleStatusUpdate = React.useCallback(async (id: string, newStatus: string) => {
    try {
      await updateStatustFn({
        orderId: id,
        status: (() => {
          switch (newStatus) {
            case "PENDING": return 1
            case "IN_PRODUCTION": return 2
            case "IN_MATURING": return 3
            case "WAITING_DELIVERY": return 4
            case "CANCELLED": return 5
            case "COMPLETED": return 6
            default: return 1
          }
        })(),
      });
    } catch (error) {
      console.error("Erro ao atualizar o status da venda:", error);
    }
  }, [updateStatustFn]);


  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Buscar..."
            className="pl-10 pr-3 h-8"
          />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customizar Colunas</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllLeafColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide() &&
                    !HIDDEN_COLUMNS.includes(column.id)
                )
                .map((column) => {
                  let label: string;

                  if (typeof columnLabels[column.id] === "string") {
                    label = columnLabels[column.id];
                  } else if (typeof column.columnDef.header === "string") {
                    label = column.columnDef.header;
                  } else {
                    label = column.id;
                  }

                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>

          </DropdownMenu>

          <SaleDialog />
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} linha(s) selecionadas.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Linhas por página
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

