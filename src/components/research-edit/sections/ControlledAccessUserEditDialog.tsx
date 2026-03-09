import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import { OrcidAutocomplete } from "@/components/common/OrcidAutocomplete"
import { useDialogDraft } from "@/hooks/use-dialog-draft"
import type { OrcidSearchResult } from "@/hooks/use-orcid-search"
import { createDefaultControlledAccessUser } from "@/schemas/defaults"
import type { Person } from "@/schemas/research"
import { FORM_LABEL_SX, SUBSECTION_GAP } from "@/theme"

import { BilingualTextField } from "../fields/BilingualTextField"
import { BilingualTextValueField } from "../fields/BilingualTextValueField"

interface ControlledAccessUserEditDialogProps {
  open: boolean
  user: Person | null
  onSave: (user: Person) => void
  onCancel: () => void
}

export const ControlledAccessUserEditDialog = ({
  open,
  user,
  onSave,
  onCancel,
}: ControlledAccessUserEditDialogProps) => {
  const [draft, setDraft] = useDialogDraft(
    open,
    () => user ? structuredClone(user) : createDefaultControlledAccessUser(),
  )

  const isNew = user === null

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
      <DialogTitle>{isNew ? "Add User" : "Edit User"}</DialogTitle>
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
          {draft.researchTitle && (
            <BilingualTextField
              label="Research Title"
              value={draft.researchTitle}
              onChange={(researchTitle) => setDraft((prev) => ({ ...prev, researchTitle }))}
            />
          )}
          {draft.periodOfDataUse && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="Period Start"
                value={draft.periodOfDataUse.startDate ?? ""}
                onChange={(e) => {
                  const { periodOfDataUse } = draft
                  if (!periodOfDataUse) return
                  setDraft((prev) => ({
                    ...prev,
                    periodOfDataUse: { ...periodOfDataUse, startDate: e.target.value || null },
                  }))
                }}
              />
              <TextField
                label="Period End"
                value={draft.periodOfDataUse.endDate ?? ""}
                onChange={(e) => {
                  const { periodOfDataUse } = draft
                  if (!periodOfDataUse) return
                  setDraft((prev) => ({
                    ...prev,
                    periodOfDataUse: { ...periodOfDataUse, endDate: e.target.value || null },
                  }))
                }}
              />
            </Box>
          )}
          {draft.datasetIds && draft.datasetIds.length > 0 && (
            <Box>
              <Typography variant="body2" sx={{ ...FORM_LABEL_SX, mb: 0.5 }}>
                Dataset IDs (read-only)
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {draft.datasetIds.map((id) => (
                  <Chip key={id} label={id} size="small" />
                ))}
              </Box>
            </Box>
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
