import type { SxProps, Theme } from "@mui/material/styles"
import TableCell from "@mui/material/TableCell"
import TableSortLabel from "@mui/material/TableSortLabel"
import type { ReactNode } from "react"

import type { SortOrder } from "../hooks/use-sort-state"

interface SortableTableCellProps<T extends string> {
  sortKey: T
  activeSortKey: T | null
  sortOrder: SortOrder
  onSort: (key: T) => void
  align?: "left" | "center" | "right"
  sx?: SxProps<Theme>
  children: ReactNode
}

export const SortableTableCell = <T extends string>({
  sortKey,
  activeSortKey,
  sortOrder,
  onSort,
  align,
  sx,
  children,
}: SortableTableCellProps<T>) => {
  const active = activeSortKey === sortKey

  return (
    <TableCell
      align={align}
      sortDirection={active ? sortOrder : false}
      sx={[{ whiteSpace: "nowrap" }, ...(Array.isArray(sx) ? sx : sx != null ? [sx] : [])]}
    >
      <TableSortLabel
        active={active}
        direction={active ? sortOrder : "asc"}
        onClick={() => onSort(sortKey)}
      >
        {children}
      </TableSortLabel>
    </TableCell>
  )
}
