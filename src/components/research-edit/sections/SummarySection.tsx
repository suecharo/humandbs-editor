import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"

import { SectionHeader } from "@/components/SectionHeader"
import type { Research } from "@/schemas/research"
import { SUBSECTION_GAP } from "@/theme"

import { BilingualTextValueField } from "../fields/BilingualTextValueField"

interface SummarySectionProps {
  draft: Research
  onChange: (updated: Research) => void
}

export const SummarySection = ({ draft, onChange }: SummarySectionProps) => {
  const { summary } = draft

  return (
    <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
      <Box sx={{ mb: SUBSECTION_GAP }}>
        <SectionHeader title="Summary" size="small" />
      </Box>
      <BilingualTextValueField
        label="Aims"
        value={summary.aims}
        onChange={(aims) => onChange({ ...draft, summary: { ...summary, aims } })}
      />
      <BilingualTextValueField
        label="Methods"
        value={summary.methods}
        onChange={(methods) => onChange({ ...draft, summary: { ...summary, methods } })}
      />
      <BilingualTextValueField
        label="Targets"
        value={summary.targets}
        onChange={(targets) => onChange({ ...draft, summary: { ...summary, targets } })}
      />
    </Paper>
  )
}
