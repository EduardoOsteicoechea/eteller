import { useEffect, useRef, useState } from 'react';

type Milestone = { done: boolean; text: string };

type TaskCard = {
  id: string;
  meta: Record<string, string>;
  milestones: Milestone[];
  paths: { clone?: string };
  mtime?: string;
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

const POLL_MS = 1500;

function badgeClass(status: string) {
  const s = (status || 'idle').toLowerCase();
  if (s === 'done' || s === 'closed') return 'done';
  if (s === 'merged') return 'merged';
  if (s === 'blocked' || s === 'blocked_client') return 'blocked';
  if (s === 'in_progress' || s === 'active' || s === 'ready_for_pr') return 'in_progress';
  return 'idle';
}

function isMerged(meta: Record<string, string>) {
  const status = (meta.status || '').toLowerCase();
  const pr = (meta.pr_status || '').toLowerCase();
  const phase = meta.phase || '';
  return status === 'merged' || pr === 'merged' || /merged/i.test(phase);
}

function fingerprint(data: Payload): string {
  return data.waves
    .map((w) =>
      w.tasks
        .map(
          (t) =>
            `${t.id}:${t.meta.status}:${t.meta.percent}:${t.meta.current_task}:${t.mtime}:${t.milestones
              .map((m) => (m.done ? '1' : '0'))
              .join('')}`,
        )
        .join('|'),
    )
    .join('/');
}

export default function Board() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conn, setConn] = useState('connecting…');
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const prevFp = useRef<string>('');
  const prevTasks = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const res = await fetch(`/api/progress?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const json = (await res.json()) as Payload;
        if (!alive) return;

        const next = new Map<string, string>();
        const changed = new Set<string>();
        for (const wave of json.waves) {
          for (const task of wave.tasks) {
            const key = `${wave.id}/${task.id}`;
            const sig = `${task.meta.status}|${task.meta.percent}|${task.meta.current_task}|${task.mtime}|${task.milestones
              .map((m) => (m.done ? '1' : '0') + m.text)
              .join(';')}`;
            next.set(key, sig);
            const old = prevTasks.current.get(key);
            if (old !== undefined && old !== sig) changed.add(task.id);
          }
        }
        prevTasks.current = next;

        const fp = fingerprint(json);
        if (fp !== prevFp.current) {
          prevFp.current = fp;
          if (changed.size > 0) {
            setFlashIds(changed);
            window.setTimeout(() => {
              if (alive) setFlashIds(new Set());
            }, 1800);
          }
        }

        setData(json);
        setError(null);
        setConn('live');
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : String(e));
        setConn('error');
      }
    };
    refresh();
    const id = setInterval(refresh, POLL_MS);
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
          Poll every <strong>{POLL_MS / 1000}s</strong> · last read:{' '}
          <strong>{data ? new Date(data.updated).toLocaleTimeString() : '—'}</strong> ·{' '}
          <span className={conn === 'live' ? 'ok' : conn === 'error' ? 'bad' : ''}>{conn}</span>
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
              const cardClass = [
                merged
                  ? 'merged-card'
                  : status === 'done' || status === 'closed'
                    ? 'done-card'
                    : '',
                flashIds.has(task.id) ? 'flash' : '',
              ]
                .filter(Boolean)
                .join(' ');
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
        Live board for eteller wave tasks. Reads clone <code>.eteller/progress.md</code> +{' '}
        <code>state.md</code> from disk every {POLL_MS / 1000}s. Agents must update progress after
        each milestone.
      </footer>
    </div>
  );
}
