import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import { type ReactNode, useId } from "react"

import { DIALOG_MIN_WIDTH } from "@/theme"

export interface ConfirmDialogProps {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel?: string
  confirmColor?: "error" | "warning" | "primary" | "success"
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog = ({
  open,
  title,
  children,
  confirmLabel = "Confirm",
  confirmColor = "error",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const descriptionId = useId()

  return (
    <Dialog open={open} onClose={onCancel} aria-describedby={descriptionId} sx={{ "& .MuiDialog-paper": { minWidth: DIALOG_MIN_WIDTH } }}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {typeof children === "string"
          ? <DialogContentText id={descriptionId}>{children}</DialogContentText>
          : <Box id={descriptionId}>{children}</Box>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onCancel} autoFocus>Cancel</Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained">
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
