import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Accordion from "@mui/material/Accordion"
import AccordionDetails from "@mui/material/AccordionDetails"
import AccordionSummary from "@mui/material/AccordionSummary"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import IconButton from "@mui/material/IconButton"
import Paper from "@mui/material/Paper"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import { SectionHeader } from "@/components/SectionHeader"
import { useStableKeys } from "@/hooks/use-stable-keys"
import type { Publication, Research } from "@/schemas/research"
import { FORM_FIELD_MAX_WIDTH, FORM_LABEL_SX, SUBSECTION_GAP } from "@/theme"

import { BilingualTextField } from "../fields/BilingualTextField"

interface PublicationSectionProps {
  draft: Research
  onChange: (updated: Research) => void
}

const emptyPublication: Publication = {
  title: { ja: null, en: null },
  doi: null,
}

export const PublicationSection = ({ draft, onChange }: PublicationSectionProps) => {
  const { relatedPublication } = draft
  const { keys, removeKey } = useStableKeys(relatedPublication.length)

  const updateItem = (index: number, updated: Publication) => {
    const next = [...relatedPublication]
    next[index] = updated
    onChange({ ...draft, relatedPublication: next })
  }

  return (
    <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
      <Box sx={{ mb: SUBSECTION_GAP }}>
        <SectionHeader title="Related Publication" size="small" />
      </Box>
      {relatedPublication.map((pub, i) => (
        <Accordion key={keys[i]} defaultExpanded={relatedPublication.length <= 3}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
              <Typography variant="body1">
                {pub.title.ja || pub.title.en || `Publication ${i + 1}`}
              </Typography>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation()
                  removeKey(i)
                  onChange({ ...draft, relatedPublication: relatedPublication.filter((_, idx) => idx !== i) })
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ maxWidth: FORM_FIELD_MAX_WIDTH }}>
              <BilingualTextField
                label="Title"
                value={pub.title}
                onChange={(title) => updateItem(i, { ...pub, title })}
              />
              <TextField
                label="DOI"
                value={pub.doi ?? ""}
                onChange={(e) => updateItem(i, { ...pub, doi: e.target.value || null })}
                fullWidth
                sx={{ mb: SUBSECTION_GAP }}
              />
              {pub.datasetIds && pub.datasetIds.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ ...FORM_LABEL_SX, mb: 0.5 }}>
                    Dataset IDs (read-only)
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {pub.datasetIds.map((id) => (
                      <Chip key={id} label={id} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
      <Button
        startIcon={<AddIcon />}
        size="small"
        sx={{ mt: 1 }}
        onClick={() => onChange({ ...draft, relatedPublication: [...relatedPublication, emptyPublication] })}
      >
        Add Publication
      </Button>
    </Paper>
  )
}
