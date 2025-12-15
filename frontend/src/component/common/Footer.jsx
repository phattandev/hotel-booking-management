import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Ứng dụng đặt phòng trực tuyến</h3>
            <p className="text-sm text-gray-300">Một ứng dụng đặt phòng khách sạn đơn giản cho mục đích học tập. Tìm phòng, đặt phòng và quản lý đặt phòng một cách dễ dàng.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Sinh viên thực hiện</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>Huỳnh Nguyễn Tấn Phát - MSSV: DH52201181</li>
              <li>Lai Thuận Phát - MSSV: DH52201183</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Liên hệ và hỗ trợ</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>Phone: <a href="tel:0912345678" className="text-green-300 hover:underline">0912345678</a></li>
              <li>Email: <a href="mailto:support@hotelbooking.example" className="text-green-300 hover:underline">support@hotelbooking.example</a></li>
              <li>Facebook: <a href="#" className="text-green-300 hover:underline">facebook.com/hotelbooking</a></li>
              <li>X (Twitter): <a href="#" className="text-green-300 hover:underline">@hotelbooking</a></li>
              <li>Instagram: <a href="#" className="text-green-300 hover:underline">@hotelbooking</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li><a href="/home" className="text-green-300 hover:underline">Trang chủ  </a></li>
              <li><a href="/find-booking" className="text-green-300 hover:underline">Tìm kiếm đặt phòng</a></li>
              <li><a href="/login" className="text-green-300 hover:underline">Đăng nhập</a></li>
              <li><a href="/register" className="text-green-300 hover:underline">Đăng ký</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Hotel Booking.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
