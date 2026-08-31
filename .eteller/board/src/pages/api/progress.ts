import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

function workspaceRoot(): string {
  // .eteller/board → workspace root is two levels up
  return path.resolve(process.cwd(), '..', '..');
}

function etellerRoot(): string {
  return path.join(workspaceRoot(), '.eteller');
}

function repoDirFromUrl(repoUrl: string): string {
  let name = repoUrl.trim().replace(/\/+$/, '').replace(/\.git$/i, '');
  name = path.basename(name);
  return name;
}

function readConfig(): { repoUrl: string; repoDir: string; integration: string } {
  const cfgPath = path.join(etellerRoot(), 'workspace.config.md');
  let repoUrl = '';
  let integration = '';
  if (fs.existsSync(cfgPath)) {
    const text = fs.readFileSync(cfgPath, 'utf8');
    const u = text.match(/^REPO_URL:\s*(.+)$/m);
    const i = text.match(/^INTEGRATION_BRANCH:\s*(.+)$/m);
    if (u) repoUrl = u[1].trim();
    if (i) integration = i[1].trim();
  }
  return {
    repoUrl,
    integration,
    repoDir: repoUrl ? repoDirFromUrl(repoUrl) : '',
  };
}

function parseMeta(md: string): Record<string, string> {
  const block = (md.match(/```([\s\S]*?)```/) || [])[1] || '';
  const out: Record<string, string> = {};
  for (const line of block.split(/\r?\n/)) {
    const m = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (m) out[m[1].toLowerCase()] = m[2].trim();
  }
  return out;
}

function parseStateTable(md: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of md.split(/\r?\n/)) {
    const m = line.match(/^\|\s*([a-z_]+)\s*\|\s*`?([^`|]*)`?\s*\|/i);
    if (m) out[m[1].toLowerCase()] = m[2].trim();
  }
  return out;
}

function parseCheckboxLines(text: string): { done: boolean; text: string }[] {
  const subs: { done: boolean; text: string }[] = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*-\s*\[([ xX])\]\s+(.+)$/);
    if (m) subs.push({ done: m[1].toLowerCase() === 'x', text: m[2].trim() });
  }
  return subs;
}

function parseMilestones(md: string): { done: boolean; text: string }[] {
  const afterHeading =
    md.split(/##\s*Milestones/i)[1] ||
    md.split(/##\s*Subtareas/i)[1] ||
    '';
  // Prefer section under heading; if missing/empty, scan whole file (agents often omit the heading).
  const fromSection = afterHeading ? parseCheckboxLines(afterHeading) : [];
  if (fromSection.length > 0) return fromSection;
  return parseCheckboxLines(md);
}

function listWaveDirs(wavesRoot: string): string[] {
  if (!fs.existsSync(wavesRoot)) return [];
  return fs
    .readdirSync(wavesRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('wave-'))
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function fileMtime(p: string | undefined): string {
  if (!p || !fs.existsSync(p)) return '';
  try {
    return fs.statSync(p).mtime.toISOString();
  } catch {
    return '';
  }
}

function mergeStatus(
  progressMeta: Record<string, string>,
  stateMeta: Record<string, string>,
): string {
  const finished = (stateMeta.finished || '').toLowerCase() === 'true';
  const stateStatus = (stateMeta.status || '').toLowerCase();
  const progressStatus = (progressMeta.status || '').toLowerCase();
  const approved =
    (stateMeta.approved || progressMeta.approved || '').toLowerCase() === 'true';

  // Terminal success on the board = merged only (not "closed" after PR open).
  if (stateStatus === 'merged' || progressStatus === 'merged') return 'merged';
  if (finished && (stateStatus === 'abandoned' || progressStatus === 'abandoned')) {
    return 'abandoned';
  }
  // Legacy: finished/closed without merge → still in flight toward merge.
  if (finished || stateStatus === 'closed' || progressStatus === 'closed') {
    if (approved) return 'approved';
    if (stateMeta.pr_url || progressMeta.pr_status) return 'awaiting_review';
    return progressStatus === 'closed' ? 'in_progress' : stateStatus || 'in_progress';
  }

  if (stateStatus === 'blocked' || stateStatus === 'blocked_client') return stateStatus;
  if (progressStatus === 'blocked' || progressStatus === 'blocked_client') {
    return progressStatus;
  }

  if (stateStatus === 'approved' || progressStatus === 'approved' || approved) {
    return 'approved';
  }
  if (stateStatus === 'awaiting_review' || progressStatus === 'awaiting_review') {
    return 'awaiting_review';
  }

  return progressStatus || stateStatus || 'pending';
}

function derivePercent(
  milestones: { done: boolean; text: string }[],
  status: string,
  declared: string | undefined,
): string {
  if (status === 'merged') return '100';
  if (milestones.length > 0) {
    const doneCount = milestones.filter((m) => m.done).length;
    let pct = Math.round((doneCount / milestones.length) * 100);
    // Never show 100% until merge (even if someone checked everything except merge by mistake).
    const mergeOpen = milestones.some(
      (m) => !m.done && /merge/i.test(m.text),
    );
    if (mergeOpen && pct >= 100) pct = Math.min(99, Math.round(((milestones.length - 1) / milestones.length) * 100));
    if (status !== 'merged' && pct >= 100) pct = 99;
    return String(pct);
  }
  if (declared && status !== 'merged') {
    const n = parseInt(declared, 10);
    if (!Number.isNaN(n) && n >= 100) return '99';
  }
  return declared || '0';
}

export const GET: APIRoute = async () => {
  const root = workspaceRoot();
  const { repoDir } = readConfig();
  const wavesRoot = path.join(root, 'waves');
  const baseEteller = repoDir
    ? path.join(root, 'base', repoDir, '.eteller')
    : '';

  const orchestrationPath = baseEteller
    ? path.join(baseEteller, 'orchestration.md')
    : '';
  const orchestration =
    orchestrationPath && fs.existsSync(orchestrationPath)
      ? fs.readFileSync(orchestrationPath, 'utf8')
      : '';

  const waves: {
    id: string;
    plan: string;
    tasks: {
      id: string;
      paths: { task?: string; state?: string; progress?: string; clone?: string };
      taskMd: string;
      stateMd: string;
      progressMd: string;
      meta: Record<string, string>;
      milestones: { done: boolean; text: string }[];
      mtime: string;
    }[];
  }[] = [];

  for (const waveId of listWaveDirs(wavesRoot)) {
    const wavePath = path.join(wavesRoot, waveId);
    const planPath = baseEteller
      ? path.join(baseEteller, 'waves', waveId, 'wave_plan.md')
      : '';
    const plan =
      planPath && fs.existsSync(planPath) ? fs.readFileSync(planPath, 'utf8') : '';

    const taskIds = fs
      .readdirSync(wavePath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    const tasks = [];
    for (const taskId of taskIds) {
      const taskParent = path.join(wavePath, taskId);
      let clonePath = '';
      if (repoDir) {
        const candidate = path.join(taskParent, repoDir);
        if (fs.existsSync(candidate)) clonePath = candidate;
      }
      if (!clonePath && fs.existsSync(taskParent)) {
        const kids = fs
          .readdirSync(taskParent, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => d.name);
        if (kids.length === 1) clonePath = path.join(taskParent, kids[0]);
      }

      const etellerDir = clonePath ? path.join(clonePath, '.eteller') : '';
      const progressPath = etellerDir ? path.join(etellerDir, 'progress.md') : '';
      const statePath = etellerDir ? path.join(etellerDir, 'state.md') : '';
      const taskPath = etellerDir ? path.join(etellerDir, 'task.md') : '';

      const read = (p: string) =>
        p && fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';

      const progressMd = read(progressPath);
      const taskMd = read(taskPath);
      const stateMd = read(statePath);
      const progressMeta = parseMeta(progressMd);
      const stateMeta = parseStateTable(stateMd);
      const milestones = parseMilestones(progressMd);

      const meta: Record<string, string> = { ...progressMeta };
      if (!meta.ticket) meta.ticket = taskId;
      if (!meta.wave) meta.wave = waveId;
      if (!meta.branch) meta.branch = stateMeta.branch || taskId;
      meta.status = mergeStatus(progressMeta, stateMeta);
      if (stateMeta.pr_url) meta.pr_status = stateMeta.pr_url;
      else if (!meta.pr_status && progressMeta.pr_status) meta.pr_status = progressMeta.pr_status;
      if (stateMeta.approved) meta.approved = stateMeta.approved;
      if (stateMeta.review) meta.review = stateMeta.review;

      meta.percent = derivePercent(milestones, meta.status, meta.percent);

      const mtime = [fileMtime(progressPath), fileMtime(statePath)]
        .filter(Boolean)
        .sort()
        .at(-1) || '';

      if (!meta.updated && mtime) meta.updated = mtime;

      tasks.push({
        id: taskId,
        paths: {
          clone: clonePath || undefined,
          task: taskPath || undefined,
          state: statePath || undefined,
          progress: progressPath || undefined,
        },
        taskMd,
        stateMd,
        progressMd,
        meta,
        milestones,
        mtime,
      });
    }

    waves.push({ id: waveId, plan, tasks });
  }

  return new Response(
    JSON.stringify({
      updated: new Date().toISOString(),
      repoDir,
      orchestration,
      waves,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
      },
    },
  );
};
