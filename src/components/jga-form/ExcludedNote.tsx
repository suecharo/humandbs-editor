import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

interface ExcludedNoteProps {
  items: string[]
  note: string
}

export const ExcludedNote = ({ items, note }: ExcludedNoteProps) => (
  <Alert severity="info" variant="outlined">
    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
      {note}
    </Typography>
    <Box component="ul" sx={{ m: 0, pl: 2 }}>
      {items.map((item) => (
        <li key={item}>
          <Typography variant="body2">{item}</Typography>
        </li>
      ))}
    </Box>
  </Alert>
)
