import Link from "next/link";
import { ThemeSwitch } from "./theme-switch";

const navItems = [
  { href: "/", label: "Learn" },
  { href: "/lessons/light-and-exposure", label: "Lesson" },
  { href: "/sandbox", label: "Sandbox" },
  { href: "/reference", label: "Reference" },
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
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <ThemeSwitch />
    </header>
  );
}
