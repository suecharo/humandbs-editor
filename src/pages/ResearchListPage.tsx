import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import LockIcon from "@mui/icons-material/Lock"
import SearchIcon from "@mui/icons-material/Search"
import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import Container from "@mui/material/Container"
import FormControl from "@mui/material/FormControl"
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Paper from "@mui/material/Paper"
import type { SelectChangeEvent } from "@mui/material/Select"
import Select from "@mui/material/Select"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TextField from "@mui/material/TextField"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import { useNavigate } from "@tanstack/react-router"
import { useState, useMemo } from "react"

import { TruncatedText } from "../components/common/TruncatedText"
import { CurationStatusChip } from "../components/CurationStatusChip"
import { SectionHeader } from "../components/SectionHeader"
import { SortableTableCell } from "../components/SortableTableCell"
import { useResearches } from "../hooks/use-researches"
import { useSortState } from "../hooks/use-sort-state"
import type { ResearchListItem } from "../schemas/research"
import { CONTENT_MARGIN_Y, EXPAND_ICON_SIZE, MONOSPACE_ID_SX, MONOSPACE_SMALL_SX } from "../theme"

const LOCK_TIMEOUT_MS = 30 * 60 * 1000

const isLockActive = (editingAt: string | null): boolean => {
  if (editingAt === null) return false

  return Date.now() - new Date(editingAt).getTime() <= LOCK_TIMEOUT_MS
}

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "uncurated", label: "Uncurated" },
  { value: "in-progress", label: "In Progress" },
  { value: "curated", label: "Curated" },
] as const

const CRITERIA_LABELS: Record<string, string> = {
  "Controlled-access (Type I)": "制限 (Type I)",
  "Controlled-access (Type II)": "制限 (Type II)",
  "Unrestricted-access": "非制限",
}

const formatDateVersion = (date: string, version: number): string =>
  `${date} (v${version})`

type SortKey = "humId" | "titleJa" | "datePublished" | "dateModified" | "datasetCount" | "accessRestrictions"

const compareRows = (a: ResearchListItem, b: ResearchListItem, sortKey: SortKey): number => {
  switch (sortKey) {
    case "humId":
      return a.humId.localeCompare(b.humId, undefined, { numeric: true })
    case "titleJa":
      return (a.title.ja ?? "").localeCompare(b.title.ja ?? "")
    case "datePublished":
      return a.datePublished.localeCompare(b.datePublished)
    case "dateModified":
      return a.dateModified.localeCompare(b.dateModified)
    case "datasetCount":
      return a.datasetCount - b.datasetCount
    case "accessRestrictions":
      return a.accessRestrictions.join(",").localeCompare(b.accessRestrictions.join(","))
  }
}

// Default sort when no column is explicitly selected
const DEFAULT_SORT_KEY: SortKey = "humId"

const ExpandableDatasets = ({ count, datasetIds }: { count: number; datasetIds: string[] }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography variant="body2">{count}</Typography>
        {count > 0 && (
          <IconButton
            size="small"
            sx={{ p: 0 }}
            onClick={(e) => {
              e.stopPropagation()
              setExpanded((prev) => !prev)
            }}
            aria-label={expanded ? "Collapse datasets" : "Expand datasets"}
          >
            {expanded ? <ExpandLessIcon sx={{ fontSize: EXPAND_ICON_SIZE }} /> : <ExpandMoreIcon sx={{ fontSize: EXPAND_ICON_SIZE }} />}
          </IconButton>
        )}
      </Box>
      {expanded && (
        <Box sx={{ mt: 0.5, display: "flex", flexDirection: "column", gap: 0.25 }}>
          {datasetIds.map((id) => (
            <Typography
              key={id}
              variant="body2"
              sx={MONOSPACE_SMALL_SX}
            >
              {id}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  )
}

const AccessRestrictionsList = ({ restrictions }: { restrictions: string[] }) => {
  if (restrictions.length === 0) {
    return <Typography variant="body2" color="text.secondary">-</Typography>
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
      {restrictions.map((r) => (
        <Typography key={r} variant="body2">
          {CRITERIA_LABELS[r] ?? r}
        </Typography>
      ))}
    </Box>
  )
}

export const ResearchListPage = () => {
  const { data: researches, isLoading, error } = useResearches()
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { sortBy, sortOrder, handleSort } = useSortState<SortKey>()

  const filtered = useMemo(() => {
    if (!researches) {
      return []
    }
    const lowerSearch = searchText.toLowerCase()

    const result = researches.filter((r) => {
      if (statusFilter !== "all" && r.curationStatus !== statusFilter) {
        return false
      }
      if (lowerSearch) {
        const matchesHumId = r.humId.toLowerCase().includes(lowerSearch)
        const matchesTitleJa = r.title.ja?.toLowerCase().includes(lowerSearch) ?? false
        if (!matchesHumId && !matchesTitleJa) {
          return false
        }
      }

      return true
    })

    const effectiveSortKey = sortBy ?? DEFAULT_SORT_KEY
    const effectiveOrder = sortBy ? sortOrder : "asc"
    const dir = effectiveOrder === "asc" ? 1 : -1
    result.sort((a, b) => compareRows(a, b, effectiveSortKey) * dir)

    return result
  }, [researches, searchText, statusFilter, sortBy, sortOrder])

  const handleStatusChange = (e: SelectChangeEvent) => {
    setStatusFilter(e.target.value)
  }

  const navigateToEdit = (humId: string) => {
    navigate({ to: "/research/$humId", params: { humId } })
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Container sx={{ my: CONTENT_MARGIN_Y }}>
        <Alert severity="error">Failed to load researches: {error.message}</Alert>
      </Container>
    )
  }

  return (
    <Container sx={{ my: CONTENT_MARGIN_Y }}>
      <Box sx={{ mb: 3 }}>
        <SectionHeader title="Researches" />
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          placeholder="Search by humId or title..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 300 }}
        />
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={handleStatusChange}
          >
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ ml: "auto" }} />
        <Typography variant="body2" color="text.secondary">
          {filtered.length} / {researches?.length ?? 0} results
        </Typography>
      </Box>

      <Paper variant="outlined">
        <TableContainer>
          <Table sx={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: 120 }} />
              <col />
              <col style={{ width: 168 }} />
              <col style={{ width: 168 }} />
              <col style={{ width: 88 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 72 }} />
            </colgroup>
            <TableHead>
              <TableRow>
                <SortableTableCell sortKey="humId" activeSortKey={sortBy} sortOrder={sortOrder} onSort={handleSort}>
                  Research ID
                </SortableTableCell>
                <SortableTableCell sortKey="titleJa" activeSortKey={sortBy} sortOrder={sortOrder} onSort={handleSort}>
                  研究題目
                </SortableTableCell>
                <SortableTableCell sortKey="datePublished" activeSortKey={sortBy} sortOrder={sortOrder} onSort={handleSort}>
                  Date Published
                </SortableTableCell>
                <SortableTableCell sortKey="dateModified" activeSortKey={sortBy} sortOrder={sortOrder} onSort={handleSort}>
                  Date Modified
                </SortableTableCell>
                <SortableTableCell sortKey="datasetCount" activeSortKey={sortBy} sortOrder={sortOrder} onSort={handleSort}>
                  Datasets
                </SortableTableCell>
                <SortableTableCell sortKey="accessRestrictions" activeSortKey={sortBy} sortOrder={sortOrder} onSort={handleSort}>
                  アクセス制限
                </SortableTableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Status</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>編集中</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => (
                <TableRow
                  key={r.humId}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigateToEdit(r.humId)}
                >
                  <TableCell sx={MONOSPACE_ID_SX}>
                    {r.humId}
                  </TableCell>
                  <TableCell>
                    <TruncatedText text={r.title.ja ?? "-"} />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {formatDateVersion(r.datePublished, 1)}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {formatDateVersion(r.dateModified, r.versionCount)}
                  </TableCell>
                  <TableCell>
                    <ExpandableDatasets count={r.datasetCount} datasetIds={r.datasetIds} />
                  </TableCell>
                  <TableCell>
                    <AccessRestrictionsList restrictions={r.accessRestrictions} />
                  </TableCell>
                  <TableCell>
                    <CurationStatusChip status={r.curationStatus} />
                  </TableCell>
                  <TableCell>
                    {r.editingBy !== null && isLockActive(r.editingAt) && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LockIcon sx={{ fontSize: "0.875rem", color: "warning.main" }} />
                        <Typography variant="body2" noWrap>{r.editingByName}</Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="編集">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigateToEdit(r.humId)
                        }}
                        aria-label={`Edit ${r.humId}`}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No researches found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  )
}
