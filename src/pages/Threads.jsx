import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAdmin } from '../context/AdminContext';
import { getTodaysReading } from '../bibleReadingPlan';

export default function Threads() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ author_name: '', title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const today = new Date();
  const reading = getTodaysReading(today);

  useEffect(() => { fetchThreads(); }, []);

  async function fetchThreads() {
    try {
      const res = await api.get('/threads');
      setThreads(res.data);
    } catch {}
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/threads', form);
      setForm({ author_name: '', title: '', content: '' });
      setShowForm(false);
      navigate(`/threads/${res.data.id}`);
    } catch {
      alert('Failed to post thread.');
    }
    setSubmitting(false);
  }

  async function handleDelete(id, e) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this thread and all its replies?')) return;
    try {
      await api.delete(`/threads/${id}`);
      fetchThreads();
    } catch {
      alert('Failed to delete.');
    }
  }

  function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* Today's Bible Reading Banner */}
      {reading && (
        <div className="bg-gradient-to-r from-purple-700 to-purple-950 rounded-2xl p-4 mb-4 text-white flex items-center gap-3">
          <div className="text-2xl flex-shrink-0">📖</div>
          <div>
            <p className="text-purple-200 text-xs font-semibold uppercase tracking-wide">Today's Bible Reading</p>
            <p className="font-bold text-base">{reading}</p>
            <p className="text-purple-300 text-xs mt-0.5">Share your reflections below!</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Threads</h1>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Thread
        </button>
      </div>

      {/* New thread form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-4 space-y-3">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">Share your thoughts</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Your Name *</label>
            <input
              required
              value={form.author_name}
              onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
              placeholder="e.g. Juan dela Cruz"
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title *</label>
            <input
              required
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="What's on your heart?"
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Message *</label>
            <textarea
              required
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={4}
              placeholder="Share a reflection, prayer request, or encouragement..."
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
              {submitting ? 'Posting...' : 'Post Thread'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:text-gray-700 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Thread list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">💬</p>
          <p className="font-medium">No threads yet.</p>
          <p className="text-sm mt-1">Be the first to share a thought or reflection!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map(thread => (
            <Link
              to={`/threads/${thread.id}`}
              key={thread.id}
              className="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-purple-100 dark:hover:border-purple-800 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-gray-800 dark:text-white line-clamp-1 flex-1">{thread.title}</p>
                {isAdmin && (
                  <button
                    onClick={(e) => handleDelete(thread.id, e)}
                    className="flex-shrink-0 text-red-400 hover:text-red-600 text-xs font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{thread.content}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                <span className="font-medium text-purple-500 dark:text-purple-400">{thread.author_name}</span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {thread.reply_count} {thread.reply_count === 1 ? 'reply' : 'replies'}
                </span>
                <span>{timeAgo(thread.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-full mb-1"></div>
      <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-2/3"></div>
    </div>
  );
}
