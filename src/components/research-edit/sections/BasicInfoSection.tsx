import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"

import { SectionHeader } from "@/components/SectionHeader"
import type { Research } from "@/schemas/research"
import { SUBSECTION_GAP } from "@/theme"

import { ReadOnlyField } from "../fields/ReadOnlyField"

interface BasicInfoSectionProps {
  research: Research
}

export const BasicInfoSection = ({ research }: BasicInfoSectionProps) => (
  <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
    <Box sx={{ mb: SUBSECTION_GAP }}>
      <SectionHeader title="Basic Info" size="small" />
    </Box>
    <ReadOnlyField label="HUM ID" value={research.humId} />
    <ReadOnlyField label="URL (JA)" value={research.url.ja} />
    <ReadOnlyField label="URL (EN)" value={research.url.en} />
    <ReadOnlyField label="Date Published" value={research.datePublished} />
    <ReadOnlyField label="Date Modified" value={research.dateModified} />
  </Paper>
)
