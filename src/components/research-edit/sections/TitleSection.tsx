import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"

import type { Research } from "@/schemas/research"
import { SUBSECTION_GAP } from "@/theme"

import { BilingualTextField } from "../fields/BilingualTextField"

interface TitleSectionProps {
  draft: Research
  onChange: (updated: Research) => void
}

export const TitleSection = ({ draft, onChange }: TitleSectionProps) => (
  <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
    <Typography variant="h2" sx={{ mb: SUBSECTION_GAP }}>Title</Typography>
    <BilingualTextField
      label="Title"
      value={draft.title}
      onChange={(title) => onChange({ ...draft, title })}
    />
  </Paper>
)
