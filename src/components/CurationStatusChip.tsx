import Chip from "@mui/material/Chip"

import type { CurationStatus } from "../schemas/editor-state"

interface CurationStatusChipProps {
  status: CurationStatus | string
}

const statusConfig: Record<string, { label: string; color: "default" | "warning" | "success" }> = {
  uncurated: { label: "Uncurated", color: "default" },
  "in-progress": { label: "In Progress", color: "warning" },
  curated: { label: "Curated", color: "success" },
}

export const CurationStatusChip = ({ status }: CurationStatusChipProps) => {
  const config = statusConfig[status] ?? { label: status, color: "default" as const }

  return <Chip label={config.label} color={config.color} variant="filled" />
}
