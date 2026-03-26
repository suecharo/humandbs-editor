import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Link from "@mui/material/Link"
import Snackbar from "@mui/material/Snackbar"
import { useState } from "react"

import { SectionHeader } from "@/components/SectionHeader"
import { MONOSPACE_FONT_FAMILY, SECTION_GAP, SUBSECTION_GAP } from "@/theme"

interface JsonOutputSectionProps {
  jsonString: string
}

export const JsonOutputSection = ({ jsonString }: JsonOutputSectionProps) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString)
    setSnackbarOpen(true)
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
      <SectionHeader title="JSON プレビュー" size="medium" />

      <Box
        component="pre"
        sx={{
          fontFamily: MONOSPACE_FONT_FAMILY,
          fontSize: "0.75rem",
          overflow: "auto",
          maxHeight: 400,
          bgcolor: "#F8FAFC",
          p: 2,
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          m: 0,
        }}
      >
        {jsonString}
      </Box>

      <Box sx={{ display: "flex", gap: SUBSECTION_GAP, alignItems: "center" }}>
        <Button
          variant="contained"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopy}
        >
          JSON をコピー
        </Button>
        <Link
          href="#"
          target="_blank"
          rel="noopener"
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          申請管理システムへ
          <OpenInNewIcon sx={{ fontSize: "1rem" }} />
        </Link>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message="JSON をクリップボードにコピーしました"
      />
    </Box>
  )
}
