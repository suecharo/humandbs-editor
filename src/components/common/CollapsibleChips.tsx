import Chip from "@mui/material/Chip"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

import { COMPACT_GAP } from "@/theme"

const DEFAULT_VISIBLE = 3

interface CollapsibleChipsProps {
  ids: string[]
  maxVisible?: number
}

export const CollapsibleChips = ({ ids, maxVisible = DEFAULT_VISIBLE }: CollapsibleChipsProps) => {
  if (ids.length === 0) return null

  const visible = ids.slice(0, maxVisible)
  const hiddenCount = ids.length - maxVisible

  return (
    <Stack direction="row" spacing={COMPACT_GAP} sx={{ mt: 0.75, flexWrap: "wrap", gap: COMPACT_GAP, alignItems: "center" }}>
      {visible.map((id) => (
        <Chip key={id} label={id} size="small" sx={{ fontFamily: "monospace" }} />
      ))}
      {hiddenCount > 0 && (
        <Typography variant="body2" color="text.secondary">
          +{hiddenCount}
        </Typography>
      )}
    </Stack>
  )
}
