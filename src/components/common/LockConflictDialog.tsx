import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"

import { DIALOG_MIN_WIDTH, DIALOG_PADDING } from "@/theme"

export interface LockConflictDialogProps {
  open: boolean
  editingByName: string
  editingAt: string
  onGoBack: () => void
  onReadOnly: () => void
  onForceEdit: () => void
}

export const LockConflictDialog = ({
  open,
  editingByName,
  editingAt,
  onGoBack,
  onReadOnly,
  onForceEdit,
}: LockConflictDialogProps) => {
  const formattedTime = new Date(editingAt).toLocaleString("ja-JP")

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      sx={{ "& .MuiDialog-paper": { minWidth: DIALOG_MIN_WIDTH } }}
    >
      <DialogTitle>編集ロック</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {editingByName} さんが {formattedTime} から編集中です。
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: DIALOG_PADDING, gap: 1 }}>
        <Button variant="outlined" onClick={onGoBack}>
          戻る
        </Button>
        <Button variant="outlined" onClick={onReadOnly}>
          閲覧のみで開く
        </Button>
        <Button variant="contained" color="warning" onClick={onForceEdit}>
          強制的に編集する
        </Button>
      </DialogActions>
    </Dialog>
  )
}
