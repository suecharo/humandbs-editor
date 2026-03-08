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

interface DatasetsSectionProps {
  versions: ResearchVersion[]
}

export const DatasetsSection = ({ versions }: DatasetsSectionProps) => {
  const latestVersion = versions.at(-1)
  const datasets = latestVersion?.datasets ?? []

  return (
    <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
      <Typography variant="h2" sx={{ mb: SUBSECTION_GAP }}>Datasets</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Dataset ID</TableCell>
              <TableCell>Version</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {datasets.map((d) => (
              <TableRow key={`${d.datasetId}-${d.version}`}>
                <TableCell sx={MONOSPACE_ID_SX}>{d.datasetId}</TableCell>
                <TableCell>{d.version}</TableCell>
              </TableRow>
            ))}
            {datasets.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <Typography variant="body2" color="text.secondary">No datasets</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
