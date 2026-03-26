import AddIcon from "@mui/icons-material/Add"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import Paper from "@mui/material/Paper"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import type { MemberForm } from "@/schemas/jga-form"
import { createDefaultMember } from "@/schemas/jga-form"
import { FIELD_GROUP_GAP, INLINE_GAP, SUBSECTION_GAP } from "@/theme"

interface DuMemberArraySectionProps {
  value: MemberForm[]
  onChange: (value: MemberForm[]) => void
}

export const DuMemberArraySection = ({
  value,
  onChange,
}: DuMemberArraySectionProps) => {
  const handleAdd = () => {
    onChange([...value, createDefaultMember()])
  }

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleChange = (
    index: number,
    field: keyof MemberForm,
    fieldValue: string,
  ) => {
    const updated = value.map((item, i) =>
      i === index ? { ...item, [field]: fieldValue } : item,
    )
    onChange(updated)
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP }}>
      <Typography variant="h3">メンバー</Typography>
      {value.map((member, index) => (
        <Paper key={index} variant="outlined" sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: FIELD_GROUP_GAP,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              #{index + 1}
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleRemove(index)}
              color="error"
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: INLINE_GAP,
            }}
          >
            <TextField
              label="First Name (en)"
              value={member.firstNameEn}
              onChange={(e) =>
                handleChange(index, "firstNameEn", e.target.value)
              }
            />
            <TextField
              label="Middle Name (en)"
              value={member.middleNameEn}
              onChange={(e) =>
                handleChange(index, "middleNameEn", e.target.value)
              }
            />
            <TextField
              label="Last Name (en)"
              value={member.lastNameEn}
              onChange={(e) =>
                handleChange(index, "lastNameEn", e.target.value)
              }
            />
            <TextField
              label="Email"
              value={member.email}
              onChange={(e) => handleChange(index, "email", e.target.value)}
            />
            <TextField
              label="Institution (en)"
              value={member.institutionEn}
              onChange={(e) =>
                handleChange(index, "institutionEn", e.target.value)
              }
            />
            <TextField
              label="Division (en)"
              value={member.divisionEn}
              onChange={(e) =>
                handleChange(index, "divisionEn", e.target.value)
              }
            />
            <TextField
              label="Job Title (en)"
              value={member.jobEn}
              onChange={(e) => handleChange(index, "jobEn", e.target.value)}
            />
            <TextField
              label="e-Rad ID"
              value={member.eradid}
              onChange={(e) => handleChange(index, "eradid", e.target.value)}
            />
            <TextField
              label="ORCID"
              value={member.orcid}
              onChange={(e) => handleChange(index, "orcid", e.target.value)}
            />
          </Box>
        </Paper>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={handleAdd}
        variant="outlined"
        size="small"
        sx={{ alignSelf: "flex-start" }}
      >
        メンバーを追加
      </Button>
    </Box>
  )
}
