import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const emptyForm = {
  company: '',
  role: '',
  status: 'APPLIED',
  numberOfApplications: 1,
  appliedDate: new Date().toISOString().slice(0, 10),
  recruiter: '',
  notes: '',
};

const statuses = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'ON_HOLD'];
const accessPassword = 'Ankit123@!';

function App() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isUnlocked) {
      loadJobs();
    }
  }, [isUnlocked]);

  function authHeaders(extraHeaders = {}) {
    return {
      ...extraHeaders,
      'X-App-Password': password,
    };
  }

  function unlockTable(event) {
    event.preventDefault();

    if (password !== accessPassword) {
      setIsUnlocked(false);
      setJobs([]);
      setError('Incorrect password');
      return;
    }

    setError('');
    setIsUnlocked(true);
  }

  function lockTable() {
    setIsUnlocked(false);
    setPassword('');
    setJobs([]);
    setError('');
    setForm(emptyForm);
  }

  async function loadJobs() {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs', { headers: authHeaders() });
      if (!response.ok) throw new Error('Could not load jobs');
      setJobs(await response.json());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addJob(event) {
    event.preventDefault();
    if (!isUnlocked) return;

    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      setError('Could not add job');
      return;
    }

    setForm(emptyForm);
    await loadJobs();
  }

  async function updateJob(job, changes) {
    if (!isUnlocked) return;

    const updatedJob = { ...job, ...changes };
    const response = await fetch(`/api/jobs/${job.id}`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(updatedJob),
    });

    if (!response.ok) {
      setError('Could not update job');
      return;
    }

    setJobs((currentJobs) => currentJobs.map((item) => (item.id === job.id ? updatedJob : item)));
  }

  async function deleteJob(id) {
    if (!isUnlocked) return;

    const response = await fetch(`/api/jobs/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!response.ok) {
      setError('Could not delete job');
      return;
    }

    setJobs((currentJobs) => currentJobs.filter((job) => job.id !== id));
  }

  return (
    <main className="page">
      <section className="header">
        <div>
          <h1>Job Status</h1>
          <p>Track applications and update recruiter progress in one simple table.</p>
        </div>
        <div className="header-actions">
          <span className="count">{jobs.length} jobs</span>
          {isUnlocked && (
            <button className="lock-button" type="button" onClick={lockTable}>
              Lock
            </button>
          )}
        </div>
      </section>

      <form className="password-form" onSubmit={unlockTable}>
        <input
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setIsUnlocked(false);
            setJobs([]);
          }}
          placeholder="Enter password"
        />
        <button type="submit">Unlock</button>
      </form>

      <form className="form" onSubmit={addJob} aria-disabled={!isUnlocked}>
        <input
          value={form.company}
          onChange={(event) => setForm({ ...form, company: event.target.value })}
          placeholder="Company"
          required
          disabled={!isUnlocked}
        />
        <input
          value={form.role}
          onChange={(event) => setForm({ ...form, role: event.target.value })}
          placeholder="Role"
          required
          disabled={!isUnlocked}
        />
        <select
          value={form.status}
          onChange={(event) => setForm({ ...form, status: event.target.value })}
          disabled={!isUnlocked}
        >
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          value={form.numberOfApplications}
          onChange={(event) => setForm({ ...form, numberOfApplications: Number(event.target.value) })}
          placeholder="No of application"
          disabled={!isUnlocked}
        />
        <input
          type="date"
          value={form.appliedDate}
          onChange={(event) => setForm({ ...form, appliedDate: event.target.value })}
          disabled={!isUnlocked}
        />
        <input
          value={form.recruiter}
          onChange={(event) => setForm({ ...form, recruiter: event.target.value })}
          placeholder="Recruiter"
          disabled={!isUnlocked}
        />
        <input
          value={form.notes}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
          placeholder="Notes"
          disabled={!isUnlocked}
        />
        <button type="submit" disabled={!isUnlocked}>Add Job</button>
      </form>

      {error && <p className="error">{error}</p>}

      <section className={`table-wrap ${!isUnlocked ? 'locked' : ''}`}>
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
              <th>No of application</th>
              <th>Applied</th>
              <th>Recruiter</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!isUnlocked ? (
              <tr>
                <td colSpan="8">Enter the password to view job details.</td>
              </tr>
            ) : loading ? (
              <tr>
                <td colSpan="8">Loading jobs...</td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan="8">No jobs added yet.</td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.company}</td>
                  <td>{job.role}</td>
                  <td>
                    <select value={job.status} onChange={(event) => updateJob(job, { status: event.target.value })}>
                      {statuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={job.numberOfApplications || 1}
                      onChange={(event) => updateJob(job, { numberOfApplications: Number(event.target.value) })}
                    />
                  </td>
                  <td>{job.appliedDate}</td>
                  <td>{job.recruiter || '-'}</td>
                  <td>{job.notes || '-'}</td>
                  <td>
                    <button className="delete" type="button" onClick={() => deleteJob(job.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
