import ArrowDownwardOutlined from "@mui/icons-material/ArrowDownwardOutlined"
import ArrowUpwardOutlined from "@mui/icons-material/ArrowUpwardOutlined"
import DeleteOutlined from "@mui/icons-material/DeleteOutlined"
import EditOutlined from "@mui/icons-material/EditOutlined"
import Chip from "@mui/material/Chip"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"
import Tooltip from "@mui/material/Tooltip"

import { EXPAND_ICON_SIZE, MODIFIED_CHIP_COMPACT_SX } from "@/theme"

export interface CardActionButtonsProps {
  label: string
  index: number
  isFirst: boolean
  isLast: boolean
  modified?: boolean | undefined
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
  modified,
  onEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
}: CardActionButtonsProps) => (
  <Stack sx={{ flexShrink: 0, alignItems: "center" }}>
    {modified && (
      <Chip label="Modified" size="small" sx={{ ...MODIFIED_CHIP_COMPACT_SX, mb: 0.25 }} />
    )}
    <Tooltip title="Edit" placement="left">
      <IconButton size="small" onClick={onEdit} aria-label={`edit ${label} ${index + 1}`}>
        <EditOutlined sx={{ fontSize: EXPAND_ICON_SIZE }} />
      </IconButton>
    </Tooltip>
    <Tooltip title="Move up" placement="left">
      <span>
        <IconButton
          size="small"
          onClick={onMoveUp}
          disabled={isFirst}
          aria-label={`move ${label} ${index + 1} up`}
        >
          <ArrowUpwardOutlined sx={{ fontSize: EXPAND_ICON_SIZE }} />
        </IconButton>
      </span>
    </Tooltip>
    <Tooltip title="Move down" placement="left">
      <span>
        <IconButton
          size="small"
          onClick={onMoveDown}
          disabled={isLast}
          aria-label={`move ${label} ${index + 1} down`}
        >
          <ArrowDownwardOutlined sx={{ fontSize: EXPAND_ICON_SIZE }} />
        </IconButton>
      </span>
    </Tooltip>
    <Tooltip title="Remove" placement="left">
      <IconButton
        size="small"
        color="error"
        onClick={onRemove}
        aria-label={`remove ${label} ${index + 1}`}
      >
        <DeleteOutlined sx={{ fontSize: EXPAND_ICON_SIZE }} />
      </IconButton>
    </Tooltip>
  </Stack>
)
