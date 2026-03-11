import AccountCircle from "@mui/icons-material/AccountCircle"
import GitHub from "@mui/icons-material/GitHub"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import ButtonBase from "@mui/material/ButtonBase"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import IconButton from "@mui/material/IconButton"
import TextField from "@mui/material/TextField"
import Toolbar from "@mui/material/Toolbar"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import { Link } from "@tanstack/react-router"
import { useAtom } from "jotai"
import { type ElementType, useState } from "react"

import { userNameAtom } from "@/stores/user"

import { DIALOG_MIN_WIDTH, DIALOG_PADDING, DIALOG_TITLE_SX, HEADER_BG, HEADER_HEIGHT, NAV_LINK_COLOR, NAV_LINK_HOVER_COLOR } from "../../theme"

const navLinkSx = {
  color: NAV_LINK_COLOR,
  textDecoration: "none",
  fontSize: "0.875rem",
  fontWeight: 500,
  transition: "color 0.15s ease",
  "&:hover": { color: NAV_LINK_HOVER_COLOR },
} as const

const NavLink = ({ to, label }: { to: string; label: string }) => (
  <Typography component={Link as ElementType} to={to} sx={navLinkSx}>
    {label}
  </Typography>
)

export const AppHeader = () => {
  const [userName, setUserName] = useAtom(userNameAtom)
  const [editOpen, setEditOpen] = useState(false)
  const [editInput, setEditInput] = useState("")
  const [editError, setEditError] = useState("")

  const handleOpenEdit = () => {
    setEditInput(userName)
    setEditError("")
    setEditOpen(true)
  }

  const handleSaveEdit = () => {
    const trimmed = editInput.trim()
    if (trimmed.length === 0) {
      setEditError("ユーザー名を入力してください")

      return
    }
    if (trimmed.length > 50) {
      setEditError("ユーザー名は50文字以内で入力してください")

      return
    }
    setUserName(trimmed)
    setEditOpen(false)
  }

  return (
    <>
      <AppBar sx={{ bgcolor: HEADER_BG }}>
        <Toolbar component="nav" aria-label="Main navigation" variant="dense" sx={{ minHeight: HEADER_HEIGHT, height: HEADER_HEIGHT }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Typography variant="h2" sx={{ color: NAV_LINK_HOVER_COLOR, fontWeight: 700, letterSpacing: "0.04em" }}>
              Human<Box component="span" sx={{ fontWeight: 800 }}>DBs</Box> Editor
            </Typography>
          </Link>
          <Box sx={{ display: "flex", alignItems: "center", ml: 3, gap: 3 }}>
            <NavLink to="/" label="研究一覧" />
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {userName && (
              <Tooltip title="ユーザー名を変更" placement="bottom">
                <ButtonBase
                  onClick={handleOpenEdit}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: NAV_LINK_COLOR,
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                    "&:hover": { color: NAV_LINK_HOVER_COLOR },
                  }}
                >
                  <AccountCircle fontSize="small" />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {userName}
                  </Typography>
                </ButtonBase>
              </Tooltip>
            )}
            <Tooltip title="GitHub - suecharo/humandbs-editor" placement="bottom">
              <IconButton
                component="a"
                href="https://github.com/suecharo/humandbs-editor"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{ color: NAV_LINK_COLOR, "&:hover": { color: NAV_LINK_HOVER_COLOR } }}
              >
                <GitHub fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        sx={{ "& .MuiDialog-paper": { minWidth: DIALOG_MIN_WIDTH } }}
      >
        <DialogTitle sx={DIALOG_TITLE_SX}>ユーザー名の変更</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="ユーザー名"
            value={editInput}
            onChange={(e) => {
              setEditInput(e.target.value)
              setEditError("")
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveEdit()
            }}
            error={editError !== ""}
            helperText={editError || " "}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: DIALOG_PADDING }}>
          <Button variant="outlined" onClick={() => setEditOpen(false)}>キャンセル</Button>
          <Button variant="contained" onClick={handleSaveEdit}>変更</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
