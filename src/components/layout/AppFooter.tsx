import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

import { FOOTER_BG, FOOTER_TEXT_COLOR } from "../../theme"

export const AppFooter = () => (
  <Box
    component="footer"
    sx={{
      bgcolor: FOOTER_BG,
      py: 0.5,
      px: 3,
      textAlign: "center",
    }}
  >
    <Typography sx={{ color: FOOTER_TEXT_COLOR, fontSize: "0.6875rem" }}>
      HumanDBs Editor @suecharo
    </Typography>
  </Box>
)
