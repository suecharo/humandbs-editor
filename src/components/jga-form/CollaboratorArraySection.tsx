import AddIcon from "@mui/icons-material/Add"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import FormControl from "@mui/material/FormControl"
import FormControlLabel from "@mui/material/FormControlLabel"
import IconButton from "@mui/material/IconButton"
import Paper from "@mui/material/Paper"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import { SectionHeader } from "@/components/SectionHeader"
import type { CollaboratorForm } from "@/schemas/jga-form"
import { createDefaultCollaborator } from "@/schemas/jga-form"
import { FIELD_GROUP_GAP, FORM_LABEL_SX, INLINE_GAP, SUBSECTION_GAP } from "@/theme"

interface CollaboratorArraySectionProps {
  value: CollaboratorForm[]
  onChange: (value: CollaboratorForm[]) => void
}

export const CollaboratorArraySection = ({
  value,
  onChange,
}: CollaboratorArraySectionProps) => {
  const handleAdd = () => {
    onChange([...value, createDefaultCollaborator()])
  }

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleChange = (
    index: number,
    field: keyof CollaboratorForm,
    fieldValue: string,
  ) => {
    const updated = value.map((item, i) =>
      i === index ? { ...item, [field]: fieldValue } : item,
    )
    onChange(updated)
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
      <SectionHeader title="その他の研究分担者および受託者" size="small" />
      <Typography variant="body2" color="text.secondary">
        データを直接ダウンロードする必要のない研究分担者 (DDBJ アカウント不要)。受託者の場合は「研究分担者名」に受託機関名を記入。
      </Typography>
      {value.map((collaborator, index) => (
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
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: INLINE_GAP,
            }}
          >
            <TextField
              label="研究分担者名"
              value={collaborator.name}
              onChange={(e) => handleChange(index, "name", e.target.value)}
            />
            <TextField
              label="部署名"
              value={collaborator.division}
              onChange={(e) => handleChange(index, "division", e.target.value)}
            />
            <TextField
              label="職名"
              value={collaborator.job}
              onChange={(e) => handleChange(index, "job", e.target.value)}
            />
            <TextField
              label="e-Rad ID"
              value={collaborator.eradid}
              onChange={(e) => handleChange(index, "eradid", e.target.value)}
            />
            <TextField
              label="ORCID"
              value={collaborator.orcid}
              onChange={(e) => handleChange(index, "orcid", e.target.value)}
            />
          </Box>
          <Box sx={{ mt: FIELD_GROUP_GAP }}>
            <Typography variant="body2" sx={FORM_LABEL_SX}>
              倫理講習受講
            </Typography>
            <FormControl>
              <RadioGroup
                row
                value={collaborator.seminar}
                onChange={(e) => handleChange(index, "seminar", e.target.value)}
              >
                <FormControlLabel
                  value="yes"
                  control={<Radio size="small" />}
                  label="受講済です"
                />
                <FormControlLabel
                  value="no"
                  control={<Radio size="small" />}
                  label="未受講です"
                />
              </RadioGroup>
            </FormControl>
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
        研究分担者を追加
      </Button>
    </Box>
  )
}
