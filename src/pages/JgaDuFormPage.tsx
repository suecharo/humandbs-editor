import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import Paper from "@mui/material/Paper"
import { useMemo, useState } from "react"

import { CollaboratorArraySection } from "@/components/jga-form/CollaboratorArraySection"
import { DuEthicsReviewSection } from "@/components/jga-form/du/DuEthicsReviewSection"
import { DuResearchInfoSection } from "@/components/jga-form/du/DuResearchInfoSection"
import { ExcludedNote } from "@/components/jga-form/ExcludedNote"
import { JsonOutputSection } from "@/components/jga-form/JsonOutputSection"
import { LanguageTypeSelector } from "@/components/jga-form/LanguageTypeSelector"
import { SectionHeader } from "@/components/SectionHeader"
import type { DuFormData } from "@/schemas/jga-form"
import { createDefaultDuFormData } from "@/schemas/jga-form"
import { CONTENT_MARGIN_Y, SECTION_GAP, SUBSECTION_GAP } from "@/theme"
import { buildDuOutput } from "@/utils/jga-reverse-transform"

export const JgaDuFormPage = () => {
  const [form, setForm] = useState<DuFormData>(createDefaultDuFormData)

  const outputJson = useMemo(() => buildDuOutput(form), [form])
  const outputJsonString = useMemo(
    () => JSON.stringify(outputJson, null, 2),
    [outputJson],
  )

  return (
    <Container sx={{ my: CONTENT_MARGIN_Y }}>
      <SectionHeader title="J-DU データ利用申請" />

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
            items={["データ利用申請グループ ID (group_id)"]}
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

      {/* Card 3: 研究分担者 (Tab 3) */}
      <Paper sx={{ p: 3, mt: SECTION_GAP }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
          <SectionHeader title="研究分担者" size="medium" />

          <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
            <ExcludedNote
              note="研究分担者 (DDBJ アカウント保持者) は申請管理システムのアカウント機能で管理します (PoC 範囲外)"
              items={[
                "データアクセス可能な研究者。DDBJ アカウントが必要",
                "申請管理システム側でアカウントに紐づけて自動表示される",
              ]}
            />
          </Box>

          <CollaboratorArraySection
            value={form.collaborators}
            onChange={(collaborators) =>
              setForm((prev) => ({ ...prev, collaborators }))
            }
          />
        </Box>
      </Paper>

      {/* Card 4: 研究内容 (Tab 4) */}
      <Paper sx={{ p: 3, mt: SECTION_GAP }}>
        <DuResearchInfoSection form={form} onChange={setForm} />
      </Paper>

      {/* Card 5: 倫理審査 (Tab 5) */}
      <Paper sx={{ p: 3, mt: SECTION_GAP }}>
        <DuEthicsReviewSection form={form} onChange={setForm} />
      </Paper>

      {/* Card 6: 添付ファイル (Tab 6) */}
      <Paper sx={{ p: 3, mt: SECTION_GAP }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
          <SectionHeader title="添付ファイル" size="medium" />
          <ExcludedNote
            note="以下の項目は申請管理システム側で入力します (PoC 範囲外)"
            items={["データセット復号用公開鍵ファイル"]}
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
