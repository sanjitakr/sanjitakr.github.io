const root     = document.documentElement;
const themeBtn = document.getElementById('theme-btn');

if (localStorage.getItem('theme') === 'light') root.classList.add('light');

themeBtn?.addEventListener('click', () => {
  const light = root.classList.toggle('light');
  localStorage.setItem('theme', light ? 'light' : 'dark');
  themeBtn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
});


document.getElementById('timeline')?.addEventListener('click', e => {
  const btn = e.target.closest('.tl-btn');
  if (!btn) return;
  const item = btn.closest('.tl-item');
  const open = item.classList.toggle('open');
  btn.setAttribute('aria-expanded', String(open));
});


const projectGrid = document.getElementById('project-grid');
if (projectGrid && typeof SITE !== 'undefined') {
  let activeTags = [];

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function slug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function parseWriteup(text) {
    return text.trim().split(/\n\n+/).map(block => {
      const lines = block.split('\n');
      if (lines.every(l => /^[-*] /.test(l))) {
        const lis = lines.map(l => `<li>${esc(l.replace(/^[-*] /, ''))}</li>`).join('');
        return `<ul>${lis}</ul>`;
      }
      const html = esc(block)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.+?)`/g, '<code>$1</code>');
      return `<p>${html}</p>`;
    }).join('');
  }

  function renderProjects(list) {
    if (!list.length) {
      projectGrid.innerHTML = '<p class="no-results">No projects match that filter.</p>';
      return;
    }
    projectGrid.innerHTML = list.map(p => {
      const id    = slug(p.title);
      const tags  = p.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('');
      const ghLink = p.link
        ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">github ↗</a>`
        : '';
      const wuBtn = p.writeup
        ? `<button class="writeup-toggle" aria-expanded="false" data-id="${id}">write-up</button>`
        : '';
      const wuBody = p.writeup
        ? `<div class="writeup-body" id="wu-${id}">
             <div class="writeup-inner">${parseWriteup(p.writeup)}</div>
           </div>`
        : '';
      return `
        <article class="project-card">
          <h2>${esc(p.title)}</h2>
          <p class="project-summary">${esc(p.summary)}</p>
          <div class="tag-row">${tags}</div>
          <div class="card-links">${ghLink}${wuBtn}</div>
          ${wuBody}
        </article>`;
    }).join('');

    projectGrid.querySelectorAll('.writeup-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = document.getElementById(`wu-${btn.dataset.id}`);
        const open  = panel.classList.toggle('open');
        btn.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', String(open));
        btn.textContent = open ? 'close' : 'write-up';
      });
    });
  }

  function applyFilter(tags) {
    activeTags = tags;
    const filtered = tags.length
      ? SITE.projects.filter(p => tags.some(t => p.tags.includes(t)))
      : SITE.projects;

    renderProjects(filtered);

    const url = tags.length ? `?tags=${tags.join(',')}` : location.pathname;
    history.pushState({ tags }, '', url);

    document.querySelectorAll('.filter-btn').forEach(btn => {
      const t      = btn.dataset.tag;
      const active = t === 'All' ? !tags.length : tags.includes(t);
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  document.getElementById('filter-bar')?.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    const tag = btn.dataset.tag;
    if (tag === 'All') { applyFilter([]); return; }
    const next = activeTags.includes(tag)
      ? activeTags.filter(t => t !== tag)
      : [...activeTags, tag];
    applyFilter(next);
  });

  window.addEventListener('popstate', e => applyFilter(e.state?.tags ?? []));

  const params = new URLSearchParams(location.search);
  const initial = params.get('tags')?.split(',').filter(Boolean) ?? [];
  applyFilter(initial);
}


const linksRoot = document.getElementById('links-root');
if (linksRoot && typeof SITE !== 'undefined') {
  linksRoot.innerHTML = SITE.links.map(section => {
    const rows = section.items.length
      ? section.items.map(item => `
          <div class="link-row">
            <div class="link-left">
              <a class="link-title" href="${item.url}" target="_blank" rel="noopener">${item.title}</a>
              ${item.note ? `<div class="link-note">${item.note}</div>` : ''}
            </div>
            <span class="link-type">${item.type}</span>
          </div>`).join('')
      : `<p class="links-empty">Nothing here yet.</p>`;
    return `
      <section class="links-section">
        <h2 class="links-heading">${section.heading}</h2>
        ${rows}
      </section>`;
  }).join('');
}