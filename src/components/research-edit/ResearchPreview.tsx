import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import { useAtomValue } from "jotai"

import type { BilingualText, BilingualTextValue } from "@/schemas/common"
import type { ResearchVersion } from "@/schemas/research-version"
import { researchDraftAtom } from "@/stores/research-edit"
import { FIELD_GROUP_GAP, FORM_LABEL_SX, MONOSPACE_FONT_FAMILY, MONOSPACE_ID_SX, SECTION_GAP, SUBSECTION_GAP } from "@/theme"

interface ResearchPreviewProps {
  versions: ResearchVersion[]
}

const BilingualTextPreview = ({ label, value }: { label: string; value: BilingualText }) => (
  <Box sx={{ mb: FIELD_GROUP_GAP }}>
    <Typography variant="body2" sx={FORM_LABEL_SX}>
      {label}
    </Typography>
    <Box sx={{ display: "flex", gap: SUBSECTION_GAP }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" color="text.secondary">JA</Typography>
        <Typography variant="body1">{value.ja ?? "-"}</Typography>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" color="text.secondary">EN</Typography>
        <Typography variant="body1">{value.en ?? "-"}</Typography>
      </Box>
    </Box>
  </Box>
)

const BilingualTextValuePreview = ({ label, value }: { label: string; value: BilingualTextValue }) => (
  <Box sx={{ mb: FIELD_GROUP_GAP }}>
    <Typography variant="body2" sx={FORM_LABEL_SX}>
      {label}
    </Typography>
    <Box sx={{ display: "flex", gap: SUBSECTION_GAP }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" color="text.secondary">JA</Typography>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {value.ja?.text ?? "-"}
        </Typography>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" color="text.secondary">EN</Typography>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {value.en?.text ?? "-"}
        </Typography>
      </Box>
    </Box>
  </Box>
)

export const ResearchPreview = ({ versions }: ResearchPreviewProps) => {
  const draft = useAtomValue(researchDraftAtom)

  if (!draft) return null

  const latestVersion = versions.at(-1)

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
      <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
        <Typography variant="h2" sx={{ mb: SUBSECTION_GAP }}>Basic Info</Typography>
        <Typography variant="body1" sx={{ ...MONOSPACE_ID_SX, mb: 1 }}>
          {draft.humId}
        </Typography>
        <BilingualTextPreview label="URL" value={draft.url} />
        <Typography variant="body2" color="text.secondary">
          Published: {draft.datePublished} / Modified: {draft.dateModified}
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
        <Typography variant="h2" sx={{ mb: SUBSECTION_GAP }}>Title</Typography>
        <BilingualTextPreview label="Title" value={draft.title} />
      </Paper>

      <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
        <Typography variant="h2" sx={{ mb: SUBSECTION_GAP }}>Summary</Typography>
        <BilingualTextValuePreview label="Aims" value={draft.summary.aims} />
        <BilingualTextValuePreview label="Methods" value={draft.summary.methods} />
        <BilingualTextValuePreview label="Targets" value={draft.summary.targets} />
      </Paper>

      {(draft.summary.footers.ja.length > 0 || draft.summary.footers.en.length > 0) && (
        <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
          <Typography variant="h2" sx={{ mb: SUBSECTION_GAP }}>Footers</Typography>
          <Box sx={{ display: "flex", gap: SUBSECTION_GAP }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">JA</Typography>
              {draft.summary.footers.ja.map((f, i) => (
                <Typography key={i} variant="body1" sx={{ mb: 0.5 }}>
                  {f.text || "-"}
                </Typography>
              ))}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">EN</Typography>
              {draft.summary.footers.en.map((f, i) => (
                <Typography key={i} variant="body1" sx={{ mb: 0.5 }}>
                  {f.text || "-"}
                </Typography>
              ))}
            </Box>
          </Box>
        </Paper>
      )}

      {draft.dataProvider.length > 0 && (
        <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
          <Typography variant="h2" sx={{ mb: SUBSECTION_GAP }}>Data Provider</Typography>
          {draft.dataProvider.map((p, i) => (
            <Box key={i} sx={{ mb: FIELD_GROUP_GAP }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {p.name.ja?.text || p.name.en?.text || "-"}
              </Typography>
              {p.organization && (
                <Typography variant="body2" color="text.secondary">
                  {p.organization.name.ja?.text || p.organization.name.en?.text || ""}
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
              {p.name.ja?.text || p.name.en?.text || "-"}
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
                {g.title.ja || g.title.en || "-"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {g.agency.name.ja || g.agency.name.en || ""}
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
                {p.title.ja || p.title.en || "-"}
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
                {u.name.ja?.text || u.name.en?.text || "-"}
              </Typography>
              {u.organization && (
                <Typography variant="body2" color="text.secondary">
                  {u.organization.name.ja?.text || u.organization.name.en?.text || ""}
                </Typography>
              )}
              {i < draft.controlledAccessUser.length - 1 && <Divider sx={{ mt: FIELD_GROUP_GAP }} />}
            </Box>
          ))}
        </Paper>
      )}

      {latestVersion && (
        <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
          <Typography variant="h2" sx={{ mb: SUBSECTION_GAP }}>
            Versions ({versions.length})
          </Typography>
          {versions.map((v) => (
            <Box key={v.humVersionId} sx={{ mb: 1 }}>
              <Typography variant="body1" sx={{ fontFamily: MONOSPACE_FONT_FAMILY }}>
                {v.version} ({v.versionReleaseDate}) - {v.datasets.length} datasets
              </Typography>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  )
}
