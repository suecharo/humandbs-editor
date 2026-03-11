import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import Typography from "@mui/material/Typography"
import type { ElementType, ReactNode } from "react"

import {
  HEADING_BORDER_LARGE,
  HEADING_BORDER_SMALL,
  HEADING_PL,
  MODIFIED_INDICATOR_COLOR,
} from "../theme"

export const SectionHeader = ({ title, subtitle, action, titleAction, component = "h2", size = "default", color, modified = false }: {
  title: string
  subtitle?: string | undefined
  action?: ReactNode | undefined
  titleAction?: ReactNode | undefined
  component?: ElementType | undefined
  size?: "default" | "small" | undefined
  color?: string | undefined
  modified?: boolean | undefined
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
        {titleAction ?? null}
        {modified ? (
          <Chip
            label="Modified"
            size="small"
            sx={{
              height: 20,
              fontSize: "0.6875rem",
              fontWeight: 600,
              bgcolor: MODIFIED_INDICATOR_COLOR,
              color: "#fff",
            }}
          />
        ) : null}
      </Box>
      {action ?? null}
    </Box>
  )
}
