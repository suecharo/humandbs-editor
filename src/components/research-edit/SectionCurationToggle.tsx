import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"

import type { SectionCurationStatus } from "@/schemas/editor-state"
import { TOGGLE_BUTTON_BORDER_RADIUS, TOGGLE_BUTTON_MIN_WIDTH } from "@/theme"

interface SectionCurationToggleProps {
  status: SectionCurationStatus
  onToggle: () => void
}

const toggleButtonSx = {
  textTransform: "none",
  px: 1.5,
  fontSize: "0.75rem",
  minWidth: TOGGLE_BUTTON_MIN_WIDTH,
} as const

export const SectionCurationToggle = ({ status, onToggle }: SectionCurationToggleProps) => (
  <ToggleButtonGroup
    value={status}
    exclusive
    size="small"
    onChange={(_, newValue: SectionCurationStatus | null) => {
      if (newValue !== null) onToggle()
    }}
    sx={{
      height: 28,
      "& .MuiToggleButtonGroup-grouped:first-of-type": { borderRadius: `${TOGGLE_BUTTON_BORDER_RADIUS} 0 0 ${TOGGLE_BUTTON_BORDER_RADIUS}` },
      "& .MuiToggleButtonGroup-grouped:last-of-type": { borderRadius: `0 ${TOGGLE_BUTTON_BORDER_RADIUS} ${TOGGLE_BUTTON_BORDER_RADIUS} 0` },
    }}
  >
    <ToggleButton
      value="uncurated"
      sx={{
        ...toggleButtonSx,
        "&.Mui-selected": { bgcolor: "warning.light", color: "warning.contrastText", "&:hover": { bgcolor: "warning.main" } },
      }}
    >
      Uncurated
    </ToggleButton>
    <ToggleButton
      value="curated"
      sx={{
        ...toggleButtonSx,
        "&.Mui-selected": { bgcolor: "success.light", color: "success.contrastText", "&:hover": { bgcolor: "success.main" } },
      }}
    >
      Curated
    </ToggleButton>
  </ToggleButtonGroup>
)
