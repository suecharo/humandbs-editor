import SearchIcon from "@mui/icons-material/Search"
import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import Container from "@mui/material/Container"
import FormControl from "@mui/material/FormControl"
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
import Typography from "@mui/material/Typography"
import { useNavigate } from "@tanstack/react-router"
import { useState, useMemo } from "react"

import { CurationStatusChip } from "../components/CurationStatusChip"
import { useResearches } from "../hooks/use-researches"
import { CONTENT_MARGIN_Y, MONOSPACE_ID_SX } from "../theme"

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "uncurated", label: "Uncurated" },
  { value: "in-progress", label: "In Progress" },
  { value: "curated", label: "Curated" },
] as const

export const ResearchListPage = () => {
  const { data: researches, isLoading, error } = useResearches()
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filtered = useMemo(() => {
    if (!researches) {
      return []
    }
    const lowerSearch = searchText.toLowerCase()

    return researches.filter((r) => {
      if (statusFilter !== "all" && r.curationStatus !== statusFilter) {
        return false
      }
      if (lowerSearch) {
        const matchesHumId = r.humId.toLowerCase().includes(lowerSearch)
        const matchesTitleJa = r.title.ja?.toLowerCase().includes(lowerSearch) ?? false
        const matchesTitleEn = r.title.en?.toLowerCase().includes(lowerSearch) ?? false
        if (!matchesHumId && !matchesTitleJa && !matchesTitleEn) {
          return false
        }
      }

      return true
    })
  }, [researches, searchText, statusFilter])

  const handleStatusChange = (e: SelectChangeEvent) => {
    setStatusFilter(e.target.value)
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
      <Typography variant="h1" sx={{ mb: 3 }}>Researches</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
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
      </Box>

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>HUM ID</TableCell>
                <TableCell>Title (JA)</TableCell>
                <TableCell>Title (EN)</TableCell>
                <TableCell align="right">Datasets</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => (
                <TableRow
                  key={r.humId}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate({ to: "/research/$humId", params: { humId: r.humId } })}
                >
                  <TableCell sx={MONOSPACE_ID_SX}>
                    {r.humId}
                  </TableCell>
                  <TableCell>{r.title.ja ?? "-"}</TableCell>
                  <TableCell>{r.title.en ?? "-"}</TableCell>
                  <TableCell align="right">{r.datasetCount}</TableCell>
                  <TableCell>
                    <CurationStatusChip status={r.curationStatus} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
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

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {filtered.length} / {researches?.length ?? 0} researches
      </Typography>
    </Container>
  )
}
