import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"

import { BilingualCardContent, type BilingualRow } from "@/components/common/BilingualCardContent"
import { CardActionButtons } from "@/components/common/CardActionButtons"
import type { CardActions } from "@/components/common/ItemCardList"
import type { Person } from "@/schemas/research"

interface DataProviderCardProps {
  person: Person
  actions: CardActions
}

export const DataProviderCard = ({ person, actions }: DataProviderCardProps) => {
  const rows: BilingualRow[] = [
    { label: "研究代表者", ja: person.name.ja?.text, en: person.name.en?.text },
  ]
  if (person.organization) {
    rows.push({ label: "所属機関", ja: person.organization.name.ja?.text, en: person.organization.name.en?.text })
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <BilingualCardContent rows={rows} />
          {(person.email || person.orcid) && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {[person.email, person.orcid && `ORCID: ${person.orcid}`].filter(Boolean).join(" / ")}
            </Typography>
          )}
        </Box>
        <CardActionButtons
          label="provider"
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
