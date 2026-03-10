import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import equal from "fast-deep-equal"

import type { Publication } from "@/schemas/research"
import { DIALOG_PADDING, DIALOG_TITLE_SX, FORM_LABEL_SX, MODIFIED_FIELD_SX, SUBSECTION_GAP } from "@/theme"

import { BilingualTextField } from "../fields/BilingualTextField"

interface PublicationEditDialogProps {
  open: boolean
  publication: Publication
  serverPublication?: Publication | undefined
  onChange: (publication: Publication) => void
  onClose: () => void
}

export const PublicationEditDialog = ({
  open,
  publication,
  serverPublication,
  onChange,
  onClose,
}: PublicationEditDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle sx={DIALOG_TITLE_SX}>関連論文を編集</DialogTitle>
    <DialogContent dividers sx={{ p: DIALOG_PADDING }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
        <BilingualTextField
          label="タイトル"
          value={publication.title}
          onChange={(title) => onChange({ ...publication, title })}
          modified={serverPublication ? {
            ja: publication.title.ja !== serverPublication.title.ja,
            en: publication.title.en !== serverPublication.title.en,
          } : undefined}
        />
        <TextField
          label="DOI"
          value={publication.doi ?? ""}
          onChange={(e) => onChange({ ...publication, doi: e.target.value || null })}
          fullWidth
          sx={serverPublication && publication.doi !== serverPublication.doi ? MODIFIED_FIELD_SX : undefined}
        />
        {publication.datasetIds && publication.datasetIds.length > 0 && (
          <Box>
            <Typography variant="body2" sx={{ ...FORM_LABEL_SX, mb: 0.5 }}>
              データセットID（読み取り専用）
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {publication.datasetIds.map((id) => (
                <Chip key={id} label={id} size="small" sx={{ fontFamily: "monospace" }} />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </DialogContent>
    <DialogActions sx={{ p: DIALOG_PADDING, justifyContent: "space-between" }}>
      <Button
        variant="outlined"
        color="secondary"
        disabled={!serverPublication || equal(publication, serverPublication)}
        onClick={() => { if (serverPublication) onChange(serverPublication) }}
      >
        変更を破棄
      </Button>
      <Button variant="outlined" onClick={onClose}>閉じる</Button>
    </DialogActions>
  </Dialog>
)
