import AddOutlined from "@mui/icons-material/AddOutlined"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { Fragment, type ReactNode, useState } from "react"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"

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
  item: T | null
  onSave: (item: T) => void
  onCancel: () => void
}

export interface ItemCardListProps<T> {
  items: T[]
  getKey: (item: T) => string | number
  onItemsChange: (items: T[]) => void
  renderCard: (item: T, actions: CardActions) => ReactNode
  renderEditDialog: (props: EditDialogRenderProps<T>) => ReactNode
  itemLabel: string
  confirmMessage: (item: T) => string
}

// eslint-disable-next-line @stylistic/comma-dangle -- trailing comma required to disambiguate TSX generic from JSX
export const ItemCardList = <T,>({
  items,
  getKey,
  onItemsChange,
  renderCard,
  renderEditDialog,
  itemLabel,
  confirmMessage,
}: ItemCardListProps<T>) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const handleAdd = () => {
    setEditingIndex(-1)
  }

  const handleSave = (item: T) => {
    if (editingIndex === -1) {
      onItemsChange([...items, item])
    } else if (editingIndex !== null) {
      onItemsChange(items.map((s, i) => (i === editingIndex ? item : s)))
    }
    setEditingIndex(null)
  }

  const handleRemoveConfirm = () => {
    if (deleteTarget !== null) {
      onItemsChange(items.filter((_, i) => i !== deleteTarget))
      setDeleteTarget(null)
    }
  }

  const handleMoveUp = (index: number) => {
    if (index <= 0) {
      return
    }

    const next = [...items]
    const a = next[index - 1]
    const b = next[index]
    if (a === undefined || b === undefined) return
    next[index - 1] = b
    next[index] = a
    onItemsChange(next)
  }

  const handleMoveDown = (index: number) => {
    if (index >= items.length - 1) {
      return
    }

    const next = [...items]
    const a = next[index]
    const b = next[index + 1]
    if (a === undefined || b === undefined) return
    next[index] = b
    next[index + 1] = a
    onItemsChange(next)
  }

  const dialogItem = editingIndex !== null && editingIndex >= 0
    ? items[editingIndex] ?? null
    : null
  const deleteTargetItem = deleteTarget !== null ? items[deleteTarget] : undefined

  return (
    <>
      <Stack spacing={1.5}>
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
            })}
          </Fragment>
        ))}

        <Box>
          <Button variant="outlined" size="small" startIcon={<AddOutlined />} onClick={handleAdd}>
            Add {itemLabel}
          </Button>
        </Box>
      </Stack>

      {renderEditDialog({
        open: editingIndex !== null,
        item: dialogItem,
        onSave: handleSave,
        onCancel: () => setEditingIndex(null),
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
