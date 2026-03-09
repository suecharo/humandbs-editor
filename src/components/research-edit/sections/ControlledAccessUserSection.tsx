import { memo, useCallback } from "react"

import type { SectionCurationStatus } from "@/schemas/editor-state"
import type { Person, Research } from "@/schemas/research"

import { ControlledAccessUserCard } from "./ControlledAccessUserCard"
import { ControlledAccessUserEditDialog } from "./ControlledAccessUserEditDialog"
import { ItemListSection } from "./ItemListSection"

interface ControlledAccessUserSectionProps {
  draft: Research
  onChange: (updated: Research) => void
  sectionStatus?: SectionCurationStatus | undefined
  onToggleStatus?: (() => void) | undefined
}

export const ControlledAccessUserSection = memo(({ draft, onChange, sectionStatus, onToggleStatus }: ControlledAccessUserSectionProps) => {
  const handleItemsChange = useCallback(
    (items: Person[]) => onChange({ ...draft, controlledAccessUser: items }),
    [draft, onChange],
  )

  return (
    <ItemListSection
      title="制限公開データの利用者一覧"
      items={draft.controlledAccessUser}
      onItemsChange={handleItemsChange}
      sectionStatus={sectionStatus}
      onToggleStatus={onToggleStatus}
      itemLabel="User"
      confirmMessage={(u) => `Remove "${u.name.ja?.text || u.name.en?.text || "this user"}"?`}
      renderCard={(item, actions) => (
        <ControlledAccessUserCard user={item} actions={actions} />
      )}
      renderEditDialog={({ open, item, onSave, onCancel }) => (
        <ControlledAccessUserEditDialog open={open} user={item} onSave={onSave} onCancel={onCancel} />
      )}
    />
  )
}, (prev, next) => prev.draft.controlledAccessUser === next.draft.controlledAccessUser && prev.sectionStatus === next.sectionStatus)
