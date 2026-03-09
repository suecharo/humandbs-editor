import { memo, useCallback } from "react"

import type { SectionCurationStatus } from "@/schemas/editor-state"
import type { Research, ResearchProject } from "@/schemas/research"

import { ItemListSection } from "./ItemListSection"
import { ResearchProjectCard } from "./ResearchProjectCard"
import { ResearchProjectEditDialog } from "./ResearchProjectEditDialog"

interface ResearchProjectSectionProps {
  draft: Research
  onChange: (updated: Research) => void
  sectionStatus?: SectionCurationStatus | undefined
  onToggleStatus?: (() => void) | undefined
}

export const ResearchProjectSection = memo(({ draft, onChange, sectionStatus, onToggleStatus }: ResearchProjectSectionProps) => {
  const handleItemsChange = useCallback(
    (items: ResearchProject[]) => onChange({ ...draft, researchProject: items }),
    [draft, onChange],
  )

  return (
    <ItemListSection
      title="研究プロジェクト"
      items={draft.researchProject}
      onItemsChange={handleItemsChange}
      sectionStatus={sectionStatus}
      onToggleStatus={onToggleStatus}
      itemLabel="Project"
      confirmMessage={(p) => `Remove "${p.name.ja?.text || p.name.en?.text || "this project"}"?`}
      renderCard={(item, actions) => (
        <ResearchProjectCard project={item} actions={actions} />
      )}
      renderEditDialog={({ open, item, onSave, onCancel }) => (
        <ResearchProjectEditDialog open={open} project={item} onSave={onSave} onCancel={onCancel} />
      )}
    />
  )
}, (prev, next) => prev.draft.researchProject === next.draft.researchProject && prev.sectionStatus === next.sectionStatus)
