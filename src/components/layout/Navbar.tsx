import React from 'react';
import { Link } from 'react-router-dom';
import { FormInput } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <FormInput className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">FormBuilder</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Documentation
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}