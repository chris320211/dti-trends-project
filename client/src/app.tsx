import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import HomePage from './pages/Home';
import UploadPage from './pages/Upload';
import PracticePage from './pages/Practice';
import app from './app.css';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/practice" element={<PracticePage />} />
            </Routes>
        </Router>
    );
};

export default App;