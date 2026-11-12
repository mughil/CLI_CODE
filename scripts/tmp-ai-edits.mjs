#!/usr/bin/env node
// Temporary one-shot data corrections for AI-category entries (verified 2026-11-12).
// Applied by .github/workflows/regen-ai.yml; both files are removed after merge.
import { readFileSync, writeFileSync } from 'node:fs';

const read = (f) => JSON.parse(readFileSync(f, 'utf8'));
const write = (f, obj, indent) => writeFileSync(f, JSON.stringify(obj, null, indent) + '\n');

function jsonSpaced(o) { return '{' + Object.entries(o).map(([k, v]) => JSON.stringify(k) + ': ' + JSON.stringify(v)).join(', ') + '}'; }
// --- overlay.json keeps hand formatting: scalar arrays inline, object lists one per line ---
function dumpOverlay(obj, level = 0) {
  const pad = '  '.repeat(level);
  const pad2 = '  '.repeat(level + 1);
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    if (obj.every((x) => typeof x !== 'object' || x === null)) return '[' + obj.map((x) => JSON.stringify(x)).join(', ') + ']';
    return '[\n' + obj.map((x) => pad2 + jsonSpaced(x)).join(',\n') + '\n' + pad + ']';
  }
  if (obj && typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (!keys.length) return '{}';
    return '{\n' + keys.map((k) => `${pad2}${JSON.stringify(k)}: ${dumpOverlay(obj[k], level + 1)}`).join(',\n') + '\n' + pad + '}';
  }
  return JSON.stringify(obj);
}

// ---------- data/catalog_registry.json ----------
const cat = read('data/catalog_registry.json');
const catRecs = Object.fromEntries(cat.clis.map((c) => [c.name, c]));
catRecs['huggingface-cli'].install_cmd = 'pipx install huggingface_hub';
catRecs['whisper-cpp'].install_cmd = 'brew install whisper.cpp';
const gh = catRecs['gh-copilot'];
gh.description = "GitHub's official agentic Copilot CLI for the terminal — build, debug, and understand code through natural language (replaces the gh-copilot extension, deprecated 2025-10-25).";
gh.requires = 'Copilot subscription';
gh.homepage = 'https://github.com/github/copilot-cli';
gh.source_url = 'https://github.com/github/copilot-cli';
gh.install_cmd = 'npm install -g @github/copilot';
cat.clis.push({
  name: 'ollama', display_name: 'Ollama', version: 'curated',
  description: 'Get up and running with large language models locally — pull, run, and serve open-weight models from the terminal.',
  requires: 'cross-platform',
  homepage: 'https://ollama.com',
  source_url: 'https://github.com/ollama/ollama',
  install_cmd: 'curl -fsSL https://ollama.com/install.sh | sh',
  category: 'ai', language: 'Go', license: 'MIT',
});
cat.clis.push({
  name: 'comfyui', display_name: 'ComfyUI', version: 'curated',
  description: 'Official command-line tool for ComfyUI (comfy-cli) — install, launch, and extend ComfyUI, manage custom nodes and models, and run workflows from the terminal.',
  requires: 'Python >= 3.9',
  homepage: 'https://github.com/Comfy-Org/comfy-cli',
  source_url: 'https://github.com/Comfy-Org/comfy-cli',
  install_cmd: 'pipx install comfy-cli',
  category: 'ai', language: 'Python', license: 'GPL-3.0-only',
});
write('data/catalog_registry.json', cat, 1);

// ---------- data/registry.json ----------
const reg = read('data/registry.json');
reg.clis = reg.clis.filter((c) => c.name !== 'ollama' && c.name !== 'comfyui');
const regRecs = Object.fromEntries(reg.clis.map((c) => [c.name, c]));
regRecs['dify-workflow'].install_cmd = 'python -m pip install "dify-ai-workflow-tools @ git+https://github.com/Akabane71/dify-workflow-cli.git@main"';
regRecs['notebooklm'].install_cmd = 'pip install notebooklm-py';
write('data/registry.json', reg, 2);

// ---------- data/public_registry.json ----------
const pub = read('data/public_registry.json');
const pubRecs = Object.fromEntries(pub.clis.map((c) => [c.name, c]));
const mm = pubRecs['minimax-cli'];
mm.description = 'Official MiniMax CLI (`mmx`) — use MiniMax text, image, video, speech, vision, and web search from the terminal or from AI agents (requires an M Plan subscription).';
mm.requires = 'Node.js >= 18, MiniMax M Plan subscription';
mm.homepage = 'https://platform.minimax.io/docs/token-plan/minimax-cli';
mm.source_url = 'https://github.com/MiniMax-AI/cli';
mm.npm_package = 'mmx-cli';
mm.install_cmd = 'npm install -g mmx-cli';
delete mm.npx_cmd;
mm.skill_md = 'npx skills add MiniMax-AI/cli -y -g';
mm.entry_point = 'mmx';
mm.contributors = [{ name: 'MiniMax', url: 'https://github.com/MiniMax-AI' }];
const vv = pubRecs['vivideo'];
vv.homepage = 'https://www.npmjs.com/package/@vivideo/cli';
vv.description = vv.description.replace(/[. ]+$/, '') + '. The scoped @vivideo npm package is real; the vivideo.ai site does not currently document the CLI, so official status is unverified.';
write('data/public_registry.json', pub, 2);

// ---------- data/overlay.json ----------
const ov = read('data/overlay.json');
const e = ov.entries;
const ol = e['ollama'];
ol.summary = 'Get up and running with large language models locally — pull, run, and serve open-weight models from the terminal.';
ol.description = ol.summary;
ol.install = [{ method: 'brew', command: 'brew install ollama', label: 'macOS / Homebrew' }];
ol.examples = [{ title: 'Run a model', command: 'ollama run gemma4', description: 'Download and chat with a model in one step (from the official Ollama README)' }];
const cf = e['comfyui'];
cf.summary = 'Official ComfyUI CLI (comfy-cli) — install, launch, and extend ComfyUI, manage custom nodes and models, and run workflows from the terminal.';
cf.description = cf.summary;
cf.examples = [
  { title: 'Install ComfyUI', command: 'comfy install', description: 'Set up ComfyUI locally (from the comfy-cli README)' },
  { title: 'Launch the server', command: 'comfy launch' },
  { title: 'Run a workflow', command: 'comfy run --workflow ./workflow.json' },
];
e['dify-workflow'] = { install: [{ method: 'pip', command: 'pip install git+https://github.com/HKUDS/CLI-Anything.git#subdirectory=dify-workflow/agent-harness', label: 'CLI-Anything harness (after prerequisite)' }] };
e['notebooklm'] = { install: [{ method: 'pip', command: 'pip install git+https://github.com/HKUDS/CLI-Anything.git#subdirectory=notebooklm/agent-harness', label: 'CLI-Anything harness (after prerequisite)' }] };
e['aider'] = { install: [{ method: 'shell', command: 'aider-install', label: 'Run the installer' }] };
writeFileSync('data/overlay.json', dumpOverlay(ov) + '\n');

// ---------- data/registry-dates.json ----------
const dt = read('data/registry-dates.json');
for (const k of ['ollama', 'comfyui', 'dify-workflow', 'notebooklm', 'minimax-cli', 'vivideo', 'gh-copilot', 'huggingface-cli', 'whisper-cpp', 'aider']) {
  dt[k] = '2026-11-12';
}
write('data/registry-dates.json', dt, 2);

console.log('ai entry corrections applied');
