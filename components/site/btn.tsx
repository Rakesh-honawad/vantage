import Link from 'next/link'

type Props = { children: React.ReactNode; href?: string; outline?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>

/** Link when `href` is given, button otherwise. Same look either way. */
export function Btn({ children, href, outline = false, className = '', ...rest }: Props) {
  const cls = `btn ${outline ? 'btn-outline' : ''} ${className}`.trim()
  if (href) return <Link href={href} className={cls}>{children}</Link>
  return <button className={cls} {...rest}>{children}</button>
}
