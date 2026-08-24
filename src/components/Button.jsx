import styles from './Button.module.css'

// Variants: primary (default), secondary, ghost, danger.
export default function Button({
  variant = 'primary',
  as = 'button',
  className = '',
  children,
  ...props
}) {
  const Component = as
  return (
    <Component
      className={`${styles.btn} ${styles[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  )
}
