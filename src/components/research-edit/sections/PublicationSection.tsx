import { memo, useCallback } from "react"

import type { SectionCurationStatus } from "@/schemas/editor-state"
import type { Publication, Research } from "@/schemas/research"

import { ItemListSection } from "./ItemListSection"
import { PublicationCard } from "./PublicationCard"
import { PublicationEditDialog } from "./PublicationEditDialog"

interface PublicationSectionProps {
  draft: Research
  onChange: (updated: Research) => void
  sectionStatus?: SectionCurationStatus | undefined
  onToggleStatus?: (() => void) | undefined
}

export const PublicationSection = memo(({ draft, onChange, sectionStatus, onToggleStatus }: PublicationSectionProps) => {
  const handleItemsChange = useCallback(
    (items: Publication[]) => onChange({ ...draft, relatedPublication: items }),
    [draft, onChange],
  )

  return (
    <ItemListSection
      title="関連論文"
      items={draft.relatedPublication}
      onItemsChange={handleItemsChange}
      sectionStatus={sectionStatus}
      onToggleStatus={onToggleStatus}
      itemLabel="Publication"
      confirmMessage={(p) => `Remove "${p.title.ja || p.title.en || "this publication"}"?`}
      renderCard={(item, actions) => (
        <PublicationCard publication={item} actions={actions} />
      )}
      renderEditDialog={({ open, item, onSave, onCancel }) => (
        <PublicationEditDialog open={open} publication={item} onSave={onSave} onCancel={onCancel} />
      )}
    />
  )
}, (prev, next) => prev.draft.relatedPublication === next.draft.relatedPublication && prev.sectionStatus === next.sectionStatus)
