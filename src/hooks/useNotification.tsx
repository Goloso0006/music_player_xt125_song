import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"

export type NotificationVariant = "info" | "success" | "warning" | "error"

export type NotificationItem = {
  id: number
  message: string
  variant: NotificationVariant
}

type QueuedNotification = NotificationItem & {
  duration: number
}

type NotifyOptions = {
  variant?: NotificationVariant
  duration?: number
}

type NotificationContextValue = {
  notifications: NotificationItem[]
  notify: (message: string, options?: NotifyOptions) => void
  dismiss: (id: number) => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

let nextId = 1

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [activeNotification, setActiveNotification] = useState<QueuedNotification | null>(null)
  const queueRef = useRef<QueuedNotification[]>([])
  const activeTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)

  const showNext = useCallback(() => {
    setActiveNotification((currentActiveNotification) => {
      if (currentActiveNotification) {
        return currentActiveNotification
      }

      const nextNotification = queueRef.current.shift() ?? null
      return nextNotification
    })
  }, [])

  const dismiss = useCallback((id: number) => {
    if (activeTimerRef.current) {
      window.clearTimeout(activeTimerRef.current)
      activeTimerRef.current = null
    }

    queueRef.current = queueRef.current.filter((notification) => notification.id !== id)

    setActiveNotification((currentActiveNotification) => {
      if (!currentActiveNotification || currentActiveNotification.id !== id) {
        return currentActiveNotification
      }

      return null
    })
  }, [])

  const notify = useCallback((message: string, options?: NotifyOptions) => {
    const id = nextId++
    const variant = options?.variant ?? "info"
    const duration = options?.duration ?? 2000

    queueRef.current.push({ id, message, variant, duration })
    showNext()
  }, [showNext])

  useEffect(() => {
    if (!activeNotification) {
      showNext()
      return
    }

    activeTimerRef.current = window.setTimeout(() => {
      dismiss(activeNotification.id)
    }, activeNotification.duration)

    return () => {
      if (activeTimerRef.current) {
        window.clearTimeout(activeTimerRef.current)
        activeTimerRef.current = null
      }
    }
  }, [activeNotification, dismiss, showNext])

  useEffect(() => {
    return () => {
      if (activeTimerRef.current) {
        window.clearTimeout(activeTimerRef.current)
        activeTimerRef.current = null
      }

      queueRef.current = []
    }
  }, [])

  const notifications = activeNotification
    ? [{ id: activeNotification.id, message: activeNotification.message, variant: activeNotification.variant }]
    : []

  const value = useMemo(() => ({ notifications, notify, dismiss }), [dismiss, notifications, notify])

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotification = () => {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error("useNotification debe usarse dentro de NotificationProvider")
  }

  return context
}
