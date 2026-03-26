import AddIcon from "@mui/icons-material/Add"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Checkbox from "@mui/material/Checkbox"
import FormControl from "@mui/material/FormControl"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormGroup from "@mui/material/FormGroup"
import IconButton from "@mui/material/IconButton"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Paper from "@mui/material/Paper"
import Select from "@mui/material/Select"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import { BilingualFormField } from "@/components/jga-form/BilingualFormField"
import { SectionHeader } from "@/components/SectionHeader"
import type { BilingualFormText, DsDataEntryForm } from "@/schemas/jga-form"
import { createDefaultDsDataEntry } from "@/schemas/jga-form"
import { FIELD_GROUP_GAP, INLINE_GAP, SECTION_GAP, SUBSECTION_GAP } from "@/theme"

interface DsDataArraySectionProps {
  data: DsDataEntryForm[]
  restriction: BilingualFormText
  releaseDate: string
  onDataChange: (value: DsDataEntryForm[]) => void
  onRestrictionChange: (value: BilingualFormText) => void
  onReleaseDateChange: (value: string) => void
}

const DATA_ACCESS_OPTIONS = [
  { value: "submission_open", label: "Open (制限なし)" },
  { value: "submission_type1", label: "Type I (制限公開)" },
  { value: "submission_type2", label: "Type II (制限公開)" },
] as const

const STUDY_TYPE_OPTIONS = [
  { value: "study_type_wgs", label: "Whole Genome (NGS)" },
  { value: "study_type_wes", label: "Whole Exome (NGS)" },
  { value: "study_type_target", label: "Target Capture (NGS)" },
  { value: "study_type_rnaseq", label: "RNA-seq (NGS)" },
  { value: "study_type_chipseq", label: "ChIP-seq (NGS)" },
  { value: "study_type_bisulfite", label: "Bisulfite-seq (NGS)" },
  { value: "study_type_snp", label: "SNP-chip / GWAS" },
  { value: "study_type_methylation", label: "メチル化アレイ" },
  { value: "study_type_metagenome", label: "メタゲノム" },
  { value: "study_type_image", label: "画像/音声/臨床情報" },
  { value: "study_type_other", label: "その他" },
] as const

export const DsDataArraySection = ({
  data,
  restriction,
  releaseDate,
  onDataChange,
  onRestrictionChange,
  onReleaseDateChange,
}: DsDataArraySectionProps) => {
  const handleAdd = () => {
    onDataChange([...data, createDefaultDsDataEntry()])
  }

  const handleRemove = (index: number) => {
    onDataChange(data.filter((_, i) => i !== index))
  }

  const handleChange = (
    index: number,
    field: keyof DsDataEntryForm,
    fieldValue: string,
  ) => {
    const updated = data.map((item, i) =>
      i === index ? { ...item, [field]: fieldValue } : item,
    )
    onDataChange(updated)
  }

  const handleToggleStudyType = (index: number, typeValue: string) => {
    const entry = data.at(index)
    if (!entry) return
    const current = entry.studyType ? entry.studyType.split(",") : []
    const updated = current.includes(typeValue)
      ? current.filter((v) => v !== typeValue)
      : [...current, typeValue]
    handleChange(index, "studyType", updated.join(","))
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
      <SectionHeader title="データ" size="medium" />

      <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
        <SectionHeader title="データの種類及び量" size="small" />
        {data.map((entry, index) => {
          const selectedTypes = entry.studyType ? entry.studyType.split(",") : []
          const showOther = selectedTypes.includes("study_type_other")

          return (
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

              <Box sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP }}>
                {/* データの種類 */}
                <FormControl size="small" sx={{ maxWidth: 300 }}>
                  <InputLabel>データの種類</InputLabel>
                  <Select
                    value={entry.dataAccess}
                    label="データの種類"
                    onChange={(e) =>
                      handleChange(index, "dataAccess", e.target.value)
                    }
                  >
                    <MenuItem value="">
                      <em>未選択</em>
                    </MenuItem>
                    {DATA_ACCESS_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* タイプ (チェックボックス群) */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    タイプ
                  </Typography>
                  <FormGroup row sx={{ gap: 0 }}>
                    {STUDY_TYPE_OPTIONS.map((opt) => (
                      <FormControlLabel
                        key={opt.value}
                        control={
                          <Checkbox
                            checked={selectedTypes.includes(opt.value)}
                            onChange={() => handleToggleStudyType(index, opt.value)}
                            size="small"
                          />
                        }
                        label={opt.label}
                        sx={{ mr: 2 }}
                      />
                    ))}
                  </FormGroup>
                  {showOther && (
                    <TextField
                      label="タイプ（その他）"
                      value={entry.studyTypeOther}
                      onChange={(e) =>
                        handleChange(index, "studyTypeOther", e.target.value)
                      }
                      size="small"
                      sx={{ mt: 1, maxWidth: 400 }}
                    />
                  )}
                </Box>

                {/* 対象領域 */}
                <TextField
                  label="対象領域"
                  helperText="一部のゲノム領域を解析対象としている場合は、対象とする領域、例えば対象遺伝子や染色体上のポジションの範囲を記載して下さい。"
                  value={entry.target}
                  onChange={(e) => handleChange(index, "target", e.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                />

                {/* ファイル形式 / 総データ量 */}
                <Box sx={{ display: "flex", gap: INLINE_GAP }}>
                  <TextField
                    label="ファイル形式"
                    value={entry.fileFormat}
                    onChange={(e) =>
                      handleChange(index, "fileFormat", e.target.value)
                    }
                    fullWidth
                  />
                  <TextField
                    label="総データ量"
                    value={entry.fileSize}
                    onChange={(e) =>
                      handleChange(index, "fileSize", e.target.value)
                    }
                    fullWidth
                  />
                </Box>
              </Box>
            </Paper>
          )
        })}
        <Button
          startIcon={<AddIcon />}
          onClick={handleAdd}
          variant="outlined"
          size="small"
          sx={{ alignSelf: "flex-start" }}
        >
          別の「データの種類」を入力する
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
        <SectionHeader title="制限事項" size="small" />
        <Typography variant="body2" color="text.secondary">
          データの利用に当たってインフォームドコンセントの中で規定されている制限事項（研究対象疾患の制限等）がある場合は入力して下さい。登録されたデータが公開された後、当該データの利用を希望される研究者が満たすべき要件になります。NBDCヒトデータ共有ガイドラインに沿ったデータの利用を求める場合は「NBDC
          policy」と記載して下さい。
        </Typography>
        <BilingualFormField
          label="制限事項"
          value={restriction}
          onChange={onRestrictionChange}
          multiline
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
        <SectionHeader title="公開予定日" size="small" />
        <TextField
          label="データ公開予定日"
          type="date"
          value={releaseDate}
          onChange={(e) => onReleaseDateChange(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ maxWidth: 300 }}
        />
      </Box>
    </Box>
  )
}
