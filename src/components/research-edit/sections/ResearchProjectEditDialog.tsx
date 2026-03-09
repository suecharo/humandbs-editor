import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import { useDialogDraft } from "@/hooks/use-dialog-draft"
import { createDefaultResearchProject } from "@/schemas/defaults"
import type { ResearchProject } from "@/schemas/research"
import { DIALOG_PADDING, DIALOG_TITLE_SX, FIELD_GROUP_GAP, FORM_LABEL_SX, SUBSECTION_GAP } from "@/theme"

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
      <DialogTitle sx={DIALOG_TITLE_SX}>{isNew ? "プロジェクトを追加" : "プロジェクトを編集"}</DialogTitle>
      <DialogContent dividers sx={{ p: DIALOG_PADDING }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
          <BilingualTextValueField
            label="プロジェクト名"
            value={draft.name}
            onChange={(name) => setDraft((prev) => ({ ...prev, name }))}
            multiline={false}
          />
          <Box>
            <Typography variant="body2" sx={{ ...FORM_LABEL_SX, mb: 1 }}>
              URL
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP }}>
              <TextField
                label="JA"
                value={draft.url?.ja?.url ?? ""}
                onChange={(e) => {
                  const url = e.target.value || null
                  setDraft((prev) => ({
                    ...prev,
                    url: {
                      ...prev.url,
                      ja: url ? { text: url, url } : null,
                      en: prev.url?.en ?? null,
                    },
                  }))
                }}
                fullWidth
              />
              <TextField
                label="EN"
                value={draft.url?.en?.url ?? ""}
                onChange={(e) => {
                  const url = e.target.value || null
                  setDraft((prev) => ({
                    ...prev,
                    url: {
                      ja: prev.url?.ja ?? null,
                      en: url ? { text: url, url } : null,
                    },
                  }))
                }}
                fullWidth
              />
            </Box>
          </Box>
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
