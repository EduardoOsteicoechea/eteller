import { useEffect, useState } from 'react';

type Milestone = { done: boolean; text: string };

type TaskCard = {
  id: string;
  meta: Record<string, string>;
  milestones: Milestone[];
  paths: { clone?: string };
};

type Wave = {
  id: string;
  plan: string;
  tasks: TaskCard[];
};

type Payload = {
  updated: string;
  repoDir: string;
  orchestration: string;
  waves: Wave[];
};

function badgeClass(status: string) {
  const s = (status || 'idle').toLowerCase();
  if (s === 'done' || s === 'closed') return 'done';
  if (s === 'merged') return 'merged';
  if (s === 'blocked') return 'blocked';
  if (s === 'in_progress' || s === 'active') return 'in_progress';
  return 'idle';
}

function isMerged(meta: Record<string, string>) {
  const status = (meta.status || '').toLowerCase();
  const pr = (meta.pr_status || '').toLowerCase();
  const phase = meta.phase || '';
  return status === 'merged' || pr === 'merged' || /merged/i.test(phase);
}

export default function Board() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conn, setConn] = useState('connecting…');

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const res = await fetch(`/api/progress?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const json = (await res.json()) as Payload;
        if (!alive) return;
        setData(json);
        setError(null);
        setConn('ok');
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : String(e));
        setConn('error');
      }
    };
    refresh();
    const id = setInterval(refresh, 5000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="eteller-board">
      <header>
        <h1>eteller</h1>
        <div className="meta">
          Poll every <strong>5s</strong> · last read:{' '}
          <strong>{data ? new Date(data.updated).toLocaleTimeString() : '—'}</strong> ·{' '}
          <span className={conn === 'ok' ? 'ok' : conn === 'error' ? 'bad' : ''}>{conn}</span>
        </div>
      </header>

      {error && (
        <div className="err">
          Could not load progress API. Run <code>npm run dev</code> from <code>board/</code>. {error}
        </div>
      )}

      {!error && data && data.waves.length === 0 && (
        <div className="empty">
          No waves yet. Fill <code>.eteller/workspace.config.md</code>, bootstrap base, write{' '}
          campaign <code>.eteller/orchestration.md</code> on base, then materialize <code>waves/</code>.
        </div>
      )}

      {data?.waves.map((wave) => (
        <section key={wave.id} className="wave">
          <h2>{wave.id}</h2>
          <div className="cards">
            {wave.tasks.length === 0 && (
              <p className="muted">No task clones under this wave yet.</p>
            )}
            {wave.tasks.map((task) => {
              const merged = isMerged(task.meta);
              const status = merged ? 'merged' : task.meta.status || 'idle';
              const percent = Math.max(
                0,
                Math.min(100, parseInt(task.meta.percent || '0', 10) || 0),
              );
              const cardClass = merged
                ? 'merged-card'
                : status === 'done' || status === 'closed'
                  ? 'done-card'
                  : '';
              return (
                <article key={task.id} className={`card ${cardClass}`}>
                  <div className="card-head">
                    <div className="ticket">
                      {task.meta.ticket || task.id}
                      {task.meta.branch ? ` · ${task.meta.branch}` : ''}
                    </div>
                    <span className={`badge ${badgeClass(status)}`}>{status}</span>
                  </div>
                  <div className="current">
                    <span className="label">Current</span>
                    {task.meta.current_task || '—'}
                  </div>
                  <div className="bar">
                    <i style={{ width: `${percent}%` }} />
                  </div>
                  <div className="pct">
                    {percent}% · updated {task.meta.updated || '—'}
                  </div>
                  <ul className="subs">
                    {task.milestones.length === 0 && <li>No milestones yet</li>}
                    {task.milestones.map((m, i) => (
                      <li key={i} className={m.done ? 'done' : ''}>
                        <span className="mark">{m.done ? '✓' : '○'}</span>
                        <span>{m.text}</span>
                      </li>
                    ))}
                  </ul>
                  {task.paths.clone && (
                    <div className="clone">
                      <code>{task.paths.clone}</code>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <footer>
        Live board for eteller wave tasks. Data from product <code>.eteller/</code> docs on disk.
      </footer>
    </div>
  );
}
