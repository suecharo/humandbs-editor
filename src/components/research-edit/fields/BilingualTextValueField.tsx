import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import type { BilingualTextValue } from "@/schemas/common"
import { FIELD_GROUP_GAP, FORM_FIELD_MAX_WIDTH, FORM_LABEL_SX } from "@/theme"

interface BilingualTextValueFieldProps {
  label: string
  value: BilingualTextValue
  onChange: (value: BilingualTextValue) => void
  readOnly?: boolean
  multiline?: boolean
}

export const BilingualTextValueField = ({
  label,
  value,
  onChange,
  readOnly = false,
  multiline = true,
}: BilingualTextValueFieldProps) => (
  <Box>
    <Typography variant="body2" sx={{ ...FORM_LABEL_SX, mb: 1 }}>
      {label}
    </Typography>
    <Box sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP, maxWidth: FORM_FIELD_MAX_WIDTH }}>
      <TextField
        label="JA"
        value={value.ja?.text ?? ""}
        onChange={(e) => onChange({
          ...value,
          ja: value.ja
            ? { ...value.ja, text: e.target.value }
            : { text: e.target.value, rawHtml: "" },
        })}
        multiline={multiline}
        minRows={multiline ? 2 : undefined}
        slotProps={{ input: { readOnly } }}
        fullWidth
      />
      <TextField
        label="EN"
        value={value.en?.text ?? ""}
        onChange={(e) => onChange({
          ...value,
          en: value.en
            ? { ...value.en, text: e.target.value }
            : { text: e.target.value, rawHtml: "" },
        })}
        multiline={multiline}
        minRows={multiline ? 2 : undefined}
        slotProps={{ input: { readOnly } }}
        fullWidth
      />
    </Box>
  </Box>
)
