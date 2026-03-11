import Button from "@mui/material/Button"
import DialogActions from "@mui/material/DialogActions"
import equal from "fast-deep-equal"

import { DIALOG_PADDING } from "@/theme"

interface EditDialogFooterProps<T> {
  item: T
  serverItem: T | undefined
  onChange: (item: T) => void
  onClose: () => void
}

// eslint-disable-next-line @stylistic/comma-dangle -- trailing comma required to disambiguate TSX generic from JSX
export const EditDialogFooter = <T,>({ item, serverItem, onChange, onClose }: EditDialogFooterProps<T>) => (
  <DialogActions sx={{ p: DIALOG_PADDING, justifyContent: "space-between" }}>
    <Button
      variant="outlined"
      color="secondary"
      disabled={!serverItem || equal(item, serverItem)}
      onClick={() => { if (serverItem) onChange(serverItem) }}
    >
      変更を破棄
    </Button>
    <Button variant="outlined" onClick={onClose}>閉じる</Button>
  </DialogActions>
)
