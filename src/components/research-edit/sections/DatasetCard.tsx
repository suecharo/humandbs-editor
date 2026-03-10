import AddOutlined from "@mui/icons-material/AddOutlined"
import DeleteOutlined from "@mui/icons-material/DeleteOutlined"
import SaveOutlined from "@mui/icons-material/SaveOutlined"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import CircularProgress from "@mui/material/CircularProgress"
import Divider from "@mui/material/Divider"
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
import { useState } from "react"

import { SectionHeader } from "@/components/SectionHeader"
import { useSaveDataset } from "@/hooks/use-save-dataset"
import type { CriteriaCanonical } from "@/schemas/common"
import type { Dataset, Experiment } from "@/schemas/dataset"
import { createDefaultExperiment } from "@/schemas/defaults"
import { FIELD_GROUP_GAP, FORM_LABEL_SX, MONOSPACE_ID_SX, SUBSECTION_GAP } from "@/theme"

import { ExperimentAccordion } from "./ExperimentAccordion"

const CRITERIA_OPTIONS: CriteriaCanonical[] = [
  "Controlled-access (Type I)",
  "Controlled-access (Type II)",
  "Unrestricted-access",
]

interface DatasetCardProps {
  datasetId: string
  version: string
  dataset: Dataset | undefined
  isLoading: boolean
  onRemove: () => void
}

export const DatasetCard = ({ datasetId, version, dataset, isLoading, onRemove }: DatasetCardProps) => {
  const saveMutation = useSaveDataset()
  const [draft, setDraft] = useState<Dataset | null>(null)
  const [prevDataset, setPrevDataset] = useState<Dataset | undefined>(undefined)

  // Sync server → draft (render-phase state derivation)
  if (dataset !== prevDataset) {
    setPrevDataset(dataset)
    if (dataset) setDraft(structuredClone(dataset))
  }

  const isDirty = draft !== null && dataset !== undefined && !equal(draft, dataset)

  const handleSave = () => {
    if (!draft) return
    saveMutation.mutate(draft)
  }

  const handleDiscard = () => {
    if (dataset) setDraft(structuredClone(dataset))
  }

  // Experiment operations
  const handleAddExperiment = () => {
    if (!draft) return
    setDraft({ ...draft, experiments: [...draft.experiments, createDefaultExperiment()] })
  }

  const handleUpdateExperiment = (index: number, experiment: Experiment) => {
    if (!draft) return
    setDraft({ ...draft, experiments: draft.experiments.map((e, i) => (i === index ? experiment : e)) })
  }

  const handleRemoveExperiment = (index: number) => {
    if (!draft) return
    setDraft({ ...draft, experiments: draft.experiments.filter((_, i) => i !== index) })
  }

  const handleMoveExperiment = (index: number, direction: "up" | "down") => {
    if (!draft) return
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= draft.experiments.length) return
    const next = [...draft.experiments]
    const a = next[index]
    const b = next[targetIndex]
    if (a === undefined || b === undefined) return
    next[index] = b
    next[targetIndex] = a
    setDraft({ ...draft, experiments: next })
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      {/* Header: ID + version + release date + actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Typography variant="body2" fontWeight={600} sx={MONOSPACE_ID_SX}>
          {datasetId}
        </Typography>
        <Chip label={version} size="small" variant="outlined" />
        {dataset?.releaseDate && (
          <Typography variant="caption" color="text.secondary">
            {dataset.releaseDate}
          </Typography>
        )}
        <Box sx={{ ml: "auto" }}>
          <Tooltip title="Remove dataset">
            <IconButton size="small" color="error" onClick={onRemove} aria-label={`remove dataset ${datasetId}`}>
              <DeleteOutlined sx={{ fontSize: "1.125rem" }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {draft && (
        <>
          {/* Criteria + Type of Data */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP }}>
            <FormControl fullWidth>
              <InputLabel>Criteria</InputLabel>
              <Select
                value={draft.criteria}
                label="Criteria"
                onChange={(e) => setDraft({ ...draft, criteria: e.target.value as CriteriaCanonical })}
              >
                {CRITERIA_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="body2" sx={{ ...FORM_LABEL_SX, mb: 1 }}>
                Type of Data
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP }}>
                <TextField
                  label="JA"
                  value={draft.typeOfData.ja ?? ""}
                  onChange={(e) => setDraft({
                    ...draft,
                    typeOfData: { ...draft.typeOfData, ja: e.target.value || null },
                  })}
                  fullWidth
                />
                <TextField
                  label="EN"
                  value={draft.typeOfData.en ?? ""}
                  onChange={(e) => setDraft({
                    ...draft,
                    typeOfData: { ...draft.typeOfData, en: e.target.value || null },
                  })}
                  fullWidth
                />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: SUBSECTION_GAP }} />

          {/* Experiments */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: SUBSECTION_GAP }}>
              <SectionHeader title="Experiments" size="small" subtitle={`${draft.experiments.length} 件`} />
              <Button variant="outlined" size="small" startIcon={<AddOutlined />} onClick={handleAddExperiment}>
                追加
              </Button>
            </Box>
            {draft.experiments.map((experiment, index) => (
              <ExperimentAccordion
                key={index}
                experiment={experiment}
                index={index}
                total={draft.experiments.length}
                onChange={(updated) => handleUpdateExperiment(index, updated)}
                onRemove={() => handleRemoveExperiment(index)}
                onMoveUp={() => handleMoveExperiment(index, "up")}
                onMoveDown={() => handleMoveExperiment(index, "down")}
              />
            ))}
            {draft.experiments.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                No experiments
              </Typography>
            )}
          </Box>

          {/* Save / Discard */}
          {isDirty && (
            <>
              <Divider sx={{ my: SUBSECTION_GAP }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button variant="outlined" color="secondary" onClick={handleDiscard}>
                  変更を破棄
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  startIcon={<SaveOutlined />}
                >
                  保存
                </Button>
              </Box>
            </>
          )}
        </>
      )}
    </Paper>
  )
}
