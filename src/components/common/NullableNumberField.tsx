import type { SxProps, Theme } from "@mui/material/styles"
import TextField from "@mui/material/TextField"

interface NullableNumberFieldProps {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  sx?: SxProps<Theme> | undefined
}

export const NullableNumberField = ({ label, value, onChange, sx }: NullableNumberFieldProps) => (
  <TextField
    label={label}
    type="number"
    value={value ?? ""}
    onChange={(e) => {
      const text = e.target.value
      if (text === "") {
        onChange(null)
      } else {
        const num = Number(text)
        if (!Number.isNaN(num)) {
          onChange(num)
        }
      }
    }}
    fullWidth
    sx={sx}
  />
)
