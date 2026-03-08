import { useState } from "react"
import type { ReactNode } from "react"

interface TabPanelProps {
  children: ReactNode
  value: number
  index: number
  prefix: string
  lazy?: boolean
}

/**
 * Keep-mounted TabPanel with optional lazy rendering.
 *
 * When `lazy` is true, children are not rendered until the tab is first activated.
 * Once rendered, children stay mounted and hidden via `display: none` when inactive.
 */
export const TabPanel = ({ children, value, index, prefix, lazy = false }: TabPanelProps) => {
  const isActive = value === index
  const [hasBeenActive, setHasBeenActive] = useState(isActive)
  // Adjust state during render (React-supported pattern, not inside an effect)
  if (isActive && !hasBeenActive) {
    setHasBeenActive(true)
  }
  const shouldRender = lazy ? hasBeenActive : true

  return (
    <div
      role="tabpanel"
      hidden={!isActive}
      id={`${prefix}-tabpanel-${index}`}
      aria-labelledby={`${prefix}-tab-${index}`}
      style={!isActive ? { display: "none" } : { height: "100%" }}
    >
      {shouldRender ? children : null}
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const tabA11yProps = (prefix: string, index: number) => ({
  id: `${prefix}-tab-${index}`,
  "aria-controls": `${prefix}-tabpanel-${index}`,
})
