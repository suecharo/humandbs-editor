import Box from "@mui/material/Box"
import Link from "@mui/material/Link"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import equal from "fast-deep-equal"

import { BilingualCardContent } from "@/components/common/BilingualCardContent"
import { CardActionButtons } from "@/components/common/CardActionButtons"
import { CollapsibleChips } from "@/components/common/CollapsibleChips"
import type { CardActions } from "@/components/common/ItemCardList"
import type { Publication } from "@/schemas/research"
import { COMPACT_GAP, MODIFIED_TEXT_SX } from "@/theme"

interface PublicationCardProps {
  publication: Publication
  actions: CardActions
  serverPublication?: Publication | undefined
}

export const PublicationCard = ({ publication, actions, serverPublication }: PublicationCardProps) => {
  const modified = serverPublication !== undefined ? !equal(publication, serverPublication) : false
  const doiModified = serverPublication ? publication.doi !== serverPublication.doi : false

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: COMPACT_GAP }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <BilingualCardContent
            rows={[{
              label: "タイトル",
              ja: publication.title.ja,
              en: publication.title.en,
              jaModified: serverPublication ? publication.title.ja !== serverPublication.title.ja : false,
              enModified: serverPublication ? publication.title.en !== serverPublication.title.en : false,
            }]}
          />
          {publication.doi && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              DOI:{" "}
              <Link
                href={publication.doi.startsWith("http") ? publication.doi : `https://doi.org/${publication.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={doiModified ? MODIFIED_TEXT_SX : undefined}
              >
                {publication.doi}
              </Link>
            </Typography>
          )}
          {publication.datasetIds && <CollapsibleChips ids={publication.datasetIds} />}
        </Box>
        <CardActionButtons
          label="publication"
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
