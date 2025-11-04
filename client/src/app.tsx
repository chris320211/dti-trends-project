import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/Login';
import PromptPage from './pages/Prompt';
import ResultsPage from './pages/Results';

const App: React.FC = () => {
    return (
        <Router>
            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/login">Login</Link></li>
                    <li><Link to="/prompt">Prompt</Link></li>
                    <li><Link to="/results">Results</Link></li>
                </ul>
            </nav>
            <Routes>
                <Route path="/" element={<div>Home Page</div>} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/prompt" element={<PromptPage />} />
                <Route path="/results" element={<ResultsPage />} />
            </Routes>
        </Router>
    );
};

export default App;