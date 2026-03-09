import Chip from "@mui/material/Chip"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"

import { CardActionButtons } from "@/components/common/CardActionButtons"
import type { CardActions } from "@/components/common/ItemCardList"
import { TruncatedText } from "@/components/common/TruncatedText"
import type { Grant } from "@/schemas/research"

interface GrantCardProps {
  grant: Grant
  actions: CardActions
}

export const GrantCard = ({ grant, actions }: GrantCardProps) => {
  const title = grant.title.ja || grant.title.en || "(untitled)"
  const agencyName = grant.agency.name.ja || grant.agency.name.en

  return (
    <Paper variant="outlined" sx={{ p: 2, display: "flex", alignItems: "center" }}>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <TruncatedText text={title} variant="body1" fontWeight={500} />
        {agencyName && (
          <TruncatedText text={agencyName} color="text.secondary" />
        )}
        {grant.id.length > 0 && (
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: "wrap" }}>
            {grant.id.map((id) => (
              <Chip key={id} label={id} size="small" />
            ))}
          </Stack>
        )}
      </Stack>
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
    </Paper>
  )
}
