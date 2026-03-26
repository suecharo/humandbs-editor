import Box from "@mui/material/Box"
import FormControl from "@mui/material/FormControl"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormLabel from "@mui/material/FormLabel"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import TextField from "@mui/material/TextField"

import { BilingualFormField } from "@/components/jga-form/BilingualFormField"
import { DuDatasetArraySection } from "@/components/jga-form/du/DuDatasetArraySection"
import { SectionHeader } from "@/components/SectionHeader"
import type { DuFormData } from "@/schemas/jga-form"
import { SECTION_GAP, SUBSECTION_GAP } from "@/theme"

interface DuResearchInfoSectionProps {
  form: DuFormData
  onChange: (form: DuFormData) => void
}

export const DuResearchInfoSection = ({
  form,
  onChange,
}: DuResearchInfoSectionProps) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
    <SectionHeader title="研究内容" size="medium" />

    <DuDatasetArraySection
      value={form.useDatasets}
      onChange={(useDatasets) => onChange({ ...form, useDatasets })}
    />

    <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
      <SectionHeader title="利用を希望するデータを使用した研究の概要" size="small" />
      <TextField
        value={form.useSummary}
        onChange={(e) => onChange({ ...form, useSummary: e.target.value })}
        multiline
        minRows={3}
        fullWidth
      />
    </Box>

    <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
      <SectionHeader title="NBDCガイドライン" size="small" />
      <FormControl>
        <FormLabel sx={{ mb: 1 }}>
          NBDCヒトデータ共有ガイドライン、NBDCヒトデータ取扱いセキュリティガイドラインの確認状況について
        </FormLabel>
        <RadioGroup
          value={form.guidelineStatus}
          onChange={(e) =>
            onChange({ ...form, guidelineStatus: e.target.value })
          }
        >
          <FormControlLabel
            value="no"
            control={<Radio size="small" />}
            label="未確認です"
          />
          <FormControlLabel
            value="yes"
            control={<Radio size="small" />}
            label="最新版のガイドラインを確認済みであり、内容を遵守します。また、ガイドライン違反時の措置についても理解致しました。"
          />
        </RadioGroup>
      </FormControl>
    </Box>

    <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
      <SectionHeader title="データを利用する研究題目" size="small" />
      <BilingualFormField
        label="研究題目"
        value={form.studyTitle}
        onChange={(studyTitle) => onChange({ ...form, studyTitle })}
      />
    </Box>

    <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
      <SectionHeader title="発表論文" size="small" />
      <TextField
        helperText="申請内容に関連した研究代表者の発表論文など"
        value={form.usePublication}
        onChange={(e) => onChange({ ...form, usePublication: e.target.value })}
        multiline
        minRows={2}
        fullWidth
      />
    </Box>
  </Box>
)
