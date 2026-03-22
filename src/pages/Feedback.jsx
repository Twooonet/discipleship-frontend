import { useEffect, useState } from 'react';
import api from '../api';
import { useAdmin } from '../context/AdminContext';

export default function Feedback() {
  const { isAdmin } = useAdmin();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ author_name: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isAdmin) fetchFeedback();
  }, [isAdmin]);

  async function fetchFeedback() {
    setLoading(true);
    try {
      const res = await api.get('/feedback');
      setFeedbackList(res.data);
    } catch {}
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/feedback', form);
      setSubmitted(true);
      setForm({ author_name: '', content: '' });
    } catch {
      alert('Failed to submit feedback. Please try again.');
    }
    setSubmitting(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this feedback?')) return;
    try {
      await api.delete(`/feedback/${id}`);
      fetchFeedback();
    } catch {
      alert('Failed to delete.');
    }
  }

  function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    const days = Math.floor(diff / 86400);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Feedback & Suggestions</h1>

      {submitted ? (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center">
          <p className="text-4xl mb-3">🙏</p>
          <h2 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">Thank you!</h2>
          <p className="text-green-600 dark:text-green-400 text-sm mb-4">Your feedback has been submitted. We appreciate you sharing your thoughts.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Submit another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-700 dark:text-gray-200">Share your feedback</h2>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Your feedback helps us grow as a group. You can submit anonymously.</p>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Your Name <span className="text-gray-400">(optional)</span></label>
            <input
              value={form.author_name}
              onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
              placeholder="Leave blank to submit anonymously"
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Feedback / Suggestion *</label>
            <textarea
              required
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={5}
              placeholder="Share your thoughts, suggestions, prayer requests, or anything you'd like the group to know..."
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      )}

      {isAdmin && (
        <section>
          <h2 className="font-bold text-gray-700 dark:text-gray-200 mb-3">
            Received Feedback
            {feedbackList.length > 0 && (
              <span className="ml-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                {feedbackList.length}
              </span>
            )}
          </h2>
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 animate-pulse">
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-full mb-1"></div>
                </div>
              ))}
            </div>
          ) : feedbackList.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              No feedback submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {feedbackList.map(item => (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-semibold text-gray-600 dark:text-gray-300">{item.author_name || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{timeAgo(item.created_at)}</span>
                    </div>
                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 text-xs font-medium flex-shrink-0">Delete</button>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mt-2 whitespace-pre-wrap leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
