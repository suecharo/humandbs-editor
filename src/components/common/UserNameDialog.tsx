import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import { useAtom } from "jotai"
import { useState } from "react"

import { userNameAtom } from "@/stores/user"
import { DIALOG_MIN_WIDTH, DIALOG_PADDING } from "@/theme"

export const UserNameDialog = () => {
  const [userName, setUserName] = useAtom(userNameAtom)
  const [input, setInput] = useState("")
  const [error, setError] = useState("")

  const open = userName === ""

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (trimmed.length === 0) {
      setError("ユーザー名を入力してください")

      return
    }
    if (trimmed.length > 50) {
      setError("ユーザー名は50文字以内で入力してください")

      return
    }
    setUserName(trimmed)
    setError("")
  }

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      sx={{ "& .MuiDialog-paper": { minWidth: DIALOG_MIN_WIDTH } }}
    >
      <DialogTitle>ユーザー名の設定</DialogTitle>
      <DialogContent>

        <TextField
          autoFocus
          fullWidth
          label="ユーザー名 (なんでもいいよ)"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setError("")
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit()
          }}
          error={error !== ""}
          helperText={error || undefined}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: DIALOG_PADDING, pb: DIALOG_PADDING }}>
        <Button variant="contained" onClick={handleSubmit}>
          設定
        </Button>
      </DialogActions>
    </Dialog>
  )
}
