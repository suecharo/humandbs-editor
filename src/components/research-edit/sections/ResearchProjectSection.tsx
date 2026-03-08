import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Accordion from "@mui/material/Accordion"
import AccordionDetails from "@mui/material/AccordionDetails"
import AccordionSummary from "@mui/material/AccordionSummary"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import { memo } from "react"

import { SectionHeader } from "@/components/SectionHeader"
import { useStableKeys } from "@/hooks/use-stable-keys"
import type { Research, ResearchProject } from "@/schemas/research"
import { SUBSECTION_GAP } from "@/theme"

import { BilingualTextValueField } from "../fields/BilingualTextValueField"

interface ResearchProjectSectionProps {
  draft: Research
  onChange: (updated: Research) => void
}

const emptyProject: ResearchProject = {
  name: { ja: { text: "", rawHtml: "" }, en: { text: "", rawHtml: "" } },
  url: null,
}

export const ResearchProjectSection = memo(({ draft, onChange }: ResearchProjectSectionProps) => {
  const { researchProject } = draft
  const { keys, removeKey } = useStableKeys(researchProject.length)

  const updateItem = (index: number, updated: ResearchProject) => {
    const next = [...researchProject]
    next[index] = updated
    onChange({ ...draft, researchProject: next })
  }

  return (
    <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
      <Box sx={{ mb: SUBSECTION_GAP }}>
        <SectionHeader title="研究プロジェクト" size="small" />
      </Box>
      {researchProject.map((project, i) => (
        <Accordion key={keys[i]} defaultExpanded={researchProject.length <= 3} slotProps={{ transition: { unmountOnExit: true } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
              <Typography variant="body1">
                {project.name.ja?.text || project.name.en?.text || `Project ${i + 1}`}
              </Typography>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation()
                  removeKey(i)
                  onChange({ ...draft, researchProject: researchProject.filter((_, idx) => idx !== i) })
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <BilingualTextValueField
              label="Name"
              value={project.name}
              onChange={(name) => updateItem(i, { ...project, name })}
            />
          </AccordionDetails>
        </Accordion>
      ))}
      <Button
        startIcon={<AddIcon />}
        size="small"
        sx={{ mt: 1 }}
        onClick={() => onChange({ ...draft, researchProject: [...researchProject, emptyProject] })}
      >
        Add Project
      </Button>
    </Paper>
  )
}, (prev, next) => prev.draft.researchProject === next.draft.researchProject)
