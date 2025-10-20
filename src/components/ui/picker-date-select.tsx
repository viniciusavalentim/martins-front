import { endOfMonth, format, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import * as React from 'react'
import type { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onDateChange?: (date: DateRange | undefined) => void
  classNameButton?: string
  dateStart?: string
  dateEnd?: string
}

export function DatePickerWithRange({
  className,
  classNameButton,
  onDateChange,
  dateStart,
  dateEnd,
}: DatePickerWithRangeProps) {
  const today = new Date()
  const startOfCurrentMonth = startOfMonth(today)
  const endOfCurrentMonth = endOfMonth(today)

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: dateStart ? new Date(dateStart + ' 10:00:00') : startOfCurrentMonth,
    to: dateEnd ? new Date(dateEnd + ' 10:00:00') : endOfCurrentMonth,
  })

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate)
    if (onDateChange) {
      onDateChange(newDate)
    }
  }

  const handleClearDate = () => {
    setDate(undefined)
    if (onDateChange) {
      onDateChange(undefined)
    }
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              `justify-start text-left font-normal w-full sm:w-auto ${classNameButton ?? 'text-foreground'}`,
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
            {date?.from ? (
              date.to ? (
                <>
                  <span className="hidden sm:inline">
                    {format(date.from, 'dd MMM yyyy', { locale: ptBR })} -{' '}
                    {format(date.to, 'dd MMM yyyy', { locale: ptBR })}
                  </span>
                  <span className="sm:hidden">
                    {format(date.from, 'dd/MM/yy', { locale: ptBR })} -{' '}
                    {format(date.to, 'dd/MM/yy', { locale: ptBR })}
                  </span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">
                    {format(date.from, 'dd MMM yyyy', { locale: ptBR })}
                  </span>
                  <span className="sm:hidden">
                    {format(date.from, 'dd/MM/yy', { locale: ptBR })}
                  </span>
                </>
              )
            ) : (
              <span>Selecione uma data</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-background" align="start">
          <div className="p-2">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateChange}
              numberOfMonths={window.innerWidth < 768 ? 1 : 2}
              locale={ptBR}
            />
            <Button
              variant="outline"
              onClick={handleClearDate}
              className="mt-2 w-full"
            >
              Limpar seleção
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
