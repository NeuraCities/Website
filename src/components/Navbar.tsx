"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left side - Logo and Navigation Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex text-primary font-semibold items-center gap-2">
              <Image 
                src="/images/880x191-NC_Name.svg" 
                alt="NeuraCities" 
                width={146.67} 
                height={31.833} 
              />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="flex space-x-8 text-primary/80">
                <Link href="/how-it-works" className="hover:text-coral transition-colors">
                  Solution
                </Link>
                <Link href="/security" className="hover:text-coral transition-colors">
                  Security
                </Link>
                <Link href="/about" className="hover:text-coral transition-colors">
                  About
                </Link>
              </div>
            </div>
          </div>

          {/* Right side - Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/demo" 
              className="text-primary/80 hover:text-coral transition-colors px-4 py-2"
            >
              Guided Demo
            </Link>
            <Link 
              href="/waitlist" 
              className="bg-coral text-white hover:bg-coral/90 transition-colors px-6 py-2 rounded-lg font-medium"
            >
              Join the Waitlist!
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(true)} 
            className="md:hidden text-primary hover:text-coral transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-0 w-72 h-full bg-white shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-primary">Menu</h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-primary hover:text-coral transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-6">
                <Link 
                  href="/how-it-works" 
                  className="block text-primary/80 hover:text-coral transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Solution
                </Link>
                <Link 
                  href="/demo" 
                  className="block text-primary/80 hover:text-coral transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Guided Demo
                </Link>
                <Link 
                  href="/security" 
                  className="block text-primary/80 hover:text-coral transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Security
                </Link>
                <Link 
                  href="/about" 
                  className="block text-primary/80 hover:text-coral transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
                <hr className="border-gray-200 my-6" />
                <Link 
                  href="/demo" 
                  className="block text-primary/80 hover:text-coral transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Guided Demo
                </Link>
                <Link 
                  href="/waitlist" 
                  className="block bg-coral text-white hover:bg-coral/90 transition-colors px-6 py-3 rounded-lg font-medium text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Join the Waitlist!
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;