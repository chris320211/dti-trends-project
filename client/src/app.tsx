import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import HomePage from './pages/Home';
import UploadPage from './pages/Upload';
import PracticePage from './pages/Practice';
import Layout from './components/Layout';
import StatsPage from './pages/Stats';
import ProtectedRoute from './components/ProtectedRoute';
import app from './app.css';

const App: React.FC = () => {
    return (
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route element={<Layout />}>
                    <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                    <Route path="/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
                    <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
                    <Route path="/practice" element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />
                </Route>
            </Routes>
    );
};

export default App;