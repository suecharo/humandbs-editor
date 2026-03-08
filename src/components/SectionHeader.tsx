import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import type { ElementType, ReactNode } from "react"

import {
  HEADING_BORDER_LARGE,
  HEADING_BORDER_SMALL,
  HEADING_PL,
} from "../theme"

export const SectionHeader = ({ title, subtitle, action, component = "h2", size = "default", color }: {
  title: string
  subtitle?: string | undefined
  action?: ReactNode | undefined
  component?: ElementType | undefined
  size?: "default" | "small" | undefined
  color?: string | undefined
}) => {
  const isSmall = size === "small"
  const resolvedColor = color ?? (isSmall ? "secondary.main" : "primary.main")

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          variant={isSmall ? "h3" : "h1"}
          component={isSmall ? "h3" : component}
          sx={{
            pl: HEADING_PL,
            position: "relative",
            "&::before": {
              content: "\"\"",
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: isSmall ? HEADING_BORDER_SMALL : HEADING_BORDER_LARGE,
              bgcolor: resolvedColor,
              borderRadius: isSmall ? HEADING_BORDER_SMALL : HEADING_BORDER_LARGE,
            },
          }}
        >
          {title}
          {subtitle ? (
            <Typography component="span" variant="body1" sx={{ ml: 2, color: "text.secondary", fontWeight: 400 }}>
              — {subtitle}
            </Typography>
          ) : null}
        </Typography>
      </Box>
      {action ?? null}
    </Box>
  )
}
