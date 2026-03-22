import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTodaysReading } from '../bibleReadingPlan';
import api from '../api';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function Home() {
  const today = new Date();
  const reading = getTodaysReading(today);
  const [recentThreads, setRecentThreads] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    api.get('/threads').then(r => {
      setRecentThreads(r.data.slice(0, 3));
    }).catch(() => {}).finally(() => setLoadingThreads(false));

    const m = today.getMonth() + 1;
    const y = today.getFullYear();
    api.get(`/calendar?month=${m}&year=${y}`).then(r => {
      const todayStr = today.toISOString().slice(0, 10);
      const upcoming = r.data.filter(e => e.event_date >= todayStr).slice(0, 3);
      setUpcomingEvents(upcoming);
    }).catch(() => {}).finally(() => setLoadingEvents(false));
  }, []);

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  }

  function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Date header */}
      <div>
        <p className="text-primary-500 text-sm font-semibold uppercase tracking-wide">
          {DAYS[today.getDay()]}, {MONTHS[today.getMonth()]} {today.getDate()}, {today.getFullYear()}
        </p>
        <h1 className="text-2xl font-bold text-gray-800">Good day, brothers and sisters!</h1>
      </div>

      {/* Verse / Reading of the Day */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 opacity-10 text-[120px] leading-none font-serif select-none">✝</div>
        <p className="text-primary-200 text-xs font-semibold uppercase tracking-widest mb-1">Today's Bible Reading</p>
        <p className="text-2xl font-bold mb-1">{reading || 'Rest and Reflect'}</p>
        <p className="text-primary-200 text-sm">2026 One-Year Bible Reading Plan</p>
        <div className="mt-4 pt-4 border-t border-primary-600">
          <p className="text-xs text-primary-300 italic">
            "These teachings are not empty words; they are your very life." — Deuteronomy 32:47
          </p>
        </div>
      </div>

      {/* Upcoming Events */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">Upcoming Activities</h2>
          <Link to="/calendar" className="text-primary-600 text-sm font-medium hover:underline">View all</Link>
        </div>
        <div className="space-y-2">
          {loadingEvents ? (
            <SkeletonCard />
          ) : upcomingEvents.length === 0 ? (
            <EmptyCard message="No upcoming activities this month." linkTo="/calendar" linkLabel="Add one" />
          ) : (
            upcomingEvents.map(event => (
              <Link to="/calendar" key={event.id} className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="bg-primary-100 text-primary-700 rounded-lg px-2.5 py-1 text-center min-w-[48px]">
                    <p className="text-lg font-bold leading-none">{new Date(event.event_date + 'T00:00:00').getDate()}</p>
                    <p className="text-xs">{MONTHS[new Date(event.event_date + 'T00:00:00').getMonth()].slice(0, 3)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{event.event_title}</p>
                    <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-gray-500">
                      {event.word_assignee && <span>Word: <span className="text-gray-700">{event.word_assignee}</span></span>}
                      {event.prayer_assignee && <span>Prayer: <span className="text-gray-700">{event.prayer_assignee}</span></span>}
                      {event.emcee_assignee && <span>EMCEE: <span className="text-gray-700">{event.emcee_assignee}</span></span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Recent Threads */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">Recent Threads</h2>
          <Link to="/threads" className="text-primary-600 text-sm font-medium hover:underline">View all</Link>
        </div>
        <div className="space-y-2">
          {loadingThreads ? (
            <SkeletonCard />
          ) : recentThreads.length === 0 ? (
            <EmptyCard message="No threads yet. Be the first to share!" linkTo="/threads" linkLabel="Start a thread" />
          ) : (
            recentThreads.map(thread => (
              <Link to={`/threads/${thread.id}`} key={thread.id} className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <p className="font-semibold text-gray-800 line-clamp-1">{thread.title}</p>
                <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{thread.content}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>{thread.author_name}</span>
                  <span>{thread.reply_count} {thread.reply_count === 1 ? 'reply' : 'replies'}</span>
                  <span>{timeAgo(thread.created_at)}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Quick links */}
      <section className="grid grid-cols-2 gap-3">
        <Link to="/offerings" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
          <p className="text-2xl mb-1">💰</p>
          <p className="font-semibold text-gray-700 text-sm">Offerings</p>
        </Link>
        <Link to="/feedback" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
          <p className="text-2xl mb-1">✍️</p>
          <p className="font-semibold text-gray-700 text-sm">Feedback</p>
        </Link>
      </section>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
    </div>
  );
}

function EmptyCard({ message, linkTo, linkLabel }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center text-sm text-gray-400">
      {message}{' '}
      <Link to={linkTo} className="text-primary-500 font-medium hover:underline">{linkLabel}</Link>
    </div>
  );
}
