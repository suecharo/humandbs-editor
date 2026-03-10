import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import equal from "fast-deep-equal"
import { memo, useCallback } from "react"

import { ItemCardList } from "@/components/common/ItemCardList"
import type { CardActions, EditDialogRenderProps } from "@/components/common/ItemCardList"
import { SectionHeader } from "@/components/SectionHeader"
import { useStableKey } from "@/hooks/use-stable-key"
import { createDefaultPerson, createDefaultResearchProject } from "@/schemas/defaults"
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
  serverProviders?: Person[] | undefined
  serverProjects?: ResearchProject[] | undefined
  sectionStatus?: SectionCurationStatus | undefined
  onToggleStatus?: (() => void) | undefined
  sectionModified?: boolean | undefined
}

export const DataProviderSection = memo(({ draft, onChange, serverProviders, serverProjects, sectionStatus, onToggleStatus, sectionModified }: DataProviderSectionProps) => {
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
          modified={sectionModified}
          action={sectionStatus !== undefined && onToggleStatus ? (
            <SectionCurationToggle status={sectionStatus} onToggle={onToggleStatus} />
          ) : undefined}
        />
      </Box>

      <ItemCardList
        items={draft.dataProvider}
        serverItems={serverProviders}
        getKey={getProviderKey}
        onItemsChange={handleProvidersChange}
        createDefault={createDefaultPerson}
        itemLabel="Provider"
        confirmMessage={(p: Person) => `Remove "${p.name.ja?.text || p.name.en?.text || "this provider"}"?`}
        renderCard={(item: Person, actions: CardActions, serverItem: Person | undefined) => (
          <DataProviderCard person={item} actions={actions} serverPerson={serverItem} />
        )}
        renderEditDialog={({ open, item, serverItem, onChange: onItemChange, onClose }: EditDialogRenderProps<Person>) => (
          <DataProviderEditDialog open={open} person={item} serverPerson={serverItem} onChange={onItemChange} onClose={onClose} />
        )}
      />

      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
        研究プロジェクト
      </Typography>

      <ItemCardList
        items={draft.researchProject}
        serverItems={serverProjects}
        getKey={getProjectKey}
        onItemsChange={handleProjectsChange}
        createDefault={createDefaultResearchProject}
        itemLabel="Project"
        confirmMessage={(p: ResearchProject) => `Remove "${p.name.ja?.text || p.name.en?.text || "this project"}"?`}
        renderCard={(item: ResearchProject, actions: CardActions, serverItem: ResearchProject | undefined) => (
          <ResearchProjectCard project={item} actions={actions} serverProject={serverItem} />
        )}
        renderEditDialog={({ open, item, serverItem, onChange: onItemChange, onClose }: EditDialogRenderProps<ResearchProject>) => (
          <ResearchProjectEditDialog open={open} project={item} serverProject={serverItem} onChange={onItemChange} onClose={onClose} />
        )}
      />
    </Paper>
  )
}, (prev, next) =>
  prev.draft.dataProvider === next.draft.dataProvider
  && prev.draft.researchProject === next.draft.researchProject
  && prev.sectionStatus === next.sectionStatus
  && prev.sectionModified === next.sectionModified
  && equal(prev.serverProviders, next.serverProviders)
  && equal(prev.serverProjects, next.serverProjects),
)
