import React from 'react';
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram 
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <GraduationCap className="w-8 h-8 text-blue-400 mr-2" />
              <span className="text-xl font-bold">MySchoolManager</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Empowering schools worldwide with comprehensive management solutions 
              that streamline operations and enhance educational outcomes.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Demo</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">API</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Integrations</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Mobile App</a></li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Webinars</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Case Studies</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Status</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-400">
                <Mail className="w-4 h-4 mr-2" />
                <span>hello@myschoolmanager.com</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="w-4 h-4 mr-2" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start text-gray-400">
                <MapPin className="w-4 h-4 mr-2 mt-1" />
                <span>123 Education Street<br />San Francisco, CA 94102</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} MySchoolManager. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;