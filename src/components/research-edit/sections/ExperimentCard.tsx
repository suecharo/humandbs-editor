import AddOutlined from "@mui/icons-material/AddOutlined"
import DeleteOutlined from "@mui/icons-material/DeleteOutlined"
import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined"
import KeyboardArrowUpOutlined from "@mui/icons-material/KeyboardArrowUpOutlined"
import Autocomplete from "@mui/material/Autocomplete"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import IconButton from "@mui/material/IconButton"
import InputBase from "@mui/material/InputBase"
import Paper from "@mui/material/Paper"
import Tab from "@mui/material/Tab"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Tabs from "@mui/material/Tabs"
import TextField from "@mui/material/TextField"
import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import equal from "fast-deep-equal"
import { useMemo, useState } from "react"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import moldataHeaders from "@/data/moldata-headers.json"
import type { Experiment, SearchableExperimentFields } from "@/schemas/dataset"
import { createDefaultSearchableFields } from "@/schemas/defaults"
import { COMPACT_GAP, INLINE_GAP, MODIFIED_FIELD_BG, MODIFIED_INDICATOR_COLOR, SUBSECTION_GAP, TAB_CONTENT_PADDING, TOGGLE_BUTTON_BORDER_RADIUS } from "@/theme"

import { SearchableFieldsEditor } from "./SearchableFieldsEditor"

interface MoldataHeader { en: string; ja: string }

const headerByEn = new Map<string, MoldataHeader>(
  moldataHeaders.map((h) => [h.en, h]),
)

const keyLabel = (key: string, lang: "ja" | "en"): string => {
  const header = headerByEn.get(key)
  if (!header) return key

  return header[lang]
}

interface ExperimentCardProps {
  experiment: Experiment
  serverExperiment?: Experiment | undefined
  index: number
  total: number
  onChange: (experiment: Experiment) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

const experimentLabel = (experiment: Experiment, index: number): string => {
  const assayTypes = experiment.searchable?.assayType ?? []
  if (assayTypes.length > 0) return assayTypes.join(", ")

  return `Experiment ${index + 1}`
}

export const ExperimentCard = ({
  experiment,
  serverExperiment,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: ExperimentCardProps) => {
  const [tab, setTab] = useState(0)
  const [selectedHeader, setSelectedHeader] = useState<MoldataHeader | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [keyLang, setKeyLang] = useState<"ja" | "en">("en")

  const experimentModified = serverExperiment !== undefined && !equal(experiment, serverExperiment)

  const isCellModified = (key: string, lang: "ja" | "en"): boolean => {
    if (!serverExperiment) return false

    return experiment.data[key]?.[lang]?.text !== serverExperiment.data[key]?.[lang]?.text
  }

  const dataKeys = Object.keys(experiment.data)

  const availableHeaders = useMemo(
    () => moldataHeaders.filter((h) => !(h.en in experiment.data)),
    [experiment.data],
  )

  const handleAddDataKey = () => {
    if (!selectedHeader || selectedHeader.en in experiment.data) return

    onChange({
      ...experiment,
      data: {
        ...experiment.data,
        [selectedHeader.en]: { ja: { text: "", rawHtml: "" }, en: { text: "", rawHtml: "" } },
      },
    })
    setSelectedHeader(null)
  }

  const handleRemoveDataKey = (key: string) => {
    const { [key]: _, ...rest } = experiment.data
    onChange({ ...experiment, data: rest })
  }

  const handleDataValueChange = (key: string, lang: "ja" | "en", text: string) => {
    const current = experiment.data[key]
    const langValue = current?.[lang]

    onChange({
      ...experiment,
      data: {
        ...experiment.data,
        [key]: {
          ...current,
          ja: current?.ja ?? null,
          en: current?.en ?? null,
          [lang]: langValue
            ? { ...langValue, text }
            : { text, rawHtml: "" },
        },
      },
    })
  }

  const handleSearchableChange = (searchable: SearchableExperimentFields) => {
    onChange({ ...experiment, searchable })
  }

  const prefix = `experiment-${index}`

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      {/* Header */}
      <Box sx={{
        display: "flex",
        alignItems: "center",
        gap: INLINE_GAP,
        px: 2,
        py: 1,
        bgcolor: "background.default",
        borderBottom: 1,
        borderColor: "divider",
      }}>
        <Typography variant="body2" fontWeight={600} sx={{ flexGrow: 1 }}>
          {experimentLabel(experiment, index)}
        </Typography>
        {experimentModified && (
          <Chip label="Modified" size="small" sx={{
            height: 20,
            fontSize: "0.6875rem",
            fontWeight: 600,
            bgcolor: MODIFIED_INDICATOR_COLOR,
            color: "#fff",
          }} />
        )}
        <Box sx={{ display: "flex", gap: COMPACT_GAP }}>
          <Tooltip title="Move Up">
            <span>
              <IconButton size="small" onClick={onMoveUp} disabled={index === 0}>
                <KeyboardArrowUpOutlined fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Move Down">
            <span>
              <IconButton size="small" onClick={onMoveDown} disabled={index === total - 1}>
                <KeyboardArrowDownOutlined fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => setConfirmDelete(true)} color="error">
              <DeleteOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <ConfirmDialog
        open={confirmDelete}
        title="Experiment の削除"
        confirmLabel="削除"
        confirmColor="error"
        onConfirm={() => { setConfirmDelete(false); onRemove() }}
        onCancel={() => setConfirmDelete(false)}
      >
        {`${experimentLabel(experiment, index)} を削除しますか？`}
      </ConfirmDialog>

      {/* Data / Searchable tabs */}
      <Tabs
        value={tab}
        onChange={(_, v: number) => setTab(v)}
        sx={{ px: 1, borderBottom: 1, borderColor: "divider", minHeight: 36 }}
      >
        <Tab
          label="Mol Data"
          id={`${prefix}-tab-0`}
          aria-controls={`${prefix}-tabpanel-0`}
          sx={{ minHeight: 36, py: 0 }}
        />
        <Tab
          label="Searchable"
          id={`${prefix}-tab-1`}
          aria-controls={`${prefix}-tabpanel-1`}
          sx={{ minHeight: 36, py: 0 }}
        />
      </Tabs>

      {/* Tab content */}
      <Box sx={{ p: TAB_CONTENT_PADDING }}>
        {/* Data tab */}
        <div
          role="tabpanel"
          id={`${prefix}-tabpanel-0`}
          aria-labelledby={`${prefix}-tab-0`}
          hidden={tab !== 0}
        >
          {tab === 0 && (
            <Box>
              <Table size="small" sx={{ tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "20%" }}>Key</TableCell>
                    <TableCell sx={{ width: "37%" }}>JA</TableCell>
                    <TableCell sx={{ width: "37%" }}>EN</TableCell>
                    <TableCell sx={{ width: "6%", p: 0 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataKeys.map((key) => (
                    <TableRow key={key} sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                      <TableCell sx={{ verticalAlign: "top", py: 1 }}>
                        <Tooltip title={keyLang === "en" ? keyLabel(key, "ja") : keyLabel(key, "en")}>
                          <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: "break-word" }}>
                            {keyLabel(key, keyLang)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ p: 0.5 }}>
                        <InputBase
                          value={experiment.data[key]?.ja?.text ?? ""}
                          onChange={(e) => handleDataValueChange(key, "ja", e.target.value)}
                          fullWidth
                          multiline
                          sx={{
                            fontSize: "0.8125rem",
                            px: 1,
                            py: 0.5,
                            borderRadius: 0.5,
                            ...(isCellModified(key, "ja") && { bgcolor: MODIFIED_FIELD_BG }),
                            "&:hover": { bgcolor: isCellModified(key, "ja") ? MODIFIED_FIELD_BG : "action.hover" },
                            "&.Mui-focused": { bgcolor: "background.paper", outline: "1px solid", outlineColor: "primary.main" },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ p: 0.5 }}>
                        <InputBase
                          value={experiment.data[key]?.en?.text ?? ""}
                          onChange={(e) => handleDataValueChange(key, "en", e.target.value)}
                          fullWidth
                          multiline
                          sx={{
                            fontSize: "0.8125rem",
                            px: 1,
                            py: 0.5,
                            borderRadius: 0.5,
                            ...(isCellModified(key, "en") && { bgcolor: MODIFIED_FIELD_BG }),
                            "&:hover": { bgcolor: isCellModified(key, "en") ? MODIFIED_FIELD_BG : "action.hover" },
                            "&.Mui-focused": { bgcolor: "background.paper", outline: "1px solid", outlineColor: "primary.main" },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ p: 0, textAlign: "center", verticalAlign: "middle" }}>
                        <Tooltip title="Delete key">
                          <IconButton size="small" onClick={() => handleRemoveDataKey(key)} color="error">
                            <DeleteOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box sx={{ display: "flex", gap: INLINE_GAP, alignItems: "center", mt: SUBSECTION_GAP, px: 1 }}>
                <Autocomplete
                  size="small"
                  options={availableHeaders}
                  getOptionLabel={(option) => keyLang === "ja" ? `${option.ja}（${option.en}）` : `${option.en}（${option.ja}）`}
                  value={selectedHeader}
                  onChange={(_, v) => setSelectedHeader(v)}
                  renderInput={(params) => <TextField {...params} label="キー選択" />}
                  sx={{ minWidth: 300 }}
                />
                <IconButton
                  size="small"
                  color="primary"
                  onClick={handleAddDataKey}
                  disabled={!selectedHeader}
                >
                  <AddOutlined />
                </IconButton>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>Key 表示言語</Typography>
                <ToggleButtonGroup
                  value={keyLang}
                  exclusive
                  size="small"
                  onChange={(_, v: "ja" | "en" | null) => { if (v) setKeyLang(v) }}
                >
                  <ToggleButton value="ja" sx={{ py: 0, px: 1, fontSize: "0.75rem", borderRadius: TOGGLE_BUTTON_BORDER_RADIUS }}>JA</ToggleButton>
                  <ToggleButton value="en" sx={{ py: 0, px: 1, fontSize: "0.75rem", borderRadius: TOGGLE_BUTTON_BORDER_RADIUS }}>EN</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
          )}
        </div>

        {/* Searchable tab */}
        <div
          role="tabpanel"
          id={`${prefix}-tabpanel-1`}
          aria-labelledby={`${prefix}-tab-1`}
          hidden={tab !== 1}
        >
          {tab === 1 && (
            experiment.searchable ? (
              <SearchableFieldsEditor
                fields={experiment.searchable}
                serverFields={serverExperiment?.searchable}
                onChange={handleSearchableChange}
              />
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Searchable fields are not set.
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onChange({ ...experiment, searchable: createDefaultSearchableFields() })}
                >
                  Initialize Searchable Fields
                </Button>
              </Box>
            )
          )}
        </div>
      </Box>
    </Paper>
  )
}
