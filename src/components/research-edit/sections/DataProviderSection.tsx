import { memo, useCallback } from "react"

import type { SectionCurationStatus } from "@/schemas/editor-state"
import type { Person, Research } from "@/schemas/research"

import { DataProviderCard } from "./DataProviderCard"
import { DataProviderEditDialog } from "./DataProviderEditDialog"
import { ItemListSection } from "./ItemListSection"

interface DataProviderSectionProps {
  draft: Research
  onChange: (updated: Research) => void
  sectionStatus?: SectionCurationStatus | undefined
  onToggleStatus?: (() => void) | undefined
}

export const DataProviderSection = memo(({ draft, onChange, sectionStatus, onToggleStatus }: DataProviderSectionProps) => {
  const handleItemsChange = useCallback(
    (items: Person[]) => onChange({ ...draft, dataProvider: items }),
    [draft, onChange],
  )

  return (
    <ItemListSection
      title="提供者情報"
      items={draft.dataProvider}
      onItemsChange={handleItemsChange}
      sectionStatus={sectionStatus}
      onToggleStatus={onToggleStatus}
      itemLabel="Provider"
      confirmMessage={(p) => `Remove "${p.name.ja?.text || p.name.en?.text || "this provider"}"?`}
      renderCard={(item, actions) => (
        <DataProviderCard person={item} actions={actions} />
      )}
      renderEditDialog={({ open, item, onSave, onCancel }) => (
        <DataProviderEditDialog open={open} person={item} onSave={onSave} onCancel={onCancel} />
      )}
    />
  )
}, (prev, next) => prev.draft.dataProvider === next.draft.dataProvider && prev.sectionStatus === next.sectionStatus)
