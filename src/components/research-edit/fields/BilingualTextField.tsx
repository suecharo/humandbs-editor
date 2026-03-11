import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import type { BilingualText } from "@/schemas/common"
import { COMPACT_GAP, FIELD_GROUP_GAP, FORM_FIELD_MAX_WIDTH, FORM_LABEL_SX, MODIFIED_FIELD_SX } from "@/theme"

export interface LangModified {
  ja?: boolean
  en?: boolean
}

interface BilingualTextFieldProps {
  label: string
  value: BilingualText
  onChange: (value: BilingualText) => void
  readOnly?: boolean
  multiline?: boolean
  modified?: LangModified | undefined
}

export const BilingualTextField = ({
  label,
  value,
  onChange,
  readOnly = false,
  multiline = false,
  modified,
}: BilingualTextFieldProps) => (
  <Box>
    <Typography variant="body2" sx={{ ...FORM_LABEL_SX, mb: COMPACT_GAP }}>
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
        sx={modified?.ja ? MODIFIED_FIELD_SX : undefined}
      />
      <TextField
        label="EN"
        value={value.en ?? ""}
        onChange={(e) => onChange({ ...value, en: e.target.value || null })}
        multiline={multiline}
        minRows={multiline ? 2 : undefined}
        slotProps={{ input: { readOnly } }}
        fullWidth
        sx={modified?.en ? MODIFIED_FIELD_SX : undefined}
      />
    </Box>
  </Box>
)
