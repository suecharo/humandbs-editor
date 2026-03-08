import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

import { FOOTER_BG, FOOTER_TEXT_COLOR } from "../../theme"

export const AppFooter = () => (
  <Box
    component="footer"
    sx={{
      backgroundColor: FOOTER_BG,
      py: 1.5,
      px: 3,
      textAlign: "center",
    }}
  >
    <Typography variant="body2" sx={{ color: FOOTER_TEXT_COLOR }}>
      humandbs-editor
    </Typography>
  </Box>
)
