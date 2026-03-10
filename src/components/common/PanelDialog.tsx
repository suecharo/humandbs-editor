import Dialog from "@mui/material/Dialog"
import type { DialogProps } from "@mui/material/Dialog"
import type { SxProps, Theme } from "@mui/material/styles"

import { usePanelSide } from "@/contexts/panel-side"

/**
 * MUI Dialog wrapper that positions the dialog centered within the
 * left or right half of the viewport based on PanelSideContext.
 *
 * Falls back to default centered behavior when no context is provided.
 */
export const PanelDialog = ({ sx, ...props }: DialogProps) => {
  const side = usePanelSide()

  const panelSx: SxProps<Theme> | undefined = side
    ? {
      "& .MuiDialog-container": {
        width: "50%",
        ...(side === "right" && { ml: "auto" }),
      },
    }
    : undefined

  const merged: SxProps<Theme> = [
    ...(panelSx ? [panelSx] : []),
    ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
  ]

  return <Dialog sx={merged} {...props} />
}
