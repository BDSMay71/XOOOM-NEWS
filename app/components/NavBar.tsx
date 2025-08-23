'use client';

import { useEffect, useRef, useState } from 'react';

type Drop = {
  id: string;
  label: string;
  href: `#${string}`;
  items?: Array<{ label: string; href: `#${string}` }>;
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
      { label: 'NFL', href: '#sports' }, { label: 'NBA', href: '#sports' },
      { label: 'MLB', href: '#sports' }, { label: 'NHL', href: '#sports' },
      { label: 'NCAA', href: '#sports' }, { label: 'WNBA', href: '#sports' },
      { label: 'Soccer', href: '#sports' }, { label: 'Tennis', href: '#sports' },
      { label: 'Golf', href: '#sports' }, { label: 'F1', href: '#sports' },
      { label: 'NASCAR', href: '#sports' },
    ],
  },
  { id: 'health', label: 'Health', href: '#health' },
  { id: 'social', label: 'Culture', href: '#social' },
];

function getOffsetTop(target: HTMLElement) {
  const root = getComputedStyle(document.documentElement);
  const headerH = parseInt(root.getPropertyValue('--header-h')) || 64;
  const navH = parseInt(root.getPropertyValue('--nav-h')) || 44;
  const safe = 0; // env(safe-area-inset-top) is in CSS; keep 0 here
  const extra = 14;
  const rectTop = target.getBoundingClientRect().top + window.pageYOffset;
  return rectTop - (headerH + navH + safe + extra);
}

function smoothScrollToHash(hash: string) {
  if (!hash || hash === '#') return;
  const id = hash.slice(1);
  const el = document.getElementById(id);
  if (!el) return;
  const top = getOffsetTop(el);
  window.scrollTo({ top, behavior: 'smooth' });
  // Update URL without native jump
  history.replaceState(null, '', hash);
}

export default function NavBar() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [menuLeft, setMenuLeft] = useState<number>(8);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!btnRef.current) return;
      if (!btnRef.current.contains(e.target as Node)) setOpenId(null);
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

  // Smooth-scroll if user lands with a hash
  useEffect(() => {
    if (location.hash) setTimeout(() => smoothScrollToHash(location.hash), 0);
  }, []);

  function toggle(id: string, e: React.MouseEvent<HTMLButtonElement>) {
    if (openId === id) return setOpenId(null);
    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - 240));
    setMenuLeft(left);
    setOpenId(id);
    btnRef.current = e.currentTarget;
  }

  function onNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    setOpenId(null);
    smoothScrollToHash(href);
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
                <div className="dropdownMenu" style={{ left: menuLeft }}>
                  {item.items.map((sub) => (
                    <a
                      key={sub.label}
                      href={sub.href}
                      className="dropdownItem"
                      onClick={(e) => onNavClick(e, sub.href)}
                    >
                      {sub.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <a
              key={item.id}
              href={item.href}
              className="navLink"
              onClick={(e) => onNavClick(e, item.href)}
            >
              {item.label}
            </a>
          )
        )}
      </div>
    </nav>
  );
}
