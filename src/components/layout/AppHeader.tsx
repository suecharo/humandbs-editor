import GitHub from "@mui/icons-material/GitHub"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Toolbar from "@mui/material/Toolbar"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import { Link } from "@tanstack/react-router"
import type { ElementType } from "react"

import { HEADER_BG, HEADER_HEIGHT, NAV_LINK_COLOR, NAV_LINK_HOVER_COLOR } from "../../theme"

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

export const AppHeader = () => (
  <AppBar sx={{ bgcolor: HEADER_BG }}>
    <Toolbar component="nav" aria-label="Main navigation" variant="dense" sx={{ minHeight: HEADER_HEIGHT, height: HEADER_HEIGHT }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        <Typography variant="h2" sx={{ color: "#FFFFFF", fontWeight: 700, letterSpacing: "0.04em" }}>
          Human<Box component="span" sx={{ fontWeight: 800 }}>DBs</Box> Editor
        </Typography>
      </Link>
      <Box sx={{ display: "flex", alignItems: "center", ml: 3, gap: 3 }}>
        <NavLink to="/" label="研究一覧" />
        <NavLink to="/datasets" label="データセット一覧" />
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
)
