import * as React from "react"

const TooltipContext = React.createContext<{ delayDuration?: number }>({})

export function TooltipProvider({ 
  delayDuration = 0, 
  children 
}: { 
  delayDuration?: number
  children: React.ReactNode 
}) {
  return (
    <TooltipContext.Provider value={{ delayDuration }}>
      {children}
    </TooltipContext.Provider>
  )
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function TooltipTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function TooltipContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
