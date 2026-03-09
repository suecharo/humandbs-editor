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
  onItemsChange: (items: T[]) => void
  sectionStatus?: SectionCurationStatus | undefined
  onToggleStatus?: (() => void) | undefined
  itemLabel: string
  confirmMessage: (item: T) => string
  renderCard: (item: T, actions: CardActions) => ReactNode
  renderEditDialog: (props: EditDialogRenderProps<T>) => ReactNode
}

// eslint-disable-next-line @stylistic/comma-dangle -- trailing comma required to disambiguate TSX generic from JSX
export const ItemListSection = <T extends object,>({
  title,
  items,
  onItemsChange,
  sectionStatus,
  onToggleStatus,
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
          action={sectionStatus !== undefined && onToggleStatus ? (
            <SectionCurationToggle status={sectionStatus} onToggle={onToggleStatus} />
          ) : undefined}
        />
      </Box>
      <ItemCardList
        items={items}
        getKey={getKey}
        onItemsChange={onItemsChange}
        itemLabel={itemLabel}
        confirmMessage={confirmMessage}
        renderCard={renderCard}
        renderEditDialog={renderEditDialog}
      />
    </Paper>
  )
}
