import Box from "@mui/material/Box"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"

import { EditDialogFooter } from "@/components/common/EditDialogFooter"
import { OrcidAutocomplete } from "@/components/common/OrcidAutocomplete"
import { PanelDialog } from "@/components/common/PanelDialog"
import type { OrcidSearchResult } from "@/hooks/use-orcid-search"
import type { Person } from "@/schemas/research"
import { DIALOG_PADDING, DIALOG_TITLE_SX, MODIFIED_FIELD_SX, SUBSECTION_GAP } from "@/theme"

import { BilingualTextValueField } from "../fields/BilingualTextValueField"

interface DataProviderEditDialogProps {
  open: boolean
  person: Person
  serverPerson?: Person | undefined
  onChange: (person: Person) => void
  onClose: () => void
}

export const DataProviderEditDialog = ({
  open,
  person,
  serverPerson,
  onChange,
  onClose,
}: DataProviderEditDialogProps) => {
  const handleOrcidSelect = (result: OrcidSearchResult) => {
    const enName = [result.givenNames, result.familyNames].filter(Boolean).join(" ")
    const instName = result.institutionNames[0] ?? ""

    onChange({
      ...person,
      name: {
        ...person.name,
        en: { text: enName, rawHtml: person.name.en?.rawHtml ?? "" },
      },
      orcid: result.orcidId,
      organization: {
        name: {
          ja: person.organization?.name?.ja ?? null,
          en: { text: instName, rawHtml: person.organization?.name?.en?.rawHtml ?? "" },
        },
        address: person.organization?.address ?? null,
      },
    })
  }

  return (
    <PanelDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={DIALOG_TITLE_SX}>提供者を編集</DialogTitle>
      <DialogContent dividers sx={{ p: DIALOG_PADDING }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
          <OrcidAutocomplete onSelect={handleOrcidSelect} />
          <BilingualTextValueField
            label="研究代表者"
            value={person.name}
            onChange={(name) => onChange({ ...person, name })}
            multiline={false}
            modified={serverPerson ? {
              ja: person.name.ja?.text !== serverPerson.name.ja?.text,
              en: person.name.en?.text !== serverPerson.name.en?.text,
            } : undefined}
          />
          <TextField
            label="メールアドレス"
            value={person.email ?? ""}
            onChange={(e) => onChange({ ...person, email: e.target.value || null })}
            fullWidth
            sx={serverPerson && person.email !== serverPerson.email ? MODIFIED_FIELD_SX : undefined}
          />
          <TextField
            label="ORCID"
            value={person.orcid ?? ""}
            onChange={(e) => onChange({ ...person, orcid: e.target.value || null })}
            fullWidth
            sx={serverPerson && person.orcid !== serverPerson.orcid ? MODIFIED_FIELD_SX : undefined}
          />
          {person.organization && (
            <BilingualTextValueField
              label="所属機関"
              value={person.organization.name}
              onChange={(name) => {
                const { organization } = person
                if (!organization) return
                onChange({ ...person, organization: { ...organization, name } })
              }}
              multiline={false}
              modified={serverPerson ? {
                ja: person.organization.name.ja?.text !== serverPerson.organization?.name.ja?.text,
                en: person.organization.name.en?.text !== serverPerson.organization?.name.en?.text,
              } : undefined}
            />
          )}
        </Box>
      </DialogContent>
      <EditDialogFooter item={person} serverItem={serverPerson} onChange={onChange} onClose={onClose} />
    </PanelDialog>
  )
}
