import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"

interface NullableEnumSelectProps {
  label: string
  value: string | null
  options: readonly string[]
  onChange: (value: string | null) => void
}

export const NullableEnumSelect = ({ label, value, options, onChange }: NullableEnumSelectProps) => (
  <FormControl fullWidth>
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
