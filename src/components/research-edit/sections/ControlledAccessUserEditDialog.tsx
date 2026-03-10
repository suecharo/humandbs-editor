import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import equal from "fast-deep-equal"

import { OrcidAutocomplete } from "@/components/common/OrcidAutocomplete"
import type { OrcidSearchResult } from "@/hooks/use-orcid-search"
import type { Person } from "@/schemas/research"
import { DIALOG_PADDING, DIALOG_TITLE_SX, FORM_LABEL_SX, MODIFIED_FIELD_SX, SUBSECTION_GAP } from "@/theme"

import { BilingualTextField } from "../fields/BilingualTextField"
import { BilingualTextValueField } from "../fields/BilingualTextValueField"

interface ControlledAccessUserEditDialogProps {
  open: boolean
  user: Person
  serverUser?: Person | undefined
  onChange: (user: Person) => void
  onClose: () => void
}

export const ControlledAccessUserEditDialog = ({
  open,
  user,
  serverUser,
  onChange,
  onClose,
}: ControlledAccessUserEditDialogProps) => {
  const handleOrcidSelect = (result: OrcidSearchResult) => {
    const enName = [result.givenNames, result.familyNames].filter(Boolean).join(" ")
    const instName = result.institutionNames[0] ?? ""

    onChange({
      ...user,
      name: {
        ...user.name,
        en: { text: enName, rawHtml: user.name.en?.rawHtml ?? "" },
      },
      orcid: result.orcidId,
      organization: {
        name: {
          ja: user.organization?.name?.ja ?? null,
          en: { text: instName, rawHtml: user.organization?.name?.en?.rawHtml ?? "" },
        },
        address: user.organization?.address ?? null,
      },
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={DIALOG_TITLE_SX}>利用者を編集</DialogTitle>
      <DialogContent dividers sx={{ p: DIALOG_PADDING }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
          <OrcidAutocomplete onSelect={handleOrcidSelect} />
          <BilingualTextValueField
            label="氏名"
            value={user.name}
            onChange={(name) => onChange({ ...user, name })}
            multiline={false}
            modified={serverUser ? {
              ja: user.name.ja?.text !== serverUser.name.ja?.text,
              en: user.name.en?.text !== serverUser.name.en?.text,
            } : undefined}
          />
          <TextField
            label="メールアドレス"
            value={user.email ?? ""}
            onChange={(e) => onChange({ ...user, email: e.target.value || null })}
            fullWidth
            sx={serverUser && user.email !== serverUser.email ? MODIFIED_FIELD_SX : undefined}
          />
          <TextField
            label="ORCID"
            value={user.orcid ?? ""}
            onChange={(e) => onChange({ ...user, orcid: e.target.value || null })}
            fullWidth
            sx={serverUser && user.orcid !== serverUser.orcid ? MODIFIED_FIELD_SX : undefined}
          />
          {user.organization && (
            <BilingualTextValueField
              label="所属機関"
              value={user.organization.name}
              onChange={(name) => {
                const { organization } = user
                if (!organization) return
                onChange({ ...user, organization: { ...organization, name } })
              }}
              multiline={false}
              modified={serverUser ? {
                ja: user.organization.name.ja?.text !== serverUser.organization?.name.ja?.text,
                en: user.organization.name.en?.text !== serverUser.organization?.name.en?.text,
              } : undefined}
            />
          )}
          {user.researchTitle && (
            <BilingualTextField
              label="研究題目"
              value={user.researchTitle}
              onChange={(researchTitle) => onChange({ ...user, researchTitle })}
              modified={serverUser ? {
                ja: user.researchTitle.ja !== serverUser.researchTitle?.ja,
                en: user.researchTitle.en !== serverUser.researchTitle?.en,
              } : undefined}
            />
          )}
          {user.periodOfDataUse && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="利用開始日"
                value={user.periodOfDataUse.startDate ?? ""}
                onChange={(e) => {
                  const { periodOfDataUse } = user
                  if (!periodOfDataUse) return
                  onChange({
                    ...user,
                    periodOfDataUse: { ...periodOfDataUse, startDate: e.target.value || null },
                  })
                }}
                sx={serverUser && user.periodOfDataUse.startDate !== serverUser.periodOfDataUse?.startDate ? MODIFIED_FIELD_SX : undefined}
              />
              <TextField
                label="利用終了日"
                value={user.periodOfDataUse.endDate ?? ""}
                onChange={(e) => {
                  const { periodOfDataUse } = user
                  if (!periodOfDataUse) return
                  onChange({
                    ...user,
                    periodOfDataUse: { ...periodOfDataUse, endDate: e.target.value || null },
                  })
                }}
                sx={serverUser && user.periodOfDataUse.endDate !== serverUser.periodOfDataUse?.endDate ? MODIFIED_FIELD_SX : undefined}
              />
            </Box>
          )}
          {user.datasetIds && user.datasetIds.length > 0 && (
            <Box>
              <Typography variant="body2" sx={{ ...FORM_LABEL_SX, mb: 0.5 }}>
                データセットID（読み取り専用）
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {user.datasetIds.map((id) => (
                  <Chip key={id} label={id} size="small" sx={{ fontFamily: "monospace" }} />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: DIALOG_PADDING, justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          color="secondary"
          disabled={!serverUser || equal(user, serverUser)}
          onClick={() => { if (serverUser) onChange(serverUser) }}
        >
          変更を破棄
        </Button>
        <Button variant="outlined" onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  )
}
