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
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { memo } from "react"

import { SectionHeader } from "@/components/SectionHeader"
import { useStableKeys } from "@/hooks/use-stable-keys"
import type { SectionCurationStatus } from "@/schemas/editor-state"
import type { Grant, Research } from "@/schemas/research"
import { FORM_FIELD_MAX_WIDTH, SUBSECTION_GAP } from "@/theme"

import { BilingualTextField } from "../fields/BilingualTextField"
import { SectionCurationToggle } from "../SectionCurationToggle"

interface GrantSectionProps {
  draft: Research
  onChange: (updated: Research) => void
  sectionStatus?: SectionCurationStatus | undefined
  onToggleStatus?: (() => void) | undefined
}

const emptyGrant: Grant = {
  id: [],
  title: { ja: null, en: null },
  agency: { name: { ja: null, en: null } },
}

export const GrantSection = memo(({ draft, onChange, sectionStatus, onToggleStatus }: GrantSectionProps) => {
  const { grant } = draft
  const { keys, removeKey } = useStableKeys(grant.length)

  const updateItem = (index: number, updated: Grant) => {
    const next = [...grant]
    next[index] = updated
    onChange({ ...draft, grant: next })
  }

  return (
    <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
      <Box sx={{ mb: SUBSECTION_GAP }}>
        <SectionHeader
          title="科研費/助成金"
          size="small"
          action={sectionStatus !== undefined && onToggleStatus ? (
            <SectionCurationToggle status={sectionStatus} onToggle={onToggleStatus} />
          ) : undefined}
        />
      </Box>
      {grant.map((g, i) => (
        <Accordion key={keys[i]} defaultExpanded={grant.length <= 3} slotProps={{ transition: { unmountOnExit: true } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
              <Typography variant="body1">
                {g.title.ja || g.title.en || `Grant ${i + 1}`}
              </Typography>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation()
                  removeKey(i)
                  onChange({ ...draft, grant: grant.filter((_, idx) => idx !== i) })
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ maxWidth: FORM_FIELD_MAX_WIDTH }}>
              <TextField
                label="Grant IDs (comma-separated)"
                value={g.id.join(", ")}
                onChange={(e) =>
                  updateItem(i, {
                    ...g,
                    id: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                fullWidth
                sx={{ mb: SUBSECTION_GAP }}
              />
              <BilingualTextField
                label="Title"
                value={g.title}
                onChange={(title) => updateItem(i, { ...g, title })}
              />
              <BilingualTextField
                label="Agency Name"
                value={g.agency.name}
                onChange={(name) => updateItem(i, { ...g, agency: { name } })}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
      <Button
        startIcon={<AddIcon />}
        size="small"
        sx={{ mt: 1 }}
        onClick={() => onChange({ ...draft, grant: [...grant, emptyGrant] })}
      >
        Add Grant
      </Button>
    </Paper>
  )
}, (prev, next) => prev.draft.grant === next.draft.grant && prev.sectionStatus === next.sectionStatus)
