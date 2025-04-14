"use client"
export const Footer = () => {
    return (
      <footer className="bg-gray-800 text-white py-8 mt-0 text-xl min-h-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm">
            &copy; 2025 Solvex. All rights reserved.
          </p>
          <div className="mt-4 space-x-6">
            <a href="/terms" className="hover:text-rose-500 transition">Terms of Service</a>
            <a href="/privacy" className="hover:text-rose-500 transition">Privacy Policy</a>
            <a href="/support" className="hover:text-rose-500 transition">Support</a>
          </div>
        </div>
      </footer>
    );
  };
  