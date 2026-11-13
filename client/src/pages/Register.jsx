import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { inputClass, buttonClass } from './Login';

export default function Register() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Client-side validation
    if (!form.name.trim() || !form.email || !form.password) {
      return toast.error('All fields are required');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-bold">Create an account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} className={inputClass} />
        <input name="email" type="email" placeholder="College email" value={form.email} onChange={handleChange} className={inputClass} />
        <input name="password" type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={handleChange} className={inputClass} />
        <button disabled={submitting} className={buttonClass}>
          {submitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        Already registered? <Link to="/login" className="text-indigo-600 hover:underline">Login</Link>
      </p>
    </div>
  );
}
