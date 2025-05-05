'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavItem {
  href: string;
  icon: string;
  title: string;
}

const navItems: NavItem[] = [
  {
    href: '/cards',
    icon: 'credit_card',
    title: 'Cards',
  },
  {
    href: '/transactions',
    icon: 'receipt_long',
    title: 'Transactions',
  },
  {
    href: '/merchants',
    icon: 'store',
    title: 'Merchants',
  },
  {
    href: '/statements',
    icon: 'description',
    title: 'Statements',
  },
  {
    href: '/payments',
    icon: 'payments',
    title: 'Payments',
  },
  {
    href: '/rewards',
    icon: 'stars',
    title: 'Rewards',
  },
];

const NavItems = () => {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => (
        <Link
          href={item.href}
          key={item.href}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors
            ${pathname === item.href ? 'bg-gray-100 text-blue-600' : 'text-gray-700'}`}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          {item.title}
        </Link>
      ))}
    </>
  );
};

export default NavItems; 