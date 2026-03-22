import { useState } from 'react';
import { getTodaysReading } from '../bibleReadingPlan';

const QUICK_TOPICS = [
  'How to be saved',
  'What is discipleship',
  'How to pray',
  'What does the Bible say about faith',
  'How to read the Bible',
  'What is the Holy Spirit',
  'How to overcome sin',
  'What does the Bible say about forgiveness',
  'What is worship',
  'How to share the gospel',
];

export default function Resources() {
  const [query, setQuery] = useState('');
  const today = new Date();
  const reading = getTodaysReading(today);

  function searchGotQuestions(searchTerm) {
    if (!searchTerm.trim()) return;
    const url = `https://www.google.com/search?q=site:gotquestions.org+${encodeURIComponent(searchTerm.trim())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function handleSubmit(e) {
    e.preventDefault();
    searchGotQuestions(query);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Resources</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Search biblical answers powered by GotQuestions.org</p>
      </div>

      {/* Today's Reading Search */}
      {reading && (
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-700 to-purple-950 rounded-2xl p-5 text-white">
          <div className="absolute top-0 right-0 opacity-10 text-[100px] leading-none font-serif select-none">?</div>
          <p className="text-purple-200 text-xs font-semibold uppercase tracking-widest mb-1">Today's Reading</p>
          <p className="text-xl font-bold mb-3">{reading}</p>
          <p className="text-purple-200 text-sm mb-4">Have questions about today's passage? Search it on GotQuestions.</p>
          <button
            onClick={() => searchGotQuestions(reading)}
            className="flex items-center gap-2 bg-white text-purple-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-purple-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Search "{reading}" on GotQuestions
          </button>
        </div>
      )}

      {/* Custom Search */}
      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-5">
        <h2 className="font-bold text-gray-800 dark:text-white mb-1">Search Any Question</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Type any biblical or spiritual question and find answers on GotQuestions.org</p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. What does the Bible say about prayer?"
            className="flex-1 border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        </form>
      </div>

      {/* Quick Topics */}
      <div>
        <h2 className="font-bold text-gray-800 dark:text-white mb-3">Quick Topics</h2>
        <div className="grid grid-cols-1 gap-2">
          {QUICK_TOPICS.map(topic => (
            <button
              key={topic}
              onClick={() => searchGotQuestions(topic)}
              className="flex items-center justify-between bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-left hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{topic}</span>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30 rounded-2xl p-4 text-center">
        <p className="text-xs text-purple-600 dark:text-purple-400">
          Results are searched through Google on <span className="font-semibold">GotQuestions.org</span> — a trusted biblical Q&A resource with answers to over 700,000 questions.
        </p>
      </div>
    </div>
  );
}
