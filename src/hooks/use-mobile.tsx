import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return
    }

    const checkIsMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(mobile)
    }

    // Set initial value
    checkIsMobile()

    // Listen for resize events
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", checkIsMobile)
    
    // Also listen to window resize as backup
    window.addEventListener("resize", checkIsMobile)

    return () => {
      mql.removeEventListener("change", checkIsMobile)
      window.removeEventListener("resize", checkIsMobile)
    }
  }, [])

  return isMobile
}
