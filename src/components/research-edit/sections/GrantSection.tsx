import equal from "fast-deep-equal"
import { memo, useCallback } from "react"

import { createDefaultGrant } from "@/schemas/defaults"
import type { SectionCurationStatus } from "@/schemas/editor-state"
import type { Grant, Research } from "@/schemas/research"

import { GrantCard } from "./GrantCard"
import { GrantEditDialog } from "./GrantEditDialog"
import { ItemListSection } from "./ItemListSection"

interface GrantSectionProps {
  draft: Research
  onChange: (updated: Research) => void
  serverItems?: Grant[] | undefined
  sectionStatus?: SectionCurationStatus | undefined
  onToggleStatus?: (() => void) | undefined
  sectionModified?: boolean | undefined
}

export const GrantSection = memo(({ draft, onChange, serverItems, sectionStatus, onToggleStatus, sectionModified }: GrantSectionProps) => {
  const handleItemsChange = useCallback(
    (items: Grant[]) => onChange({ ...draft, grant: items }),
    [draft, onChange],
  )

  return (
    <ItemListSection
      title="科研費/助成金"
      items={draft.grant}
      serverItems={serverItems}
      onItemsChange={handleItemsChange}
      createDefault={createDefaultGrant}
      sectionStatus={sectionStatus}
      onToggleStatus={onToggleStatus}
      sectionModified={sectionModified}
      itemLabel="Grant"
      confirmMessage={(g) => `Remove "${g.title.ja || g.title.en || "this grant"}"?`}
      renderCard={(item, actions, serverItem) => (
        <GrantCard grant={item} actions={actions} serverGrant={serverItem} />
      )}
      renderEditDialog={({ open, item, serverItem, onChange: onItemChange, onClose }) => (
        <GrantEditDialog open={open} grant={item} serverGrant={serverItem} onChange={onItemChange} onClose={onClose} />
      )}
    />
  )
}, (prev, next) =>
  prev.draft.grant === next.draft.grant
  && prev.sectionStatus === next.sectionStatus
  && prev.sectionModified === next.sectionModified
  && equal(prev.serverItems, next.serverItems),
)
