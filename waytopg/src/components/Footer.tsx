import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h4 className="text-2xl font-bold mb-4 text-blue-100">Way2pg</h4>
            <p className="text-blue-100">Finding the best homes for conscious students worldwide.</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-blue-100 hover:text-white transition">About Us</Link></li>
              <li><Link to="/faq" className="text-blue-100 hover:text-white transition">FAQs</Link></li>
              <li><Link to="/terms" className="text-blue-100 hover:text-white transition">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-blue-100 hover:text-white transition">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">Contact Us</h4>
            <p className="text-blue-100">Email: info@way2pg.com</p>
            <p className="text-blue-100">Phone: +1 (123) 456-7890</p>
            <div className="mt-4 flex space-x-4">
              {/* Add social media icons here */}
            </div>
          </div>
        </div>
        <div className="mt-12 text-center text-blue-100">
          <p>&copy; {new Date().getFullYear()} Way2pg. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;