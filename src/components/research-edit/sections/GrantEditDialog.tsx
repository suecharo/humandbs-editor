import Autocomplete from "@mui/material/Autocomplete"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"

import { EditDialogFooter } from "@/components/common/EditDialogFooter"
import { PanelDialog } from "@/components/common/PanelDialog"
import type { Grant } from "@/schemas/research"
import { DIALOG_PADDING, DIALOG_TITLE_SX, SUBSECTION_GAP } from "@/theme"

import { BilingualTextField } from "../fields/BilingualTextField"

interface GrantEditDialogProps {
  open: boolean
  grant: Grant
  serverGrant?: Grant | undefined
  onChange: (grant: Grant) => void
  onClose: () => void
}

export const GrantEditDialog = ({
  open,
  grant,
  serverGrant,
  onChange,
  onClose,
}: GrantEditDialogProps) => (
  <PanelDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle sx={DIALOG_TITLE_SX}>科研費/助成金を編集</DialogTitle>
    <DialogContent dividers sx={{ p: DIALOG_PADDING }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
        <BilingualTextField
          label="タイトル"
          value={grant.title}
          onChange={(title) => onChange({ ...grant, title })}
          modified={serverGrant ? {
            ja: grant.title.ja !== serverGrant.title.ja,
            en: grant.title.en !== serverGrant.title.en,
          } : undefined}
        />
        <BilingualTextField
          label="助成金名"
          value={grant.agency.name}
          onChange={(name) => onChange({ ...grant, agency: { name } })}
          modified={serverGrant ? {
            ja: grant.agency.name.ja !== serverGrant.agency.name.ja,
            en: grant.agency.name.en !== serverGrant.agency.name.en,
          } : undefined}
        />
        <Autocomplete
          multiple
          freeSolo
          options={[]}
          value={grant.id}
          onChange={(_e, value) =>
            onChange({
              ...grant,
              id: value.map((v) => v.trim()).filter(Boolean),
            })
          }
          renderTags={(value, getTagProps) =>
            value.map((id, index) => {
              const { key, ...tagProps } = getTagProps({ index })

              return <Chip key={key} label={id} size="small" sx={{ fontFamily: "monospace" }} {...tagProps} />
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="課題番号"
              placeholder="Enter で追加"
            />
          )}
        />
      </Box>
    </DialogContent>
    <EditDialogFooter item={grant} serverItem={serverGrant} onChange={onChange} onClose={onClose} />
  </PanelDialog>
)
