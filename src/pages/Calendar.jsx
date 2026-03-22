import { useEffect, useState } from 'react';
import api from '../api';
import { useAdmin } from '../context/AdminContext';
import { getReadingForDate } from '../bibleReadingPlan';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function Calendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState({ month: today.getMonth() + 1, year: today.getFullYear() });
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAdmin();

  const emptyForm = { event_title: '', word_assignee: '', prayer_assignee: '', emcee_assignee: '', notes: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchEvents();
  }, [viewDate]);

  async function fetchEvents() {
    setLoading(true);
    try {
      const res = await api.get(`/calendar?month=${viewDate.month}&year=${viewDate.year}`);
      setEvents(res.data);
    } catch {}
    setLoading(false);
  }

  function prevMonth() {
    setViewDate(v => {
      if (v.month === 1) return { month: 12, year: v.year - 1 };
      return { month: v.month - 1, year: v.year };
    });
    setSelectedDate(null);
  }

  function nextMonth() {
    setViewDate(v => {
      if (v.month === 12) return { month: 1, year: v.year + 1 };
      return { month: v.month + 1, year: v.year };
    });
    setSelectedDate(null);
  }

  function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }

  function getFirstDayOfMonth(month, year) {
    return new Date(year, month - 1, 1).getDay();
  }

  function toDateStr(day) {
    return `${viewDate.year}-${String(viewDate.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function eventsForDay(day) {
    const dateStr = toDateStr(day);
    return events.filter(e => e.event_date.slice(0, 10) === dateStr);
  }

  function isToday(day) {
    return today.getDate() === day && today.getMonth() + 1 === viewDate.month && today.getFullYear() === viewDate.year;
  }

  function handleDayClick(day) {
    setSelectedDate(day);
    setShowForm(false);
    setEditingEvent(null);
    setForm(emptyForm);
  }

  function openAddForm() {
    setEditingEvent(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(event) {
    setEditingEvent(event);
    setForm({
      event_title: event.event_title,
      word_assignee: event.word_assignee || '',
      prayer_assignee: event.prayer_assignee || '',
      emcee_assignee: event.emcee_assignee || '',
      notes: event.notes || '',
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const dateStr = toDateStr(selectedDate);
    try {
      if (editingEvent) {
        await api.put(`/calendar/${editingEvent.id}`, { event_date: dateStr, ...form });
      } else {
        await api.post('/calendar', { event_date: dateStr, ...form });
      }
      setShowForm(false);
      setEditingEvent(null);
      setForm(emptyForm);
      fetchEvents();
    } catch (err) {
      alert('Failed to save event.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/calendar/${id}`);
      fetchEvents();
    } catch {
      alert('Failed to delete.');
    }
  }

  const daysInMonth = getDaysInMonth(viewDate.month, viewDate.year);
  const firstDay = getFirstDayOfMonth(viewDate.month, viewDate.year);
  const selectedEvents = selectedDate ? eventsForDay(selectedDate) : [];
  const selectedReading = selectedDate
    ? getReadingForDate(new Date(viewDate.year, viewDate.month - 1, selectedDate))
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Calendar</h1>

      {/* Month navigator */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-3 bg-primary-700 text-white">
          <button onClick={prevMonth} className="p-1 hover:bg-primary-600 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-semibold">{MONTHS[viewDate.month - 1]} {viewDate.year}</span>
          <button onClick={nextMonth} className="p-1 hover:bg-primary-600 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 bg-primary-50">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-primary-600 py-2">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-100">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-white h-12" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = eventsForDay(day);
            const selected = selectedDate === day;
            const todayDay = isToday(day);
            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`bg-white h-12 flex flex-col items-center justify-start pt-1.5 relative transition-colors hover:bg-primary-50 ${selected ? 'ring-2 ring-inset ring-primary-500' : ''}`}
              >
                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${todayDay ? 'bg-primary-600 text-white' : 'text-gray-700'}`}>
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <span className="mt-0.5 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((_, idx) => (
                      <span key={idx} className="w-1.5 h-1.5 rounded-full bg-primary-400 inline-block" />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selectedDate && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-800 text-lg">
                {MONTHS[viewDate.month - 1]} {selectedDate}, {viewDate.year}
              </h2>
              {selectedReading && (
                <p className="text-xs text-primary-600 mt-0.5">Bible reading: {selectedReading}</p>
              )}
            </div>
            {isAdmin && (
              <button
                onClick={openAddForm}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Event
              </button>
            )}
          </div>

          {selectedEvents.length === 0 && !showForm && (
            <p className="text-gray-400 text-sm text-center py-4">No events on this day.</p>
          )}

          <div className="space-y-3">
            {selectedEvents.map(event => (
              <div key={event.id} className="border border-gray-100 rounded-xl p-4 bg-primary-50">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-gray-800">{event.event_title}</p>
                  {isAdmin && (
                    <div className="flex gap-2 ml-2 flex-shrink-0">
                      <button onClick={() => openEditForm(event)} className="text-primary-500 hover:text-primary-700 text-xs font-medium">Edit</button>
                      <button onClick={() => handleDelete(event.id)} className="text-red-400 hover:text-red-600 text-xs font-medium">Delete</button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                  <AssigneeTag label="Word" name={event.word_assignee} />
                  <AssigneeTag label="Opening Prayer" name={event.prayer_assignee} />
                  <AssigneeTag label="EMCEE" name={event.emcee_assignee} />
                </div>
                {event.notes && <p className="text-xs text-gray-500 mt-2 italic">{event.notes}</p>}
              </div>
            ))}
          </div>

          {/* Add/Edit form */}
          {showForm && isAdmin && (
            <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
              <h3 className="font-semibold text-gray-700">{editingEvent ? 'Edit Event' : 'New Event'}</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Activity Title *</label>
                <input
                  required
                  value={form.event_title}
                  onChange={e => setForm(f => ({ ...f, event_title: e.target.value }))}
                  placeholder="e.g. Sunday Discipleship"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Word (Speaker)</label>
                  <input
                    value={form.word_assignee}
                    onChange={e => setForm(f => ({ ...f, word_assignee: e.target.value }))}
                    placeholder="Name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Opening Prayer</label>
                  <input
                    value={form.prayer_assignee}
                    onChange={e => setForm(f => ({ ...f, prayer_assignee: e.target.value }))}
                    placeholder="Name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">EMCEE</label>
                  <input
                    value={form.emcee_assignee}
                    onChange={e => setForm(f => ({ ...f, emcee_assignee: e.target.value }))}
                    placeholder="Name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="Optional notes..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
                  {editingEvent ? 'Save Changes' : 'Add Event'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function AssigneeTag({ label, name }) {
  if (!name) return null;
  return (
    <div className="bg-white rounded-lg px-3 py-2">
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-700 truncate">{name}</p>
    </div>
  );
}
