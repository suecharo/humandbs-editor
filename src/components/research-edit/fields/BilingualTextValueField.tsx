import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import type { BilingualTextValue } from "@/schemas/common"
import { COMPACT_GAP, FIELD_GROUP_GAP, FORM_FIELD_MAX_WIDTH, FORM_LABEL_SX, MODIFIED_FIELD_SX } from "@/theme"

import type { LangModified } from "./BilingualTextField"

interface BilingualTextValueFieldProps {
  label: string
  value: BilingualTextValue
  onChange: (value: BilingualTextValue) => void
  readOnly?: boolean
  multiline?: boolean
  modified?: LangModified | undefined
}

export const BilingualTextValueField = ({
  label,
  value,
  onChange,
  readOnly = false,
  multiline = true,
  modified,
}: BilingualTextValueFieldProps) => (
  <Box>
    <Typography variant="body2" sx={{ ...FORM_LABEL_SX, mb: COMPACT_GAP }}>
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
        sx={modified?.ja ? MODIFIED_FIELD_SX : undefined}
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
        sx={modified?.en ? MODIFIED_FIELD_SX : undefined}
      />
    </Box>
  </Box>
)
