import styles from './PageHeader.module.css'

export default function PageHeader({ icon, title, subtitle }) {
  return (
    <div className={styles.header}>
      <div className={styles.titleRow}>
        {icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}
        <h1 className={styles.title}>{title}</h1>
      </div>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  )
}
