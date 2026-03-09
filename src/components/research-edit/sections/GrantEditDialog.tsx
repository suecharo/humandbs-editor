import Autocomplete from "@mui/material/Autocomplete"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"

import { useDialogDraft } from "@/hooks/use-dialog-draft"
import { createDefaultGrant } from "@/schemas/defaults"
import type { Grant } from "@/schemas/research"
import { SUBSECTION_GAP } from "@/theme"

import { BilingualTextField } from "../fields/BilingualTextField"

interface GrantEditDialogProps {
  open: boolean
  grant: Grant | null
  onSave: (grant: Grant) => void
  onCancel: () => void
}

export const GrantEditDialog = ({
  open,
  grant,
  onSave,
  onCancel,
}: GrantEditDialogProps) => {
  const [draft, setDraft] = useDialogDraft(
    open,
    () => grant ? structuredClone(grant) : createDefaultGrant(),
  )

  const isNew = grant === null

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>{isNew ? "Add Grant" : "Edit Grant"}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={draft.id}
            onChange={(_e, value) =>
              setDraft((prev) => ({
                ...prev,
                id: value.map((v) => v.trim()).filter(Boolean),
              }))
            }
            renderTags={(value, getTagProps) =>
              value.map((id, index) => {
                const { key, ...tagProps } = getTagProps({ index })

                return <Chip key={key} label={id} size="small" {...tagProps} />
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Grant IDs"
                placeholder="Enter で追加"
              />
            )}
          />
          <BilingualTextField
            label="Title"
            value={draft.title}
            onChange={(title) => setDraft((prev) => ({ ...prev, title }))}
          />
          <BilingualTextField
            label="Agency Name"
            value={draft.agency.name}
            onChange={(name) => setDraft((prev) => ({ ...prev, agency: { name } }))}
          />
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
