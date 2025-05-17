'use client'

import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { fr } from 'date-fns/locale'
import { cn } from 'utils/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

type DateRangePickerProps = React.ComponentProps<typeof DayPicker> & {
  className?: string
}

export function DateRangePicker({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: DateRangePickerProps) {
  return (
    <DayPicker
      locale={fr}
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-gray-700 rounded-md'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-gray-400 rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-800/50 [&:has([aria-selected])]:bg-gray-800/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: cn(
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-gray-700 focus:bg-gray-700'
        ),
        day_range_end: 'day-range-end',
        day_selected:
          'bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white focus:bg-indigo-700 focus:text-white',
        day_today: 'bg-gray-700 text-white',
        day_outside:
          'day-outside text-gray-500 opacity-50 aria-selected:bg-gray-800/50 aria-selected:text-gray-400 aria-selected:opacity-30',
        day_disabled: 'text-gray-500 opacity-50',
        day_range_middle:
          'aria-selected:bg-gray-800/50 aria-selected:text-gray-400',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === 'left' ? ChevronLeft : ChevronRight
          return <Icon className='h-4 w-4' />
        },
      }}
      {...props}
    />
  )
}
