import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import equal from "fast-deep-equal"

import type { ResearchProject } from "@/schemas/research"
import { DIALOG_PADDING, DIALOG_TITLE_SX, FIELD_GROUP_GAP, FORM_LABEL_SX, MODIFIED_FIELD_SX, SUBSECTION_GAP } from "@/theme"

import { BilingualTextValueField } from "../fields/BilingualTextValueField"

interface ResearchProjectEditDialogProps {
  open: boolean
  project: ResearchProject
  serverProject?: ResearchProject | undefined
  onChange: (project: ResearchProject) => void
  onClose: () => void
}

export const ResearchProjectEditDialog = ({
  open,
  project,
  serverProject,
  onChange,
  onClose,
}: ResearchProjectEditDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle sx={DIALOG_TITLE_SX}>プロジェクトを編集</DialogTitle>
    <DialogContent dividers sx={{ p: DIALOG_PADDING }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
        <BilingualTextValueField
          label="プロジェクト名"
          value={project.name}
          onChange={(name) => onChange({ ...project, name })}
          multiline={false}
          modified={serverProject ? {
            ja: project.name.ja?.text !== serverProject.name.ja?.text,
            en: project.name.en?.text !== serverProject.name.en?.text,
          } : undefined}
        />
        <Box>
          <Typography variant="body2" sx={{ ...FORM_LABEL_SX, mb: 1 }}>
            URL
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP }}>
            <TextField
              label="JA"
              value={project.url?.ja?.url ?? ""}
              onChange={(e) => {
                const url = e.target.value || null
                onChange({
                  ...project,
                  url: {
                    ...project.url,
                    ja: url ? { text: url, url } : null,
                    en: project.url?.en ?? null,
                  },
                })
              }}
              fullWidth
              sx={serverProject && project.url?.ja?.url !== serverProject.url?.ja?.url ? MODIFIED_FIELD_SX : undefined}
            />
            <TextField
              label="EN"
              value={project.url?.en?.url ?? ""}
              onChange={(e) => {
                const url = e.target.value || null
                onChange({
                  ...project,
                  url: {
                    ja: project.url?.ja ?? null,
                    en: url ? { text: url, url } : null,
                  },
                })
              }}
              fullWidth
              sx={serverProject && project.url?.en?.url !== serverProject.url?.en?.url ? MODIFIED_FIELD_SX : undefined}
            />
          </Box>
        </Box>
      </Box>
    </DialogContent>
    <DialogActions sx={{ p: DIALOG_PADDING, justifyContent: "space-between" }}>
      <Button
        variant="outlined"
        color="secondary"
        disabled={!serverProject || equal(project, serverProject)}
        onClick={() => { if (serverProject) onChange(serverProject) }}
      >
        変更を破棄
      </Button>
      <Button variant="outlined" onClick={onClose}>閉じる</Button>
    </DialogActions>
  </Dialog>
)
