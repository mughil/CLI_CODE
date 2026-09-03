/**
 * run-local.js — discover models that run on your own hardware, grouped by runner.
 */
(function () {
  'use strict';
  const esc = (s) => window.CLISearch.escapeHtml(s);
  const RUNNERS = [
    ['ollama', 'Ollama', 'One-command local runs; wraps llama.cpp.'],
    ['llama.cpp', 'llama.cpp', 'C/C++ engine, GGUF, CPU or GPU.'],
    ['mlx', 'MLX', 'Apple silicon (unified memory).'],
    ['vllm', 'vLLM', 'High-throughput GPU serving.'],
    ['transformers', 'Transformers', 'Reference PyTorch loading / fine-tuning.'],
    ['localai', 'LocalAI', 'OpenAI-compatible local API.'],
    ['lm-studio', 'LM Studio', 'Desktop app over llama.cpp / MLX.'],
    ['tgi', 'TGI', 'Hugging Face text-generation-inference server.'],
  ];

  document.addEventListener('DOMContentLoaded', async () => {
    const mount = document.getElementById('rl-view');
    let data;
    try { data = await window.ModelData.load(); }
    catch (e) { mount.innerHTML = `<p class="empty">Could not load models (${esc(String(e.message || e))}).</p>`; return; }
    const local = data.models.filter((m) => m.localCapable);
    const noRunner = local.filter((m) => !(m.localRunners || []).length);

    mount.innerHTML = `
      <h1 class="sec-title">Run AI models <span class="g">locally</span></h1>
      <p class="sec-sub"><b>${local.length}</b> of ${data.models.length} models in the directory can run on your own hardware. Grouped by runner where documented. Hardware needs vary by quantization — figures on each model page come from its model card, not estimates.</p>
      <h2 class="sub-h" style="margin-top:24px">By runner</h2>
      <div class="preset-grid">
        ${RUNNERS.map(([key, label, blurb]) => {
          const list = local.filter((m) => (m.localRunners || []).includes(key));
          if (!list.length) return '';
          return `<article class="preset">
            <div class="preset-head"><h3>${esc(label)}</h3><span class="pill">${list.length}</span></div>
            <p class="preset-desc">${esc(blurb)}</p>
            <ol class="pick-list">${list.slice(0, 12).map((m) => `<li>
              <a class="pick-name" href="model.html?slug=${encodeURIComponent(m.slug)}">${esc(m.name)}</a>
              <span class="pick-role">${esc(m.parameters || m.categories.join(' · '))}${m.openSourceStatus === 'open-weight' ? ' · open weight' : m.openSourceStatus === 'open-source' ? ' · open source' : ''}</span>
            </li>`).join('')}</ol>
          </article>`;
        }).join('')}
      </div>
      ${noRunner.length ? `<section class="cli-sec"><h2>Local-capable, runner not documented</h2>
        <div class="chips">${noRunner.map((m) => `<a class="chip" href="model.html?slug=${encodeURIComponent(m.slug)}">${esc(m.name)}</a>`).join('')}</div></section>` : ''}
      <section class="cli-sec"><h2>Runner projects</h2>
        <p class="muted">See the <a href="ai-explorer.html?cat=local-runner">AI OSS explorer</a> for the runner projects themselves (llama.cpp, Ollama, vLLM, MLX…).</p></section>`;
  });
})();
