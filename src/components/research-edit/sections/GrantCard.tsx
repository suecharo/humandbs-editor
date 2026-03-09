import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"

import { BilingualCardContent, type BilingualRow } from "@/components/common/BilingualCardContent"
import { CardActionButtons } from "@/components/common/CardActionButtons"
import { CollapsibleChips } from "@/components/common/CollapsibleChips"
import type { CardActions } from "@/components/common/ItemCardList"
import type { Grant } from "@/schemas/research"

interface GrantCardProps {
  grant: Grant
  actions: CardActions
}

export const GrantCard = ({ grant, actions }: GrantCardProps) => {
  const rows: BilingualRow[] = [
    { label: "タイトル", ja: grant.title.ja, en: grant.title.en },
    { label: "助成金名", ja: grant.agency.name.ja, en: grant.agency.name.en },
  ]

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <BilingualCardContent rows={rows} />
          <CollapsibleChips ids={grant.id} />
        </Box>
        <CardActionButtons
          label="grant"
          index={actions.index}
          isFirst={actions.isFirst}
          isLast={actions.isLast}
          onEdit={actions.onEdit}
          onRemove={actions.onRemove}
          onMoveUp={actions.onMoveUp}
          onMoveDown={actions.onMoveDown}
        />
      </Box>
    </Paper>
  )
}
