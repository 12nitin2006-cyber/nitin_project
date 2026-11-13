// Used for both "Post item" (/post) and "Edit item" (/edit/:id)
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { SERVER_URL, getErrorMessage } from '../api/axios';
import { CATEGORIES } from '../constants';
import Spinner from '../components/Spinner';
import { inputClass, buttonClass } from './Login';

const emptyForm = { title: '', description: '', category: '', type: 'lost', location: '', date: '' };

export default function PostItem() {
  const { id } = useParams(); // present only when editing
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null); // the File chosen by the user
  const [preview, setPreview] = useState(''); // URL to show the image preview
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  // When editing, load the existing item into the form
  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/items/${id}`)
      .then(({ data }) => {
        setForm({
          title: data.title,
          description: data.description,
          category: data.category,
          type: data.type,
          location: data.location,
          date: data.date.slice(0, 10), // "2026-11-13T00:00..." -> "2026-11-13" for <input type="date">
        });
        if (data.imageUrl) setPreview(SERVER_URL + data.imageUrl);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Same rules as the server: jpg/png, max 2 MB
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      e.target.value = '';
      return toast.error('Only JPG and PNG images are allowed');
    }
    if (file.size > 2 * 1024 * 1024) {
      e.target.value = '';
      return toast.error('Image must be 2 MB or smaller');
    }
    setImage(file);
    setPreview(URL.createObjectURL(file)); // temporary local URL for the preview
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Client-side validation: every field except the photo is required
    const missing = Object.entries(form).find(([, value]) => !value.trim());
    if (missing) return toast.error(`Please fill in the ${missing[0]}`);

    // Files must be sent as multipart/form-data, not JSON
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (image) formData.append('image', image);

    setSubmitting(true);
    try {
      const res = isEdit ? await api.put(`/items/${id}`, formData) : await api.post('/items', formData);
      toast.success(isEdit ? 'Item updated' : 'Item posted');
      navigate(`/items/${res.data._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-bold">{isEdit ? 'Edit item' : 'Post a lost or found item'}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Lost / Found toggle */}
        <div className="grid grid-cols-2 gap-2">
          {['lost', 'found'].map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setForm({ ...form, type: t })}
              className={`rounded-md border px-4 py-2 text-sm font-medium capitalize ${
                form.type === t
                  ? t === 'lost'
                    ? 'border-red-400 bg-red-50 text-red-700'
                    : 'border-green-400 bg-green-50 text-green-700'
                  : 'border-gray-300 text-gray-600'
              }`}
            >
              I {t} something
            </button>
          ))}
        </div>

        <input name="title" maxLength={100} placeholder="Title, e.g. Blue water bottle" value={form.title} onChange={handleChange} className={inputClass} />
        <textarea name="description" rows={4} maxLength={1000} placeholder="Description (colour, brand, marks...)" value={form.description} onChange={handleChange} className={inputClass} />

        <div className="grid gap-4 sm:grid-cols-2">
          <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            name="date"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={form.date}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <input name="location" placeholder="Location, e.g. Block A canteen" value={form.location} onChange={handleChange} className={inputClass} />

        <div>
          <label className="mb-1 block text-sm text-gray-600">Photo (optional, JPG/PNG, max 2 MB)</label>
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleImage}
            className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-indigo-700"
          />
          {preview && <img src={preview} alt="Preview" className="mt-3 h-48 w-full rounded-md object-cover" />}
        </div>

        <button disabled={submitting} className={buttonClass}>
          {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Post item'}
        </button>
      </form>
    </div>
  );
}
