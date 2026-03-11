import AddOutlined from "@mui/icons-material/AddOutlined"
import DeleteOutlined from "@mui/icons-material/DeleteOutlined"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import Autocomplete from "@mui/material/Autocomplete"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Collapse from "@mui/material/Collapse"
import FormControl from "@mui/material/FormControl"
import IconButton from "@mui/material/IconButton"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import TextField from "@mui/material/TextField"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import equal from "fast-deep-equal"
import { useState } from "react"

import { NullableEnumSelect } from "@/components/common/NullableEnumSelect"
import { NullableNumberField } from "@/components/common/NullableNumberField"
import { TagInput } from "@/components/common/TagInput"
import { TriStateToggle } from "@/components/common/TriStateToggle"
import { SectionHeader } from "@/components/SectionHeader"
import { facetSuggestions } from "@/data/facet-suggestions"
import { SEARCHABLE_FIELD_META } from "@/data/searchable-field-meta"
import type { NormalizedPolicy, PolicyCanonical } from "@/schemas/common"
import { PolicyCanonicalSchema } from "@/schemas/common"
import type { DiseaseInfo, PlatformInfo, SearchableExperimentFields } from "@/schemas/dataset"
import {
  AgeGroupSchema,
  HealthStatusSchema,
  IsTumorSchema,
  ReadTypeSchema,
  SexSchema,
  SubjectCountTypeSchema,
} from "@/schemas/dataset"
import {
  createDefaultDiseaseInfo,
  createDefaultNormalizedPolicy,
  createDefaultPlatformInfo,
  createDefaultVariantCounts,
  getPolicyDefaults,
} from "@/schemas/defaults"
import { COMPACT_GAP, FIELD_GROUP_GAP, FORM_LABEL_SX, INLINE_GAP, INLINE_ICON_SIZE, MODIFIED_FIELD_BG, MODIFIED_FIELD_SX, SECTION_GAP, SUBSECTION_GAP } from "@/theme"

// Section field keys for completion calculation

const SECTION_KEYS = {
  overview: ["assayType", "tissues", "diseases", "healthStatus", "isTumor"],
  subject: ["subjectCount", "subjectCountType", "sex", "ageGroup", "population", "cellLine"],
  platform: ["platforms", "libraryKits", "readType", "readLength"],
  quality: ["sequencingDepth", "targetCoverage", "referenceGenome", "variantCounts", "hasPhenotypeData", "targets"],
  dataFormat: ["fileTypes", "processedDataTypes", "dataVolumeGb"],
  policy: ["policies"],
} as const satisfies Record<string, readonly (keyof SearchableExperimentFields)[]>

const countFilled = (
  fields: SearchableExperimentFields,
  keys: readonly (keyof SearchableExperimentFields)[],
): number => {
  let filled = 0
  for (const key of keys) {
    const v = fields[key]
    if (v === null || v === undefined) continue
    if (Array.isArray(v) && v.length === 0) continue
    if (typeof v === "string" && v === "") continue
    filled++
  }

  return filled
}

const ProgressChip = ({ filled, total }: { filled: number; total: number }) => (
  <Chip
    label={`${filled}/${total}`}
    size="small"
    color={filled === total ? "success" : "default"}
    variant="outlined"
    sx={{ height: 20, fontSize: "0.6875rem" }}
  />
)

const TWO_COL = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: FIELD_GROUP_GAP } as const

const SectionHelpPanel = ({ section, open }: { section: keyof typeof SECTION_KEYS; open: boolean }) => (
  <Collapse in={open}>
    <Box sx={{
      bgcolor: "action.hover",
      borderRadius: 1,
      p: 1.5,
      mb: FIELD_GROUP_GAP,
      display: "flex",
      flexDirection: "column",
      gap: COMPACT_GAP,
    }}>
      {SECTION_KEYS[section].map((key) => (
        <Typography key={key} variant="body2" color="text.secondary">
          <Typography component="span" variant="body2" fontWeight={600} color="text.primary">
            {SEARCHABLE_FIELD_META[key].label}
          </Typography>
          {" — "}
          {SEARCHABLE_FIELD_META[key].description}
        </Typography>
      ))}
    </Box>
  </Collapse>
)

interface SearchableFieldsEditorProps {
  fields: SearchableExperimentFields
  serverFields?: SearchableExperimentFields | undefined
  onChange: (fields: SearchableExperimentFields) => void
}

export const SearchableFieldsEditor = ({ fields, serverFields, onChange }: SearchableFieldsEditorProps) => {
  const [openHelp, setOpenHelp] = useState<Set<string>>(new Set())
  const toggleHelp = (section: string) => {
    setOpenHelp((prev) => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)

      return next
    })
  }

  const update = <K extends keyof SearchableExperimentFields>(key: K, value: SearchableExperimentFields[K]) => {
    onChange({ ...fields, [key]: value })
  }

  const isFieldModified = (key: keyof SearchableExperimentFields): boolean => {
    if (!serverFields) return false

    return !equal(fields[key], serverFields[key])
  }

  const updateDiseaseAt = (index: number, disease: DiseaseInfo) => {
    update("diseases", fields.diseases.map((d, i) => (i === index ? disease : d)))
  }

  const updatePlatformAt = (index: number, platform: PlatformInfo) => {
    update("platforms", fields.platforms.map((p, i) => (i === index ? platform : p)))
  }

  const updatePolicyAt = (index: number, policy: NormalizedPolicy) => {
    update("policies", fields.policies.map((p, i) => (i === index ? policy : p)))
  }

  const helpButton = (section: keyof typeof SECTION_KEYS) => (
    <Tooltip title="フィールドの説明">
      <IconButton size="small" onClick={() => toggleHelp(section)} color={openHelp.has(section) ? "primary" : "default"}>
        <HelpOutlineIcon sx={{ fontSize: INLINE_ICON_SIZE }} />
      </IconButton>
    </Tooltip>
  )

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
      {/* 実験の概要 */}
      <Box>
        <SectionHeader title="実験の概要" size="small" titleAction={helpButton("overview")} action={<ProgressChip filled={countFilled(fields, SECTION_KEYS.overview)} total={SECTION_KEYS.overview.length} />} />
        <Box sx={{ mt: INLINE_GAP, border: 1, borderColor: "divider", borderRadius: 1, p: SUBSECTION_GAP, display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP }}>
          <SectionHelpPanel section="overview" open={openHelp.has("overview")} />
          <TagInput label={SEARCHABLE_FIELD_META.assayType.label} value={fields.assayType} onChange={(v) => update("assayType", v)} options={facetSuggestions.assayType} sx={isFieldModified("assayType") ? MODIFIED_FIELD_SX : undefined} />
          <TagInput label={SEARCHABLE_FIELD_META.tissues.label} value={fields.tissues} onChange={(v) => update("tissues", v)} options={facetSuggestions.tissues} sx={isFieldModified("tissues") ? MODIFIED_FIELD_SX : undefined} />

          {/* Diseases */}
          <Box sx={isFieldModified("diseases") ? { bgcolor: MODIFIED_FIELD_BG, borderRadius: 1, p: 1, mx: -1 } : undefined}>
            <Typography variant="body2" sx={FORM_LABEL_SX}>{SEARCHABLE_FIELD_META.diseases.label}</Typography>
            {fields.diseases.map((disease, i) => (
              <Box key={i} sx={{ display: "flex", gap: INLINE_GAP, mt: 1, alignItems: "center" }}>
                <Autocomplete
                  freeSolo
                  options={facetSuggestions.diseaseLabel}
                  inputValue={disease.label}
                  onInputChange={(_, v) => updateDiseaseAt(i, { ...disease, label: v })}
                  renderInput={(params) => <TextField {...params} label="Label" />}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="ICD-10"
                  value={disease.icd10 ?? ""}
                  onChange={(e) => updateDiseaseAt(i, { ...disease, icd10: e.target.value || null })}
                  sx={{ width: 140 }}
                />
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => update("diseases", fields.diseases.filter((_, j) => j !== i))} color="error">
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
            <Button variant="outlined" size="small" startIcon={<AddOutlined />} onClick={() => update("diseases", [...fields.diseases, createDefaultDiseaseInfo()])} sx={{ mt: 1 }}>
              Add Disease
            </Button>
          </Box>

          <Box sx={TWO_COL}>
            <NullableEnumSelect label={SEARCHABLE_FIELD_META.healthStatus.label} value={fields.healthStatus} options={HealthStatusSchema.options} onChange={(v) => update("healthStatus", v as SearchableExperimentFields["healthStatus"])} sx={isFieldModified("healthStatus") ? MODIFIED_FIELD_SX : undefined} />
            <NullableEnumSelect label={SEARCHABLE_FIELD_META.isTumor.label} value={fields.isTumor} options={IsTumorSchema.options} onChange={(v) => update("isTumor", v as SearchableExperimentFields["isTumor"])} sx={isFieldModified("isTumor") ? MODIFIED_FIELD_SX : undefined} />
          </Box>
        </Box>
      </Box>

      {/* 被験者 */}
      <Box>
        <SectionHeader title="被験者" size="small" titleAction={helpButton("subject")} action={<ProgressChip filled={countFilled(fields, SECTION_KEYS.subject)} total={SECTION_KEYS.subject.length} />} />
        <Box sx={{ mt: INLINE_GAP, border: 1, borderColor: "divider", borderRadius: 1, p: SUBSECTION_GAP, display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP }}>
          <SectionHelpPanel section="subject" open={openHelp.has("subject")} />
          <Box sx={TWO_COL}>
            <NullableNumberField label={SEARCHABLE_FIELD_META.subjectCount.label} value={fields.subjectCount} onChange={(v) => update("subjectCount", v)} sx={isFieldModified("subjectCount") ? MODIFIED_FIELD_SX : undefined} />
            <NullableEnumSelect label={SEARCHABLE_FIELD_META.subjectCountType.label} value={fields.subjectCountType} options={SubjectCountTypeSchema.options} onChange={(v) => update("subjectCountType", v as SearchableExperimentFields["subjectCountType"])} sx={isFieldModified("subjectCountType") ? MODIFIED_FIELD_SX : undefined} />
          </Box>
          <Box sx={TWO_COL}>
            <NullableEnumSelect label={SEARCHABLE_FIELD_META.sex.label} value={fields.sex} options={SexSchema.options} onChange={(v) => update("sex", v as SearchableExperimentFields["sex"])} sx={isFieldModified("sex") ? MODIFIED_FIELD_SX : undefined} />
            <NullableEnumSelect label={SEARCHABLE_FIELD_META.ageGroup.label} value={fields.ageGroup} options={AgeGroupSchema.options} onChange={(v) => update("ageGroup", v as SearchableExperimentFields["ageGroup"])} sx={isFieldModified("ageGroup") ? MODIFIED_FIELD_SX : undefined} />
          </Box>
          <TagInput label={SEARCHABLE_FIELD_META.population.label} value={fields.population} onChange={(v) => update("population", v)} options={facetSuggestions.population} sx={isFieldModified("population") ? MODIFIED_FIELD_SX : undefined} />
          <TagInput label={SEARCHABLE_FIELD_META.cellLine.label} value={fields.cellLine} onChange={(v) => update("cellLine", v)} options={facetSuggestions.cellLine} sx={isFieldModified("cellLine") ? MODIFIED_FIELD_SX : undefined} />
        </Box>
      </Box>

      {/* プラットフォーム・手法 */}
      <Box>
        <SectionHeader title="プラットフォーム・手法" size="small" titleAction={helpButton("platform")} action={<ProgressChip filled={countFilled(fields, SECTION_KEYS.platform)} total={SECTION_KEYS.platform.length} />} />
        <Box sx={{ mt: INLINE_GAP, border: 1, borderColor: "divider", borderRadius: 1, p: SUBSECTION_GAP, display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP }}>
          <SectionHelpPanel section="platform" open={openHelp.has("platform")} />
          <Box sx={isFieldModified("platforms") ? { bgcolor: MODIFIED_FIELD_BG, borderRadius: 1, p: 1, mx: -1 } : undefined}>
            <Typography variant="body2" sx={FORM_LABEL_SX}>{SEARCHABLE_FIELD_META.platforms.label}</Typography>
            {fields.platforms.map((platform, i) => (
              <Box key={i} sx={{ display: "flex", gap: INLINE_GAP, mt: 1, alignItems: "center" }}>
                <Autocomplete
                  freeSolo
                  options={facetSuggestions.platformVendor}
                  inputValue={platform.vendor ?? ""}
                  onInputChange={(_, v) => updatePlatformAt(i, { ...platform, vendor: v || null })}
                  renderInput={(params) => <TextField {...params} label="Vendor" />}
                  sx={{ flex: 1 }}
                />
                <Autocomplete
                  freeSolo
                  options={facetSuggestions.platformModel}
                  inputValue={platform.model ?? ""}
                  onInputChange={(_, v) => updatePlatformAt(i, { ...platform, model: v || null })}
                  renderInput={(params) => <TextField {...params} label="Model" />}
                  sx={{ flex: 1 }}
                />
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => update("platforms", fields.platforms.filter((_, j) => j !== i))} color="error">
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
            <Button variant="outlined" size="small" startIcon={<AddOutlined />} onClick={() => update("platforms", [...fields.platforms, createDefaultPlatformInfo()])} sx={{ mt: 1 }}>
              Add Platform
            </Button>
          </Box>

          <TagInput label={SEARCHABLE_FIELD_META.libraryKits.label} value={fields.libraryKits} onChange={(v) => update("libraryKits", v)} options={facetSuggestions.libraryKits} sx={isFieldModified("libraryKits") ? MODIFIED_FIELD_SX : undefined} />

          <Box sx={TWO_COL}>
            <NullableEnumSelect label={SEARCHABLE_FIELD_META.readType.label} value={fields.readType} options={ReadTypeSchema.options} onChange={(v) => update("readType", v as SearchableExperimentFields["readType"])} sx={isFieldModified("readType") ? MODIFIED_FIELD_SX : undefined} />
            <NullableNumberField label={SEARCHABLE_FIELD_META.readLength.label} value={fields.readLength} onChange={(v) => update("readLength", v)} sx={isFieldModified("readLength") ? MODIFIED_FIELD_SX : undefined} />
          </Box>
        </Box>
      </Box>

      {/* シーケンシング品質 */}
      <Box>
        <SectionHeader title="シーケンシング品質" size="small" titleAction={helpButton("quality")} action={<ProgressChip filled={countFilled(fields, SECTION_KEYS.quality)} total={SECTION_KEYS.quality.length} />} />
        <Box sx={{ mt: INLINE_GAP, border: 1, borderColor: "divider", borderRadius: 1, p: SUBSECTION_GAP, display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP }}>
          <SectionHelpPanel section="quality" open={openHelp.has("quality")} />
          <Box sx={TWO_COL}>
            <NullableNumberField label={SEARCHABLE_FIELD_META.sequencingDepth.label} value={fields.sequencingDepth} onChange={(v) => update("sequencingDepth", v)} sx={isFieldModified("sequencingDepth") ? MODIFIED_FIELD_SX : undefined} />
            <NullableNumberField label={SEARCHABLE_FIELD_META.targetCoverage.label} value={fields.targetCoverage} onChange={(v) => update("targetCoverage", v)} sx={isFieldModified("targetCoverage") ? MODIFIED_FIELD_SX : undefined} />
          </Box>

          <TagInput label={SEARCHABLE_FIELD_META.referenceGenome.label} value={fields.referenceGenome} onChange={(v) => update("referenceGenome", v)} options={facetSuggestions.referenceGenome} sx={isFieldModified("referenceGenome") ? MODIFIED_FIELD_SX : undefined} />

          {/* Variant Counts */}
          <Box sx={isFieldModified("variantCounts") ? { bgcolor: MODIFIED_FIELD_BG, borderRadius: 1, p: 1, mx: -1 } : undefined}>
            <Typography variant="body2" sx={FORM_LABEL_SX}>{SEARCHABLE_FIELD_META.variantCounts.label}</Typography>
            {fields.variantCounts === null ? (
              <Button size="small" variant="outlined" onClick={() => update("variantCounts", createDefaultVariantCounts())} sx={{ mt: 0.5 }}>
                Set Variant Counts
              </Button>
            ) : (
              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: FIELD_GROUP_GAP }}>
                  {(["snv", "indel", "cnv", "sv", "total"] as const).map((k) => (
                    <NullableNumberField
                      key={k}
                      label={k.toUpperCase()}
                      value={fields.variantCounts?.[k] ?? null}
                      onChange={(v) => {
                        if (!fields.variantCounts) return
                        update("variantCounts", { ...fields.variantCounts, [k]: v })
                      }}
                    />
                  ))}
                </Box>
                <Button size="small" variant="outlined" color="warning" onClick={() => update("variantCounts", null)} sx={{ mt: 1 }}>
                  Clear Variant Counts
                </Button>
              </Box>
            )}
          </Box>

          <TriStateToggle label={SEARCHABLE_FIELD_META.hasPhenotypeData.label} value={fields.hasPhenotypeData} onChange={(v) => update("hasPhenotypeData", v)} sx={isFieldModified("hasPhenotypeData") ? { bgcolor: MODIFIED_FIELD_BG, borderRadius: 1, p: 1, mx: -1 } : undefined} />

          <Autocomplete
            freeSolo
            options={facetSuggestions.targets}
            inputValue={fields.targets ?? ""}
            onInputChange={(_, v) => update("targets", v || null)}
            renderInput={(params) => <TextField {...params} label={SEARCHABLE_FIELD_META.targets.label} />}
            sx={isFieldModified("targets") ? MODIFIED_FIELD_SX : undefined}
          />
        </Box>
      </Box>

      {/* データ形式 */}
      <Box>
        <SectionHeader title="データ形式" size="small" titleAction={helpButton("dataFormat")} action={<ProgressChip filled={countFilled(fields, SECTION_KEYS.dataFormat)} total={SECTION_KEYS.dataFormat.length} />} />
        <Box sx={{ mt: INLINE_GAP, border: 1, borderColor: "divider", borderRadius: 1, p: SUBSECTION_GAP, display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP }}>
          <SectionHelpPanel section="dataFormat" open={openHelp.has("dataFormat")} />
          <TagInput label={SEARCHABLE_FIELD_META.fileTypes.label} value={fields.fileTypes} onChange={(v) => update("fileTypes", v)} options={facetSuggestions.fileTypes} sx={isFieldModified("fileTypes") ? MODIFIED_FIELD_SX : undefined} />
          <TagInput label={SEARCHABLE_FIELD_META.processedDataTypes.label} value={fields.processedDataTypes} onChange={(v) => update("processedDataTypes", v)} options={facetSuggestions.processedDataTypes} sx={isFieldModified("processedDataTypes") ? MODIFIED_FIELD_SX : undefined} />
          <NullableNumberField label={SEARCHABLE_FIELD_META.dataVolumeGb.label} value={fields.dataVolumeGb} onChange={(v) => update("dataVolumeGb", v)} sx={isFieldModified("dataVolumeGb") ? MODIFIED_FIELD_SX : undefined} />
        </Box>
      </Box>

      {/* ポリシー */}
      <Box>
        <SectionHeader title="ポリシー" size="small" titleAction={helpButton("policy")} action={<ProgressChip filled={countFilled(fields, SECTION_KEYS.policy)} total={SECTION_KEYS.policy.length} />} />
        <Box sx={{ mt: INLINE_GAP, border: 1, borderColor: "divider", borderRadius: 1, p: SUBSECTION_GAP }}>
          <SectionHelpPanel section="policy" open={openHelp.has("policy")} />
          {fields.policies.map((policy, i) => (
            <Box key={i} sx={{
              display: "flex",
              flexDirection: "column",
              gap: FIELD_GROUP_GAP,
              mt: i > 0 ? SUBSECTION_GAP : 0,
              p: 1.5,
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              ...(isFieldModified("policies") && { bgcolor: MODIFIED_FIELD_BG }),
            }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" fontWeight={600}>Policy #{i + 1}</Typography>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => update("policies", fields.policies.filter((_, j) => j !== i))} color="error">
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <FormControl fullWidth size="small">
                <InputLabel>ID</InputLabel>
                <Select
                  value={policy.id}
                  label="ID"
                  onChange={(e) => {
                    const newId = e.target.value as PolicyCanonical
                    updatePolicyAt(i, { ...policy, id: newId, ...getPolicyDefaults(newId) })
                  }}
                >
                  {PolicyCanonicalSchema.options.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={TWO_COL}>
                <TextField label="Name (JA)" value={policy.name.ja} onChange={(e) => updatePolicyAt(i, { ...policy, name: { ...policy.name, ja: e.target.value } })} fullWidth />
                <TextField label="Name (EN)" value={policy.name.en} onChange={(e) => updatePolicyAt(i, { ...policy, name: { ...policy.name, en: e.target.value } })} fullWidth />
              </Box>
              <TextField label="URL" value={policy.url ?? ""} onChange={(e) => updatePolicyAt(i, { ...policy, url: e.target.value || null })} fullWidth />
            </Box>
          ))}
          <Button variant="outlined" size="small" startIcon={<AddOutlined />} onClick={() => update("policies", [...fields.policies, createDefaultNormalizedPolicy()])} sx={{ mt: 1 }}>
            Add Policy
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
