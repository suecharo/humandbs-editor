import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import { memo } from "react"

import { SectionHeader } from "@/components/SectionHeader"
import type { SectionCurationStatus } from "@/schemas/editor-state"
import type { Research } from "@/schemas/research"
import { SUBSECTION_GAP } from "@/theme"

import { BilingualTextValueField } from "../fields/BilingualTextValueField"
import { SectionCurationToggle } from "../SectionCurationToggle"

interface SummarySectionProps {
  draft: Research
  onChange: (updated: Research) => void
  sectionStatus?: SectionCurationStatus | undefined
  onToggleStatus?: (() => void) | undefined
  modifiedPaths?: ReadonlySet<string> | undefined
}

export const SummarySection = memo(({ draft, onChange, sectionStatus, onToggleStatus, modifiedPaths }: SummarySectionProps) => {
  const { summary } = draft
  const sectionModified = modifiedPaths !== undefined
    && ["aims", "methods", "targets"].some((f) =>
      modifiedPaths.has(`summary.${f}.ja`) || modifiedPaths.has(`summary.${f}.en`),
    )

  const langMod = (field: string) =>
    modifiedPaths
      ? { ja: modifiedPaths.has(`summary.${field}.ja`), en: modifiedPaths.has(`summary.${field}.en`) }
      : undefined

  return (
    <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
      <Box sx={{ mb: SUBSECTION_GAP }}>
        <SectionHeader
          title="研究内容の概要"
          size="small"
          modified={sectionModified}
          action={sectionStatus !== undefined && onToggleStatus ? (
            <SectionCurationToggle status={sectionStatus} onToggle={onToggleStatus} />
          ) : undefined}
        />
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
        <BilingualTextValueField
          label="目的"
          value={summary.aims}
          onChange={(aims) => onChange({ ...draft, summary: { ...summary, aims } })}
          modified={langMod("aims")}
        />
        <BilingualTextValueField
          label="方法"
          value={summary.methods}
          onChange={(methods) => onChange({ ...draft, summary: { ...summary, methods } })}
          modified={langMod("methods")}
        />
        <BilingualTextValueField
          label="対象"
          value={summary.targets}
          onChange={(targets) => onChange({ ...draft, summary: { ...summary, targets } })}
          modified={langMod("targets")}
        />
      </Box>
    </Paper>
  )
}, (prev, next) =>
  prev.draft.summary === next.draft.summary
  && prev.sectionStatus === next.sectionStatus
  && prev.modifiedPaths === next.modifiedPaths,
)
