import equal from "fast-deep-equal"
import { memo, useCallback } from "react"

import { createDefaultPublication } from "@/schemas/defaults"
import type { SectionCurationStatus } from "@/schemas/editor-state"
import type { Publication, Research } from "@/schemas/research"

import { ItemListSection } from "./ItemListSection"
import { PublicationCard } from "./PublicationCard"
import { PublicationEditDialog } from "./PublicationEditDialog"

interface PublicationSectionProps {
  draft: Research
  onChange: (updated: Research) => void
  serverItems?: Publication[] | undefined
  sectionStatus?: SectionCurationStatus | undefined
  onToggleStatus?: (() => void) | undefined
  sectionModified?: boolean | undefined
}

export const PublicationSection = memo(({ draft, onChange, serverItems, sectionStatus, onToggleStatus, sectionModified }: PublicationSectionProps) => {
  const handleItemsChange = useCallback(
    (items: Publication[]) => onChange({ ...draft, relatedPublication: items }),
    [draft, onChange],
  )

  return (
    <ItemListSection
      title="関連論文"
      items={draft.relatedPublication}
      serverItems={serverItems}
      onItemsChange={handleItemsChange}
      createDefault={createDefaultPublication}
      sectionStatus={sectionStatus}
      onToggleStatus={onToggleStatus}
      sectionModified={sectionModified}
      itemLabel="Publication"
      confirmMessage={(p) => `Remove "${p.title.ja || p.title.en || "this publication"}"?`}
      renderCard={(item, actions, serverItem) => (
        <PublicationCard publication={item} actions={actions} serverPublication={serverItem} />
      )}
      renderEditDialog={({ open, item, serverItem, onChange: onItemChange, onClose }) => (
        <PublicationEditDialog open={open} publication={item} serverPublication={serverItem} onChange={onItemChange} onClose={onClose} />
      )}
    />
  )
}, (prev, next) =>
  prev.draft.relatedPublication === next.draft.relatedPublication
  && prev.sectionStatus === next.sectionStatus
  && prev.sectionModified === next.sectionModified
  && equal(prev.serverItems, next.serverItems),
)
