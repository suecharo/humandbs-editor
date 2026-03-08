import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"

import { HEADER_BG, HEADER_HEIGHT } from "../../theme"

export const AppHeader = () => (
  <AppBar sx={{ backgroundColor: HEADER_BG, height: HEADER_HEIGHT, justifyContent: "center" }}>
    <Toolbar variant="dense">
      <Typography variant="h2" sx={{ color: "#FFFFFF", fontWeight: 700 }}>
        humandbs-editor
      </Typography>
    </Toolbar>
  </AppBar>
)
