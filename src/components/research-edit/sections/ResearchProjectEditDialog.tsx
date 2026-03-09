import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"

import { useDialogDraft } from "@/hooks/use-dialog-draft"
import { createDefaultResearchProject } from "@/schemas/defaults"
import type { ResearchProject } from "@/schemas/research"

import { BilingualTextValueField } from "../fields/BilingualTextValueField"

interface ResearchProjectEditDialogProps {
  open: boolean
  project: ResearchProject | null
  onSave: (project: ResearchProject) => void
  onCancel: () => void
}

export const ResearchProjectEditDialog = ({
  open,
  project,
  onSave,
  onCancel,
}: ResearchProjectEditDialogProps) => {
  const [draft, setDraft] = useDialogDraft(
    open,
    () => project ? structuredClone(project) : createDefaultResearchProject(),
  )

  const isNew = project === null

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>{isNew ? "Add Project" : "Edit Project"}</DialogTitle>
      <DialogContent dividers>
        <BilingualTextValueField
          label="Name"
          value={draft.name}
          onChange={(name) => setDraft((prev) => ({ ...prev, name }))}
        />
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
