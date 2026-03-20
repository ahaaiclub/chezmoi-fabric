// Chez Moi - Fabric Library App

const USE_ICONS = {
  '衣物': '👘', '包袋': '👜', '桌布盖布': '🏠', '布艺玩偶': '🧸',
  '围巾披肩': '🧣', '家居软装': '🛋️', '手工拼布': '🧵', '茶席': '🍵',
  '书衣包装': '📖', '窗帘': '🪟', '靠垫': '🛏️', '装饰挂布': '🎨',
  '桌旗': '🎋', '布艺装饰': '✂️', '拼布创作': '🧩'
};

async function loadFabrics() {
  const resp = await fetch('data/fabrics.json');
  return resp.json();
}

// ===== Detail Page =====
async function initDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { window.location.href = 'index.html'; return; }

  const fabrics = await loadFabrics();
  const fabric = fabrics.find(f => f.id === id);
  if (!fabric) { window.location.href = 'index.html'; return; }

  document.title = `${fabric.name} - Chez Moi`;

  // Header ID
  document.getElementById('fabricId').textContent = `# ${fabric.id}`;

  // Gallery
  renderGallery(fabric);

  // Basic info
  document.getElementById('fabricName').textContent = fabric.name;
  document.getElementById('fabricOrigin').innerHTML = `产地 · <span>${fabric.origin}</span> · ${fabric.originStory}`;

  // Tags
  const tagsEl = document.getElementById('fabricTags');
  const statusClass = fabric.status === '有货' ? '' : ' low';
  tagsEl.innerHTML = `
    <span class="tag tag-material">${fabric.material}</span>
    <span class="tag tag-pattern">${fabric.pattern}纹</span>
    <span class="tag tag-status${statusClass}">● ${fabric.status}</span>
  `;

  // Info grid
  document.getElementById('infoMaterial').textContent = fabric.material;
  document.getElementById('infoPattern').textContent = fabric.pattern;
  document.getElementById('infoDyeing').textContent = fabric.dyeing;
  document.getElementById('infoWidth').textContent = fabric.width;
  document.getElementById('infoThickness').textContent = fabric.thickness;
  document.getElementById('infoOrigin').textContent = fabric.origin;

  // Story
  document.getElementById('fabricStory').textContent = fabric.story;

  // Uses
  const usesEl = document.getElementById('fabricUses');
  usesEl.innerHTML = fabric.uses.map(u =>
    `<span class="suitable-tag">${USE_ICONS[u] || '📌'} ${u}</span>`
  ).join('');

  // Care
  document.getElementById('fabricCare').textContent = fabric.care;
}

function renderGallery(fabric) {
  const track = document.getElementById('galleryTrack');
  const dotsEl = document.getElementById('galleryDots');
  const count = fabric.images.length;

  // Render slides
  track.innerHTML = fabric.images.map((img, i) => `
    <div class="gallery-slide">
      <div class="img-placeholder" style="background: ${fabric.placeholderGradient}">
        <div class="weave-pattern">⬚⬚⬚<br>⬚⬚⬚<br>⬚⬚⬚</div>
        布料实拍图 ${i + 1}
      </div>
    </div>
  `).join('');

  // Render dots
  dotsEl.innerHTML = fabric.images.map((_, i) =>
    `<span${i === 0 ? ' class="active"' : ''} data-index="${i}"></span>`
  ).join('');

  // Touch swipe
  let current = 0;
  let startX = 0;
  let diff = 0;
  const gallery = document.querySelector('.gallery');

  gallery.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    track.style.transition = 'none';
  }, { passive: true });

  gallery.addEventListener('touchmove', e => {
    diff = e.touches[0].clientX - startX;
    track.style.transform = `translateX(calc(-${current * 100}% + ${diff}px))`;
  }, { passive: true });

  gallery.addEventListener('touchend', () => {
    track.style.transition = 'transform 0.35s ease';
    if (Math.abs(diff) > 50) {
      if (diff < 0 && current < count - 1) current++;
      if (diff > 0 && current > 0) current--;
    }
    diff = 0;
    updateSlide(current, track, dotsEl);
  });

  // Dot clicks
  dotsEl.addEventListener('click', e => {
    if (e.target.dataset.index !== undefined) {
      current = parseInt(e.target.dataset.index);
      track.style.transition = 'transform 0.35s ease';
      updateSlide(current, track, dotsEl);
    }
  });
}

function updateSlide(index, track, dotsEl) {
  track.style.transform = `translateX(-${index * 100}%)`;
  dotsEl.querySelectorAll('span').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// ===== Index Page =====
let allFabrics = [];
let activeFilters = { pattern: '', color: '', origin: '', material: '' };

async function initIndexPage() {
  allFabrics = await loadFabrics();
  renderGrid(allFabrics);
  setupFilters();
}

function renderGrid(fabrics) {
  const grid = document.getElementById('fabricGrid');
  if (fabrics.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🧶</div>
        <p>没有找到匹配的布料</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = fabrics.map((f, i) => `
    <div class="fabric-card" onclick="location.href='fabric.html?id=${f.id}'" style="animation-delay: ${i * 0.05}s">
      <div class="card-image">
        <div class="card-placeholder" style="background: ${f.placeholderGradient}">
          ⬚⬚<br>⬚⬚
        </div>
      </div>
      <div class="card-info">
        <div class="card-name">${f.name}</div>
        <div class="card-tags">
          <span class="card-tag">${f.material}</span>
          <span class="card-tag">${f.dyeing}</span>
        </div>
        <div class="card-origin">${f.origin} · ${f.originStory}</div>
      </div>
    </div>
  `).join('');
}

function setupFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.group;
      const value = btn.dataset.value;

      // Toggle
      if (activeFilters[group] === value) {
        activeFilters[group] = '';
        btn.classList.remove('active');
      } else {
        // Deactivate siblings
        document.querySelectorAll(`.filter-btn[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
        activeFilters[group] = value;
        btn.classList.add('active');
      }

      applyFilters();
    });
  });
}

function applyFilters() {
  const filtered = allFabrics.filter(f => {
    if (activeFilters.pattern && f.pattern !== activeFilters.pattern) return false;
    if (activeFilters.color && !f.colors.includes(activeFilters.color)) return false;
    if (activeFilters.origin && !f.origin.includes(activeFilters.origin)) return false;
    if (activeFilters.material && f.material !== activeFilters.material) return false;
    return true;
  });
  renderGrid(filtered);
}
