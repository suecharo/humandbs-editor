import Chip from "@mui/material/Chip"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"

import { CardActionButtons } from "@/components/common/CardActionButtons"
import type { CardActions } from "@/components/common/ItemCardList"
import { TruncatedText } from "@/components/common/TruncatedText"
import type { Person } from "@/schemas/research"

interface ControlledAccessUserCardProps {
  user: Person
  actions: CardActions
}

export const ControlledAccessUserCard = ({ user, actions }: ControlledAccessUserCardProps) => {
  const name = user.name.ja?.text || user.name.en?.text || "(unnamed)"
  const orgName = user.organization?.name.ja?.text || user.organization?.name.en?.text
  const researchTitle = user.researchTitle?.ja || user.researchTitle?.en
  const period = user.periodOfDataUse
  const periodText = period
    ? [period.startDate, period.endDate].filter(Boolean).join(" - ")
    : null

  return (
    <Paper variant="outlined" sx={{ p: 2, display: "flex", alignItems: "center" }}>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <TruncatedText text={name} variant="body1" fontWeight={500} />
        {orgName && (
          <TruncatedText text={orgName} color="text.secondary" />
        )}
        {researchTitle && (
          <TruncatedText text={researchTitle} color="text.secondary" />
        )}
        {periodText && (
          <TruncatedText text={periodText} color="text.secondary" />
        )}
        {user.datasetIds && user.datasetIds.length > 0 && (
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: "wrap" }}>
            {user.datasetIds.map((id) => (
              <Chip key={id} label={id} size="small" />
            ))}
          </Stack>
        )}
      </Stack>
      <CardActionButtons
        label="user"
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
