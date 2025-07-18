import React, { useState } from "react"
import { Menu, X } from "lucide-react"

type NavItem = {
  name: string
  href: string
}

const navLinks: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "About", href: "/" },
  { name: "Services", href: "/" },
  { name: "Contact", href: "/" },
]

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-[#0f172a]/50 border-b border-white/10 shadow-none rounded-b-[30px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="text-xl font-bold text-white">WebScrapCo</div>

            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-white hover:text-pink-400 transition-colors duration-200 ease-in-out"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Hamburger Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(true)}
                className="transition-transform duration-150 hover:scale-110"
              >
                <Menu size={28} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Drawer Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white/5 text-white z-50 shadow-lg p-6 flex flex-col gap-6 backdrop-blur-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-white">Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            className="transition-transform duration-150 hover:scale-110"
          >
            <X size={24} className="text-white" />
          </button>
        </div>
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="hover:text-pink-300 text-lg transition-colors duration-200"
            onClick={() => setIsOpen(false)}
          >
            {link.name}
          </a>
        ))}
      </div>
    </>
  )
}

export default NavBar
