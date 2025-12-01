import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { isAuthenticated, isAdmin, isUser, logout } from '../../service/ApiService';
import authEventEmitter from '../../utils/authEventEmitter';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [userIsAdmin, setUserIsAdmin] = useState(isAdmin());
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUserIsAdmin(false);
    navigate("/login");
  };

  // Tự động đóng menu hamburger khi chuyển sang màn hình lớn hơn
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // 768px là breakpoint 'md' của Tailwind
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Subscribe to auth changes (login/logout) to update navbar in real-time
  useEffect(() => {
    const unsubscribe = authEventEmitter.subscribe(() => {
      console.log('[NavBar] Auth event triggered - updating state');
      setIsLoggedIn(isAuthenticated());
      setUserIsAdmin(isAdmin());
    });
    return unsubscribe;
  }, []);
  
  // Hàm để xác định class cho NavLink, thêm hiệu ứng active
  const navLinkClass = ({ isActive }) =>
    `block py-2 px-4 text-white hover:text-green-300 transition-colors duration-200 ${
      isActive ? 'font-bold text-green-300' : ''
    }`;

  // Hàm xử lý khi click vào một link trên mobile để đóng menu
  const handleLinkClick = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-green-800 p-4 shadow-lg z-50">
      <div className="container mx-auto flex items-center justify-between">
        {/* Tên Website */}
        <NavLink to="/home" className="text-white text-2xl font-bold hover:text-green-300 transition-colors duration-200">
          Hotel Booking
        </NavLink>

        {/* Nút Hamburger (chỉ hiển thị trên mobile) */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Các mục điều hướng */}
        {/* Trên màn hình lớn: hiển thị ngang. Trên mobile: ẩn/hiện theo trạng thái 'isOpen' */}
        <div className={`absolute md:relative top-full left-0 w-full md:w-auto bg-green-800 md:bg-transparent transition-all duration-300 ease-in-out ${isOpen ? 'block' : 'hidden'} md:flex`}>
          <ul className="flex flex-col md:flex-row md:space-x-2 p-4 md:p-0">
            <li><NavLink to="/home" className={navLinkClass} onClick={handleLinkClick}>Home</NavLink></li>
            <li><NavLink to="/rooms" className={navLinkClass} onClick={handleLinkClick}>Rooms</NavLink></li>
            
            {isLoggedIn && (
              <li><NavLink to="/find-booking" className={navLinkClass} onClick={handleLinkClick}>Find Booking</NavLink></li>
            )}

            {userIsAdmin && (
              <li><NavLink to="/admin" className={navLinkClass} onClick={handleLinkClick}>Admin</NavLink></li>
            )}

            {!isLoggedIn ? (
              <>
                <li><NavLink to="/login" className={navLinkClass} onClick={handleLinkClick}>Login</NavLink></li>
                <li><NavLink to="/register" className={navLinkClass} onClick={handleLinkClick}>Register</NavLink></li>
              </>
            ) : (
              <li><button onClick={handleLogout} className="block py-2 px-4 text-white hover:text-green-300 transition-colors duration-200 w-full text-left">Logout</button></li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;