import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import type { ReactNode } from "react"

import { COMPACT_GAP, SUBSECTION_GAP } from "@/theme"

import { CardActionButtons } from "./CardActionButtons"
import type { CardActions } from "./ItemCardList"

interface ActionCardProps {
  label: string
  actions: CardActions
  modified: boolean
  children: ReactNode
}

export const ActionCard = ({ label, actions, modified, children }: ActionCardProps) => (
  <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: COMPACT_GAP }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {children}
      </Box>
      <CardActionButtons
        label={label}
        index={actions.index}
        isFirst={actions.isFirst}
        isLast={actions.isLast}
        modified={modified}
        onEdit={actions.onEdit}
        onRemove={actions.onRemove}
        onMoveUp={actions.onMoveUp}
        onMoveDown={actions.onMoveDown}
      />
    </Box>
  </Paper>
)
