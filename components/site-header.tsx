import Link from "next/link";
import { ThemeSwitch } from "./theme-switch";

const navItems = [
  { href: "/", label: "Learn", state: null },
  { href: "/lessons/light-and-exposure", label: "Lesson", state: null },
  { href: "/sandbox", label: "Sandbox", state: "Preview" },
  { href: "/reference", label: "Reference", state: "Preview" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Learn Photo home">
        <span className="wordmark-mark" aria-hidden="true" />
        Learn Photo
      </Link>
      <nav aria-label="Primary navigation">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link href={item.href}>
                {item.label}
                {item.state && <span className="nav-state"> {item.state}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <ThemeSwitch />
    </header>
  );
}
