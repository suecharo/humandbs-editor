import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"
import Chip from "@mui/material/Chip"

import type { SectionCurationStatus } from "@/schemas/editor-state"

interface SectionCurationToggleProps {
  status: SectionCurationStatus
  onToggle: () => void
}

export const SectionCurationToggle = ({ status, onToggle }: SectionCurationToggleProps) => (
  <Chip
    icon={status === "curated" ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
    label={status === "curated" ? "Curated" : "Uncurated"}
    color={status === "curated" ? "success" : "default"}
    size="small"
    onClick={onToggle}
    clickable
  />
)
