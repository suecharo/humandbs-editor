import Box from "@mui/material/Box"
import type { SxProps, Theme } from "@mui/material/styles"
import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import Typography from "@mui/material/Typography"

import { COMPACT_GAP, FORM_LABEL_SX, TOGGLE_BUTTON_BORDER_RADIUS } from "@/theme"

interface TriStateToggleProps {
  label: string
  value: boolean | null
  onChange: (value: boolean | null) => void
  sx?: SxProps<Theme> | undefined
}

export const TriStateToggle = ({ label, value, onChange, sx }: TriStateToggleProps) => {
  const handleChange = (_event: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    if (newValue === "true") onChange(true)
    else if (newValue === "false") onChange(false)
    else onChange(null)
  }

  const stringValue = value === null ? "null" : String(value)

  const toggleButtonSx = {
    textTransform: "none",
    px: 1.5,
    fontSize: "0.75rem",
  } as const

  return (
    <Box sx={sx}>
      <Typography variant="body2" sx={{ ...FORM_LABEL_SX, mb: COMPACT_GAP }}>
        {label}
      </Typography>
      <ToggleButtonGroup
        value={stringValue}
        exclusive
        onChange={handleChange}
        size="small"
        sx={{
          height: 28,
          "& .MuiToggleButtonGroup-grouped:first-of-type": { borderRadius: `${TOGGLE_BUTTON_BORDER_RADIUS} 0 0 ${TOGGLE_BUTTON_BORDER_RADIUS}` },
          "& .MuiToggleButtonGroup-grouped:last-of-type": { borderRadius: `0 ${TOGGLE_BUTTON_BORDER_RADIUS} ${TOGGLE_BUTTON_BORDER_RADIUS} 0` },
        }}
      >
        <ToggleButton value="null" sx={toggleButtonSx}>---</ToggleButton>
        <ToggleButton value="true" sx={toggleButtonSx}>Yes</ToggleButton>
        <ToggleButton value="false" sx={toggleButtonSx}>No</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
}
