import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import { useAtomValue } from "jotai"

import { SectionHeader } from "@/components/SectionHeader"
import type { BilingualText, BilingualTextValue } from "@/schemas/common"
import { researchDraftAtom } from "@/stores/research-edit"
import { FIELD_GROUP_GAP, FORM_LABEL_SX, SECTION_GAP, SUBSECTION_GAP } from "@/theme"

type Lang = "ja" | "en"

const LABELS = {
  ja: {
    title: "タイトル",
    summary: "研究内容の概要",
    aims: "目的",
    methods: "方法",
    targets: "対象",
    dataProvider: "提供者情報",
    researchProject: "研究プロジェクト",
    grant: "科研費/助成金",
    relatedPublication: "関連論文",
    controlledAccessUser: "制限公開データの利用者一覧",
  },
  en: {
    title: "Title",
    summary: "Summary",
    aims: "Aims",
    methods: "Methods",
    targets: "Participants/Materials",
    dataProvider: "Data Provider",
    researchProject: "Research Project",
    grant: "Funds / Grants",
    relatedPublication: "Publications",
    controlledAccessUser: "Users (Controlled-access Data)",
  },
} as const

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

  const l = LABELS[lang]

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
      <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
        <Box sx={{ mb: SUBSECTION_GAP }}>
          <SectionHeader title={l.title} size="small" />
        </Box>
        <TextPreview label={l.title} value={draft.title} lang={lang} />
      </Paper>

      <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
        <Box sx={{ mb: SUBSECTION_GAP }}>
          <SectionHeader title={l.summary} size="small" />
        </Box>
        <TextValuePreview label={l.aims} value={draft.summary.aims} lang={lang} />
        <TextValuePreview label={l.methods} value={draft.summary.methods} lang={lang} />
        <TextValuePreview label={l.targets} value={draft.summary.targets} lang={lang} />
      </Paper>

      {draft.dataProvider.length > 0 && (
        <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
          <Box sx={{ mb: SUBSECTION_GAP }}>
            <SectionHeader title={l.dataProvider} size="small" />
          </Box>
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
          <Box sx={{ mb: SUBSECTION_GAP }}>
            <SectionHeader title={l.researchProject} size="small" />
          </Box>
          {draft.researchProject.map((p, i) => (
            <Typography key={i} variant="body1" sx={{ mb: 0.5 }}>
              {p.name[lang]?.text ?? "-"}
            </Typography>
          ))}
        </Paper>
      )}

      {draft.grant.length > 0 && (
        <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
          <Box sx={{ mb: SUBSECTION_GAP }}>
            <SectionHeader title={l.grant} size="small" />
          </Box>
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
                  {g.id.map((id) => <Chip key={id} label={id} size="small" sx={{ fontFamily: "monospace" }} />)}
                </Box>
              )}
              {i < draft.grant.length - 1 && <Divider sx={{ mt: FIELD_GROUP_GAP }} />}
            </Box>
          ))}
        </Paper>
      )}

      {draft.relatedPublication.length > 0 && (
        <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
          <Box sx={{ mb: SUBSECTION_GAP }}>
            <SectionHeader title={l.relatedPublication} size="small" />
          </Box>
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
          <Box sx={{ mb: SUBSECTION_GAP }}>
            <SectionHeader title={l.controlledAccessUser} size="small" />
          </Box>
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
