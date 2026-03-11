import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

import { COMPACT_GAP, FORM_LABEL_SX, MONOSPACE_ID_SX } from "@/theme"

interface ReadOnlyFieldProps {
  label: string
  value: string | null | undefined
  monospace?: boolean
}

export const ReadOnlyField = ({ label, value, monospace }: ReadOnlyFieldProps) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant="body2" sx={{ ...FORM_LABEL_SX, mb: COMPACT_GAP }}>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", ...(monospace ? MONOSPACE_ID_SX : {}) }}>
      {value ?? "-"}
    </Typography>
  </Box>
)
