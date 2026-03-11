import Autocomplete from "@mui/material/Autocomplete"
import Box from "@mui/material/Box"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import equal from "fast-deep-equal"
import { useAtomValue } from "jotai"

import { EditDialogFooter } from "@/components/common/EditDialogFooter"
import { PanelDialog } from "@/components/common/PanelDialog"
import type { Publication } from "@/schemas/research"
import { researchDraftAtom, versionsDraftAtom } from "@/stores/research-edit"
import { DIALOG_PADDING, DIALOG_TITLE_SX, MODIFIED_FIELD_SX, SUBSECTION_GAP } from "@/theme"

import { BilingualTextField } from "../fields/BilingualTextField"

interface PublicationEditDialogProps {
  open: boolean
  publication: Publication
  serverPublication?: Publication | undefined
  onChange: (publication: Publication) => void
  onClose: () => void
}

export const PublicationEditDialog = ({
  open,
  publication,
  serverPublication,
  onChange,
  onClose,
}: PublicationEditDialogProps) => {
  const researchDraft = useAtomValue(researchDraftAtom)
  const versionsDraft = useAtomValue(versionsDraftAtom)

  const availableIds = (() => {
    if (!researchDraft) return []
    const latestVersion = versionsDraft.find((v) => v.humVersionId === researchDraft.latestVersion)

    return latestVersion?.datasets.map((d) => d.datasetId) ?? []
  })()

  const datasetIdsModified = serverPublication
    ? !equal(publication.datasetIds ?? [], serverPublication.datasetIds ?? [])
    : false

  return (
    <PanelDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={DIALOG_TITLE_SX}>関連論文を編集</DialogTitle>
      <DialogContent dividers sx={{ p: DIALOG_PADDING }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
          <BilingualTextField
            label="タイトル"
            value={publication.title}
            onChange={(title) => onChange({ ...publication, title })}
            modified={serverPublication ? {
              ja: publication.title.ja !== serverPublication.title.ja,
              en: publication.title.en !== serverPublication.title.en,
            } : undefined}
          />
          <TextField
            label="DOI"
            value={publication.doi ?? ""}
            onChange={(e) => onChange({ ...publication, doi: e.target.value || null })}
            fullWidth
            sx={serverPublication && publication.doi !== serverPublication.doi ? MODIFIED_FIELD_SX : undefined}
          />
          <Autocomplete
            multiple
            options={availableIds}
            value={publication.datasetIds ?? []}
            onChange={(_e, newValue) => onChange({ ...publication, datasetIds: newValue.length > 0 ? newValue : undefined })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="データセットID"
                sx={datasetIdsModified ? MODIFIED_FIELD_SX : undefined}
              />
            )}
            freeSolo={false}
            disableCloseOnSelect
          />
        </Box>
      </DialogContent>
      <EditDialogFooter item={publication} serverItem={serverPublication} onChange={onChange} onClose={onClose} />
    </PanelDialog>
  )
}
