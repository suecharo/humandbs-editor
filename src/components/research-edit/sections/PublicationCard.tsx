import Chip from "@mui/material/Chip"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"

import { CardActionButtons } from "@/components/common/CardActionButtons"
import type { CardActions } from "@/components/common/ItemCardList"
import { TruncatedText } from "@/components/common/TruncatedText"
import type { Publication } from "@/schemas/research"

interface PublicationCardProps {
  publication: Publication
  actions: CardActions
}

export const PublicationCard = ({ publication, actions }: PublicationCardProps) => {
  const title = publication.title.ja || publication.title.en || "(untitled)"

  return (
    <Paper variant="outlined" sx={{ p: 2, display: "flex", alignItems: "center" }}>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <TruncatedText text={title} variant="body1" fontWeight={500} />
        {publication.doi && (
          <TruncatedText text={`DOI: ${publication.doi}`} color="text.secondary" />
        )}
        {publication.datasetIds && publication.datasetIds.length > 0 && (
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: "wrap" }}>
            {publication.datasetIds.map((id) => (
              <Chip key={id} label={id} size="small" />
            ))}
          </Stack>
        )}
      </Stack>
      <CardActionButtons
        label="publication"
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
