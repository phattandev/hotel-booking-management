import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1: Project description */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Hotel Booking Online</h3>
            <p className="text-sm text-gray-300">A simple hotel booking application for learning and demonstration purposes. Find rooms, make bookings and manage your reservations with ease.</p>
          </div>

          {/* Column 2: Developers */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Developers</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>Huỳnh Nguyễn Tấn Phát - MSSV: DH52201181</li>
              <li>Lai Thuận Phát - MSSV: DH52201183</li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Contact & Support</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>Phone: <a href="tel:0912345678" className="text-green-300 hover:underline">0912345678</a></li>
              <li>Email: <a href="mailto:support@hotelbooking.example" className="text-green-300 hover:underline">support@hotelbooking.example</a></li>
              <li>Facebook: <a href="#" className="text-green-300 hover:underline">facebook.com/hotelbooking</a></li>
              <li>X (Twitter): <a href="#" className="text-green-300 hover:underline">@hotelbooking</a></li>
              <li>Instagram: <a href="#" className="text-green-300 hover:underline">@hotelbooking</a></li>
            </ul>
          </div>

          {/* Column 4: Quick links / Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li><a href="/home" className="text-green-300 hover:underline">Home</a></li>
              <li><a href="/rooms" className="text-green-300 hover:underline">Rooms</a></li>
              <li><a href="/find-booking" className="text-green-300 hover:underline">Find Booking</a></li>
              <li><a href="/login" className="text-green-300 hover:underline">Login</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Hotel Booking. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
