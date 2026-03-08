import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"

import { SectionHeader } from "@/components/SectionHeader"
import type { Research } from "@/schemas/research"
import { SUBSECTION_GAP } from "@/theme"

import { BilingualTextField } from "../fields/BilingualTextField"

interface TitleSectionProps {
  draft: Research
  onChange: (updated: Research) => void
}

export const TitleSection = ({ draft, onChange }: TitleSectionProps) => (
  <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
    <Box sx={{ mb: SUBSECTION_GAP }}>
      <SectionHeader title="タイトル" size="small" />
    </Box>
    <BilingualTextField
      label="タイトル"
      value={draft.title}
      onChange={(title) => onChange({ ...draft, title })}
    />
  </Paper>
)
