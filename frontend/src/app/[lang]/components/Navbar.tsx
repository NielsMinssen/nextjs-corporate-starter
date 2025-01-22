"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";

interface NavLink {
  id: number;
  url: string;
  newTab: boolean;
  text: string;
}

interface DropdownLink {
  id: number;
  title: string;
  links: Array<NavLink>;
}

interface MobileNavLink extends NavLink {
  closeMenu: () => void;
}

function NavLinkComponent({ url, text }: NavLink) {
  const path = usePathname();
  return (
    <Link
      href={url}
      className={`px-3 py-2 rounded-md text-base font-medium ${path === url
        ? "text-blue-600"
        : "text-gray-700 hover:text-blue-600"
        }`}
    >
      {text}
    </Link>
  );
}

function MobileNavLinkComponent({ url, text, closeMenu }: MobileNavLink) {
  const path = usePathname();
  return (
    <Link
      href={url}
      onClick={closeMenu}
      className={`block px-3 py-2 rounded-md text-base font-medium ${path === url
        ? "text-blue-600"
        : "text-gray-700 hover:text-blue-600"
        }`}
    >
      {text}
    </Link>
  );
}

function DropdownComponent({ title, links, isMobile = false, closeMenu }: DropdownLink & { isMobile?: boolean; closeMenu: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [languageCode, setLanguageCode] = useState<string>("en"); // Default language
  useEffect(() => {
    const storedLanguage = localStorage.getItem('selectedLanguage');
    if (storedLanguage) {
      setLanguageCode(storedLanguage);
    }
  }, []);


  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center ${isMobile
          ? "text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
          : "text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
          }`}
      >
        {title}
        <ChevronDownIcon className={`ml-2 h-5 w-5 transform ${isOpen ? "rotate-180" : ""} transition-transform duration-200`} />
      </button>
      {isOpen && (
        <div className={`${isMobile ? "" : "absolute left-0 mt-2 w-48"} z-10 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5`}>
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {links.map((link) => (
              <Link
                key={link.id}
                href={`/${languageCode}${link.url}`} // Prepend the language code to the dropdown link URL
                className="block px-4 py-2 text-base text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  if (isMobile) closeMenu();
                }}
              >
                {link.text}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar({
  links,
  dropdownLinks,
  logoUrl,
  logoText,
}: {
  links: Array<NavLink>;
  dropdownLinks: Array<DropdownLink>;
  logoUrl: string | null;
  logoText: string | null;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMenu = () => setMobileMenuOpen(false);

  const [languageCode, setLanguageCode] = useState<string>("en"); // Default language
  useEffect(() => {
    const storedLanguage = localStorage.getItem('selectedLanguage');
    if (storedLanguage) {
      setLanguageCode(storedLanguage);
    }
  }, []);


  return (
    <nav className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Logo src={logoUrl}>
              {logoText && <h2 className="text-gray-900 text-md font-semibold">{logoText}</h2>}
            </Logo>
          </div>
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center justify-center">
              {links.map((item) => (
                <NavLinkComponent
                  key={item.id}
                  url={`/${languageCode}${item.url}`} // Prepend the language code to the URL
                  text={item.text} id={0} newTab={false} />
              ))}
              {dropdownLinks.map((dropdown) => (
                <DropdownComponent key={dropdown.id} {...dropdown} closeMenu={closeMenu} />
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <Dialog
        as="div"
        className="md:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-40 bg-black bg-opacity-25" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-40 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Logo src={logoUrl}>
              {logoText && <h2 className="text-gray-900 text-lg font-semibold">{logoText}</h2>}
            </Logo>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {links.map((item) => (
                  <MobileNavLinkComponent
                    key={item.id}
                    url={`/${languageCode}${item.url}`} // Prepend the language code to the URL
                    text={item.text}
                    closeMenu={closeMenu} id={0} newTab={false} />
                ))}
                {dropdownLinks.map((dropdown) => (
                  <DropdownComponent key={dropdown.id} {...dropdown} isMobile closeMenu={closeMenu} />
                ))}
              </div>
              <div className="py-6">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </nav>
  );
}