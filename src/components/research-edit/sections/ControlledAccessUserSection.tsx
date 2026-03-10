import equal from "fast-deep-equal"
import { memo, useCallback } from "react"

import { createDefaultControlledAccessUser } from "@/schemas/defaults"
import type { SectionCurationStatus } from "@/schemas/editor-state"
import type { Person, Research } from "@/schemas/research"

import { ControlledAccessUserCard } from "./ControlledAccessUserCard"
import { ControlledAccessUserEditDialog } from "./ControlledAccessUserEditDialog"
import { ItemListSection } from "./ItemListSection"

interface ControlledAccessUserSectionProps {
  draft: Research
  onChange: (updated: Research) => void
  serverItems?: Person[] | undefined
  sectionStatus?: SectionCurationStatus | undefined
  onToggleStatus?: (() => void) | undefined
  sectionModified?: boolean | undefined
}

export const ControlledAccessUserSection = memo(({ draft, onChange, serverItems, sectionStatus, onToggleStatus, sectionModified }: ControlledAccessUserSectionProps) => {
  const handleItemsChange = useCallback(
    (items: Person[]) => onChange({ ...draft, controlledAccessUser: items }),
    [draft, onChange],
  )

  return (
    <ItemListSection
      title="制限公開データの利用者一覧"
      items={draft.controlledAccessUser}
      serverItems={serverItems}
      onItemsChange={handleItemsChange}
      createDefault={createDefaultControlledAccessUser}
      sectionStatus={sectionStatus}
      onToggleStatus={onToggleStatus}
      sectionModified={sectionModified}
      itemLabel="User"
      confirmMessage={(u) => `Remove "${u.name.ja?.text || u.name.en?.text || "this user"}"?`}
      renderCard={(item, actions, serverItem) => (
        <ControlledAccessUserCard user={item} actions={actions} serverUser={serverItem} />
      )}
      renderEditDialog={({ open, item, serverItem, onChange: onItemChange, onClose }) => (
        <ControlledAccessUserEditDialog open={open} user={item} serverUser={serverItem} onChange={onItemChange} onClose={onClose} />
      )}
    />
  )
}, (prev, next) =>
  prev.draft.controlledAccessUser === next.draft.controlledAccessUser
  && prev.sectionStatus === next.sectionStatus
  && prev.sectionModified === next.sectionModified
  && equal(prev.serverItems, next.serverItems),
)
