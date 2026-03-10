import Box from "@mui/material/Box"
import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import Typography from "@mui/material/Typography"

import { FORM_LABEL_SX } from "@/theme"

interface TriStateToggleProps {
  label: string
  value: boolean | null
  onChange: (value: boolean | null) => void
}

export const TriStateToggle = ({ label, value, onChange }: TriStateToggleProps) => {
  const handleChange = (_event: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    if (newValue === "true") onChange(true)
    else if (newValue === "false") onChange(false)
    else onChange(null)
  }

  const stringValue = value === null ? "null" : String(value)

  return (
    <Box>
      <Typography variant="body2" sx={{ ...FORM_LABEL_SX, mb: 0.5 }}>
        {label}
      </Typography>
      <ToggleButtonGroup
        value={stringValue}
        exclusive
        onChange={handleChange}
        size="small"
      >
        <ToggleButton value="null">---</ToggleButton>
        <ToggleButton value="true">Yes</ToggleButton>
        <ToggleButton value="false">No</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
}
