import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import equal from "fast-deep-equal"

import { BilingualCardContent, type BilingualRow } from "@/components/common/BilingualCardContent"
import { CardActionButtons } from "@/components/common/CardActionButtons"
import { CollapsibleChips } from "@/components/common/CollapsibleChips"
import type { CardActions } from "@/components/common/ItemCardList"
import type { Person } from "@/schemas/research"
import { MODIFIED_TEXT_SX } from "@/theme"

interface ControlledAccessUserCardProps {
  user: Person
  actions: CardActions
  serverUser?: Person | undefined
}

export const ControlledAccessUserCard = ({ user, actions, serverUser }: ControlledAccessUserCardProps) => {
  const modified = serverUser !== undefined ? !equal(user, serverUser) : false

  const rows: BilingualRow[] = [
    {
      label: "氏名",
      ja: user.name.ja?.text,
      en: user.name.en?.text,
      jaModified: serverUser ? user.name.ja?.text !== serverUser.name.ja?.text : false,
      enModified: serverUser ? user.name.en?.text !== serverUser.name.en?.text : false,
    },
  ]
  if (user.organization) {
    rows.push({
      label: "所属機関",
      ja: user.organization.name.ja?.text,
      en: user.organization.name.en?.text,
      jaModified: serverUser ? user.organization.name.ja?.text !== serverUser.organization?.name.ja?.text : false,
      enModified: serverUser ? user.organization.name.en?.text !== serverUser.organization?.name.en?.text : false,
    })
  }
  if (user.researchTitle) {
    rows.push({
      label: "研究題目",
      ja: user.researchTitle.ja,
      en: user.researchTitle.en,
      jaModified: serverUser ? user.researchTitle.ja !== serverUser.researchTitle?.ja : false,
      enModified: serverUser ? user.researchTitle.en !== serverUser.researchTitle?.en : false,
    })
  }

  const period = user.periodOfDataUse
  const periodText = period
    ? [period.startDate, period.endDate].filter(Boolean).join(" - ")
    : null
  const serverPeriod = serverUser?.periodOfDataUse
  const periodModified = serverUser && period
    ? period.startDate !== serverPeriod?.startDate || period.endDate !== serverPeriod?.endDate
    : false

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <BilingualCardContent rows={rows} />
          {periodText && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, ...(periodModified ? MODIFIED_TEXT_SX : undefined) }}
            >
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
