import Box from "@mui/material/Box"
import Link from "@mui/material/Link"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"

import { BilingualCardContent } from "@/components/common/BilingualCardContent"
import { CardActionButtons } from "@/components/common/CardActionButtons"
import type { CardActions } from "@/components/common/ItemCardList"
import type { ResearchProject } from "@/schemas/research"

interface ResearchProjectCardProps {
  project: ResearchProject
  actions: CardActions
}

export const ResearchProjectCard = ({ project, actions }: ResearchProjectCardProps) => {
  const jaUrl = project.url?.ja
  const enUrl = project.url?.en

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <BilingualCardContent
            rows={[{ label: "プロジェクト名", ja: project.name.ja?.text, en: project.name.en?.text }]}
          />
          {(jaUrl || enUrl) && (
            <Box sx={{ mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ letterSpacing: "0.04em" }}>
                URL
              </Typography>
              <Box sx={{ pl: 0.5 }}>
                {jaUrl && (
                  <Typography variant="body2">
                    <Typography component="span" variant="body2" color="text.secondary">JA: </Typography>
                    <Link href={jaUrl.url} target="_blank" rel="noopener noreferrer">{jaUrl.url}</Link>
                  </Typography>
                )}
                {enUrl && (
                  <Typography variant="body2">
                    <Typography component="span" variant="body2" color="text.secondary">EN: </Typography>
                    <Link href={enUrl.url} target="_blank" rel="noopener noreferrer">{enUrl.url}</Link>
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>
        <CardActionButtons
          label="project"
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
