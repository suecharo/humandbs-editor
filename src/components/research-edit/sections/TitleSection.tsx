import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import { memo } from "react"

import { SectionHeader } from "@/components/SectionHeader"
import type { SectionCurationStatus } from "@/schemas/editor-state"
import type { Research } from "@/schemas/research"
import { SUBSECTION_GAP } from "@/theme"

import { BilingualTextField } from "../fields/BilingualTextField"
import { SectionCurationToggle } from "../SectionCurationToggle"

interface TitleSectionProps {
  draft: Research
  onChange: (updated: Research) => void
  sectionStatus?: SectionCurationStatus | undefined
  onToggleStatus?: (() => void) | undefined
}

export const TitleSection = memo(({ draft, onChange, sectionStatus, onToggleStatus }: TitleSectionProps) => (
  <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
    <Box sx={{ mb: SUBSECTION_GAP }}>
      <SectionHeader
        title="タイトル"
        size="small"
        action={sectionStatus !== undefined && onToggleStatus ? (
          <SectionCurationToggle status={sectionStatus} onToggle={onToggleStatus} />
        ) : undefined}
      />
    </Box>
    <BilingualTextField
      label="タイトル"
      value={draft.title}
      onChange={(title) => onChange({ ...draft, title })}
    />
  </Paper>
), (prev, next) => prev.draft.title === next.draft.title && prev.sectionStatus === next.sectionStatus)
