import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import type { ReactNode } from "react"

import { ItemCardList } from "@/components/common/ItemCardList"
import type { CardActions, EditDialogRenderProps } from "@/components/common/ItemCardList"
import { SectionHeader } from "@/components/SectionHeader"
import { useStableKey } from "@/hooks/use-stable-key"
import type { SectionCurationStatus } from "@/schemas/editor-state"
import { SUBSECTION_GAP } from "@/theme"

import { SectionCurationToggle } from "../SectionCurationToggle"

export interface ItemListSectionProps<T extends object> {
  title: string
  items: T[]
  serverItems?: T[] | undefined
  onItemsChange: (items: T[]) => void
  createDefault: () => T
  sectionStatus?: SectionCurationStatus | undefined
  onToggleStatus?: (() => void) | undefined
  sectionModified?: boolean | undefined
  itemLabel: string
  confirmMessage: (item: T) => string
  renderCard: (item: T, actions: CardActions, serverItem: T | undefined) => ReactNode
  renderEditDialog: (props: EditDialogRenderProps<T>) => ReactNode
}

// eslint-disable-next-line @stylistic/comma-dangle -- trailing comma required to disambiguate TSX generic from JSX
export const ItemListSection = <T extends object,>({
  title,
  items,
  serverItems,
  onItemsChange,
  createDefault,
  sectionStatus,
  onToggleStatus,
  sectionModified,
  itemLabel,
  confirmMessage,
  renderCard,
  renderEditDialog,
}: ItemListSectionProps<T>) => {
  const getKey = useStableKey<T>()

  return (
    <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
      <Box sx={{ mb: SUBSECTION_GAP }}>
        <SectionHeader
          title={title}
          size="small"
          modified={sectionModified}
          action={sectionStatus !== undefined && onToggleStatus ? (
            <SectionCurationToggle status={sectionStatus} onToggle={onToggleStatus} />
          ) : undefined}
        />
      </Box>
      <ItemCardList
        items={items}
        serverItems={serverItems}
        getKey={getKey}
        onItemsChange={onItemsChange}
        createDefault={createDefault}
        itemLabel={itemLabel}
        confirmMessage={confirmMessage}
        renderCard={renderCard}
        renderEditDialog={renderEditDialog}
      />
    </Paper>
  )
}
