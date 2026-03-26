import AddIcon from "@mui/icons-material/Add"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import Paper from "@mui/material/Paper"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import { SectionHeader } from "@/components/SectionHeader"
import type { UseDatasetForm } from "@/schemas/jga-form"
import { createDefaultUseDataset } from "@/schemas/jga-form"
import { FIELD_GROUP_GAP, INLINE_GAP, SUBSECTION_GAP } from "@/theme"

interface DuDatasetArraySectionProps {
  value: UseDatasetForm[]
  onChange: (value: UseDatasetForm[]) => void
}

export const DuDatasetArraySection = ({
  value,
  onChange,
}: DuDatasetArraySectionProps) => {
  const handleAdd = () => {
    onChange([...value, createDefaultUseDataset()])
  }

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleChange = (
    index: number,
    field: keyof UseDatasetForm,
    fieldValue: string,
  ) => {
    const updated = value.map((item, i) =>
      i === index ? { ...item, [field]: fieldValue } : item,
    )
    onChange(updated)
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
      <SectionHeader title="利用を希望するデータと利用目的" size="small" />
      <Typography variant="body2" color="text.secondary">
        NBDC 研究データ一覧（https://humandbs.dbcls.jp/）、もしくは、DDBJ Search
        で使いたいデータセットを検索し、データセット ID を入力してください。
      </Typography>
      {value.map((dataset, index) => (
        <Paper key={index} variant="outlined" sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: FIELD_GROUP_GAP,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              #{index + 1}
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleRemove(index)}
              color="error"
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", gap: INLINE_GAP }}>
            <TextField
              label="データセット ID"
              value={dataset.request}
              onChange={(e) => handleChange(index, "request", e.target.value)}
              fullWidth
            />
            <TextField
              label="データセットIDの利用目的"
              value={dataset.purpose}
              onChange={(e) => handleChange(index, "purpose", e.target.value)}
              fullWidth
            />
          </Box>
        </Paper>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={handleAdd}
        variant="outlined"
        size="small"
        sx={{ alignSelf: "flex-start" }}
      >
        データセットを追加
      </Button>
    </Box>
  )
}
