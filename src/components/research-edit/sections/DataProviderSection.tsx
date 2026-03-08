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
import type { Person, Research } from "@/schemas/research"
import { FORM_FIELD_MAX_WIDTH, SUBSECTION_GAP } from "@/theme"

import { BilingualTextValueField } from "../fields/BilingualTextValueField"

interface DataProviderSectionProps {
  draft: Research
  onChange: (updated: Research) => void
}

const emptyPerson: Person = {
  name: { ja: { text: "", rawHtml: "" }, en: { text: "", rawHtml: "" } },
  email: null,
  orcid: null,
  organization: {
    name: { ja: { text: "", rawHtml: "" }, en: { text: "", rawHtml: "" } },
    address: null,
  },
}

const PersonFields = ({
  person,
  onChangePerson,
}: {
  person: Person
  onChangePerson: (updated: Person) => void
}) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, maxWidth: FORM_FIELD_MAX_WIDTH }}>
    <BilingualTextValueField
      label="Name"
      value={person.name}
      onChange={(name) => onChangePerson({ ...person, name })}
    />
    <TextField
      label="Email"
      value={person.email ?? ""}
      onChange={(e) => onChangePerson({ ...person, email: e.target.value || null })}
      fullWidth
    />
    <TextField
      label="ORCID"
      value={person.orcid ?? ""}
      onChange={(e) => onChangePerson({ ...person, orcid: e.target.value || null })}
      fullWidth
    />
    {person.organization && (
      <BilingualTextValueField
        label="Organization"
        value={person.organization.name}
        onChange={(name) => {
          const { organization } = person
          if (!organization) return
          onChangePerson({ ...person, organization: { ...organization, name } })
        }}
      />
    )}
  </Box>
)

export const DataProviderSection = memo(({ draft, onChange }: DataProviderSectionProps) => {
  const { dataProvider } = draft
  const { keys, removeKey } = useStableKeys(dataProvider.length)

  const updateItem = (index: number, updated: Person) => {
    const next = [...dataProvider]
    next[index] = updated
    onChange({ ...draft, dataProvider: next })
  }

  return (
    <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
      <Box sx={{ mb: SUBSECTION_GAP }}>
        <SectionHeader title="提供者情報" size="small" />
      </Box>
      {dataProvider.map((person, i) => (
        <Accordion key={keys[i]} defaultExpanded={dataProvider.length <= 3} slotProps={{ transition: { unmountOnExit: true } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
              <Typography variant="body1">
                {person.name.ja?.text || person.name.en?.text || `Provider ${i + 1}`}
              </Typography>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation()
                  removeKey(i)
                  onChange({ ...draft, dataProvider: dataProvider.filter((_, idx) => idx !== i) })
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <PersonFields person={person} onChangePerson={(updated) => updateItem(i, updated)} />
          </AccordionDetails>
        </Accordion>
      ))}
      <Button
        startIcon={<AddIcon />}
        size="small"
        sx={{ mt: 1 }}
        onClick={() => onChange({ ...draft, dataProvider: [...dataProvider, emptyPerson] })}
      >
        Add Provider
      </Button>
    </Paper>
  )
}, (prev, next) => prev.draft.dataProvider === next.draft.dataProvider)
