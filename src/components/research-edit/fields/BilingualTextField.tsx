import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import type { BilingualText } from "@/schemas/common"
import { FIELD_GROUP_GAP, FORM_FIELD_MAX_WIDTH, FORM_LABEL_SX, SUBSECTION_GAP } from "@/theme"

interface BilingualTextFieldProps {
  label: string
  value: BilingualText
  onChange: (value: BilingualText) => void
  readOnly?: boolean
  multiline?: boolean
}

export const BilingualTextField = ({
  label,
  value,
  onChange,
  readOnly = false,
  multiline = false,
}: BilingualTextFieldProps) => (
  <Box sx={{ mb: SUBSECTION_GAP }}>
    <Typography variant="body2" sx={{ ...FORM_LABEL_SX, mb: 1 }}>
      {label}
    </Typography>
    <Box sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP, maxWidth: FORM_FIELD_MAX_WIDTH }}>
      <TextField
        label="JA"
        value={value.ja ?? ""}
        onChange={(e) => onChange({ ...value, ja: e.target.value || null })}
        multiline={multiline}
        minRows={multiline ? 2 : undefined}
        slotProps={{ input: { readOnly } }}
        fullWidth
      />
      <TextField
        label="EN"
        value={value.en ?? ""}
        onChange={(e) => onChange({ ...value, en: e.target.value || null })}
        multiline={multiline}
        minRows={multiline ? 2 : undefined}
        slotProps={{ input: { readOnly } }}
        fullWidth
      />
    </Box>
  </Box>
)
