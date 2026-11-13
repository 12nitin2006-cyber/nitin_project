import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// Style for nav links; the active page is highlighted
const linkClass = ({ isActive }) =>
  `block rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:text-indigo-600'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // mobile menu open or closed

  const handleLogout = () => {
    logout();
    setOpen(false);
    toast.success('Logged out');
    navigate('/');
  };

  const links = user ? (
    <>
      <NavLink to="/post" className={linkClass} onClick={() => setOpen(false)}>Post Item</NavLink>
      <NavLink to="/my-posts" className={linkClass} onClick={() => setOpen(false)}>My Posts</NavLink>
      {user.role === 'admin' && (
        <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>Admin</NavLink>
      )}
      <button
        onClick={handleLogout}
        className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-600 hover:text-red-600 md:w-auto"
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>Login</NavLink>
      <NavLink to="/register" className={linkClass} onClick={() => setOpen(false)}>Register</NavLink>
    </>
  );

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-indigo-600">
          Campus Lost &amp; Found
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {user && <span className="mr-2 text-sm text-gray-500">Hi, {user.name}</span>}
          {links}
        </div>

        {/* Hamburger button for small screens */}
        <button
          className="rounded-md p-2 text-gray-600 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d={open ? 'M6 6l12 12M6 18L18 6' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && <div className="space-y-1 border-t border-gray-100 px-4 py-2 md:hidden">{links}</div>}
    </nav>
  );
}
