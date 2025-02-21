'use client';

import Link from 'next/link';
import LoginButton from './login/LoginButton';

const Navbar = () => {
  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 font-[family-name:var(--font-geist-sans)]">
                Kinetic Marketplace
              </span>
            </Link>
          </div>
          <div className="flex items-center">
            <LoginButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
