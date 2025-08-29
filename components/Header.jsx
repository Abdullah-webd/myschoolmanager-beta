"use client"
import Link from 'next/link'
import { useState } from 'react'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-blue-600 font-bold text-xl lg:text-2xl hover:text-blue-700 transition-colors">
            My School Manager
          </Link>
          
          <nav className={`${isMenuOpen ? 'flex' : 'hidden'} lg:flex absolute lg:relative top-full lg:top-0 left-0 right-0 lg:left-auto lg:right-auto bg-white lg:bg-transparent flex-col lg:flex-row items-center gap-6 lg:gap-8 p-6 lg:p-0 shadow-lg lg:shadow-none`}>
            <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium transition-colors relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors relative group">
              Login
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/signup" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
              Sign Up
            </Link>
          </nav>
          
          <button 
            className="lg:hidden flex flex-col space-y-1 p-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header