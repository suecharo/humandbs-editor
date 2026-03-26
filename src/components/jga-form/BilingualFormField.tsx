import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import type { BilingualFormText } from "@/schemas/jga-form"
import { FIELD_GROUP_GAP, INLINE_GAP } from "@/theme"

interface BilingualFormFieldProps {
  label: string
  helperText?: string
  value: BilingualFormText
  onChange: (value: BilingualFormText) => void
  multiline?: boolean
}

export const BilingualFormField = ({
  label,
  helperText,
  value,
  onChange,
  multiline = false,
}: BilingualFormFieldProps) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP }}>
    <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary" }}>
      {label}
    </Typography>
    {helperText ? (
      <Typography variant="body2" color="text.secondary" sx={{ mt: -0.5 }}>
        {helperText}
      </Typography>
    ) : null}
    <Box sx={{ display: "flex", gap: INLINE_GAP }}>
      <TextField
        label="日本語"
        value={value.ja}
        onChange={(e) => onChange({ ...value, ja: e.target.value })}
        multiline={multiline}
        minRows={multiline ? 2 : undefined}
        fullWidth
      />
      <TextField
        label="English"
        value={value.en}
        onChange={(e) => onChange({ ...value, en: e.target.value })}
        multiline={multiline}
        minRows={multiline ? 2 : undefined}
        fullWidth
      />
    </Box>
  </Box>
)
