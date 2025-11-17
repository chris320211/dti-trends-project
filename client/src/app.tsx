import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import HomePage from './pages/Home';
import UploadPage from './pages/Upload';
import PracticePage from './pages/Practice';
import Layout from './components/Layout';
import StatsPage from './pages/Stats';
import app from './app.css';

const App: React.FC = () => {
    return (
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route element={<Layout />}>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/stats" element={<StatsPage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/practice" element={<PracticePage />} />
                </Route>
            </Routes>
    );
};

export default App;