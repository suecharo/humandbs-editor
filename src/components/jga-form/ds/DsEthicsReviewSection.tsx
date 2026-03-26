import Box from "@mui/material/Box"
import FormControl from "@mui/material/FormControl"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormLabel from "@mui/material/FormLabel"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import { SectionHeader } from "@/components/SectionHeader"
import type { DsFormData } from "@/schemas/jga-form"
import { SECTION_GAP, SUBSECTION_GAP } from "@/theme"

interface DsEthicsReviewSectionProps {
  form: DsFormData
  onChange: (form: DsFormData) => void
}

export const DsEthicsReviewSection = ({
  form,
  onChange,
}: DsEthicsReviewSectionProps) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
    <SectionHeader title="倫理審査" size="medium" />

    {/* NBDCガイドライン */}
    <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
      <SectionHeader title="NBDCガイドライン" size="small" />
      <FormControl>
        <FormLabel sx={{ mb: 1 }}>
          NBDCヒトデータ共有ガイドライン、NBDCヒトデータ取扱いセキュリティガイドラインの確認状況について
        </FormLabel>
        <RadioGroup
          value={form.nbdcGuidelineStatus}
          onChange={(e) => onChange({ ...form, nbdcGuidelineStatus: e.target.value })}
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

    {/* データの匿名化の実施について */}
    <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
      <SectionHeader title="データの匿名化の実施について" size="small" />
      <Typography variant="body2" color="text.secondary">
        安全管理措置上、NBDCヒトデータベースへ個人情報のデータを提供する前に、二重匿名化することをおすすめします（NBDCヒトデータ共有ガイドライン
        4-2）。データ提供の責任、提供に際し、二重匿名化が実施されているかどうかを回答してください。
      </Typography>
      <FormControl>
        <RadioGroup
          value={form.deIdentificationStatus}
          onChange={(e) => onChange({ ...form, deIdentificationStatus: e.target.value })}
        >
          <Box sx={{ display: "grid", gridTemplateColumns: "auto 220px", alignItems: "center", rowGap: 0.5 }}>
            <FormControlLabel
              value="completed"
              control={<Radio size="small" />}
              label="二重匿名化済"
            />
            <Box />
            <FormControlLabel
              value="scheduled"
              control={<Radio size="small" />}
              label="匿名化実施予定"
            />
            <TextField
              label="匿名化実施予定日"
              type="date"
              value={form.deIdentificationStatus === "scheduled" ? form.deIdentificationDate : ""}
              onChange={(e) => onChange({ ...form, deIdentificationDate: e.target.value })}
              disabled={form.deIdentificationStatus !== "scheduled"}
              slotProps={{ inputLabel: { shrink: true } }}
              size="small"
            />
            <FormControlLabel
              value="unnecessary"
              control={<Radio size="small" />}
              label="二重匿名化不要"
            />
            <TextField
              label="匿名化不要の理由"
              value={form.deIdentificationStatus === "unnecessary" ? form.deIdentificationReason : ""}
              onChange={(e) => onChange({ ...form, deIdentificationReason: e.target.value })}
              disabled={form.deIdentificationStatus !== "unnecessary"}
              placeholder="利用個人情報のデータの提供でないため"
              size="small"
            />
          </Box>
        </RadioGroup>
      </FormControl>
    </Box>

    {/* データ提供に関する倫理審査の状況 */}
    <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
      <SectionHeader title="データ提供に関する倫理審査の状況" size="small" />
      <FormControl>
        <RadioGroup
          value={form.submissionReviewStatus}
          onChange={(e) => onChange({ ...form, submissionReviewStatus: e.target.value })}
        >
          <Box sx={{ display: "grid", gridTemplateColumns: "auto 220px", alignItems: "center", rowGap: 0.5 }}>
            <FormControlLabel
              value="completed"
              control={<Radio size="small" />}
              label="審査済み"
            />
            <TextField
              label="審査終了予定月日"
              type="date"
              value={form.submissionReviewStatus === "completed" ? form.submissionReviewDate : ""}
              onChange={(e) => onChange({ ...form, submissionReviewDate: e.target.value })}
              disabled={form.submissionReviewStatus !== "completed"}
              slotProps={{ inputLabel: { shrink: true } }}
              size="small"
            />
            <FormControlLabel
              value="notyet"
              control={<Radio size="small" />}
              label="審査未実施・未完了"
            />
            <TextField
              label="審査終了予定月日"
              type="date"
              value={form.submissionReviewStatus === "notyet" ? form.submissionReviewDate : ""}
              onChange={(e) => onChange({ ...form, submissionReviewDate: e.target.value })}
              disabled={form.submissionReviewStatus !== "notyet"}
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

    {/* 民間企業でのデータ利用について */}
    <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
      <SectionHeader title="民間企業でのデータ利用について" size="small" />
      <FormControl>
        <RadioGroup
          value={form.companyUseStatus}
          onChange={(e) => onChange({ ...form, companyUseStatus: e.target.value })}
        >
          <FormControlLabel
            value="ok"
            control={<Radio size="small" />}
            label="承認した上でデータを提供いたします"
          />
          <FormControlLabel
            value="ng"
            control={<Radio size="small" />}
            label="インフォームドコンセントの説明文書の中で、民間企業におけるデータ利用を禁じているため、承認することができません"
          />
        </RadioGroup>
      </FormControl>
    </Box>

    {/* 多施設共同研究からのデータ提供について */}
    <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
      <SectionHeader title="多施設共同研究からのデータ提供について" size="small" />
      <Typography variant="body2" color="text.secondary">
        研究代表者として、全研究分担機関におけるインフォームドコンセント取得、同意文書の記載確認の状況、ならびに、各倫理審査委員会において「データベースへデータを提供・共有すること」が承認されている確認状況について回答して下さい。
      </Typography>
      <FormControl>
        <RadioGroup
          value={form.multicenterStatus}
          onChange={(e) => onChange({ ...form, multicenterStatus: e.target.value })}
        >
          <FormControlLabel
            value="yes"
            control={<Radio size="small" />}
            label="確認しています"
          />
          <FormControlLabel
            value="no"
            control={<Radio size="small" />}
            label="確認していません"
          />
          <FormControlLabel
            value="piinstitution"
            control={<Radio size="small" />}
            label="単独で実施したデータを登録した全ての検体は研究代表者の施設に由来しています"
          />
        </RadioGroup>
      </FormControl>
    </Box>

    {/* DBCLSおよび生命情報・DDBJセンターにおけるデータ加工について */}
    <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
      <SectionHeader title="DBCLSおよび生命情報・DDBJセンターにおけるデータ加工について" size="small" />
      <Typography variant="body2" color="text.secondary">
        ご提供いただくデータの利用を促進する目的で、データの概要を公開するためのデータを作成し、併せて、データ利用の際にデータ構造をアラインメント・バリアントコーラー・顔照合アプリなどでの品質確認をする場合にパイプラインでアライメントファイル・バリアントコーリングのファイルを作成し、要望があればデータの利用希望者へ提供します。NBDCヒトデータベースで作成したデータの提供を承認する場合は「承認します」を選択して下さい。
      </Typography>
      <FormControl>
        <RadioGroup
          value={form.nbdcDataProcessingStatus}
          onChange={(e) => onChange({ ...form, nbdcDataProcessingStatus: e.target.value })}
        >
          <Box sx={{ display: "grid", gridTemplateColumns: "auto 220px", alignItems: "center", rowGap: 0.5 }}>
            <FormControlLabel
              value="ok"
              control={<Radio size="small" />}
              label="承認します"
            />
            <Box />
            <FormControlLabel
              value="ng"
              control={<Radio size="small" />}
              label="承認することができません"
            />
            <TextField
              label="理由"
              value={form.nbdcDataProcessingStatus === "ng" ? form.nbdcDataProcessingReason : ""}
              onChange={(e) => onChange({ ...form, nbdcDataProcessingReason: e.target.value })}
              disabled={form.nbdcDataProcessingStatus !== "ng"}
              size="small"
            />
          </Box>
        </RadioGroup>
      </FormControl>
    </Box>
  </Box>
)
