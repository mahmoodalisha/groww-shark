'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Watchlist', path: '/watchlist', icon: '📋' },
  { name: 'Chart', path: '/chart', icon: '📈' },
  { name: 'Widgets', path: '/widgets', icon: '🧩' },
  { name: 'Explore', path: '/explore', icon: '🧭' },
  { name: 'Community', path: '/community', icon: '👥' },
  { name: 'Menu', path: '/menu', icon: '☰' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 backdrop-blur">
      <div className="flex h-15 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`relative flex flex-col items-center gap-1 text-xs transition-colors ${
                isActive ? 'text-blue-500' : 'text-gray-400'
              }`}
            >
              <span
                className={`text-3xl transition-transform duration-200 ${
                  isActive ? 'scale-125' : 'scale-100'
                }`}
              >
                {item.icon}
              </span>

              <span className="text-[11px]">{item.name}</span>

              {isActive && (
                <span className="absolute -top-1 h-2 w-2 rounded-full bg-blue-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
