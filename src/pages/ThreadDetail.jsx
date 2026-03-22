import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useAdmin } from '../context/AdminContext';

export default function ThreadDetail() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyForm, setReplyForm] = useState({ author_name: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const { isAdmin } = useAdmin();

  useEffect(() => { fetchThread(); }, [id]);

  async function fetchThread() {
    try {
      const res = await api.get(`/threads/${id}`);
      setThread(res.data);
    } catch {}
    setLoading(false);
  }

  async function handleReply(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/threads/${id}/replies`, replyForm);
      setReplyForm({ author_name: '', content: '' });
      fetchThread();
    } catch {
      alert('Failed to post reply.');
    }
    setSubmitting(false);
  }

  async function handleDeleteReply(replyId) {
    if (!confirm('Delete this reply?')) return;
    try {
      await api.delete(`/threads/${id}/replies/${replyId}`);
      fetchThread();
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-4/5"></div>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center">
        <p className="text-gray-500">Thread not found.</p>
        <Link to="/threads" className="text-primary-600 font-medium hover:underline mt-2 inline-block">Back to Threads</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <Link to="/threads" className="flex items-center gap-1 text-primary-600 text-sm font-medium hover:underline">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Threads
      </Link>

      {/* Original post */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h1 className="text-xl font-bold text-gray-800 mb-1">{thread.title}</h1>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <span className="font-medium text-primary-500">{thread.author_name}</span>
          <span>•</span>
          <span>{timeAgo(thread.created_at)}</span>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{thread.content}</p>
      </div>

      {/* Replies */}
      <div>
        <h2 className="font-semibold text-gray-700 mb-3">
          {thread.replies.length} {thread.replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>
        {thread.replies.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No replies yet. Be the first to respond!</p>
        ) : (
          <div className="space-y-3">
            {thread.replies.map(reply => (
              <div key={reply.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <span className="font-semibold text-primary-500">{reply.author_name}</span>
                    <span>•</span>
                    <span>{timeAgo(reply.created_at)}</span>
                  </div>
                  {isAdmin && (
                    <button onClick={() => handleDeleteReply(reply.id)} className="text-red-400 hover:text-red-600 text-xs font-medium">Delete</button>
                  )}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{reply.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply form */}
      <form onSubmit={handleReply} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-semibold text-gray-700">Add a Reply</h2>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Your Name *</label>
          <input
            required
            value={replyForm.author_name}
            onChange={e => setReplyForm(f => ({ ...f, author_name: e.target.value }))}
            placeholder="e.g. Maria Santos"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Reply *</label>
          <textarea
            required
            value={replyForm.content}
            onChange={e => setReplyForm(f => ({ ...f, content: e.target.value }))}
            rows={3}
            placeholder="Write your response..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {submitting ? 'Posting...' : 'Post Reply'}
        </button>
      </form>
    </div>
  );
}
