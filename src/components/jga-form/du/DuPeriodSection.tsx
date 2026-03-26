import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import { INLINE_GAP, SUBSECTION_GAP } from "@/theme"

interface DuPeriodSectionProps {
  start: string
  end: string
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
}

export const DuPeriodSection = ({
  start,
  end,
  onStartChange,
  onEndChange,
}: DuPeriodSectionProps) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
    <Typography variant="h3">利用期間</Typography>
    <Box sx={{ display: "flex", gap: INLINE_GAP }}>
      <TextField
        label="開始日"
        type="date"
        value={start}
        onChange={(e) => onStartChange(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth
      />
      <TextField
        label="終了日"
        type="date"
        value={end}
        onChange={(e) => onEndChange(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth
      />
    </Box>
  </Box>
)
