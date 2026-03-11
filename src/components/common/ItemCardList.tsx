import AddOutlined from "@mui/icons-material/AddOutlined"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { Fragment, type ReactNode, useState } from "react"

import { FIELD_GROUP_GAP } from "@/theme"

import { ConfirmDialog } from "./ConfirmDialog"

export interface CardActions {
  onEdit: () => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
  index: number
}

export interface EditDialogRenderProps<T> {
  open: boolean
  item: T
  serverItem: T | undefined
  onChange: (item: T) => void
  onClose: () => void
}

export interface ItemCardListProps<T> {
  items: T[]
  serverItems?: T[] | undefined
  getKey: (item: T) => string | number
  onItemsChange: (items: T[]) => void
  createDefault: () => T
  renderCard: (item: T, actions: CardActions, serverItem: T | undefined) => ReactNode
  renderEditDialog: (props: EditDialogRenderProps<T>) => ReactNode
  itemLabel: string
  confirmMessage: (item: T) => string
}

// eslint-disable-next-line @stylistic/comma-dangle -- trailing comma required to disambiguate TSX generic from JSX
export const ItemCardList = <T,>({
  items,
  serverItems,
  getKey,
  onItemsChange,
  createDefault,
  renderCard,
  renderEditDialog,
  itemLabel,
  confirmMessage,
}: ItemCardListProps<T>) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const handleAdd = () => {
    onItemsChange([...items, createDefault()])
    setEditingIndex(items.length)
  }

  const handleChange = (item: T) => {
    if (editingIndex === null || editingIndex < 0) return
    onItemsChange(items.map((s, i) => (i === editingIndex ? item : s)))
  }

  const handleRemoveConfirm = () => {
    if (deleteTarget !== null) {
      onItemsChange(items.filter((_, i) => i !== deleteTarget))
      setDeleteTarget(null)
    }
  }

  const handleMoveUp = (index: number) => {
    if (index <= 0) return

    const next = [...items]
    const a = next[index - 1]
    const b = next[index]
    if (a === undefined || b === undefined) return
    next[index - 1] = b
    next[index] = a
    onItemsChange(next)
  }

  const handleMoveDown = (index: number) => {
    if (index >= items.length - 1) return

    const next = [...items]
    const a = next[index]
    const b = next[index + 1]
    if (a === undefined || b === undefined) return
    next[index] = b
    next[index + 1] = a
    onItemsChange(next)
  }

  const editingItem = editingIndex !== null && editingIndex >= 0
    ? items[editingIndex]
    : undefined
  const editingServerItem = editingIndex !== null && editingIndex >= 0
    ? serverItems?.[editingIndex]
    : undefined
  const deleteTargetItem = deleteTarget !== null ? items[deleteTarget] : undefined

  return (
    <>
      <Stack spacing={FIELD_GROUP_GAP}>
        {items.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
            No {itemLabel.toLowerCase()}s added yet.
          </Typography>
        )}

        {items.map((item, index) => (
          <Fragment key={getKey(item)}>
            {renderCard(item, {
              onEdit: () => setEditingIndex(index),
              onRemove: () => setDeleteTarget(index),
              onMoveUp: () => handleMoveUp(index),
              onMoveDown: () => handleMoveDown(index),
              isFirst: index === 0,
              isLast: index === items.length - 1,
              index,
            }, serverItems?.[index])}
          </Fragment>
        ))}

        <Box>
          <Button variant="outlined" size="small" startIcon={<AddOutlined />} onClick={handleAdd}>
            Add {itemLabel}
          </Button>
        </Box>
      </Stack>

      {renderEditDialog({
        open: editingItem !== undefined,
        item: editingItem ?? items[0] ?? createDefault(),
        serverItem: editingItem !== undefined ? editingServerItem : undefined,
        onChange: handleChange,
        onClose: () => setEditingIndex(null),
      })}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Remove ${itemLabel}`}
        confirmLabel="Remove"
        confirmColor="error"
        onConfirm={handleRemoveConfirm}
        onCancel={() => setDeleteTarget(null)}
      >
        {deleteTargetItem !== undefined && confirmMessage(deleteTargetItem)}
      </ConfirmDialog>
    </>
  )
}
