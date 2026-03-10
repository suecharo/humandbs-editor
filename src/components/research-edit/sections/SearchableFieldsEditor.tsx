import AddOutlined from "@mui/icons-material/AddOutlined"
import DeleteOutlined from "@mui/icons-material/DeleteOutlined"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import FormControl from "@mui/material/FormControl"
import IconButton from "@mui/material/IconButton"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import TextField from "@mui/material/TextField"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"

import { NullableEnumSelect } from "@/components/common/NullableEnumSelect"
import { NullableNumberField } from "@/components/common/NullableNumberField"
import { TagInput } from "@/components/common/TagInput"
import { TriStateToggle } from "@/components/common/TriStateToggle"
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
} from "@/schemas/defaults"
import { FIELD_GROUP_GAP, FORM_FIELD_MAX_WIDTH, FORM_LABEL_SX, SUBSECTION_GAP } from "@/theme"

interface SearchableFieldsEditorProps {
  fields: SearchableExperimentFields
  onChange: (fields: SearchableExperimentFields) => void
}

const SectionTitle = ({ title }: { title: string }) => (
  <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: SUBSECTION_GAP, mb: 1 }}>
    {title}
  </Typography>
)

export const SearchableFieldsEditor = ({ fields, onChange }: SearchableFieldsEditorProps) => {
  const update = <K extends keyof SearchableExperimentFields>(key: K, value: SearchableExperimentFields[K]) => {
    onChange({ ...fields, [key]: value })
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

  return (
    <Box>
      {/* Subject/Sample info */}
      <SectionTitle title="被験者・サンプル情報" />
      <Box sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP, maxWidth: FORM_FIELD_MAX_WIDTH }}>
        <NullableNumberField label="Subject Count" value={fields.subjectCount} onChange={(v) => update("subjectCount", v)} />
        <NullableEnumSelect label="Subject Count Type" value={fields.subjectCountType} options={SubjectCountTypeSchema.options} onChange={(v) => update("subjectCountType", v as SearchableExperimentFields["subjectCountType"])} />
        <NullableEnumSelect label="Health Status" value={fields.healthStatus} options={HealthStatusSchema.options} onChange={(v) => update("healthStatus", v as SearchableExperimentFields["healthStatus"])} />

        {/* Diseases array */}
        <Box>
          <Typography variant="body2" sx={FORM_LABEL_SX}>Diseases</Typography>
          {fields.diseases.map((disease, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1, mt: 1, alignItems: "center" }}>
              <TextField label="Label" value={disease.label} onChange={(e) => updateDiseaseAt(i, { ...disease, label: e.target.value })} sx={{ flex: 1 }} />
              <TextField label="ICD-10" value={disease.icd10 ?? ""} onChange={(e) => updateDiseaseAt(i, { ...disease, icd10: e.target.value || null })} sx={{ flex: 1 }} />
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => update("diseases", fields.diseases.filter((_, j) => j !== i))} color="error">
                  <DeleteOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
          <Button size="small" startIcon={<AddOutlined />} onClick={() => update("diseases", [...fields.diseases, createDefaultDiseaseInfo()])} sx={{ mt: 1 }}>
            Add Disease
          </Button>
        </Box>

        <TagInput label="Tissues" value={fields.tissues} onChange={(v) => update("tissues", v)} />
        <NullableEnumSelect label="Is Tumor" value={fields.isTumor} options={IsTumorSchema.options} onChange={(v) => update("isTumor", v as SearchableExperimentFields["isTumor"])} />
        <TagInput label="Cell Line" value={fields.cellLine} onChange={(v) => update("cellLine", v)} />
        <TagInput label="Population" value={fields.population} onChange={(v) => update("population", v)} />
      </Box>

      <Divider sx={{ my: SUBSECTION_GAP }} />

      {/* Demographics */}
      <SectionTitle title="人口統計" />
      <Box sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP, maxWidth: FORM_FIELD_MAX_WIDTH }}>
        <NullableEnumSelect label="Sex" value={fields.sex} options={SexSchema.options} onChange={(v) => update("sex", v as SearchableExperimentFields["sex"])} />
        <NullableEnumSelect label="Age Group" value={fields.ageGroup} options={AgeGroupSchema.options} onChange={(v) => update("ageGroup", v as SearchableExperimentFields["ageGroup"])} />
      </Box>

      <Divider sx={{ my: SUBSECTION_GAP }} />

      {/* Experimental methods */}
      <SectionTitle title="実験手法" />
      <Box sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP, maxWidth: FORM_FIELD_MAX_WIDTH }}>
        <TagInput label="Assay Type" value={fields.assayType} onChange={(v) => update("assayType", v)} />
        <TagInput label="Library Kits" value={fields.libraryKits} onChange={(v) => update("libraryKits", v)} />

        {/* Platforms array */}
        <Box>
          <Typography variant="body2" sx={FORM_LABEL_SX}>Platforms</Typography>
          {fields.platforms.map((platform, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1, mt: 1, alignItems: "center" }}>
              <TextField label="Vendor" value={platform.vendor ?? ""} onChange={(e) => updatePlatformAt(i, { ...platform, vendor: e.target.value || null })} sx={{ flex: 1 }} />
              <TextField label="Model" value={platform.model ?? ""} onChange={(e) => updatePlatformAt(i, { ...platform, model: e.target.value || null })} sx={{ flex: 1 }} />
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => update("platforms", fields.platforms.filter((_, j) => j !== i))} color="error">
                  <DeleteOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
          <Button size="small" startIcon={<AddOutlined />} onClick={() => update("platforms", [...fields.platforms, createDefaultPlatformInfo()])} sx={{ mt: 1 }}>
            Add Platform
          </Button>
        </Box>

        <NullableEnumSelect label="Read Type" value={fields.readType} options={ReadTypeSchema.options} onChange={(v) => update("readType", v as SearchableExperimentFields["readType"])} />
        <NullableNumberField label="Read Length (bp)" value={fields.readLength} onChange={(v) => update("readLength", v)} />
      </Box>

      <Divider sx={{ my: SUBSECTION_GAP }} />

      {/* Sequencing quality */}
      <SectionTitle title="シーケンシング品質" />
      <Box sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP, maxWidth: FORM_FIELD_MAX_WIDTH }}>
        <NullableNumberField label="Sequencing Depth" value={fields.sequencingDepth} onChange={(v) => update("sequencingDepth", v)} />
        <NullableNumberField label="Target Coverage" value={fields.targetCoverage} onChange={(v) => update("targetCoverage", v)} />
        <TagInput label="Reference Genome" value={fields.referenceGenome} onChange={(v) => update("referenceGenome", v)} />

        {/* Variant Counts */}
        <Box>
          <Typography variant="body2" sx={FORM_LABEL_SX}>Variant Counts</Typography>
          {fields.variantCounts === null ? (
            <Button size="small" onClick={() => update("variantCounts", createDefaultVariantCounts())} sx={{ mt: 0.5 }}>
              Set Variant Counts
            </Button>
          ) : (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP }}>
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
              <Button size="small" color="warning" onClick={() => update("variantCounts", null)} sx={{ mt: 1 }}>
                Clear Variant Counts
              </Button>
            </Box>
          )}
        </Box>

        <TriStateToggle label="Has Phenotype Data" value={fields.hasPhenotypeData} onChange={(v) => update("hasPhenotypeData", v)} />
        <TextField label="Targets" value={fields.targets ?? ""} onChange={(e) => update("targets", e.target.value || null)} fullWidth />
      </Box>

      <Divider sx={{ my: SUBSECTION_GAP }} />

      {/* Data info */}
      <SectionTitle title="データ情報" />
      <Box sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP, maxWidth: FORM_FIELD_MAX_WIDTH }}>
        <TagInput label="File Types" value={fields.fileTypes} onChange={(v) => update("fileTypes", v)} />
        <TagInput label="Processed Data Types" value={fields.processedDataTypes} onChange={(v) => update("processedDataTypes", v)} />
        <NullableNumberField label="Data Volume (GB)" value={fields.dataVolumeGb} onChange={(v) => update("dataVolumeGb", v)} />
      </Box>

      <Divider sx={{ my: SUBSECTION_GAP }} />

      {/* Policies */}
      <SectionTitle title="ポリシー" />
      <Box sx={{ maxWidth: FORM_FIELD_MAX_WIDTH }}>
        {fields.policies.map((policy, i) => (
          <Box key={i} sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP, mt: i > 0 ? SUBSECTION_GAP : 0, p: 1.5, border: 1, borderColor: "divider", borderRadius: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" fontWeight={600}>Policy #{i + 1}</Typography>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => update("policies", fields.policies.filter((_, j) => j !== i))} color="error">
                  <DeleteOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <FormControl fullWidth>
              <InputLabel>ID</InputLabel>
              <Select
                value={policy.id}
                label="ID"
                onChange={(e) => updatePolicyAt(i, { ...policy, id: e.target.value as PolicyCanonical })}
              >
                {PolicyCanonicalSchema.options.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Name (JA)" value={policy.name.ja} onChange={(e) => updatePolicyAt(i, { ...policy, name: { ...policy.name, ja: e.target.value } })} fullWidth />
            <TextField label="Name (EN)" value={policy.name.en} onChange={(e) => updatePolicyAt(i, { ...policy, name: { ...policy.name, en: e.target.value } })} fullWidth />
            <TextField label="URL" value={policy.url ?? ""} onChange={(e) => updatePolicyAt(i, { ...policy, url: e.target.value || null })} fullWidth />
          </Box>
        ))}
        <Button size="small" startIcon={<AddOutlined />} onClick={() => update("policies", [...fields.policies, createDefaultNormalizedPolicy()])} sx={{ mt: 1 }}>
          Add Policy
        </Button>
      </Box>
    </Box>
  )
}
