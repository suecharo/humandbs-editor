import AddOutlined from "@mui/icons-material/AddOutlined"
import DeleteOutlined from "@mui/icons-material/DeleteOutlined"
import SaveOutlined from "@mui/icons-material/SaveOutlined"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import CircularProgress from "@mui/material/CircularProgress"
import FormControl from "@mui/material/FormControl"
import IconButton from "@mui/material/IconButton"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Paper from "@mui/material/Paper"
import Select from "@mui/material/Select"
import TextField from "@mui/material/TextField"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import equal from "fast-deep-equal"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { useCallback } from "react"

import { SectionCurationToggle } from "@/components/research-edit/SectionCurationToggle"
import { SectionHeader } from "@/components/SectionHeader"
import { useSaveDataset } from "@/hooks/use-save-dataset"
import type { CriteriaCanonical } from "@/schemas/common"
import type { Dataset, Experiment } from "@/schemas/dataset"
import { createDefaultExperiment } from "@/schemas/defaults"
import type { SectionCurationStatus } from "@/schemas/editor-state"
import { datasetsDraftAtom, datasetsServerAtom } from "@/stores/research-edit"
import { COMPACT_GAP, FIELD_GROUP_GAP, FORM_LABEL_SX, INLINE_GAP, MODIFIED_FIELD_SX, MODIFIED_INDICATOR_COLOR, MONOSPACE_ID_SX, SUBSECTION_GAP } from "@/theme"

import { ExperimentCard } from "./ExperimentCard"

const CRITERIA_OPTIONS: CriteriaCanonical[] = [
  "Controlled-access (Type I)",
  "Controlled-access (Type II)",
  "Unrestricted-access",
]

interface DatasetCardProps {
  datasetKey: string
  datasetId: string
  version: string
  isLoading: boolean
  curationStatus: SectionCurationStatus
  onToggleCuration: () => void
  onRemove: () => void
}

export const DatasetCard = ({ datasetKey, datasetId, version, isLoading, curationStatus, onToggleCuration, onRemove }: DatasetCardProps) => {
  const saveMutation = useSaveDataset()
  const [datasetsDraft, setDatasetsDraft] = useAtom(datasetsDraftAtom)
  const datasetsServer = useAtomValue(datasetsServerAtom)
  const setDatasetsServer = useSetAtom(datasetsServerAtom)
  const draft = datasetsDraft[datasetKey] ?? null
  const serverDataset = datasetsServer[datasetKey] ?? null
  const isDirty = draft !== null && serverDataset !== null && !equal(draft, serverDataset)

  const updateDraft = useCallback((updater: (d: Dataset) => Dataset) => {
    setDatasetsDraft((prev) => {
      const current = prev[datasetKey]
      if (!current) return prev

      return { ...prev, [datasetKey]: updater(current) }
    })
  }, [datasetKey, setDatasetsDraft])

  const handleSave = () => {
    if (!draft) return
    saveMutation.mutate(draft, {
      onSuccess: ({ data: saved }) => {
        const key = `${saved.datasetId}-${saved.version}`
        setDatasetsServer((prev) => ({ ...prev, [key]: saved }))
        setDatasetsDraft((prev) => ({ ...prev, [key]: structuredClone(saved) }))
      },
    })
  }

  const handleDiscard = () => {
    if (!serverDataset) return
    setDatasetsDraft((prev) => ({ ...prev, [datasetKey]: structuredClone(serverDataset) }))
  }

  // Experiment operations
  const handleAddExperiment = () => {
    updateDraft((d) => ({ ...d, experiments: [...d.experiments, createDefaultExperiment()] }))
  }

  const handleUpdateExperiment = (index: number, experiment: Experiment) => {
    updateDraft((d) => ({ ...d, experiments: d.experiments.map((e, i) => (i === index ? experiment : e)) }))
  }

  const handleRemoveExperiment = (index: number) => {
    updateDraft((d) => ({ ...d, experiments: d.experiments.filter((_, i) => i !== index) }))
  }

  const handleMoveExperiment = (index: number, direction: "up" | "down") => {
    updateDraft((d) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= d.experiments.length) return d
      const next = [...d.experiments]
      const a = next[index]
      const b = next[targetIndex]
      if (a === undefined || b === undefined) return d
      next[index] = b
      next[targetIndex] = a

      return { ...d, experiments: next }
    })
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      {/* Header: ID + version + release date + actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: INLINE_GAP, mb: SUBSECTION_GAP }}>
        <Typography variant="body2" fontWeight={600} sx={MONOSPACE_ID_SX}>
          {datasetId}
        </Typography>
        <Chip label={version} size="small" variant="outlined" />
        {draft?.releaseDate && (
          <Typography variant="caption" color="text.secondary">
            {draft.releaseDate}
          </Typography>
        )}
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: INLINE_GAP }}>
          {isDirty && (
            <Chip label="Modified" size="small" sx={{
              height: 20,
              fontSize: "0.6875rem",
              fontWeight: 600,
              bgcolor: MODIFIED_INDICATOR_COLOR,
              color: "#fff",
            }} />
          )}
          <Button size="small" variant="outlined" disabled={!isDirty} onClick={handleDiscard}>
            破棄
          </Button>
          <Button size="small" variant="contained" disabled={!isDirty || saveMutation.isPending}
            onClick={handleSave} startIcon={<SaveOutlined />}>
            保存
          </Button>
          <SectionCurationToggle
            status={curationStatus}
            onToggle={onToggleCuration}
          />
          <Tooltip title="Remove dataset">
            <IconButton size="small" color="error" onClick={onRemove} aria-label={`remove dataset ${datasetId}`}>
              <DeleteOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {isLoading && !draft && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {draft && (
        <>
          {/* Criteria + Type of Data */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP }}>
            <FormControl fullWidth size="small" sx={serverDataset && draft.criteria !== serverDataset.criteria ? MODIFIED_FIELD_SX : undefined}>
              <InputLabel>Criteria</InputLabel>
              <Select
                value={draft.criteria}
                label="Criteria"
                onChange={(e) => updateDraft((d) => ({ ...d, criteria: e.target.value as CriteriaCanonical }))}
              >
                {CRITERIA_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="body2" sx={{ ...FORM_LABEL_SX, mb: COMPACT_GAP }}>
                Type of Data
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP }}>
                <TextField
                  label="JA"
                  value={draft.typeOfData.ja ?? ""}
                  onChange={(e) => updateDraft((d) => ({
                    ...d,
                    typeOfData: { ...d.typeOfData, ja: e.target.value || null },
                  }))}
                  fullWidth
                  sx={serverDataset && draft.typeOfData.ja !== serverDataset.typeOfData.ja ? MODIFIED_FIELD_SX : undefined}
                />
                <TextField
                  label="EN"
                  value={draft.typeOfData.en ?? ""}
                  onChange={(e) => updateDraft((d) => ({
                    ...d,
                    typeOfData: { ...d.typeOfData, en: e.target.value || null },
                  }))}
                  fullWidth
                  sx={serverDataset && draft.typeOfData.en !== serverDataset.typeOfData.en ? MODIFIED_FIELD_SX : undefined}
                />
              </Box>
            </Box>
          </Box>

          {/* Experiments */}
          <Box sx={{ mt: SUBSECTION_GAP }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: SUBSECTION_GAP }}>
              <SectionHeader title="Experiments" size="small" subtitle={`${draft.experiments.length} 件`} />
              <Button variant="outlined" size="small" startIcon={<AddOutlined />} onClick={handleAddExperiment}>
                追加
              </Button>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
              {draft.experiments.map((experiment, index) => (
                <ExperimentCard
                  key={index}
                  experiment={experiment}
                  serverExperiment={serverDataset?.experiments[index]}
                  index={index}
                  total={draft.experiments.length}
                  onChange={(updated) => handleUpdateExperiment(index, updated)}
                  onRemove={() => handleRemoveExperiment(index)}
                  onMoveUp={() => handleMoveExperiment(index, "up")}
                  onMoveDown={() => handleMoveExperiment(index, "down")}
                />
              ))}
            </Box>
            {draft.experiments.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                No experiments
              </Typography>
            )}
          </Box>
        </>
      )}
    </Paper>
  )
}
