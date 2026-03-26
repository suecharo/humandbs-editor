import Box from "@mui/material/Box"
import FormControl from "@mui/material/FormControl"
import FormControlLabel from "@mui/material/FormControlLabel"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import Typography from "@mui/material/Typography"

import { FIELD_GROUP_GAP } from "@/theme"

interface LanguageTypeSelectorProps {
  value: 1 | 2
  onChange: (value: 1 | 2) => void
}

export const LanguageTypeSelector = ({
  value,
  onChange,
}: LanguageTypeSelectorProps) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP }}>
    <Typography variant="body2" color="text.secondary">
      研究参加者由来のデータがどのように利用されているか研究参加者へ説明する責任、また、税金で実施した研究における成果の利活用に関する情報公開のため、日本語サイトを作成しております。そのため、日本において研究活動を実施する研究者は、日本語フォームでの申請をお願い致します。
    </Typography>
    <FormControl>
      <RadioGroup
        row
        value={String(value)}
        onChange={(e) => onChange(Number(e.target.value) as 1 | 2)}
      >
        <FormControlLabel value="1" control={<Radio size="small" />} label="日本語" />
        <FormControlLabel value="2" control={<Radio size="small" />} label="英語" />
      </RadioGroup>
    </FormControl>
  </Box>
)
