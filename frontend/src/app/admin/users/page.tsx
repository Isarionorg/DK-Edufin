'use client';

import { useEffect, useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { fetchUsers, AdminUser } from '@/lib/adminapi';

function ProfileBadge({ complete }: { complete: boolean | null }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
      complete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
    }`}>
      {complete ? 'Complete' : 'Incomplete'}
    </span>
  );
}

function UserDrawer({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const profile = user.user_profiles;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">{user.full_name || 'Unnamed User'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-light">✕</button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Contact Info */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 w-16">Email</span>
                <a href={`mailto:${user.email}`} className="text-sm text-blue-600 hover:underline break-all">{user.email}</a>
                {user.is_email_verified && <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Verified</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 w-16">Phone</span>
                {user.phone ? (
                  <>
                    <a href={`tel:${user.phone}`} className="text-sm text-blue-600 hover:underline">{user.phone}</a>
                    {user.phone_verified && <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Verified</span>}
                  </>
                ) : (
                  <span className="text-sm text-gray-400 italic">Not provided</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 w-16">Joined</span>
                <span className="text-sm text-gray-700">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </span>
              </div>
            </div>
          </section>

          {/* Profile Details */}
          {profile ? (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Profile <ProfileBadge complete={profile.is_profile_complete} />
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                {[
                  ['Gender', profile.gender],
                  ['DOB', profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-IN') : null],
                  ['Category', profile.categories ? `${profile.categories.category_code} — ${profile.categories.category_name}` : null],
                  ['Stream', profile.eligible_streams ? `${profile.eligible_streams.stream_name}` : null],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex gap-3">
                    <span className="text-sm text-gray-500 w-20 shrink-0">{label}</span>
                    <span className="text-sm text-gray-800">{value || <span className="text-gray-400 italic">—</span>}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Profile</h3>
              <p className="text-sm text-gray-400 italic">No profile submitted yet.</p>
            </section>
          )}

          {/* Exam Scores */}
          {user.user_exam_scores.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Exam Scores</h3>
              <div className="space-y-2">
                {user.user_exam_scores.map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{s.exams?.exam_name || 'Unknown Exam'}</p>
                      <p className="text-xs text-gray-400">{s.year}</p>
                    </div>
                    <div className="text-right">
                      {s.exams?.qualification_type === 'score' && s.score_value && (
                        <p className="text-sm font-semibold text-[#2563EB]">Score: {s.score_value}</p>
                      )}
                      {s.exams?.qualification_type === 'rank' && s.rank_value && (
                        <p className="text-sm font-semibold text-[#2563EB]">Rank: {s.rank_value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Course Preferences */}
          {user.user_course_preferences.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Course Preferences</h3>
              <ol className="space-y-2">
                {user.user_course_preferences.map((p, i) => (
                  <li key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-xs font-bold text-[#2563EB] bg-blue-50 rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                      {p.priority ?? i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.courses?.course_name || '—'}</p>
                      {p.courses?.degree_type && <p className="text-xs text-gray-400">{p.courses.degree_type}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [selected, setSelected] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch((e) => setError(e?.message || 'Failed to load users.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const matchesSearch =
      (u.full_name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone?.includes(search) ?? false);
    const matchesFilter =
      filter === 'all' ||
      (filter === 'complete' && u.user_profiles?.is_profile_complete) ||
      (filter === 'incomplete' && !u.user_profiles?.is_profile_complete);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Users" subtitle="View student details and contact information" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Users', value: users.length },
            { label: 'Profile Complete', value: users.filter(u => u.user_profiles?.is_profile_complete).length },
            { label: 'Phone Verified', value: users.filter(u => u.phone_verified).length },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search by name, email or phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 min-w-60 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
            {(['all', 'complete', 'incomplete'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                  filter === f
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-sm text-gray-400">Loading users…</div>
          ) : error ? (
            <div className="p-10 text-center text-sm text-red-500">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-400">No users found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Name</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Email</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Phone</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Stream</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Profile</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => (
                  <tr
                    key={u.user_id}
                    onClick={() => setSelected(u)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-gray-900">{u.full_name || <span className="text-gray-400 italic">—</span>}</td>
                    <td className="px-5 py-3.5 text-gray-600">{u.email}</td>
                    <td className="px-5 py-3.5 text-gray-600">{u.phone || <span className="text-gray-400 italic">—</span>}</td>
                    <td className="px-5 py-3.5 text-gray-600">{u.user_profiles?.eligible_streams?.stream_name || <span className="text-gray-400 italic">—</span>}</td>
                    <td className="px-5 py-3.5"><ProfileBadge complete={u.user_profiles?.is_profile_complete ?? null} /></td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && <UserDrawer user={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}