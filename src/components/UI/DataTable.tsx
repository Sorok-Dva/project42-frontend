import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'components/UI/Table'
import { Button } from 'components/UI/Button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown } from 'lucide-react'

interface DataTableProps {
  data: any[];
  columns: {
    header: string;
    accessorKey: string;
    cell: ({ row }: { row: { original: any } }) => React.ReactNode;
  }[];
  pagination: {
    pageCount: number;
    page: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSortChange: (column: string) => void;
  };
}

export function DataTable({ data, columns, pagination, sorting }: DataTableProps) {
  const { pageCount, page, onPageChange } = pagination

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>
                  {sorting && (
                    <button
                      className="flex items-center space-x-1 hover:text-primary"
                      onClick={() => sorting.onSortChange(column.accessorKey)}
                    >
                      <span>{column.header}</span>
                      {sorting.sortBy === column.accessorKey && (
                        sorting.sortOrder === 'asc' ?
                          <ArrowUp className="h-3 w-3" /> :
                          <ArrowDown className="h-3 w-3" />
                      )}
                    </button>
                  )}
                  {!sorting && column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Aucune donnée trouvée
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {column.cell({ row: { original: row } })}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {page} sur {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === pageCount}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageCount)}
            disabled={page === pageCount}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
