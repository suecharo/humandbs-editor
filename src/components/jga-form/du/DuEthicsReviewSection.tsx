import Box from "@mui/material/Box"
import Checkbox from "@mui/material/Checkbox"
import FormControl from "@mui/material/FormControl"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormGroup from "@mui/material/FormGroup"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import { SectionHeader } from "@/components/SectionHeader"
import type { DuFormData, OffPremiseServer } from "@/schemas/jga-form"
import { FIELD_GROUP_GAP, SECTION_GAP, SUBSECTION_GAP } from "@/theme"

interface DuEthicsReviewSectionProps {
  form: DuFormData
  onChange: (form: DuFormData) => void
}

const SERVER_OPTIONS = [
  { value: "onpre", label: "自機関で保有するサーバを使用します" },
  { value: "offpre", label: "所属機関外利用可能サーバ（機関外サーバ）を使用します" },
  { value: "both", label: "自機関が保有するサーバおよび機関外サーバの両方を使用します" },
] as const

const OFF_PREMISE_OPTIONS: { value: OffPremiseServer; label: string; note?: string }[] = [
  { value: "nig", label: "遺伝研スーパーコンピュータ（個人ゲノム解析システム）" },
  { value: "tombo", label: "ToMMo スーパーコンピュータ" },
  { value: "kog", label: "国立がんオーセンター（NCC）のスーパーコンピュータ" },
  {
    value: "hgc",
    label: "医科学研究所ヒトゲノム解析センター SHIROKANE",
    note: "機関外サーバとして SHIROKANE を利用する際は、くじらアカウントの申請が必要です。",
  },
  { value: "oasis", label: "九州大学オミクスサイエンスセキュア情報解析システム（OASIS）" },
]

export const DuEthicsReviewSection = ({
  form,
  onChange,
}: DuEthicsReviewSectionProps) => {
  const offPremiseEnabled = form.serverStatus === "offpre" || form.serverStatus === "both"

  const handleToggleServer = (server: OffPremiseServer) => {
    const current = form.offPremiseStatus
    if (current.includes(server)) {
      onChange({ ...form, offPremiseStatus: current.filter((s) => s !== server) })
    } else {
      onChange({ ...form, offPremiseStatus: [...current, server] })
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
      <SectionHeader title="倫理審査" size="medium" />

      {/* データ利用期間 */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
        <SectionHeader title="データ利用期間" size="small" />
        <TextField
          label="データ利用終了日（予定）"
          type="date"
          value={form.usePeriodEnd}
          onChange={(e) => onChange({ ...form, usePeriodEnd: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ maxWidth: 300 }}
        />
      </Box>

      {/* 研究計画の倫理審査の状況 */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
        <SectionHeader title="研究計画の倫理審査の状況" size="small" />
        <FormControl>
          <RadioGroup
            value={form.useReviewStatus}
            onChange={(e) =>
              onChange({ ...form, useReviewStatus: e.target.value })
            }
          >
            <Box sx={{ display: "grid", gridTemplateColumns: "auto 220px", alignItems: "center", rowGap: 0.5 }}>
              <FormControlLabel
                value="completed"
                control={<Radio size="small" />}
                label="審査済み"
              />
              <TextField
                label="承認了月日"
                type="date"
                value={form.useReviewStatus === "completed" ? form.useReviewDate : ""}
                onChange={(e) => onChange({ ...form, useReviewDate: e.target.value })}
                disabled={form.useReviewStatus !== "completed"}
                slotProps={{ inputLabel: { shrink: true } }}
                size="small"
              />
              <FormControlLabel
                value="notyet"
                control={<Radio size="small" />}
                label="審査未実施・未完了"
              />
              <TextField
                label="審査終了見込み"
                type="date"
                value={form.useReviewStatus === "notyet" ? form.useReviewDate : ""}
                onChange={(e) => onChange({ ...form, useReviewDate: e.target.value })}
                disabled={form.useReviewStatus !== "notyet"}
                slotProps={{ inputLabel: { shrink: true } }}
                size="small"
              />
              <FormControlLabel
                value="unnecessary"
                control={<Radio size="small" />}
                label="審査免除・不要"
              />
              <Box />
            </Box>
          </RadioGroup>
        </FormControl>
      </Box>

      {/* データの保管および解析するサーバ */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
        <SectionHeader title="データの保管および解析するサーバ" size="small" />
        <FormControl>
          <RadioGroup
            value={form.serverStatus}
            onChange={(e) => onChange({ ...form, serverStatus: e.target.value })}
          >
            {SERVER_OPTIONS.map((opt) => (
              <FormControlLabel
                key={opt.value}
                value={opt.value}
                control={<Radio size="small" />}
                label={opt.label}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <Box sx={{ ml: 4, display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP }}>
          <Typography variant="body2" color="text.secondary">
            使用予定の機関外サーバを選択して下さい。
          </Typography>
          <FormGroup>
            {OFF_PREMISE_OPTIONS.map((opt) => (
              <Box key={opt.value}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.offPremiseStatus.includes(opt.value)}
                      onChange={() => handleToggleServer(opt.value)}
                      size="small"
                      disabled={!offPremiseEnabled}
                    />
                  }
                  label={opt.label}
                />
                {opt.note && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mt: -0.5, mb: 0.5 }}>
                    ※ {opt.note}
                  </Typography>
                )}
              </Box>
            ))}
          </FormGroup>

          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            機関外サーバでのデータ利用を希望する者は以下を確認し、チェックを入れて下さい。
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={form.isOffPremiseStatement}
                onChange={(e) =>
                  onChange({ ...form, isOffPremiseStatement: e.target.checked })
                }
                size="small"
                disabled={!offPremiseEnabled}
              />
            }
            label="機関外サーバの利用にあたっての全責任は、研究代表者にあることを理解した上で機関外サーバを利用します。機関外サーバ利用において何らかの問題が発生した場合は、機関外サーバを提供する機関と研究代表者間で解決致します。"
            sx={{ alignItems: "flex-start" }}
          />
        </Box>
      </Box>

      {/* 引用文献/謝辞 */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
        <SectionHeader title="引用文献/謝辞" size="small" />
        <Typography variant="body2" color="text.secondary">
          当該データを利用した研究成果を論文として発表する際には引用文献/謝辞にて言及します。
        </Typography>
        <FormControl>
          <RadioGroup
            row
            value={form.acknowledgmentStatus}
            onChange={(e) =>
              onChange({ ...form, acknowledgmentStatus: e.target.value })
            }
          >
            <FormControlLabel value="yes" control={<Radio size="small" />} label="はい" />
            <FormControlLabel value="no" control={<Radio size="small" />} label="いいえ" />
          </RadioGroup>
        </FormControl>
      </Box>

    </Box>
  )
}
