import Image from "next/image";
import { Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white text-primary py-6 text-center">
      <div className="flex flex-col items-center justify-center mb-2">
        <Image 
          src="/images/500x500-NC_Logo.svg" 
          alt="NeuraCities Logo" 
          width={40} 
          height={40} 
          className="mb-2"
        />
        <Image 
          src="/images/880x191-NC_Name.svg" 
          alt="NeuraCities" 
          width={146.67} 
          height={31.833} 
        />
      </div>
      <p>&copy; {new Date().getFullYear()} NeuraCities. All rights reserved.</p>
      <div className="flex justify-center space-x-4 mt-4">
        <a href="/privacy" className="text-primary hover:text-teal-600">
          Privacy Policy
        </a>
        <a href="/terms" className="text-primary hover:text-teal-600">
          Terms of Service
        </a>
      </div>
      <div className="flex justify-center space-x-6 mt-4">
        <a 
          href="https://www.linkedin.com/company/neuracities" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-secondary hover:text-teal-600"
          aria-label="NeuraCities on LinkedIn"
        >
          <Image 
            src="/images/LinkedIn.svg"
            alt="LinkedIn"
            width={24} // Set the desired width
            height={24} // Set the desired height
          />
        </a>
        <a 
          href="mailto:contact@neuracities.com" 
          className="text-secondary hover:text-teal-600"
          aria-label="Email NeuraCities"
        >
          <Mail className="w-6 h-6" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;