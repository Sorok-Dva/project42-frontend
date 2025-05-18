'use client'

import React from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { cn } from 'utils/utils'
import { Button } from 'components/UI/Button'
import { Calendar } from 'components/UI/Calendar'
import { Popover, PopoverContent, PopoverTrigger } from 'components/UI/Popover'

interface DateRangePickerProps {
  className?: string
  value: DateRange | undefined
  onChange: (date: DateRange | undefined) => void
  placeholder?: string
  disabled?: boolean
}

export function DateRangePicker({
  className,
  value,
  onChange,
  placeholder = 'Sélectionner une période',
  disabled = false,
}: DateRangePickerProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-gray-500',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, 'dd/MM/yyyy', { locale: fr })} - {format(value.to, 'dd/MM/yyyy', { locale: fr })}
                </>
              ) : (
                format(value.from, 'dd/MM/yyyy', { locale: fr })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            locale={fr}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
