import { memo, useCallback } from "react"

import type { SectionCurationStatus } from "@/schemas/editor-state"
import type { Grant, Research } from "@/schemas/research"

import { GrantCard } from "./GrantCard"
import { GrantEditDialog } from "./GrantEditDialog"
import { ItemListSection } from "./ItemListSection"

interface GrantSectionProps {
  draft: Research
  onChange: (updated: Research) => void
  sectionStatus?: SectionCurationStatus | undefined
  onToggleStatus?: (() => void) | undefined
}

export const GrantSection = memo(({ draft, onChange, sectionStatus, onToggleStatus }: GrantSectionProps) => {
  const handleItemsChange = useCallback(
    (items: Grant[]) => onChange({ ...draft, grant: items }),
    [draft, onChange],
  )

  return (
    <ItemListSection
      title="科研費/助成金"
      items={draft.grant}
      onItemsChange={handleItemsChange}
      sectionStatus={sectionStatus}
      onToggleStatus={onToggleStatus}
      itemLabel="Grant"
      confirmMessage={(g) => `Remove "${g.title.ja || g.title.en || "this grant"}"?`}
      renderCard={(item, actions) => (
        <GrantCard grant={item} actions={actions} />
      )}
      renderEditDialog={({ open, item, onSave, onCancel }) => (
        <GrantEditDialog open={open} grant={item} onSave={onSave} onCancel={onCancel} />
      )}
    />
  )
}, (prev, next) => prev.draft.grant === next.draft.grant && prev.sectionStatus === next.sectionStatus)
