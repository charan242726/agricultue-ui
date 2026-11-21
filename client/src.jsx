import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Tools from './Tools.jsx';
import OriginalPages from './original-pages.jsx';
async function api(url, method = 'GET', body) {
  const response = await fetch(`/api${url}`, { method, headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}
function App() {
  const [user, setUser] = useState(null), [loading, setLoading] = useState(true), [register, setRegister] = useState(false);
  const [farm, setFarm] = useState({}), [records, setRecords] = useState([]), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  async function refresh() { const [f, r] = await Promise.all([api('/farm'), api('/records')]); setFarm(f); setRecords(r); }
  useEffect(() => { api('/me').then(async u => { setUser(u); await refresh(); }).catch(() => {}).finally(() => setLoading(false)); }, []);
  async function act(fn) { setBusy(true); setMessage(''); try { await fn(); } catch (e) { setMessage(e.message); } finally { setBusy(false); } }
  if (loading) return <main>Loading AgroEase…</main>;
  return <><header><strong>🌾 AgroEase</strong>{user && <span>{user.name} <button onClick={() => act(async () => { await api('/logout', 'POST'); setUser(null); setFarm({}); setRecords([]); })}>Sign out</button></span>}</header><main>
    <p role="status" aria-live="polite">{message}</p>
    {!user ? <section className="auth"><h1>{register ? 'Create your farm account' : 'Welcome back'}</h1><p>Your farm records, available wherever you sign in.</p><form onSubmit={e => { e.preventDefault(); const values = Object.fromEntries(new FormData(e.currentTarget)); act(async () => { setUser(await api(`/auth/${register ? 'register' : 'login'}`, 'POST', values)); await refresh(); }); }}>
      {register && <label>Name<input name="name" required maxLength="100" autoComplete="name" /></label>}
      <label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Password<input name="password" type="password" required minLength="10" maxLength="72" autoComplete={register ? 'new-password' : 'current-password'} /></label>
      <button disabled={busy}>{register ? 'Create account' : 'Sign in'}</button></form><button className="secondary" onClick={() => setRegister(!register)}>{register ? 'Already registered? Sign in' : 'Create an account'}</button></section> : <>
      <h1>Your farm overview</h1><p>Keep your farm figures and field records together.</p>
      <div className="grid">{[['Land','land','acres'],['Active crops','crops',''],['Expected yield','yield','tons'],['Expected revenue','revenue','₹']].map(([label,key,unit]) => <section key={key}><small>{label}</small><h2>{farm[key] == null ? 'Not recorded' : `${Number(farm[key]).toLocaleString('en-IN')} ${unit}`}</h2></section>)}</div>
      <section><h2>Farm profile</h2><p>These are your entered estimates. Update them as the season progresses.</p><form className="grid" onSubmit={e => { e.preventDefault(); const values = Object.fromEntries([...new FormData(e.currentTarget)].map(([k,v]) => [k,Number(v)])); act(async () => { setFarm(await api('/farm','PUT',values)); setMessage('Farm profile saved.'); }); }} key={farm.updatedAt || 'new'}>
        {[['land','Land (acres)'],['crops','Number of active crops'],['yield','Expected yield (tons)'],['revenue','Expected revenue (₹)']].map(([key,label]) => <label key={key}>{label}<input name={key} type="number" required min="0" step={key === 'crops' ? '1' : '0.01'} defaultValue={farm[key] ?? ''} /></label>)}<button disabled={busy}>Save profile</button></form></section>
      <Tools api={api}/>
      <section><h2>Scheduler & field records</h2><p>Schedule dated tasks and track soil tests, crops and applications. Include quantities and units in notes.</p><form onSubmit={e => { e.preventDefault(); const form = e.currentTarget; const values = Object.fromEntries(new FormData(form)); act(async () => { const row = await api('/records','POST',values); setRecords([row,...records]); form.reset(); setMessage('Record saved.'); }); }}>
        <div className="grid"><label>Type<select name="type"><option value="task">Task</option><option value="soil">Soil test</option><option value="crop">Crop</option><option value="application">Application</option></select></label><label>Title<input name="title" required maxLength="150" /></label><label>Date<input name="date" type="date" required /></label></div><label>Notes<textarea name="notes" maxLength="3000" rows="3" /></label><button disabled={busy}>Add record</button></form>
        {!records.length && <p>No records yet. Add your first field record above.</p>}{records.map(row => <article key={row._id}><strong>{row.title}</strong><small>{row.type} · {row.date}</small><p>{row.notes}</p>{row.type === 'task' && <button disabled={busy} className="secondary" onClick={() => act(async () => { const updated = await api(`/records/${row._id}`,'PATCH',{ done: !row.done }); setRecords(records.map(r => r._id === row._id ? updated : r)); })}>{row.done ? 'Completed — reopen' : 'Mark complete'}</button>}</article>)}
      </section></>}
    </main></>;
}
createRoot(document.getElementById('root')).render(<OriginalPages />);
