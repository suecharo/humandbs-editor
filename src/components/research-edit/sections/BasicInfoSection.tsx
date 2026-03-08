import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Typography from "@mui/material/Typography"

import { SectionHeader } from "@/components/SectionHeader"
import type { Research } from "@/schemas/research"
import type { ResearchVersion } from "@/schemas/research-version"
import { MONOSPACE_ID_SX, SECTION_GAP, SUBSECTION_GAP } from "@/theme"

import { ReadOnlyField } from "../fields/ReadOnlyField"

interface BasicInfoSectionProps {
  research: Research
  versions: ResearchVersion[]
}

export const BasicInfoSection = ({ research, versions }: BasicInfoSectionProps) => (
  <Paper variant="outlined" sx={{ p: SUBSECTION_GAP, display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
    <Box>
      <Box sx={{ mb: SUBSECTION_GAP }}>
        <SectionHeader title={`${research.humId} 編集`} component="h1" />
      </Box>
      <ReadOnlyField label="URL (JA)" value={research.url.ja} />
      <ReadOnlyField label="URL (EN)" value={research.url.en} />
      <ReadOnlyField label="Date Published" value={research.datePublished} />
      <ReadOnlyField label="Date Modified" value={research.dateModified} />
    </Box>
    <Box>
      <Box sx={{ mb: SUBSECTION_GAP }}>
        <SectionHeader title="Versions" size="small" />
      </Box>
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
    </Box>
  </Paper>
)
