import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import TextField from "@mui/material/TextField"

import { PanelDialog } from "@/components/common/PanelDialog"
import { useAllDatasetIds } from "@/hooks/use-all-dataset-ids"
import { useCreateDataset } from "@/hooks/use-create-dataset"
import { useDialogDraft } from "@/hooks/use-dialog-draft"
import type { CriteriaCanonical } from "@/schemas/common"
import type { CreateDatasetBody } from "@/schemas/dataset"
import { DIALOG_MIN_WIDTH, FIELD_GROUP_GAP } from "@/theme"

const CRITERIA_OPTIONS: CriteriaCanonical[] = [
  "Controlled-access (Type I)",
  "Controlled-access (Type II)",
  "Unrestricted-access",
]

const createEmptyDraft = (): CreateDatasetBody => ({
  datasetId: "",
  version: "v1",
  humId: "",
  humVersionId: "",
  criteria: "Controlled-access (Type I)",
  typeOfData: { ja: null, en: null },
})

interface DatasetAddDialogProps {
  open: boolean
  humId: string
  humVersionId: string
  onClose: () => void
}

export const DatasetAddDialog = ({ open, humId, humVersionId, onClose }: DatasetAddDialogProps) => {
  const [draft, setDraft, submitted, setSubmitted] = useDialogDraft(open, () => ({
    ...createEmptyDraft(),
    humId,
    humVersionId,
  }))

  const createMutation = useCreateDataset(humId)
  const { data: allDatasetIdsData } = useAllDatasetIds()
  const existingIds = allDatasetIdsData?.datasetIds ?? []
  const isDuplicate = draft.datasetId.trim().length > 0 && existingIds.includes(draft.datasetId.trim())

  const isValid = draft.datasetId.trim().length > 0 && draft.version.trim().length > 0 && !isDuplicate

  const handleSubmit = () => {
    setSubmitted(true)
    if (!isValid) return

    createMutation.mutate(draft, {
      onSuccess: () => onClose(),
    })
  }

  return (
    <PanelDialog open={open} onClose={onClose} sx={{ "& .MuiDialog-paper": { minWidth: DIALOG_MIN_WIDTH } }}>
      <DialogTitle>データセットの追加</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP, pt: 1 }}>
          <TextField
            label="Dataset ID"
            value={draft.datasetId}
            onChange={(e) => setDraft((prev) => ({ ...prev, datasetId: e.target.value }))}
            error={(submitted && draft.datasetId.trim().length === 0) || isDuplicate}
            helperText={
              isDuplicate
                ? "この Dataset ID は既に使用されています"
                : submitted && draft.datasetId.trim().length === 0
                  ? "必須"
                  : undefined
            }
            fullWidth
            required
          />
          <TextField
            label="Version"
            value={draft.version}
            onChange={(e) => setDraft((prev) => ({ ...prev, version: e.target.value }))}
            error={submitted && draft.version.trim().length === 0}
            helperText={submitted && draft.version.trim().length === 0 ? "必須" : undefined}
            fullWidth
            required
          />
          <FormControl fullWidth>
            <InputLabel>Criteria</InputLabel>
            <Select
              value={draft.criteria}
              label="Criteria"
              onChange={(e) => setDraft((prev) => ({ ...prev, criteria: e.target.value as CriteriaCanonical }))}
            >
              {CRITERIA_OPTIONS.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Type of Data (JA)"
            value={draft.typeOfData.ja ?? ""}
            onChange={(e) => setDraft((prev) => ({
              ...prev,
              typeOfData: { ...prev.typeOfData, ja: e.target.value || null },
            }))}
            fullWidth
          />
          <TextField
            label="Type of Data (EN)"
            value={draft.typeOfData.en ?? ""}
            onChange={(e) => setDraft((prev) => ({
              ...prev,
              typeOfData: { ...prev.typeOfData, en: e.target.value || null },
            }))}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose}>キャンセル</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={createMutation.isPending}
        >
          作成
        </Button>
      </DialogActions>
    </PanelDialog>
  )
}
