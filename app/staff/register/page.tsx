'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/staff/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/staff/login?message=Registration successful');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#003049] flex items-center justify-center p-6">
      <div className="bg-[#EAE2B7] rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#003049] mb-2">Staff Registration</h1>
          <div className="w-16 h-1 bg-[#F77F00] mx-auto rounded-full"></div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-[#003049] text-sm font-semibold mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 bg-white border-2 border-[#FCBF49] rounded-lg text-[#003049] placeholder-gray-500 focus:outline-none focus:border-[#F77F00] focus:ring-2 focus:ring-[#F77F00]/20"
              required
            />
          </div>

          <div>
            <label className="block text-[#003049] text-sm font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-white border-2 border-[#FCBF49] rounded-lg text-[#003049] placeholder-gray-500 focus:outline-none focus:border-[#F77F00] focus:ring-2 focus:ring-[#F77F00]/20"
              required
            />
          </div>

          <div>
            <label className="block text-[#003049] text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full px-4 py-3 bg-white border-2 border-[#FCBF49] rounded-lg text-[#003049] placeholder-gray-500 focus:outline-none focus:border-[#F77F00] focus:ring-2 focus:ring-[#F77F00]/20"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-[#003049] text-sm font-semibold mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border-2 border-[#FCBF49] rounded-lg text-[#003049] focus:outline-none focus:border-[#F77F00] focus:ring-2 focus:ring-[#F77F00]/20"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F77F00] hover:bg-[#e67400] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Registering...
              </div>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-[#003049] text-sm">
            Already have an account? <a href="/staff/login" className="text-[#F77F00] hover:underline">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
}