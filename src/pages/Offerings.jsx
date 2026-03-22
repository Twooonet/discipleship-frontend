import { useEffect, useState } from 'react';
import api from '../api';
import { useAdmin } from '../context/AdminContext';
import { Link } from 'react-router-dom';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Offerings() {
  const { isAdmin } = useAdmin();
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({ total_offerings: 0, total_expenses: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ entry_date: todayStr(), amount: '', description: '', type: 'offering' });
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState('all');

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
  }, [isAdmin]);

  async function fetchData() {
    setLoading(true);
    try {
      const [entriesRes, summaryRes] = await Promise.all([
        api.get('/offerings'),
        api.get('/offerings/summary'),
      ]);
      setEntries(entriesRes.data);
      setSummary(summaryRes.data);
    } catch {}
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/offerings', form);
      setForm({ entry_date: todayStr(), amount: '', description: '', type: 'offering' });
      setShowForm(false);
      fetchData();
    } catch {
      alert('Failed to save entry.');
    }
    setSubmitting(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this entry?')) return;
    try {
      await api.delete(`/offerings/${id}`);
      fetchData();
    } catch {
      alert('Failed to delete.');
    }
  }

  function formatCurrency(amount) {
    return '₱' + parseFloat(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const clean = dateStr.slice(0, 10);
    const [year, month, day] = clean.split('-').map(Number);
    return `${MONTHS[month - 1]} ${day}, ${year}`;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">Admin Access Required</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">The offerings page is only visible to the admin.</p>
        <Link to="/admin-login" className="inline-block px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors">
          Go to Admin Login
        </Link>
      </div>
    );
  }

  const filtered = filterType === 'all' ? entries : entries.filter(e => e.type === filterType);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Offerings & Expenses</h1>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Entry
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 rounded-xl p-3 text-center backdrop-blur-sm">
          <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Offerings</p>
          <p className="text-lg font-bold text-green-700 dark:text-green-300">{formatCurrency(summary.total_offerings)}</p>
        </div>
        <div className="bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-center backdrop-blur-sm">
          <p className="text-xs text-red-500 dark:text-red-400 font-medium mb-1">Expenses</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(summary.total_expenses)}</p>
        </div>
        <div className="bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/30 rounded-xl p-3 text-center backdrop-blur-sm">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Balance</p>
          <p className={`text-lg font-bold ${parseFloat(summary.balance) >= 0 ? 'text-purple-700 dark:text-purple-300' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(summary.balance)}
          </p>
        </div>
      </div>

      {/* Add entry form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-5 space-y-3">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">New Entry</h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => setForm(f => ({ ...f, type: 'offering' }))}
              className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${form.type === 'offering' ? 'bg-green-500 text-white border-green-500' : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-white/20'}`}>
              Offering
            </button>
            <button type="button" onClick={() => setForm(f => ({ ...f, type: 'expense' }))}
              className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${form.type === 'expense' ? 'bg-red-500 text-white border-red-500' : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-white/20'}`}>
              Expense
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date *</label>
              <input type="date" required value={form.entry_date}
                onChange={e => setForm(f => ({ ...f, entry_date: e.target.value }))}
                className="w-full border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Amount (₱) *</label>
              <input type="number" required min="0" step="0.01" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Sunday offering, Venue rental..."
              className="w-full border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting}
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
              {submitting ? 'Saving...' : 'Save Entry'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-white/20 rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'offering', 'expense'].map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full capitalize transition-colors ${filterType === t ? 'bg-purple-600 text-white' : 'bg-white/50 dark:bg-white/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/20'}`}>
            {t === 'all' ? 'All' : t === 'offering' ? 'Offerings' : 'Expenses'}
          </button>
        ))}
      </div>

      {/* Entries list */}
      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No entries found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(entry => (
            <div key={entry.id} className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-white/10 px-4 py-3 flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${entry.type === 'offering' ? 'bg-green-400' : 'bg-red-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                  {entry.description || (entry.type === 'offering' ? 'Offering' : 'Expense')}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(entry.entry_date)}</p>
              </div>
              <p className={`text-sm font-bold flex-shrink-0 ${entry.type === 'offering' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {entry.type === 'offering' ? '+' : '-'}{formatCurrency(entry.amount)}
              </p>
              <button onClick={() => handleDelete(entry.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors ml-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="bg-white/80 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 px-4 py-3 flex items-center gap-3 animate-pulse">
      <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="flex-1">
        <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-1.5"></div>
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3"></div>
      </div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
    </div>
  );
}
