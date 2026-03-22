import { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAdmin } from '../context/AdminContext';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return data.secure_url;
}

// ─── Albums List ────────────────────────────────────────────────────────────
export default function Photos() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', created_by: '' });
  const [submitting, setSubmitting] = useState(false);
  const { isAdmin } = useAdmin();

  useEffect(() => { fetchAlbums(); }, []);

  async function fetchAlbums() {
    try {
      const res = await api.get('/photos/albums');
      setAlbums(res.data);
    } catch {}
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/photos/albums', form);
      setForm({ name: '', description: '', created_by: '' });
      setShowForm(false);
      fetchAlbums();
    } catch {
      alert('Failed to create album.');
    }
    setSubmitting(false);
  }

  async function handleDelete(id, e) {
    e.preventDefault();
    if (!confirm('Delete this album and all its photos?')) return;
    try {
      await api.delete(`/photos/albums/${id}`);
      fetchAlbums();
    } catch {
      alert('Failed to delete.');
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Photos</h1>
        <button onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Album
        </button>
      </div>

      {/* Create album form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-5 mb-4 space-y-3">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">Create New Album</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Your Name *</label>
            <input required value={form.created_by} onChange={e => setForm(f => ({ ...f, created_by: e.target.value }))}
              placeholder="e.g. Maria Santos"
              className="w-full border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Album Name *</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Sunday Worship March 2026"
              className="w-full border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional description..."
              className="w-full border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting}
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
              {submitting ? 'Creating...' : 'Create Album'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-white/20 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Albums grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-2xl bg-gray-200 dark:bg-white/10 animate-pulse aspect-square" />
          ))}
        </div>
      ) : albums.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">📷</p>
          <p className="font-medium">No albums yet.</p>
          <p className="text-sm mt-1">Create the first album for your group!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {albums.map(album => (
            <Link to={`/photos/${album.id}`} key={album.id}
              className="group relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 aspect-square block hover:shadow-lg transition-shadow">
              {album.cover_url ? (
                <img src={album.cover_url} alt={album.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-3">
                <p className="text-white font-semibold text-sm line-clamp-1">{album.name}</p>
                <p className="text-white/70 text-xs">{album.photo_count} {album.photo_count === 1 ? 'photo' : 'photos'}</p>
              </div>
              {isAdmin && (
                <button onClick={(e) => handleDelete(album.id, e)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  Delete
                </button>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Album Detail (photos inside album) ─────────────────────────────────────
export function AlbumDetail() {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ uploaded_by: '', caption: '' });
  const [showUpload, setShowUpload] = useState(false);
  const fileRef = useRef();
  const { isAdmin } = useAdmin();

  useEffect(() => { fetchPhotos(); }, [albumId]);

  async function fetchPhotos() {
    try {
      const [albumsRes, photosRes] = await Promise.all([
        api.get('/photos/albums'),
        api.get(`/photos/albums/${albumId}/photos`),
      ]);
      setAlbum(albumsRes.data.find(a => a.id === parseInt(albumId)));
      setPhotos(photosRes.data);
    } catch {}
    setLoading(false);
  }

  async function handleUpload(e) {
    e.preventDefault();
    const files = fileRef.current.files;
    if (!files.length) return alert('Please select at least one photo.');
    if (!uploadForm.uploaded_by.trim()) return alert('Please enter your name.');
    setUploading(true);
    try {
      for (const file of files) {
        const url = await uploadToCloudinary(file);
        await api.post(`/photos/albums/${albumId}/photos`, {
          photo_url: url,
          caption: uploadForm.caption,
          uploaded_by: uploadForm.uploaded_by,
        });
      }
      setUploadForm({ uploaded_by: '', caption: '' });
      fileRef.current.value = '';
      setShowUpload(false);
      fetchPhotos();
    } catch {
      alert('Upload failed. Make sure Cloudinary is set up correctly.');
    }
    setUploading(false);
  }

  async function handleDelete(photoId) {
    if (!confirm('Delete this photo?')) return;
    try {
      await api.delete(`/photos/albums/${albumId}/photos/${photoId}`);
      fetchPhotos();
      if (lightbox?.id === photoId) setLightbox(null);
    } catch {
      alert('Failed to delete.');
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={() => navigate('/photos')}
        className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Albums
      </button>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{album?.name || 'Album'}</h1>
          {album?.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{album.description}</p>}
        </div>
        <button onClick={() => setShowUpload(s => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload
        </button>
      </div>

      {/* Upload form */}
      {showUpload && (
        <form onSubmit={handleUpload} className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-5 mb-4 space-y-3">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">Upload Photos</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Your Name *</label>
            <input required value={uploadForm.uploaded_by} onChange={e => setUploadForm(f => ({ ...f, uploaded_by: e.target.value }))}
              placeholder="e.g. Juan dela Cruz"
              className="w-full border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Caption (optional)</label>
            <input value={uploadForm.caption} onChange={e => setUploadForm(f => ({ ...f, caption: e.target.value }))}
              placeholder="Add a caption..."
              className="w-full border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Select Photos *</label>
            <input ref={fileRef} type="file" accept="image/*" multiple required
              className="w-full text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-100 file:text-purple-700 dark:file:bg-purple-900/50 dark:file:text-purple-300 hover:file:bg-purple-200 cursor-pointer" />
            <p className="text-xs text-gray-400 mt-1">You can select multiple photos at once</p>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={uploading}
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
              {uploading ? 'Uploading...' : 'Upload Photos'}
            </button>
            <button type="button" onClick={() => setShowUpload(false)}
              className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-white/20 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Photos grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-2">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse aspect-square" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">🖼️</p>
          <p className="font-medium">No photos yet.</p>
          <p className="text-sm mt-1">Be the first to upload a photo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map(photo => (
            <div key={photo.id} className="group relative rounded-xl overflow-hidden aspect-square bg-gray-100 dark:bg-white/5 cursor-pointer"
              onClick={() => setLightbox(photo)}>
              <img src={photo.photo_url} alt={photo.caption || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              {isAdmin && (
                <button onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <img src={lightbox.photo_url} alt={lightbox.caption || ''} className="w-full max-h-[80vh] object-contain rounded-xl" />
            {lightbox.caption && (
              <p className="text-white text-center mt-3 text-sm">{lightbox.caption}</p>
            )}
            <p className="text-white/50 text-center text-xs mt-1">Uploaded by {lightbox.uploaded_by}</p>
            <button onClick={() => setLightbox(null)}
              className="absolute -top-3 -right-3 bg-white/20 hover:bg-white/30 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors">
              ✕
            </button>
            {/* Navigate between photos */}
            <div className="flex justify-between mt-4">
              <button onClick={() => { const i = photos.findIndex(p => p.id === lightbox.id); if (i > 0) setLightbox(photos[i-1]); }}
                disabled={photos.findIndex(p => p.id === lightbox.id) === 0}
                className="text-white/70 hover:text-white disabled:opacity-30 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm">
                ← Prev
              </button>
              <span className="text-white/50 text-sm self-center">
                {photos.findIndex(p => p.id === lightbox.id) + 1} / {photos.length}
              </span>
              <button onClick={() => { const i = photos.findIndex(p => p.id === lightbox.id); if (i < photos.length - 1) setLightbox(photos[i+1]); }}
                disabled={photos.findIndex(p => p.id === lightbox.id) === photos.length - 1}
                className="text-white/70 hover:text-white disabled:opacity-30 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm">
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
