import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import equal from "fast-deep-equal"

import { BilingualCardContent, type BilingualRow } from "@/components/common/BilingualCardContent"
import { CardActionButtons } from "@/components/common/CardActionButtons"
import { CollapsibleChips } from "@/components/common/CollapsibleChips"
import type { CardActions } from "@/components/common/ItemCardList"
import type { Grant } from "@/schemas/research"
import { COMPACT_GAP } from "@/theme"

interface GrantCardProps {
  grant: Grant
  actions: CardActions
  serverGrant?: Grant | undefined
}

export const GrantCard = ({ grant, actions, serverGrant }: GrantCardProps) => {
  const modified = serverGrant !== undefined ? !equal(grant, serverGrant) : false

  const rows: BilingualRow[] = [
    {
      label: "タイトル",
      ja: grant.title.ja,
      en: grant.title.en,
      jaModified: serverGrant ? grant.title.ja !== serverGrant.title.ja : false,
      enModified: serverGrant ? grant.title.en !== serverGrant.title.en : false,
    },
    {
      label: "助成金名",
      ja: grant.agency.name.ja,
      en: grant.agency.name.en,
      jaModified: serverGrant ? grant.agency.name.ja !== serverGrant.agency.name.ja : false,
      enModified: serverGrant ? grant.agency.name.en !== serverGrant.agency.name.en : false,
    },
  ]

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: COMPACT_GAP }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <BilingualCardContent rows={rows} />
          <CollapsibleChips ids={grant.id} />
        </Box>
        <CardActionButtons
          label="grant"
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
}
