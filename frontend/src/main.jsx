import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const emptyForm = {
  company: '',
  role: '',
  status: 'APPLIED',
  appliedDate: new Date().toISOString().slice(0, 10),
  recruiter: '',
  notes: '',
};

const statuses = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'ON_HOLD'];

function App() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs');
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
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const updatedJob = { ...job, ...changes };
    const response = await fetch(`/api/jobs/${job.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedJob),
    });

    if (!response.ok) {
      setError('Could not update job');
      return;
    }

    setJobs((currentJobs) => currentJobs.map((item) => (item.id === job.id ? updatedJob : item)));
  }

  async function deleteJob(id) {
    const response = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
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
          <h1>Job Tracker</h1>
          <p>Track applications and update recruiter progress in one simple table.</p>
        </div>
        <span className="count">{jobs.length} jobs</span>
      </section>

      <form className="form" onSubmit={addJob}>
        <input
          value={form.company}
          onChange={(event) => setForm({ ...form, company: event.target.value })}
          placeholder="Company"
          required
        />
        <input
          value={form.role}
          onChange={(event) => setForm({ ...form, role: event.target.value })}
          placeholder="Role"
          required
        />
        <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <input
          type="date"
          value={form.appliedDate}
          onChange={(event) => setForm({ ...form, appliedDate: event.target.value })}
        />
        <input
          value={form.recruiter}
          onChange={(event) => setForm({ ...form, recruiter: event.target.value })}
          placeholder="Recruiter"
        />
        <input
          value={form.notes}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
          placeholder="Notes"
        />
        <button type="submit">Add Job</button>
      </form>

      {error && <p className="error">{error}</p>}

      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
              <th>Applied</th>
              <th>Recruiter</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Loading jobs...</td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan="7">No jobs added yet.</td>
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
