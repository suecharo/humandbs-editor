import Box from "@mui/material/Box"
import Link from "@mui/material/Link"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import equal from "fast-deep-equal"

import { BilingualCardContent } from "@/components/common/BilingualCardContent"
import { CardActionButtons } from "@/components/common/CardActionButtons"
import type { CardActions } from "@/components/common/ItemCardList"
import type { ResearchProject } from "@/schemas/research"
import { MODIFIED_TEXT_SX } from "@/theme"

interface ResearchProjectCardProps {
  project: ResearchProject
  actions: CardActions
  serverProject?: ResearchProject | undefined
}

export const ResearchProjectCard = ({ project, actions, serverProject }: ResearchProjectCardProps) => {
  const modified = serverProject !== undefined ? !equal(project, serverProject) : false
  const jaUrl = project.url?.ja
  const enUrl = project.url?.en
  const jaUrlModified = serverProject ? jaUrl?.url !== serverProject.url?.ja?.url : false
  const enUrlModified = serverProject ? enUrl?.url !== serverProject.url?.en?.url : false

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <BilingualCardContent
            rows={[{
              label: "プロジェクト名",
              ja: project.name.ja?.text,
              en: project.name.en?.text,
              jaModified: serverProject ? project.name.ja?.text !== serverProject.name.ja?.text : false,
              enModified: serverProject ? project.name.en?.text !== serverProject.name.en?.text : false,
            }]}
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
                    <Link
                      href={jaUrl.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={jaUrlModified ? MODIFIED_TEXT_SX : undefined}
                    >
                      {jaUrl.url}
                    </Link>
                  </Typography>
                )}
                {enUrl && (
                  <Typography variant="body2">
                    <Typography component="span" variant="body2" color="text.secondary">EN: </Typography>
                    <Link
                      href={enUrl.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={enUrlModified ? MODIFIED_TEXT_SX : undefined}
                    >
                      {enUrl.url}
                    </Link>
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
