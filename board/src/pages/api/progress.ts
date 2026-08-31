import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

function workspaceRoot(): string {
  // board/ is one level under eteller root
  return path.resolve(process.cwd(), '..');
}

function readConfig(): { repoDir: string } {
  const cfgPath = path.join(workspaceRoot(), 'workspace.config.md');
  let repoDir = '';
  if (fs.existsSync(cfgPath)) {
    const text = fs.readFileSync(cfgPath, 'utf8');
    const m = text.match(/^REPO_DIR_NAME:\s*(.+)$/m);
    if (m) repoDir = m[1].trim();
  }
  return { repoDir };
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

function parseMilestones(md: string): { done: boolean; text: string }[] {
  const section =
    md.split(/##\s*Milestones/i)[1] ||
    md.split(/##\s*Subtareas/i)[1] ||
    '';
  const subs: { done: boolean; text: string }[] = [];
  for (const line of section.split(/\r?\n/)) {
    const m = line.match(/^\s*-\s*\[([ xX])\]\s+(.+)$/);
    if (m) subs.push({ done: m[1].toLowerCase() === 'x', text: m[2].trim() });
  }
  return subs;
}

function listWaveDirs(wavesRoot: string): string[] {
  if (!fs.existsSync(wavesRoot)) return [];
  return fs
    .readdirSync(wavesRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('wave-'))
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

export const GET: APIRoute = async () => {
  const root = workspaceRoot();
  const { repoDir } = readConfig();
  const wavesRoot = path.join(root, 'waves');
  const baseEteller = repoDir
    ? path.join(root, 'base', repoDir, '.eteller')
    : path.join(root, 'base');

  const orchestrationPath = path.join(baseEteller, 'orchestration.md');
  const orchestration = fs.existsSync(orchestrationPath)
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
    }[];
  }[] = [];

  for (const waveId of listWaveDirs(wavesRoot)) {
    const wavePath = path.join(wavesRoot, waveId);
    const planPath = path.join(baseEteller, 'waves', waveId, 'wave_plan.md');
    const plan = fs.existsSync(planPath) ? fs.readFileSync(planPath, 'utf8') : '';

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
      if (!clonePath) {
        const kids = fs
          .readdirSync(taskParent, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => d.name);
        if (kids.length === 1) clonePath = path.join(taskParent, kids[0]);
      }

      const etellerDir = clonePath ? path.join(clonePath, '.eteller') : '';
      const read = (name: string) => {
        if (!etellerDir) return '';
        const p = path.join(etellerDir, name);
        return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
      };

      const progressMd = read('progress.md');
      const taskMd = read('task.md');
      const stateMd = read('state.md');
      const meta = parseMeta(progressMd);
      if (!meta.ticket) meta.ticket = taskId;
      if (!meta.wave) meta.wave = waveId;

      tasks.push({
        id: taskId,
        paths: {
          clone: clonePath || undefined,
          task: etellerDir ? path.join(etellerDir, 'task.md') : undefined,
          state: etellerDir ? path.join(etellerDir, 'state.md') : undefined,
          progress: etellerDir ? path.join(etellerDir, 'progress.md') : undefined,
        },
        taskMd,
        stateMd,
        progressMd,
        meta,
        milestones: parseMilestones(progressMd),
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
        'Cache-Control': 'no-store',
      },
    },
  );
};
