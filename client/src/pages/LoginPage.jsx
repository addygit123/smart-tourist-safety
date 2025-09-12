import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../context/Api';

const ShieldIcon = () => (
  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 019-4.944c3.996 0 7.523 2.163 9.382 5.44A12.02 12.02 0 0021 11.056a11.955 11.955 0 01-5.382-8.072z" />
  </svg>
);

const LoginPage = () => {
  const [officialId, setOfficialId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
http://localhost:5000
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officialId, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      localStorage.setItem('authToken', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-14 h-14 bg-blue-600 rounded-full shadow-lg">
                <ShieldIcon />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Smart Tourist Safety Portal</h2>
            <p className="text-slate-400">Official Sign-in</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="officialId" className="block text-slate-300 text-sm font-bold">Official ID</label>
              <input 
                id="officialId" type="text" value={officialId} 
                onChange={(e) => setOfficialId(e.target.value)} required 
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Enter your Official ID"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-slate-300 text-sm font-bold">Password</label>
              <input 
                id="password" type="password" value={password} 
                onChange={(e) => setPassword(e.target.value)} required 
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-400 text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <div>
              <button 
                type="submit" disabled={isLoading} 
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors">
                {isLoading ? 'Authenticating...' : 'Secure Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;