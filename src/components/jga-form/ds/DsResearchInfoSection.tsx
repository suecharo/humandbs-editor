import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import { BilingualFormField } from "@/components/jga-form/BilingualFormField"
import { SectionHeader } from "@/components/SectionHeader"
import type { DsFormData } from "@/schemas/jga-form"
import { SECTION_GAP, SUBSECTION_GAP } from "@/theme"

interface DsResearchInfoSectionProps {
  form: DsFormData
  onChange: (form: DsFormData) => void
}

export const DsResearchInfoSection = ({
  form,
  onChange,
}: DsResearchInfoSectionProps) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
    <SectionHeader title="研究内容" size="medium" />

    <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
      <SectionHeader title="研究内容の概要" size="small" />
      <Typography variant="body2" color="text.secondary">
        倫理審査委員会による承認および所属機関の長により許可を受けた研究計画書全体の研究内容を記載して下さい。
      </Typography>
      <BilingualFormField
        label="目的"
        value={form.aim}
        onChange={(aim) => onChange({ ...form, aim })}
        multiline
      />
      <BilingualFormField
        label="対象"
        helperText="今回登録いただくデータについてのみ記載して下さい。対象としている集団の呼称名（健常集団である場合はその旨）、対象者数、同一症例から複数検体を解析対象としている場合は検体の種類とそれぞれの検体数について、解析手法毎に記載して下さい。"
        value={form.participant}
        onChange={(participant) => onChange({ ...form, participant })}
        multiline
      />
      <TextField
        label="ICD10 分類コード"
        value={form.icd10}
        onChange={(e) => onChange({ ...form, icd10: e.target.value })}
        fullWidth
      />
      <BilingualFormField
        label="方法"
        helperText="今回登録いただくデータについてのみ記載して下さい。ライブラリー調整方法や使用したシーケンサーなどの情報も記載してください。"
        value={form.method}
        onChange={(method) => onChange({ ...form, method })}
        multiline
      />
    </Box>

    <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
      <SectionHeader title="発表論文" size="small" />
      <TextField
        value={form.publication}
        onChange={(e) => onChange({ ...form, publication: e.target.value })}
        multiline
        minRows={2}
        fullWidth
      />
    </Box>

    <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
      <SectionHeader title="提供データを取得した研究題目" size="small" />
      <BilingualFormField
        label="研究題目"
        value={form.studyTitle}
        onChange={(studyTitle) => onChange({ ...form, studyTitle })}
      />
    </Box>
  </Box>
)
