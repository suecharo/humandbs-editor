import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import type { SxProps, Theme } from "@mui/material/styles"

interface NullableEnumSelectProps {
  label: string
  value: string | null
  options: readonly string[]
  onChange: (value: string | null) => void
  sx?: SxProps<Theme> | undefined
}

export const NullableEnumSelect = ({ label, value, options, onChange, sx }: NullableEnumSelectProps) => (
  <FormControl fullWidth size="small" sx={sx}>
    <InputLabel>{label}</InputLabel>
    <Select
      value={value ?? ""}
      label={label}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
    >
      <MenuItem value="">---</MenuItem>
      {options.map((opt) => (
        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
      ))}
    </Select>
  </FormControl>
)
