"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
// removed unused import of Image
import "/node_modules/flag-icons/css/flag-icons.min.css";
import { usePathname } from 'next/navigation';

// Define the Language type
interface Language {
  code: string;
  label: string;
}

// List of available languages
const languages: Language[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
];

const LanguageSwitcher: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const path = usePathname(); // Get the current path
  const initialLanguageCode = path.split('/')[1]; // Extract the language code from the URL

  // Extract everything after the language code
  const currentPage = path.includes('/blog') || (path.split('/').slice(2).join('/') && path.split('/').slice(2).join('/') !== 'blog')
    ? 'blog'
    : path.split('/').slice(2).join('/');


  // Use the extracted code to find the initial language
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
    const storedLanguage = (typeof window !== 'undefined') ? localStorage.getItem('selectedLanguage') : null;
    const languageFromPath = languages.find(lang => lang.code === initialLanguageCode);
    if (languageFromPath) return languageFromPath;
    if (storedLanguage) {
      const matchedLang = languages.find(lang => lang.code === storedLanguage);
      if (matchedLang) return matchedLang;
    }
    return languages[0];
  });

  // Effect to store the selected language in local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLanguage', selectedLanguage.code);
    }
  }, [selectedLanguage]);

  // Toggle dropdown open/close
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle language switch
  const handleLanguageSwitch = (language: Language) => {
    setSelectedLanguage(language);
    setIsDropdownOpen(false); // Close the dropdown after selection
  };

  return (
    <div className="relative">
      {/* Selected Language */}
      <button
        onClick={toggleDropdown}
        className="flex items-center p-2 border rounded-md bg-gray-100 dark:bg-gray-800"
      >
        <div className="mr-2">
          <span className={`fi fi-${selectedLanguage.code === 'en' ? 'gb' : selectedLanguage.code}`}></span>
        </div>
        {selectedLanguage.label}
        <svg
          className={`ml-2 w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : "rotate-0"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <ul className="absolute z-10 mt-2 w-full bg-white border rounded-md shadow-lg dark:bg-gray-700">
          {languages.map((language) => (
            <li key={language.code}>
              <Link className="flex items-center p-2 hover:bg-gray-200 dark:hover:bg-gray-600" href={`/${language.code}/${currentPage ? currentPage : ''}`}
                onClick={() => handleLanguageSwitch(language)}>
                <div className="mr-2">
                  <span className={`fi fi-${language.code === 'en' ? 'gb' : language.code}`}></span>
                </div>
                {language.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
