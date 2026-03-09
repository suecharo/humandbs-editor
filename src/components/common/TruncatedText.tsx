import Tooltip from "@mui/material/Tooltip"
import Typography, { type TypographyProps } from "@mui/material/Typography"
import { useCallback, useState } from "react"

interface TruncatedTextProps {
  text: string
  variant?: TypographyProps["variant"]
  color?: TypographyProps["color"]
  fontWeight?: TypographyProps["fontWeight"]
}

export const TruncatedText = ({
  text,
  variant = "body2",
  color,
  fontWeight,
}: TruncatedTextProps) => {
  const [truncated, setTruncated] = useState(false)

  const checkTruncation = useCallback((el: HTMLSpanElement | null) => {
    if (el) {
      setTruncated(el.scrollWidth > el.clientWidth)
    }
  }, [])

  const content = (
    <Typography
      ref={checkTruncation}
      variant={variant}
      color={color}
      fontWeight={fontWeight}
      component="span"
      sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
    >
      {text}
    </Typography>
  )

  if (!truncated) {
    return content
  }

  return (
    <Tooltip title={text} placement="top-start">
      {content}
    </Tooltip>
  )
}
