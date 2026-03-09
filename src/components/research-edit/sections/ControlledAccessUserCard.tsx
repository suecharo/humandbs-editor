import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"

import { BilingualCardContent, type BilingualRow } from "@/components/common/BilingualCardContent"
import { CardActionButtons } from "@/components/common/CardActionButtons"
import { CollapsibleChips } from "@/components/common/CollapsibleChips"
import type { CardActions } from "@/components/common/ItemCardList"
import type { Person } from "@/schemas/research"

interface ControlledAccessUserCardProps {
  user: Person
  actions: CardActions
}

export const ControlledAccessUserCard = ({ user, actions }: ControlledAccessUserCardProps) => {
  const rows: BilingualRow[] = [
    { label: "氏名", ja: user.name.ja?.text, en: user.name.en?.text },
  ]
  if (user.organization) {
    rows.push({ label: "所属機関", ja: user.organization.name.ja?.text, en: user.organization.name.en?.text })
  }
  if (user.researchTitle) {
    rows.push({ label: "研究題目", ja: user.researchTitle.ja, en: user.researchTitle.en })
  }

  const period = user.periodOfDataUse
  const periodText = period
    ? [period.startDate, period.endDate].filter(Boolean).join(" - ")
    : null

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <BilingualCardContent rows={rows} />
          {periodText && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {periodText}
            </Typography>
          )}
          {user.datasetIds && <CollapsibleChips ids={user.datasetIds} />}
        </Box>
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
      </Box>
    </Paper>
  )
}
