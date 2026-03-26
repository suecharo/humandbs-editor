import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import Typography from "@mui/material/Typography"
import type { ElementType, ReactNode } from "react"

import {
  HEADING_BORDER_LARGE,
  HEADING_BORDER_SMALL,
  HEADING_PL,
  MODIFIED_CHIP_SX,
} from "../theme"

export const SectionHeader = ({ title, subtitle, action, titleAction, component = "h2", size = "default", color, modified = false }: {
  title: string
  subtitle?: string | undefined
  action?: ReactNode | undefined
  titleAction?: ReactNode | undefined
  component?: ElementType | undefined
  size?: "default" | "medium" | "small" | undefined
  color?: string | undefined
  modified?: boolean | undefined
}) => {
  const isSmall = size === "small"
  const isMedium = size === "medium"
  const resolvedColor = color ?? (isSmall ? "secondary.main" : "primary.main")
  const variant = isSmall ? "h3" : isMedium ? "h2" : "h1"
  const borderWidth = isSmall ? HEADING_BORDER_SMALL : HEADING_BORDER_LARGE

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          variant={variant}
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
              width: borderWidth,
              bgcolor: resolvedColor,
              borderRadius: borderWidth,
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
          <Chip label="Modified" size="small" sx={MODIFIED_CHIP_SX} />
        ) : null}
      </Box>
      {action ?? null}
    </Box>
  )
}
