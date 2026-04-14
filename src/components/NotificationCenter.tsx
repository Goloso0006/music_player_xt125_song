import { useNotification, type NotificationVariant } from "../hooks/useNotification"

const variantLabels: Record<NotificationVariant, string> = {
  info: "Info",
  success: "Éxito",
  warning: "Aviso",
  error: "Error"
}

const variantIcons: Record<NotificationVariant, string> = {
  info: "i",
  success: "✓",
  warning: "!",
  error: "×"
}

const NotificationCenter = () => {
  const { notifications, dismiss } = useNotification()

  return (
    <div className="notification-stack" aria-live="polite" aria-atomic="true">
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification-toast notification-${notification.variant}`}>
          <div className="notification-icon">{variantIcons[notification.variant]}</div>
          <div className="notification-content">
            <p className="notification-title">{variantLabels[notification.variant]}</p>
            <p className="notification-message">{notification.message}</p>
          </div>
          <button className="notification-close" type="button" onClick={() => dismiss(notification.id)} aria-label="Cerrar mensaje">
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default NotificationCenter
