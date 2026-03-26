import Box from "@mui/material/Box"
import Checkbox from "@mui/material/Checkbox"
import FormControl from "@mui/material/FormControl"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormGroup from "@mui/material/FormGroup"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import Typography from "@mui/material/Typography"

import type { OffPremiseServer } from "@/schemas/jga-form"
import { FIELD_GROUP_GAP, SUBSECTION_GAP } from "@/theme"

interface DuServerSectionProps {
  serverStatus: string
  offPremiseStatus: OffPremiseServer[]
  isOffPremiseStatement: boolean
  onServerStatusChange: (value: string) => void
  onOffPremiseStatusChange: (value: OffPremiseServer[]) => void
  onOffPremiseStatementChange: (value: boolean) => void
}

const SERVER_OPTIONS = [
  { value: "onpre", label: "自機関で保有するサーバ（機関内サーバ）を使用します" },
  { value: "both", label: "自機関が保有するサーバおよび機関外サーバの両方を使用します" },
] as const

const OFF_PREMISE_OPTIONS: { value: OffPremiseServer; label: string }[] = [
  { value: "nig", label: "遺伝研スーパーコンピュータ（個人ゲノム解析システム）" },
  { value: "tombo", label: "ToMMo スーパーコンピュータ" },
  { value: "hgc", label: "国立がんセンター（NCC）のスーパーコンピュータ" },
  { value: "kog", label: "九州大学マスイサイエンスセンター解析システム（DASK）" },
  { value: "oasis", label: "九州大学オミクスサイエンスセキュア情報解析システム（OASIS）" },
]

export const DuServerSection = ({
  serverStatus,
  offPremiseStatus,
  isOffPremiseStatement,
  onServerStatusChange,
  onOffPremiseStatusChange,
  onOffPremiseStatementChange,
}: DuServerSectionProps) => {
  const checkboxEnabled = serverStatus === "offpre" || serverStatus === "both"

  const handleToggle = (server: OffPremiseServer) => {
    if (offPremiseStatus.includes(server)) {
      onOffPremiseStatusChange(offPremiseStatus.filter((s) => s !== server))
    } else {
      onOffPremiseStatusChange([...offPremiseStatus, server])
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
      <Typography variant="h3">データの保管および解析するサーバ</Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP }}>
        <FormControl>
          <RadioGroup
            value={serverStatus}
            onChange={(e) => onServerStatusChange(e.target.value)}
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
            使用予定の機関外サーバを選択してください
          </Typography>
          <FormGroup>
            {OFF_PREMISE_OPTIONS.map((opt) => (
              <FormControlLabel
                key={opt.value}
                control={
                  <Checkbox
                    checked={offPremiseStatus.includes(opt.value)}
                    onChange={() => handleToggle(opt.value)}
                    size="small"
                    disabled={!checkboxEnabled}
                  />
                }
                label={opt.label}
              />
            ))}
          </FormGroup>

          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            機関外サーバでのデータ利用を希望する者は以下を確認し、チェックを入れて下さい。
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={isOffPremiseStatement}
                onChange={(e) => onOffPremiseStatementChange(e.target.checked)}
                size="small"
                disabled={!checkboxEnabled}
              />
            }
            label="機関外サーバの利用にあたっての全責任は、研究代表者にあることを理解した上で機関外サーバを利用します。機関外サーバ利用において何らかの問題が発生した場合は、機関外サーバを提供する機関と研究代表者間で解決致します。"
            sx={{ alignItems: "flex-start", "& .MuiFormControlLabel-label": { fontSize: "0.8125rem" } }}
          />
        </Box>
      </Box>
    </Box>
  )
}
