import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"

import type { Research } from "@/schemas/research"
import { SUBSECTION_GAP } from "@/theme"

import { ReadOnlyField } from "../fields/ReadOnlyField"

interface BasicInfoSectionProps {
  research: Research
}

export const BasicInfoSection = ({ research }: BasicInfoSectionProps) => (
  <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
    <Typography variant="h2" sx={{ mb: SUBSECTION_GAP }}>Basic Info</Typography>
    <ReadOnlyField label="HUM ID" value={research.humId} />
    <ReadOnlyField label="URL (JA)" value={research.url.ja} />
    <ReadOnlyField label="URL (EN)" value={research.url.en} />
    <ReadOnlyField label="Date Published" value={research.datePublished} />
    <ReadOnlyField label="Date Modified" value={research.dateModified} />
  </Paper>
)
