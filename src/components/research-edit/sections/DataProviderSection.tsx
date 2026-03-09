import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import { memo, useCallback } from "react"

import { ItemCardList } from "@/components/common/ItemCardList"
import type { CardActions, EditDialogRenderProps } from "@/components/common/ItemCardList"
import { SectionHeader } from "@/components/SectionHeader"
import { useStableKey } from "@/hooks/use-stable-key"
import type { SectionCurationStatus } from "@/schemas/editor-state"
import type { Person, Research, ResearchProject } from "@/schemas/research"
import { SUBSECTION_GAP } from "@/theme"

import { SectionCurationToggle } from "../SectionCurationToggle"

import { DataProviderCard } from "./DataProviderCard"
import { DataProviderEditDialog } from "./DataProviderEditDialog"
import { ResearchProjectCard } from "./ResearchProjectCard"
import { ResearchProjectEditDialog } from "./ResearchProjectEditDialog"

interface DataProviderSectionProps {
  draft: Research
  onChange: (updated: Research) => void
  sectionStatus?: SectionCurationStatus | undefined
  onToggleStatus?: (() => void) | undefined
}

export const DataProviderSection = memo(({ draft, onChange, sectionStatus, onToggleStatus }: DataProviderSectionProps) => {
  const getProviderKey = useStableKey<Person>()
  const getProjectKey = useStableKey<ResearchProject>()

  const handleProvidersChange = useCallback(
    (items: Person[]) => onChange({ ...draft, dataProvider: items }),
    [draft, onChange],
  )

  const handleProjectsChange = useCallback(
    (items: ResearchProject[]) => onChange({ ...draft, researchProject: items }),
    [draft, onChange],
  )

  return (
    <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
      <Box sx={{ mb: SUBSECTION_GAP }}>
        <SectionHeader
          title="提供者情報"
          size="small"
          action={sectionStatus !== undefined && onToggleStatus ? (
            <SectionCurationToggle status={sectionStatus} onToggle={onToggleStatus} />
          ) : undefined}
        />
      </Box>

      <ItemCardList
        items={draft.dataProvider}
        getKey={getProviderKey}
        onItemsChange={handleProvidersChange}
        itemLabel="Provider"
        confirmMessage={(p: Person) => `Remove "${p.name.ja?.text || p.name.en?.text || "this provider"}"?`}
        renderCard={(item: Person, actions: CardActions) => (
          <DataProviderCard person={item} actions={actions} />
        )}
        renderEditDialog={({ open, item, onSave, onCancel }: EditDialogRenderProps<Person>) => (
          <DataProviderEditDialog open={open} person={item} onSave={onSave} onCancel={onCancel} />
        )}
      />

      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
        研究プロジェクト
      </Typography>

      <ItemCardList
        items={draft.researchProject}
        getKey={getProjectKey}
        onItemsChange={handleProjectsChange}
        itemLabel="Project"
        confirmMessage={(p: ResearchProject) => `Remove "${p.name.ja?.text || p.name.en?.text || "this project"}"?`}
        renderCard={(item: ResearchProject, actions: CardActions) => (
          <ResearchProjectCard project={item} actions={actions} />
        )}
        renderEditDialog={({ open, item, onSave, onCancel }: EditDialogRenderProps<ResearchProject>) => (
          <ResearchProjectEditDialog open={open} project={item} onSave={onSave} onCancel={onCancel} />
        )}
      />
    </Paper>
  )
}, (prev, next) =>
  prev.draft.dataProvider === next.draft.dataProvider
  && prev.draft.researchProject === next.draft.researchProject
  && prev.sectionStatus === next.sectionStatus,
)
