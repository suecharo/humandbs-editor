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
import type { Person, Research } from "@/schemas/research"
import { FORM_FIELD_MAX_WIDTH, FORM_LABEL_SX, SUBSECTION_GAP } from "@/theme"

import { BilingualTextField } from "../fields/BilingualTextField"
import { BilingualTextValueField } from "../fields/BilingualTextValueField"

interface ControlledAccessUserSectionProps {
  draft: Research
  onChange: (updated: Research) => void
}

const emptyUser: Person = {
  name: { ja: { text: "", rawHtml: "" }, en: { text: "", rawHtml: "" } },
  email: null,
  orcid: null,
  organization: {
    name: { ja: { text: "", rawHtml: "" }, en: { text: "", rawHtml: "" } },
    address: null,
  },
  researchTitle: { ja: null, en: null },
  periodOfDataUse: null,
}

export const ControlledAccessUserSection = ({ draft, onChange }: ControlledAccessUserSectionProps) => {
  const { controlledAccessUser } = draft
  const { keys, removeKey } = useStableKeys(controlledAccessUser.length)

  const updateItem = (index: number, updated: Person) => {
    const next = [...controlledAccessUser]
    next[index] = updated
    onChange({ ...draft, controlledAccessUser: next })
  }

  return (
    <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
      <Box sx={{ mb: SUBSECTION_GAP }}>
        <SectionHeader title="Controlled Access User" size="small" />
      </Box>
      {controlledAccessUser.map((user, i) => (
        <Accordion key={keys[i]} defaultExpanded={controlledAccessUser.length <= 3}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
              <Typography variant="body1">
                {user.name.ja?.text || user.name.en?.text || `User ${i + 1}`}
              </Typography>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation()
                  removeKey(i)
                  onChange({ ...draft, controlledAccessUser: controlledAccessUser.filter((_, idx) => idx !== i) })
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ maxWidth: FORM_FIELD_MAX_WIDTH }}>
              <BilingualTextValueField
                label="Name"
                value={user.name}
                onChange={(name) => updateItem(i, { ...user, name })}
              />
              {user.organization && (
                <BilingualTextValueField
                  label="Organization"
                  value={user.organization.name}
                  onChange={(name) => {
                    const { organization } = user
                    if (!organization) return
                    updateItem(i, { ...user, organization: { ...organization, name } })
                  }}
                />
              )}
              {user.researchTitle && (
                <BilingualTextField
                  label="Research Title"
                  value={user.researchTitle}
                  onChange={(researchTitle) => updateItem(i, { ...user, researchTitle })}
                />
              )}
              {user.periodOfDataUse && (
                <Box sx={{ display: "flex", gap: 1, mb: SUBSECTION_GAP }}>
                  <TextField
                    label="Period Start"
                    value={user.periodOfDataUse.startDate ?? ""}
                    onChange={(e) => {
                      const { periodOfDataUse } = user
                      if (!periodOfDataUse) return
                      updateItem(i, {
                        ...user,
                        periodOfDataUse: { ...periodOfDataUse, startDate: e.target.value || null },
                      })
                    }}
                  />
                  <TextField
                    label="Period End"
                    value={user.periodOfDataUse.endDate ?? ""}
                    onChange={(e) => {
                      const { periodOfDataUse } = user
                      if (!periodOfDataUse) return
                      updateItem(i, {
                        ...user,
                        periodOfDataUse: { ...periodOfDataUse, endDate: e.target.value || null },
                      })
                    }}
                  />
                </Box>
              )}
              {user.datasetIds && user.datasetIds.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ ...FORM_LABEL_SX, mb: 0.5 }}>
                    Dataset IDs (read-only)
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {user.datasetIds.map((id) => (
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
        onClick={() => onChange({ ...draft, controlledAccessUser: [...controlledAccessUser, emptyUser] })}
      >
        Add User
      </Button>
    </Paper>
  )
}
