import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"

import { OrcidAutocomplete } from "@/components/common/OrcidAutocomplete"
import { useDialogDraft } from "@/hooks/use-dialog-draft"
import type { OrcidSearchResult } from "@/hooks/use-orcid-search"
import { createDefaultPerson } from "@/schemas/defaults"
import type { Person } from "@/schemas/research"
import { SUBSECTION_GAP } from "@/theme"

import { BilingualTextValueField } from "../fields/BilingualTextValueField"

interface DataProviderEditDialogProps {
  open: boolean
  person: Person | null
  onSave: (person: Person) => void
  onCancel: () => void
}

export const DataProviderEditDialog = ({
  open,
  person,
  onSave,
  onCancel,
}: DataProviderEditDialogProps) => {
  const [draft, setDraft] = useDialogDraft(
    open,
    () => person ? structuredClone(person) : createDefaultPerson(),
  )

  const isNew = person === null

  const handleOrcidSelect = (result: OrcidSearchResult) => {
    const enName = [result.givenNames, result.familyNames].filter(Boolean).join(" ")
    const instName = result.institutionNames[0] ?? ""

    setDraft((prev) => ({
      ...prev,
      name: {
        ...prev.name,
        en: { text: enName, rawHtml: prev.name.en?.rawHtml ?? "" },
      },
      orcid: result.orcidId,
      organization: {
        name: {
          ja: prev.organization?.name?.ja ?? null,
          en: { text: instName, rawHtml: prev.organization?.name?.en?.rawHtml ?? "" },
        },
        address: prev.organization?.address ?? null,
      },
    }))
  }

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>{isNew ? "Add Provider" : "Edit Provider"}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
          <OrcidAutocomplete onSelect={handleOrcidSelect} />
          <BilingualTextValueField
            label="Name"
            value={draft.name}
            onChange={(name) => setDraft((prev) => ({ ...prev, name }))}
          />
          <TextField
            label="Email"
            value={draft.email ?? ""}
            onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value || null }))}
            fullWidth
          />
          <TextField
            label="ORCID"
            value={draft.orcid ?? ""}
            onChange={(e) => setDraft((prev) => ({ ...prev, orcid: e.target.value || null }))}
            fullWidth
          />
          {draft.organization && (
            <BilingualTextValueField
              label="Organization"
              value={draft.organization.name}
              onChange={(name) => {
                const { organization } = draft
                if (!organization) return
                setDraft((prev) => ({ ...prev, organization: { ...organization, name } }))
              }}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(draft)} variant="contained">
          {isNew ? "Add" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
