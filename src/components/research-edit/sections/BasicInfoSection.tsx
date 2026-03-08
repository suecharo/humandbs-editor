import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Collapse from "@mui/material/Collapse"
import IconButton from "@mui/material/IconButton"
import Link from "@mui/material/Link"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Typography from "@mui/material/Typography"
import { Fragment, useState } from "react"

import { CurationStatusChip } from "@/components/CurationStatusChip"
import { SectionHeader } from "@/components/SectionHeader"
import type { CurationStatus, SectionCurationStatus } from "@/schemas/editor-state"
import type { Research } from "@/schemas/research"
import type { ResearchVersion } from "@/schemas/research-version"
import { FORM_LABEL_SX, MONOSPACE_ID_SX, SECTION_GAP, SUBSECTION_GAP } from "@/theme"

interface BasicInfoSectionProps {
  research: Research
  versions: ResearchVersion[]
  curationStatus: CurationStatus
  dirty: boolean
  onDiscardChanges: () => void
  onSetAllSections: (status: SectionCurationStatus) => void
}

export const BasicInfoSection = ({
  research,
  versions,
  curationStatus,
  dirty,
  onDiscardChanges,
  onSetAllSections,
}: BasicInfoSectionProps) => {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null)

  const handleToggleExpand = (versionId: string) => {
    setExpandedVersion((prev) => (prev === versionId ? null : versionId))
  }

  return (
    <Paper variant="outlined" sx={{ p: SUBSECTION_GAP, display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <SectionHeader title={research.humId} component="h1" />
          <CurationStatusChip status={curationStatus} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            disabled={!dirty}
            onClick={onDiscardChanges}
          >
            変更を破棄
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onSetAllSections("uncurated")}
          >
            全て Uncurated
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="success"
            onClick={() => onSetAllSections("curated")}
          >
            全て Curated
          </Button>
        </Box>
      </Box>

      {/* Metadata */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
        <MetaField label="URL (JA)" value={research.url.ja} isLink />
        <MetaField label="Published" value={research.datePublished} />
        <MetaField label="URL (EN)" value={research.url.en} isLink />
        <MetaField label="Modified" value={research.dateModified} />
      </Box>

      {/* Releases */}
      <Box>
        <Box sx={{ mb: SUBSECTION_GAP }}>
          <SectionHeader title="Releases" size="small" />
        </Box>
        <ReleasesTable
          versions={versions}
          expandedVersion={expandedVersion}
          onToggleExpand={handleToggleExpand}
        />
      </Box>
    </Paper>
  )
}

const MetaField = ({ label, value, isLink }: {
  label: string
  value: string | null | undefined
  isLink?: boolean | undefined
}) => (
  <Box>
    <Typography variant="body2" sx={{ ...FORM_LABEL_SX, mb: 0.25 }}>
      {label}
    </Typography>
    {isLink && value ? (
      <Link
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        variant="body1"
        sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
      >
        {value}
        <OpenInNewIcon sx={{ fontSize: "0.875rem" }} />
      </Link>
    ) : (
      <Typography variant="body1">{value ?? "-"}</Typography>
    )}
  </Box>
)

const ReleasesTable = ({ versions, expandedVersion, onToggleExpand }: {
  versions: ResearchVersion[]
  expandedVersion: string | null
  onToggleExpand: (versionId: string) => void
}) => (
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell sx={{ width: 40, px: 0.5 }} />
          <TableCell>Version</TableCell>
          <TableCell>Release Date</TableCell>
          <TableCell align="right">Datasets</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {versions.map((v) => {
          const isExpanded = expandedVersion === v.humVersionId

          return (
            <Fragment key={v.humVersionId}>
              <TableRow
                hover
                onClick={() => onToggleExpand(v.humVersionId)}
                sx={{
                  cursor: "pointer",
                  ...(isExpanded && { "& > .MuiTableCell-root": { borderBottomColor: "transparent" } }),
                }}
              >
                <TableCell sx={{ width: 40, px: 0.5 }}>
                  <IconButton size="small" tabIndex={-1}>
                    {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </TableCell>
                <TableCell sx={MONOSPACE_ID_SX}>{v.version}</TableCell>
                <TableCell>{v.versionReleaseDate}</TableCell>
                <TableCell align="right">{v.datasets.length}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  colSpan={4}
                  sx={{ py: 0, ...(isExpanded ? {} : { borderBottom: 0 }) }}
                >
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ py: 1.5, px: 2 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                        Release Note
                      </Typography>
                      {v.releaseNote.ja?.text || v.releaseNote.en?.text ? (
                        <Box sx={{ mb: 1.5 }}>
                          {v.releaseNote.ja?.text ? (
                            <Typography variant="body2" color="text.secondary">
                              JA: {v.releaseNote.ja.text}
                            </Typography>
                          ) : null}
                          {v.releaseNote.en?.text ? (
                            <Typography variant="body2" color="text.secondary">
                              EN: {v.releaseNote.en.text}
                            </Typography>
                          ) : null}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                          -
                        </Typography>
                      )}
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                        Datasets
                      </Typography>
                      {v.datasets.length > 0 ? (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {v.datasets.map((ds) => (
                            <Chip
                              key={`${ds.datasetId}-${ds.version}`}
                              label={`${ds.datasetId} (${ds.version})`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </Fragment>
          )
        })}
        {versions.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} align="center">
              <Typography variant="body2" color="text.secondary">No releases</Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableContainer>
)
