import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Typography from "@mui/material/Typography"

import type { ResearchVersion } from "@/schemas/research-version"
import { MONOSPACE_ID_SX, SUBSECTION_GAP } from "@/theme"

interface VersionsSectionProps {
  versions: ResearchVersion[]
}

export const VersionsSection = ({ versions }: VersionsSectionProps) => (
  <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
    <Typography variant="h2" sx={{ mb: SUBSECTION_GAP }}>Versions</Typography>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Version</TableCell>
            <TableCell>Release Date</TableCell>
            <TableCell align="right">Datasets</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {versions.map((v) => (
            <TableRow key={v.humVersionId}>
              <TableCell sx={MONOSPACE_ID_SX}>{v.version}</TableCell>
              <TableCell>{v.versionReleaseDate}</TableCell>
              <TableCell align="right">{v.datasets.length}</TableCell>
            </TableRow>
          ))}
          {versions.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} align="center">
                <Typography variant="body2" color="text.secondary">No versions</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
)
