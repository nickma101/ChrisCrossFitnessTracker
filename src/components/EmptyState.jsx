import styles from './EmptyState.module.css'

export default function EmptyState({ icon, message, action }) {
  return (
    <div className={styles.wrap}>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <p className={styles.message}>{message}</p>
      {action}
    </div>
  )
}
