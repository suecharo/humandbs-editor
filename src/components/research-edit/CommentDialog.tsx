import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import SendIcon from "@mui/icons-material/Send"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { useAtomValue } from "jotai"
import { useState } from "react"

import type { ResearchComment } from "@/schemas/editor-state"
import { userNameAtom } from "@/stores/user"
import { COMPACT_GAP, DIALOG_PADDING, DIALOG_TITLE_SX, FIELD_GROUP_GAP, INLINE_GAP, SUBSECTION_GAP } from "@/theme"

interface CommentDialogProps {
  open: boolean
  onClose: () => void
  comments: ResearchComment[]
  onAdd: (body: { author: string; text: string }) => void
  onDelete: (commentId: string) => void
  adding: boolean
}

export const CommentDialog = ({
  open,
  onClose,
  comments,
  onAdd,
  onDelete,
  adding,
}: CommentDialogProps) => {
  const userName = useAtomValue(userNameAtom)
  const [text, setText] = useState("")

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed || !userName) return

    onAdd({ author: userName, text: trimmed })
    setText("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableScrollLock
      maxWidth="sm"
      fullWidth
      sx={{ "& .MuiDialog-paper": { maxHeight: "80vh" } }}
    >
      <DialogTitle sx={DIALOG_TITLE_SX}>コメント</DialogTitle>
      <DialogContent sx={{ p: DIALOG_PADDING, display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
        {/* Comment list */}
        <Box sx={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP }}>
          {comments.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ py: SUBSECTION_GAP, textAlign: "center" }}>
              コメントはまだありません
            </Typography>
          )}
          {comments.map((comment) => (
            <Box key={comment.id}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: INLINE_GAP }}>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: COMPACT_GAP }}>
                  <Typography variant="body2" fontWeight={600}>
                    {comment.author}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                    {new Date(comment.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                {comment.author === userName && (
                  <IconButton size="small" onClick={() => onDelete(comment.id)} sx={{ p: 0.25 }}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: COMPACT_GAP }}>
                {comment.text}
              </Typography>
              <Divider sx={{ mt: FIELD_GROUP_GAP }} />
            </Box>
          ))}
        </Box>

        {/* Input area */}
        <Box sx={{ display: "flex", gap: INLINE_GAP, alignItems: "flex-end" }}>
          <TextField
            multiline
            minRows={2}
            maxRows={6}
            fullWidth
            placeholder="コメントを入力… (Ctrl+Enter で投稿)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            variant="contained"
            size="small"
            disabled={!text.trim() || !userName || adding}
            onClick={handleSubmit}
            sx={{ minWidth: "auto", px: 1.5, height: 40 }}
          >
            <SendIcon fontSize="small" />
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
