import ArrowDownwardOutlined from "@mui/icons-material/ArrowDownwardOutlined"
import ArrowUpwardOutlined from "@mui/icons-material/ArrowUpwardOutlined"
import DeleteOutlined from "@mui/icons-material/DeleteOutlined"
import EditOutlined from "@mui/icons-material/EditOutlined"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"
import Tooltip from "@mui/material/Tooltip"

export interface CardActionButtonsProps {
  label: string
  index: number
  isFirst: boolean
  isLast: boolean
  onEdit: () => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export const CardActionButtons = ({
  label,
  index,
  isFirst,
  isLast,
  onEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
}: CardActionButtonsProps) => (
  <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
    <Tooltip title="Edit">
      <IconButton size="small" onClick={onEdit} aria-label={`edit ${label} ${index + 1}`}>
        <EditOutlined fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Move up">
      <span>
        <IconButton
          size="small"
          onClick={onMoveUp}
          disabled={isFirst}
          aria-label={`move ${label} ${index + 1} up`}
        >
          <ArrowUpwardOutlined fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
    <Tooltip title="Move down">
      <span>
        <IconButton
          size="small"
          onClick={onMoveDown}
          disabled={isLast}
          aria-label={`move ${label} ${index + 1} down`}
        >
          <ArrowDownwardOutlined fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
    <Tooltip title="Remove">
      <IconButton
        size="small"
        color="error"
        onClick={onRemove}
        aria-label={`remove ${label} ${index + 1}`}
      >
        <DeleteOutlined fontSize="small" />
      </IconButton>
    </Tooltip>
  </Stack>
)
