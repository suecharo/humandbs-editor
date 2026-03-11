import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

import { ALPHA_BG_WARNING_SUBTLE, COMPACT_GAP, MODIFIED_TEXT_SX } from "@/theme"

export interface BilingualRow {
  label: string
  ja: string | null | undefined
  en: string | null | undefined
  jaModified?: boolean | undefined
  enModified?: boolean | undefined
}

const EmptyLine = () => (
  <Typography
    variant="body2"
    color="warning.main"
    sx={{
      bgcolor: ALPHA_BG_WARNING_SUBTLE,
      borderRadius: 0.5,
      px: 0.5,
      display: "inline-block",
    }}
  >
    (empty)
  </Typography>
)

const BilingualField = ({ label, ja, en, jaModified, enModified }: BilingualRow) => {
  const jaText = ja?.trim() || null
  const enText = en?.trim() || null

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={500}
        sx={{ letterSpacing: "0.04em" }}
      >
        {label}
      </Typography>
      <Box sx={{ pl: 0.5 }}>
        {jaText
          ? <Typography variant="body2" sx={jaModified ? MODIFIED_TEXT_SX : undefined}>{jaText}</Typography>
          : enText && <EmptyLine />}
        {enText
          ? <Typography variant="body2" sx={enModified ? MODIFIED_TEXT_SX : undefined}>{enText}</Typography>
          : jaText && <EmptyLine />}
      </Box>
    </Box>
  )
}

export const BilingualCardContent = ({ rows }: { rows: BilingualRow[] }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: COMPACT_GAP }}>
    {rows.map((row) => (
      <BilingualField key={row.label} {...row} />
    ))}
  </Box>
)
