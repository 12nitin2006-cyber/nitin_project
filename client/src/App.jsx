import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ItemDetail from './pages/ItemDetail';
import PostItem from './pages/PostItem';
import MyPosts from './pages/MyPosts';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Toaster position="top-center" />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Logged-in students (and admins) */}
          <Route path="/post" element={<ProtectedRoute><PostItem key="new" /></ProtectedRoute>} />
          {/* The same form is reused for editing; a different key gives it a fresh, empty state */}
          <Route path="/edit/:id" element={<ProtectedRoute><PostItem key="edit" /></ProtectedRoute>} />
          <Route path="/my-posts" element={<ProtectedRoute><MyPosts /></ProtectedRoute>} />

          {/* Admins only */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />

          <Route path="*" element={<p className="py-12 text-center text-gray-500">Page not found</p>} />
        </Routes>
      </main>
    </div>
  );
}
