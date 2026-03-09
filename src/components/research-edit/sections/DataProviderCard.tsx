import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"

import { CardActionButtons } from "@/components/common/CardActionButtons"
import type { CardActions } from "@/components/common/ItemCardList"
import { TruncatedText } from "@/components/common/TruncatedText"
import type { Person } from "@/schemas/research"

interface DataProviderCardProps {
  person: Person
  actions: CardActions
}

export const DataProviderCard = ({ person, actions }: DataProviderCardProps) => {
  const name = person.name.ja?.text || person.name.en?.text || "(unnamed)"
  const orgName = person.organization?.name.ja?.text || person.organization?.name.en?.text

  return (
    <Paper variant="outlined" sx={{ p: 2, display: "flex", alignItems: "center" }}>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <TruncatedText text={name} variant="body1" fontWeight={500} />
        {orgName && (
          <TruncatedText text={orgName} color="text.secondary" />
        )}
        {(person.email || person.orcid) && (
          <TruncatedText
            text={[person.email, person.orcid && `ORCID: ${person.orcid}`].filter(Boolean).join(" / ")}
            color="text.secondary"
          />
        )}
      </Stack>
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
    </Paper>
  )
}
