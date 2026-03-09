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
import { DIALOG_PADDING, DIALOG_TITLE_SX, SUBSECTION_GAP } from "@/theme"

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
      <DialogTitle sx={DIALOG_TITLE_SX}>{isNew ? "科研費/助成金を追加" : "科研費/助成金を編集"}</DialogTitle>
      <DialogContent dividers sx={{ p: DIALOG_PADDING }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
          <BilingualTextField
            label="タイトル"
            value={draft.title}
            onChange={(title) => setDraft((prev) => ({ ...prev, title }))}
          />
          <BilingualTextField
            label="助成金名"
            value={draft.agency.name}
            onChange={(name) => setDraft((prev) => ({ ...prev, agency: { name } }))}
          />
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

                return <Chip key={key} label={id} size="small" sx={{ fontFamily: "monospace" }} {...tagProps} />
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="課題番号"
                placeholder="Enter で追加"
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: DIALOG_PADDING }}>
        <Button variant="outlined" onClick={onCancel}>キャンセル</Button>
        <Button onClick={() => onSave(draft)} variant="contained">
          {isNew ? "追加" : "保存"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
