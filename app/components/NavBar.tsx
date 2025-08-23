'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type Drop = {
  id: string;
  label: string;
  href: string;
  items?: Array<{ label: string; href: string }>;
};

const NAV: Drop[] = [
  { id: 'local',     label: 'Local',     href: '#local' },
  { id: 'political', label: 'Political', href: '#political' },
  { id: 'financial', label: 'Financial', href: '#financial' },
  { id: 'business',  label: 'Business',  href: '#business' },
  {
    id: 'sports',
    label: 'Sports',
    href: '#sports',
    items: [
      { label: 'NFL',  href: '#sports' },
      { label: 'NBA',  href: '#sports' },
      { label: 'MLB',  href: '#sports' },
      { label: 'NHL',  href: '#sports' },
      { label: 'NCAA', href: '#sports' },
      { label: 'WNBA', href: '#sports' },
      { label: 'Soccer', href: '#sports' },
      { label: 'Tennis', href: '#sports' },
      { label: 'Golf', href: '#sports' },
      { label: 'F1', href: '#sports' },
      { label: 'NASCAR', href: '#sports' },
    ],
  },
  { id: 'health', label: 'Health', href: '#health' },
  { id: 'social', label: 'Culture', href: '#social' },
];

export default function NavBar() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [menuLeft, setMenuLeft] = useState<number>(0);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // Close on outside click / escape
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!btnRef.current) return;
      const btn = btnRef.current;
      if (!btn.contains(e.target as Node)) setOpenId(null);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenId(null);
    }
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onEsc);
    };
  }, []);

  function toggle(id: string, e: React.MouseEvent<HTMLButtonElement>) {
    if (openId === id) return setOpenId(null);
    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
    setMenuLeft(rect.left);
    setOpenId(id);
    btnRef.current = e.currentTarget;
  }

  return (
    <nav className="siteNav">
      <div className="container siteNav__inner">
        {NAV.map((item) =>
          item.items ? (
            <div className="dropdown" key={item.id}>
              <button
                className="navButton"
                aria-expanded={openId === item.id}
                onClick={(e) => toggle(item.id, e)}
              >
                {item.label} ▾
              </button>

              {openId === item.id && (
                <div className="dropdownMenu" style={{ left: Math.max(8, Math.min(menuLeft, window.innerWidth - 240)) }}>
                  {item.items.map((sub) => (
                    <a
                      key={sub.label}
                      href={sub.href}
                      className="dropdownItem"
                      onClick={() => setOpenId(null)}
                    >
                      {sub.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link key={item.id} href={item.href} className="navLink">
              {item.label}
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
