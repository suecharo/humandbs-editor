import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import Paper from "@mui/material/Paper"
import { useMemo, useState } from "react"

import { CollaboratorArraySection } from "@/components/jga-form/CollaboratorArraySection"
import { DsDataArraySection } from "@/components/jga-form/ds/DsDataArraySection"
import { DsEthicsReviewSection } from "@/components/jga-form/ds/DsEthicsReviewSection"
import { DsResearchInfoSection } from "@/components/jga-form/ds/DsResearchInfoSection"
import { ExcludedNote } from "@/components/jga-form/ExcludedNote"
import { JsonOutputSection } from "@/components/jga-form/JsonOutputSection"
import { LanguageTypeSelector } from "@/components/jga-form/LanguageTypeSelector"
import { SectionHeader } from "@/components/SectionHeader"
import type { DsFormData } from "@/schemas/jga-form"
import { createDefaultDsFormData } from "@/schemas/jga-form"
import { CONTENT_MARGIN_Y, SECTION_GAP, SUBSECTION_GAP } from "@/theme"
import { buildDsOutput } from "@/utils/jga-reverse-transform"

export const JgaDsFormPage = () => {
  const [form, setForm] = useState<DsFormData>(createDefaultDsFormData)

  const outputJson = useMemo(() => buildDsOutput(form), [form])
  const outputJsonString = useMemo(
    () => JSON.stringify(outputJson, null, 2),
    [outputJson],
  )

  return (
    <Container sx={{ my: CONTENT_MARGIN_Y }}>
      <SectionHeader title="J-DS データ提供申請" />

      {/* Card 0: 申請フォームの言語 */}
      <Paper sx={{ p: 3, mt: SECTION_GAP }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
          <SectionHeader title="申請フォームの言語" size="medium" />
          <LanguageTypeSelector
            value={form.languageType}
            onChange={(languageType) => setForm((prev) => ({ ...prev, languageType }))}
          />
        </Box>
      </Paper>

      {/* Card 1: グループ (Tab 1) */}
      <Paper sx={{ p: 3, mt: SECTION_GAP }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
          <SectionHeader title="グループ" size="medium" />
          <ExcludedNote
            note="以下の項目は申請管理システム側で入力します (PoC 範囲外)"
            items={["データ提供申請グループ ID (group_id)"]}
          />
        </Box>
      </Paper>

      {/* Card 2: アカウント (Tab 2) */}
      <Paper sx={{ p: 3, mt: SECTION_GAP }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
          <SectionHeader title="アカウント" size="medium" />
          <ExcludedNote
            note="以下の項目は申請管理システム側で入力します (PoC 範囲外)"
            items={[
              "研究代表者に関する情報 (姓名、所属機関、部署、職名、連絡先 等)",
              "所属機関の長について (氏名、電話番号、職名、メールアドレス)",
            ]}
          />
        </Box>
      </Paper>

      {/* Card 3: 研究内容 (Tab 3) */}
      <Paper sx={{ p: 3, mt: SECTION_GAP }}>
        <DsResearchInfoSection form={form} onChange={setForm} />
      </Paper>

      {/* Card 4: データ (Tab 4) */}
      <Paper sx={{ p: 3, mt: SECTION_GAP }}>
        <DsDataArraySection
          data={form.data}
          restriction={form.restriction}
          releaseDate={form.releaseDate}
          onDataChange={(data) => setForm((prev) => ({ ...prev, data }))}
          onRestrictionChange={(restriction) => setForm((prev) => ({ ...prev, restriction }))}
          onReleaseDateChange={(releaseDate) => setForm((prev) => ({ ...prev, releaseDate }))}
        />
      </Paper>

      {/* Card 5: 倫理審査 (Tab 5) */}
      <Paper sx={{ p: 3, mt: SECTION_GAP }}>
        <DsEthicsReviewSection form={form} onChange={setForm} />
      </Paper>

      {/* Card 6: 研究分担者 */}
      <Paper sx={{ p: 3, mt: SECTION_GAP }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
          <SectionHeader title="研究分担者" size="medium" />
          <CollaboratorArraySection
            value={form.collaborators}
            onChange={(collaborators) =>
              setForm((prev) => ({ ...prev, collaborators }))
            }
          />
        </Box>
      </Paper>

      {/* Card 7: 添付ファイル (Tab 6) */}
      <Paper sx={{ p: 3, mt: SECTION_GAP }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
          <SectionHeader title="添付ファイル" size="medium" />
          <ExcludedNote
            note="以下の項目は申請管理システム側で入力します (PoC 範囲外)"
            items={[
              "添付ファイルのアップロード",
              "簡易審査の希望",
            ]}
          />
        </Box>
      </Paper>

      {/* JSON プレビュー */}
      <Paper sx={{ p: 3, mt: SECTION_GAP }}>
        <JsonOutputSection jsonString={outputJsonString} />
      </Paper>
    </Container>
  )
}
