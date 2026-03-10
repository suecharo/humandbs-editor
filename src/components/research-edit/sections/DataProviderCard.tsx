import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import equal from "fast-deep-equal"

import { BilingualCardContent, type BilingualRow } from "@/components/common/BilingualCardContent"
import { CardActionButtons } from "@/components/common/CardActionButtons"
import type { CardActions } from "@/components/common/ItemCardList"
import type { Person } from "@/schemas/research"
import { MODIFIED_TEXT_SX } from "@/theme"

interface DataProviderCardProps {
  person: Person
  actions: CardActions
  serverPerson?: Person | undefined
}

export const DataProviderCard = ({ person, actions, serverPerson }: DataProviderCardProps) => {
  const modified = serverPerson !== undefined ? !equal(person, serverPerson) : false

  const rows: BilingualRow[] = [
    {
      label: "研究代表者",
      ja: person.name.ja?.text,
      en: person.name.en?.text,
      jaModified: serverPerson ? person.name.ja?.text !== serverPerson.name.ja?.text : false,
      enModified: serverPerson ? person.name.en?.text !== serverPerson.name.en?.text : false,
    },
  ]
  if (person.organization) {
    rows.push({
      label: "所属機関",
      ja: person.organization.name.ja?.text,
      en: person.organization.name.en?.text,
      jaModified: serverPerson ? person.organization.name.ja?.text !== serverPerson.organization?.name.ja?.text : false,
      enModified: serverPerson ? person.organization.name.en?.text !== serverPerson.organization?.name.en?.text : false,
    })
  }

  const metaLine = [person.email, person.orcid && `ORCID: ${person.orcid}`].filter(Boolean).join(" / ")
  const serverMetaLine = serverPerson
    ? [serverPerson.email, serverPerson.orcid && `ORCID: ${serverPerson.orcid}`].filter(Boolean).join(" / ")
    : null
  const metaModified = serverPerson ? metaLine !== (serverMetaLine ?? "") : false

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <BilingualCardContent rows={rows} />
          {metaLine && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, ...(metaModified ? MODIFIED_TEXT_SX : undefined) }}
            >
              {metaLine}
            </Typography>
          )}
        </Box>
        <CardActionButtons
          label="provider"
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
