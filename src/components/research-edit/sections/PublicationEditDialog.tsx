import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import { useDialogDraft } from "@/hooks/use-dialog-draft"
import { createDefaultPublication } from "@/schemas/defaults"
import type { Publication } from "@/schemas/research"
import { FORM_LABEL_SX, SUBSECTION_GAP } from "@/theme"

import { BilingualTextField } from "../fields/BilingualTextField"

interface PublicationEditDialogProps {
  open: boolean
  publication: Publication | null
  onSave: (publication: Publication) => void
  onCancel: () => void
}

export const PublicationEditDialog = ({
  open,
  publication,
  onSave,
  onCancel,
}: PublicationEditDialogProps) => {
  const [draft, setDraft] = useDialogDraft(
    open,
    () => publication ? structuredClone(publication) : createDefaultPublication(),
  )

  const isNew = publication === null

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>{isNew ? "Add Publication" : "Edit Publication"}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
          <BilingualTextField
            label="Title"
            value={draft.title}
            onChange={(title) => setDraft((prev) => ({ ...prev, title }))}
          />
          <TextField
            label="DOI"
            value={draft.doi ?? ""}
            onChange={(e) => setDraft((prev) => ({ ...prev, doi: e.target.value || null }))}
            fullWidth
          />
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
