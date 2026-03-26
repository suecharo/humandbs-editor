import { describe, it, expect } from "vitest"

import type {
  CollaboratorForm,
  DsFormData,
  DuFormData,
} from "../../../src/schemas/jga-form"
import {
  createDefaultDsFormData,
  createDefaultDuFormData,
} from "../../../src/schemas/jga-form"
import {
  buildDsOutput,
  buildDuOutput,
} from "../../../src/utils/jga-reverse-transform"

describe("buildDsOutput", () => {
  it("returns empty components for default (all empty) form", () => {
    const form = createDefaultDsFormData()
    const output = buildDsOutput(form)

    expect(output.language_type).toBe(1)
    expect(output.components).toEqual([])
  })

  it("converts bilingual study title to two components", () => {
    const form: DsFormData = {
      ...createDefaultDsFormData(),
      studyTitle: { ja: "テスト題目", en: "Test Title" },
    }
    const output = buildDsOutput(form)

    expect(output.components).toContainEqual({
      key: "submission_study_title",
      value: "テスト題目",
    })
    expect(output.components).toContainEqual({
      key: "submission_study_title_en",
      value: "Test Title",
    })
  })

  it("skips bilingual field when only one language is filled", () => {
    const form: DsFormData = {
      ...createDefaultDsFormData(),
      aim: { ja: "テスト目的", en: "" },
    }
    const output = buildDsOutput(form)

    expect(output.components).toContainEqual({
      key: "aim",
      value: "テスト目的",
    })
    expect(output.components.find((c) => c.key === "aim_en")).toBeUndefined()
  })

  it("converts single-value fields", () => {
    const form: DsFormData = {
      ...createDefaultDsFormData(),
      publication: "Nature 2025",
      icd10: "C00-C97",
      releaseDate: "2025-12-01",
    }
    const output = buildDsOutput(form)

    expect(output.components).toContainEqual({
      key: "submission_publication",
      value: "Nature 2025",
    })
    expect(output.components).toContainEqual({
      key: "icd10",
      value: "C00-C97",
    })
    expect(output.components).toContainEqual({
      key: "release_date",
      value: "2025-12-01",
    })
  })

  it("converts data array with interleaved keys", () => {
    const form: DsFormData = {
      ...createDefaultDsFormData(),
      data: [
        {
          dataAccess: "submission_open",
          studyType: "study_type_wgs",
          studyTypeOther: "",
          target: "cancer",
          fileFormat: "BAM",
          fileSize: "100GB",
        },
        {
          dataAccess: "submission_type1",
          studyType: "study_type_wes",
          studyTypeOther: "",
          target: "rare disease",
          fileFormat: "VCF",
          fileSize: "10GB",
        },
      ],
    }
    const output = buildDsOutput(form)

    const dataAccessComponents = output.components.filter(
      (c) => c.key === "data_access",
    )
    expect(dataAccessComponents).toEqual([
      { key: "data_access", value: "submission_open" },
      { key: "data_access", value: "submission_type1" },
    ])

    const studyTypeComponents = output.components.filter(
      (c) => c.key === "study_type",
    )
    expect(studyTypeComponents).toEqual([
      { key: "study_type", value: "study_type_wgs" },
      { key: "study_type", value: "study_type_wes" },
    ])

    const studyTypeOther = output.components.filter(
      (c) => c.key === "study_type_other",
    )
    expect(studyTypeOther).toEqual([
      { key: "study_type_other", value: "" },
      { key: "study_type_other", value: "" },
    ])
  })

  it("preserves comma-separated studyType as a single value (no split)", () => {
    const form: DsFormData = {
      ...createDefaultDsFormData(),
      data: [
        {
          dataAccess: "submission_open",
          studyType: "study_type_wgs,study_type_wes",
          studyTypeOther: "",
          target: "cancer",
          fileFormat: "BAM",
          fileSize: "100GB",
        },
      ],
    }
    const output = buildDsOutput(form)

    const studyTypeComponents = output.components.filter(
      (c) => c.key === "study_type",
    )
    expect(studyTypeComponents).toEqual([
      { key: "study_type", value: "study_type_wgs,study_type_wes" },
    ])
  })

  it("skips all-empty data entries", () => {
    const form: DsFormData = {
      ...createDefaultDsFormData(),
      data: [
        {
          dataAccess: "submission_open",
          studyType: "study_type_wgs",
          studyTypeOther: "",
          target: "",
          fileFormat: "BAM",
          fileSize: "",
        },
        {
          dataAccess: "",
          studyType: "",
          studyTypeOther: "",
          target: "",
          fileFormat: "",
          fileSize: "",
        },
      ],
    }
    const output = buildDsOutput(form)

    const dataAccessComponents = output.components.filter(
      (c) => c.key === "data_access",
    )
    expect(dataAccessComponents).toHaveLength(1)
    expect(dataAccessComponents[0]!.value).toBe("submission_open")
  })

  it("skips all-empty collaborator entries", () => {
    const form: DsFormData = {
      ...createDefaultDsFormData(),
      collaborators: [
        { name: "Alice", division: "", job: "", eradid: "", orcid: "", seminar: "" },
        { name: "", division: "", job: "", eradid: "", orcid: "", seminar: "" },
      ],
    }
    const output = buildDsOutput(form)

    const names = output.components.filter(
      (c) => c.key === "collaborator_name",
    )
    expect(names).toHaveLength(1)
    expect(names[0]!.value).toBe("Alice")
  })

  it("converts collaborators with interleaved keys", () => {
    const collaborators: CollaboratorForm[] = [
      { name: "Alice", division: "Lab A", job: "Prof", eradid: "", orcid: "0000-0001", seminar: "yes" },
      { name: "Bob", division: "Lab B", job: "Assoc Prof", eradid: "e001", orcid: "", seminar: "no" },
    ]
    const form: DsFormData = {
      ...createDefaultDsFormData(),
      collaborators,
    }
    const output = buildDsOutput(form)

    const names = output.components.filter(
      (c) => c.key === "collaborator_name",
    )
    expect(names).toEqual([
      { key: "collaborator_name", value: "Alice" },
      { key: "collaborator_name", value: "Bob" },
    ])

    const divisions = output.components.filter(
      (c) => c.key === "collaborator_division",
    )
    expect(divisions).toEqual([
      { key: "collaborator_division", value: "Lab A" },
      { key: "collaborator_division", value: "Lab B" },
    ])

    const eradids = output.components.filter(
      (c) => c.key === "collaborator_eradid",
    )
    expect(eradids).toEqual([
      { key: "collaborator_eradid", value: "" },
      { key: "collaborator_eradid", value: "e001" },
    ])

    const orcids = output.components.filter(
      (c) => c.key === "collaborator_orcid",
    )
    expect(orcids).toEqual([
      { key: "collaborator_orcid", value: "0000-0001" },
      { key: "collaborator_orcid", value: "" },
    ])
  })

  it("preserves multivalue index alignment when some fields are empty", () => {
    const collaborators: CollaboratorForm[] = [
      { name: "Alice", division: "Lab A", job: "", eradid: "", orcid: "", seminar: "" },
      { name: "Bob", division: "", job: "Prof", eradid: "e001", orcid: "0000-0001", seminar: "yes" },
    ]
    const form: DsFormData = {
      ...createDefaultDsFormData(),
      collaborators,
    }
    const output = buildDsOutput(form)

    const fieldKeys = [
      "collaborator_name",
      "collaborator_division",
      "collaborator_job",
      "collaborator_eradid",
      "collaborator_orcid",
      "collaborator_seminar",
    ] as const
    for (const key of fieldKeys) {
      const values = output.components.filter((c) => c.key === key)
      expect(values).toHaveLength(2)
    }
  })

  it("respects language_type selection", () => {
    const form: DsFormData = {
      ...createDefaultDsFormData(),
      languageType: 2,
    }
    const output = buildDsOutput(form)

    expect(output.language_type).toBe(2)
  })

  it("includes collaborator_seminar", () => {
    const form: DsFormData = {
      ...createDefaultDsFormData(),
      collaborators: [
        { name: "Alice", division: "", job: "", eradid: "", orcid: "", seminar: "yes" },
      ],
    }
    const output = buildDsOutput(form)

    expect(output.components).toContainEqual({
      key: "collaborator_seminar",
      value: "yes",
    })
  })

  it("converts DS ethics review fields with backend keys", () => {
    const form: DsFormData = {
      ...createDefaultDsFormData(),
      nbdcGuidelineStatus: "yes",
      deIdentificationStatus: "scheduled",
      deIdentificationDate: "2026-06-01",
      submissionReviewStatus: "completed",
      submissionReviewDate: "2026-01-15",
      companyUseStatus: "ok",
      multicenterStatus: "yes",
      nbdcDataProcessingStatus: "ok",
    }
    const output = buildDsOutput(form)

    expect(output.components).toContainEqual({
      key: "nbdc_guideline_status",
      value: "yes",
    })
    expect(output.components).toContainEqual({
      key: "de_identification_status",
      value: "scheduled",
    })
    expect(output.components).toContainEqual({
      key: "de_identification_date",
      value: "2026-06-01",
    })
    expect(output.components).toContainEqual({
      key: "submission_review_status",
      value: "completed",
    })
    expect(output.components).toContainEqual({
      key: "company_use_status",
      value: "ok",
    })
    expect(output.components).toContainEqual({
      key: "multicenter_collaborative_study_status",
      value: "yes",
    })
    expect(output.components).toContainEqual({
      key: "nbdc_data_processing_status",
      value: "ok",
    })
  })

  it("skips empty DS ethics review fields", () => {
    const form = createDefaultDsFormData()
    const output = buildDsOutput(form)
    const keys = new Set(output.components.map((c) => c.key))

    expect(keys.has("nbdc_guideline_status")).toBe(false)
    expect(keys.has("de_identification_status")).toBe(false)
    expect(keys.has("company_use_status")).toBe(false)
    expect(keys.has("nbdc_data_processing_status")).toBe(false)
  })
})

describe("buildDuOutput", () => {
  it("returns only boolean fields for default (all empty) form", () => {
    const form = createDefaultDuFormData()
    const output = buildDuOutput(form)

    expect(output.language_type).toBe(1)
    expect(output.components).toEqual([
      { key: "is_off_premise_server_statement", value: "FALSE" },
    ])
  })

  it("converts DU study title with correct key prefix", () => {
    const form: DuFormData = {
      ...createDefaultDuFormData(),
      studyTitle: { ja: "利用研究", en: "Data Use Study" },
    }
    const output = buildDuOutput(form)

    expect(output.components).toContainEqual({
      key: "use_study_title",
      value: "利用研究",
    })
    expect(output.components).toContainEqual({
      key: "use_study_title_en",
      value: "Data Use Study",
    })
  })

  it("does not output guidelineStatus in DU EAV (no backend key)", () => {
    const form: DuFormData = {
      ...createDefaultDuFormData(),
      guidelineStatus: "confirmed",
    }
    const output = buildDuOutput(form)

    expect(
      output.components.find((c) => c.key.includes("guideline")),
    ).toBeUndefined()
  })

  it("converts use datasets with interleaved keys", () => {
    const form: DuFormData = {
      ...createDefaultDuFormData(),
      useDatasets: [
        { request: "JGAD000001", purpose: "Research A" },
        { request: "JGAD000002", purpose: "Research B" },
      ],
    }
    const output = buildDuOutput(form)

    const requests = output.components.filter(
      (c) => c.key === "use_dataset_request",
    )
    expect(requests).toEqual([
      { key: "use_dataset_request", value: "JGAD000001" },
      { key: "use_dataset_request", value: "JGAD000002" },
    ])

    const purposes = output.components.filter(
      (c) => c.key === "use_dataset_purpose",
    )
    expect(purposes).toEqual([
      { key: "use_dataset_purpose", value: "Research A" },
      { key: "use_dataset_purpose", value: "Research B" },
    ])
  })

  it("does not include use_dataset_id", () => {
    const form: DuFormData = {
      ...createDefaultDuFormData(),
      useDatasets: [{ request: "JGAD000001", purpose: "Research" }],
    }
    const output = buildDuOutput(form)

    expect(
      output.components.find((c) => c.key === "use_dataset_id"),
    ).toBeUndefined()
  })

  it("skips all-empty dataset entries", () => {
    const form: DuFormData = {
      ...createDefaultDuFormData(),
      useDatasets: [
        { request: "JGAD000001", purpose: "Research A" },
        { request: "", purpose: "" },
      ],
    }
    const output = buildDuOutput(form)

    const requests = output.components.filter(
      (c) => c.key === "use_dataset_request",
    )
    expect(requests).toHaveLength(1)
    expect(requests[0]!.value).toBe("JGAD000001")
  })

  it("converts server status and off-premise servers", () => {
    const form: DuFormData = {
      ...createDefaultDuFormData(),
      serverStatus: "both",
      offPremiseStatus: ["nig", "hgc"],
    }
    const output = buildDuOutput(form)

    expect(output.components).toContainEqual({
      key: "server_status",
      value: "both",
    })

    const offPremise = output.components.filter(
      (c) => c.key === "off_premise_server_status",
    )
    expect(offPremise).toEqual([
      { key: "off_premise_server_status", value: "nig" },
      { key: "off_premise_server_status", value: "hgc" },
    ])
  })

  it("converts use review status and date", () => {
    const form: DuFormData = {
      ...createDefaultDuFormData(),
      useReviewStatus: "completed",
      useReviewDate: "2025-01-15",
    }
    const output = buildDuOutput(form)

    expect(output.components).toContainEqual({
      key: "use_review_status",
      value: "completed",
    })
    expect(output.components).toContainEqual({
      key: "use_review_date",
      value: "2025-01-15",
    })
  })

  it("skips use review date when empty", () => {
    const form: DuFormData = {
      ...createDefaultDuFormData(),
      useReviewStatus: "unnecessary",
    }
    const output = buildDuOutput(form)

    expect(output.components).toContainEqual({
      key: "use_review_status",
      value: "unnecessary",
    })
    expect(
      output.components.find((c) => c.key === "use_review_date"),
    ).toBeUndefined()
  })

  it("converts use period", () => {
    const form: DuFormData = {
      ...createDefaultDuFormData(),
      usePeriodStart: "2025-04-01",
      usePeriodEnd: "2026-03-31",
    }
    const output = buildDuOutput(form)

    expect(output.components).toContainEqual({
      key: "use_period_start",
      value: "2025-04-01",
    })
    expect(output.components).toContainEqual({
      key: "use_period_end",
      value: "2026-03-31",
    })
  })

  it("does not include excluded fields (PI, members, publicKey, etc.)", () => {
    const form: DuFormData = {
      ...createDefaultDuFormData(),
      studyTitle: { ja: "テスト", en: "Test" },
    }
    const output = buildDuOutput(form)
    const keys = new Set(output.components.map((c) => c.key))

    for (const excluded of [
      "pi_first_name",
      "submitter_first_name",
      "head_name",
      "group_id",
      "public_key",
      "member_first_name_en",
      "report_summary",
      "deletion_date",
      "distributing_processed_data_status",
      "is_declare_statement",
    ]) {
      expect(keys.has(excluded)).toBe(false)
    }
  })
})
