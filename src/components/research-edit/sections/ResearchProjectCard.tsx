import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"

import { CardActionButtons } from "@/components/common/CardActionButtons"
import type { CardActions } from "@/components/common/ItemCardList"
import { TruncatedText } from "@/components/common/TruncatedText"
import type { ResearchProject } from "@/schemas/research"

interface ResearchProjectCardProps {
  project: ResearchProject
  actions: CardActions
}

export const ResearchProjectCard = ({ project, actions }: ResearchProjectCardProps) => {
  const title = project.name.ja?.text || project.name.en?.text || "(unnamed)"

  return (
    <Paper variant="outlined" sx={{ p: 2, display: "flex", alignItems: "center" }}>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <TruncatedText text={title} variant="body1" fontWeight={500} />
      </Stack>
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
    </Paper>
  )
}
