import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none';
export const buttonClass =
  'w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />; // already logged in

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Client-side validation before calling the API
    if (!form.email || !form.password) {
      return toast.error('Please enter email and password');
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-bold">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className={inputClass} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className={inputClass} />
        <button disabled={submitting} className={buttonClass}>
          {submitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        No account? <Link to="/register" className="text-indigo-600 hover:underline">Register</Link>
      </p>
    </div>
  );
}
