import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

import { ALPHA_BG_WARNING_SUBTLE } from "@/theme"

export interface BilingualRow {
  label: string
  ja: string | null | undefined
  en: string | null | undefined
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

const BilingualField = ({ label, ja, en }: BilingualRow) => {
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
          ? <Typography variant="body2">{jaText}</Typography>
          : enText && <EmptyLine />}
        {enText
          ? <Typography variant="body2">{enText}</Typography>
          : jaText && <EmptyLine />}
      </Box>
    </Box>
  )
}

export const BilingualCardContent = ({ rows }: { rows: BilingualRow[] }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
    {rows.map((row) => (
      <BilingualField key={row.label} {...row} />
    ))}
  </Box>
)
