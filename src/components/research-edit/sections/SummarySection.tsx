import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import { memo } from "react"

import { SectionHeader } from "@/components/SectionHeader"
import type { Research } from "@/schemas/research"
import { SUBSECTION_GAP } from "@/theme"

import { BilingualTextValueField } from "../fields/BilingualTextValueField"

interface SummarySectionProps {
  draft: Research
  onChange: (updated: Research) => void
}

export const SummarySection = memo(({ draft, onChange }: SummarySectionProps) => {
  const { summary } = draft

  return (
    <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
      <Box sx={{ mb: SUBSECTION_GAP }}>
        <SectionHeader title="研究内容の概要" size="small" />
      </Box>
      <BilingualTextValueField
        label="目的"
        value={summary.aims}
        onChange={(aims) => onChange({ ...draft, summary: { ...summary, aims } })}
      />
      <BilingualTextValueField
        label="方法"
        value={summary.methods}
        onChange={(methods) => onChange({ ...draft, summary: { ...summary, methods } })}
      />
      <BilingualTextValueField
        label="対象"
        value={summary.targets}
        onChange={(targets) => onChange({ ...draft, summary: { ...summary, targets } })}
      />
    </Paper>
  )
}, (prev, next) => prev.draft.summary === next.draft.summary)
