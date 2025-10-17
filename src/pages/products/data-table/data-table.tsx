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
  IconGripVertical,
  IconLayoutColumns,
  IconPlus,
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
  // TabsList,
  // TabsTrigger,
} from "@/components/ui/tabs"
import { Calculator, DollarSign, Package, Search } from "lucide-react"
import type { Product } from "@/utils/models"
import { formatToBRL } from "@/utils/helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@radix-ui/react-separator"

const columnLabels: Record<string, string> = {
  name: "Nome",
  category: "Categoria",
  currentStock: "Estoque Atual",
  unitCost: "Custo Unitário",
  lowStockThreshold: "Estoque Mínimo",
  lastUpdatedAt: "Última Atualização",
}

const HIDDEN_COLUMNS = ["select", "actions", "drag"];

const ProductDetailCards: React.FC<{ product: Product }> = ({ product }) => {

  if (!product) {
    return (
      <>Produto inválido</>
    )
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">

      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Receita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {product.billOfMaterials && product.billOfMaterials.map((item, index) => {
              return (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item?.rawMaterial?.name} - {item?.quantityUsed} {item.rawMaterial?.unitOfMeasure}
                  </span>
                  <span className="font-medium">{formatToBRL(((item?.rawMaterial?.unitCost ? item?.rawMaterial?.unitCost : 0) * item.quantityUsed))}</span>
                </div>
              )
            })}
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Custo da Receita:</span>
              <span>{formatToBRL(product.materialCost)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exemplo de Card 1 */}
      {product.additionalCosts && product.additionalCosts.length > 0 && (
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Custos Adicionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {product.additionalCosts.map((cost) => {
                return (
                  <div key={cost.id} className="flex justify-between text-sm">
                    <span>
                      {cost.description}{" "}
                      <Badge variant="outline" className="ml-2">
                        {cost.type === "FIXED_VALUE" ? "Fixo" : `${cost.value}%`}
                      </Badge>
                    </span>
                    <span className="font-medium">{formatToBRL(cost.value)}</span>
                  </div>
                )
              })}
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total Custos Adicionais:</span>
                <span>{formatToBRL(product.sellingPrice - 10)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Resumo de Precificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Custo da Receita:</span>
              <span>{formatToBRL(product.materialCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Custos Adicionais:</span>
              {/* TODO: Adicionar total de custos adicionais */}
              <span>{formatToBRL(product.totalCost)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>CTP (Custo Total do Produto):</span>
              <span>{formatToBRL(product.materialCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Margem de Lucro:
                <Badge variant="secondary" className="ml-2">
                  {product.profitMargin.toFixed(2)}%
                </Badge>
              </span>
              <span className="text-green-600 font-medium">{formatToBRL(product.profit)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Preço de Venda:</span>
              <span className="text-primary">{formatToBRL(product.sellingPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

const columns: ColumnDef<Product>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
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
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => {
      return row.original.name
    },
  },
  {
    accessorKey: "totalCost",
    header: "Custo total (CTP)",
    cell: ({ row }) => (
      <>
        {formatToBRL(row.original.totalCost)}
      </>
    ),
  },
  {
    accessorKey: "profitMargin",
    header: "Margem",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.profitMargin.toFixed(2)}%
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "sellingPrice",
    header: "Preço de venda",
    cell: ({ row }) => (
      <>
        {formatToBRL(row.original.sellingPrice)}
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
  }
]

function DraggableRow({ row }: { row: Row<Product> }) {
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
          {/* Célula única que ocupa todas as colunas */}
          <TableCell colSpan={row.getVisibleCells().length} >
            <ProductDetailCards product={row.original} />
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export function DataTable({
  data: initialData,
}: {
  data: Product[]
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

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

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
          <Button variant="default" size="sm">
            <IconPlus />
            <span className="hidden lg:inline">Novo produto</span>
          </Button>
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
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  )
}

