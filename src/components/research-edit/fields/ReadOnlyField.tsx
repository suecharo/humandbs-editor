import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

import { FORM_LABEL_SX } from "@/theme"

interface ReadOnlyFieldProps {
  label: string
  value: string | null | undefined
}

export const ReadOnlyField = ({ label, value }: ReadOnlyFieldProps) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant="body2" sx={{ ...FORM_LABEL_SX, mb: 0.25 }}>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {value ?? "-"}
    </Typography>
  </Box>
)
