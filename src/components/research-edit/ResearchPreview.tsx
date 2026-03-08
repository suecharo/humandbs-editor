import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import { useAtomValue } from "jotai"

import type { BilingualText, BilingualTextValue } from "@/schemas/common"
import { researchDraftAtom } from "@/stores/research-edit"
import { FIELD_GROUP_GAP, FORM_LABEL_SX, SECTION_GAP, SUBSECTION_GAP } from "@/theme"

type Lang = "ja" | "en"

const TextPreview = ({ label, value, lang }: { label: string; value: BilingualText; lang: Lang }) => (
  <Box sx={{ mb: FIELD_GROUP_GAP }}>
    <Typography variant="body2" sx={FORM_LABEL_SX}>
      {label}
    </Typography>
    <Typography variant="body1">{value[lang] ?? "-"}</Typography>
  </Box>
)

const TextValuePreview = ({ label, value, lang }: { label: string; value: BilingualTextValue; lang: Lang }) => (
  <Box sx={{ mb: FIELD_GROUP_GAP }}>
    <Typography variant="body2" sx={FORM_LABEL_SX}>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
      {value[lang]?.text ?? "-"}
    </Typography>
  </Box>
)

export const ResearchPreview = ({ lang }: { lang: Lang }) => {
  const draft = useAtomValue(researchDraftAtom)

  if (!draft) return null

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
      <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
        <Typography variant="h2" sx={{ mb: SUBSECTION_GAP }}>Title</Typography>
        <TextPreview label="Title" value={draft.title} lang={lang} />
      </Paper>

      <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
        <Typography variant="h2" sx={{ mb: SUBSECTION_GAP }}>Summary</Typography>
        <TextValuePreview label="Aims" value={draft.summary.aims} lang={lang} />
        <TextValuePreview label="Methods" value={draft.summary.methods} lang={lang} />
        <TextValuePreview label="Targets" value={draft.summary.targets} lang={lang} />
      </Paper>

      {draft.dataProvider.length > 0 && (
        <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
          <Typography variant="h2" sx={{ mb: SUBSECTION_GAP }}>Data Provider</Typography>
          {draft.dataProvider.map((p, i) => (
            <Box key={i} sx={{ mb: FIELD_GROUP_GAP }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {p.name[lang]?.text ?? "-"}
              </Typography>
              {p.organization && (
                <Typography variant="body2" color="text.secondary">
                  {p.organization.name[lang]?.text ?? ""}
                </Typography>
              )}
              {p.email && <Typography variant="body2">{p.email}</Typography>}
              {i < draft.dataProvider.length - 1 && <Divider sx={{ mt: FIELD_GROUP_GAP }} />}
            </Box>
          ))}
        </Paper>
      )}

      {draft.researchProject.length > 0 && (
        <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
          <Typography variant="h2" sx={{ mb: SUBSECTION_GAP }}>Research Project</Typography>
          {draft.researchProject.map((p, i) => (
            <Typography key={i} variant="body1" sx={{ mb: 0.5 }}>
              {p.name[lang]?.text ?? "-"}
            </Typography>
          ))}
        </Paper>
      )}

      {draft.grant.length > 0 && (
        <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
          <Typography variant="h2" sx={{ mb: SUBSECTION_GAP }}>Grant</Typography>
          {draft.grant.map((g, i) => (
            <Box key={i} sx={{ mb: FIELD_GROUP_GAP }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {g.title[lang] ?? "-"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {g.agency.name[lang] ?? ""}
              </Typography>
              {g.id.length > 0 && (
                <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
                  {g.id.map((id) => <Chip key={id} label={id} size="small" />)}
                </Box>
              )}
              {i < draft.grant.length - 1 && <Divider sx={{ mt: FIELD_GROUP_GAP }} />}
            </Box>
          ))}
        </Paper>
      )}

      {draft.relatedPublication.length > 0 && (
        <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
          <Typography variant="h2" sx={{ mb: SUBSECTION_GAP }}>Related Publication</Typography>
          {draft.relatedPublication.map((p, i) => (
            <Box key={i} sx={{ mb: FIELD_GROUP_GAP }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {p.title[lang] ?? "-"}
              </Typography>
              {p.doi && <Typography variant="body2">{p.doi}</Typography>}
              {i < draft.relatedPublication.length - 1 && <Divider sx={{ mt: FIELD_GROUP_GAP }} />}
            </Box>
          ))}
        </Paper>
      )}

      {draft.controlledAccessUser.length > 0 && (
        <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
          <Typography variant="h2" sx={{ mb: SUBSECTION_GAP }}>Controlled Access User</Typography>
          {draft.controlledAccessUser.map((u, i) => (
            <Box key={i} sx={{ mb: FIELD_GROUP_GAP }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {u.name[lang]?.text ?? "-"}
              </Typography>
              {u.organization && (
                <Typography variant="body2" color="text.secondary">
                  {u.organization.name[lang]?.text ?? ""}
                </Typography>
              )}
              {i < draft.controlledAccessUser.length - 1 && <Divider sx={{ mt: FIELD_GROUP_GAP }} />}
            </Box>
          ))}
        </Paper>
      )}

    </Box>
  )
}
