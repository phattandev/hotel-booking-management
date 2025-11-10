import React from 'react';
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './component/auth/LoginPage'
import RegisterPage from './component/auth/RegisterPage'
import HomePage from './component/home/HomePage'
import NavBar from './component/common/NavBar'

function App() {

  return (
    <BrowserRouter>
      <NavBar />
      {/* Add padding-top to prevent content from being hidden behind the fixed navbar */}
      <div className="App pt-20">
        <Routes>
            {/* Route for homepage and login */}
            <Route exact path="/" element={<LoginPage />} />
            <Route exact path="/login" element={<LoginPage />} />
            <Route exact path="/register" element={<RegisterPage />} />
            <Route exact path="/home" element={<HomePage />} />
            {/* Add other routes here in the future */}
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
