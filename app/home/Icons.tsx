import type { SVGProps } from 'react';

export function Arrow({ down = false }: { down?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={down ? { transform: 'rotate(90deg)' } : undefined}><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
export function BrandMark() {
  return <svg width="32" height="36" viewBox="0 0 32 36" fill="none" aria-hidden="true"><path d="M16 4c-7-8-16 3-8 8-10 0-9 13 1 12-4 9 10 13 12 3 9 5 15-8 6-12 8-6-1-16-8-9Z" stroke="currentColor" strokeWidth="1.2"/><circle cx="16" cy="17" r="3" stroke="currentColor" strokeWidth="1.2"/><path d="M16 29v6" stroke="currentColor" strokeWidth="1.2"/></svg>;
}
export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: 'menu' | 'close' | 'user' | 'bag' | 'plus' | 'check' }) {
  const paths = {
    menu: <path d="M3 8h18M3 16h18" />,
    close: <path d="m5 5 14 14M5 19 19 5" />,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
    bag: <><path d="M5 7h14l1 14H4L5 7Z" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></>,
    plus: <path d="M5 12h14M12 5v14" />,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
