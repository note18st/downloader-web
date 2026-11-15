// Trình tải M3 — V1.1 · Thuần, không thư viện ngoài, không khóa bí mật trong trang.
'use strict';

const APP_VERSION = 'V1.1.0';
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const settings = { api: '', token: sessionStorage.getItem('m3_session') || '', jobs: [], page: 'home', logged: false };
const activeStates = new Set(['queued', 'starting', 'downloading', 'uploading', 'canceling']);
const statusNames = {
  queued: 'Đang chờ', starting: 'Chuẩn bị', downloading: 'Đang tải', uploading: 'Đang lưu',
  done: 'Hoàn tất', error: 'Có lỗi', canceling: 'Đang hủy', canceled: 'Đã hủy'
};

// Biểu tượng Material (SVG tĩnh, không chứa dữ liệu người dùng)
const ICONS = {
  auto: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"/></svg>',
  video: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>',
  gallery: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
  stream: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>',
  cancel: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
  retry: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>',
  open: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',
  filePill: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>'
};

let noticeTimer = 0;
function notify(message, kind = '') {
  const e = $('#notice');
  clearTimeout(noticeTimer);
  if (!message) { e.hidden = true; return; }
  e.textContent = message;
  e.className = 'notice' + (kind ? ' ' + kind : '');
  e.hidden = false;
  if (kind === 'success') noticeTimer = setTimeout(() => { e.hidden = true; }, 5200);
}

/* ---------- Giao diện sáng / tối / tự động ---------- */
const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
function themeMode() { return localStorage.getItem('m3_theme_mode') || 'auto'; }
function themeApply(mode, persist = true) {
  if (!['light', 'dark', 'auto'].includes(mode)) mode = 'auto';
  if (persist) localStorage.setItem('m3_theme_mode', mode);
  const dark = mode === 'dark' || (mode === 'auto' && themeMedia.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  $('#themeColorMeta').setAttribute('content', dark ? '#1E1F25' : '#F5F2FA');
  $$('#themeMode .seg-item').forEach((b) => {
    const active = b.dataset.mode === mode;
    b.classList.toggle('active', active);
    b.setAttribute('aria-checked', active ? 'true' : 'false');
  });
}
function themeCycle() {
  const order = ['light', 'dark', 'auto'];
  const next = order[(order.indexOf(themeMode()) + 1) % order.length];
  const names = { light: 'Giao diện sáng', dark: 'Giao diện tối', auto: 'Giao diện tự động theo hệ thống' };
  themeApply(next);
  notify(names[next] + (next === 'auto' ? (themeMedia.matches ? ' (đang tối)' : ' (đang sáng)') : ''), 'success');
}
themeMedia.addEventListener('change', () => { if (themeMode() === 'auto') themeApply('auto', false); });

/* ---------- Trang ---------- */
function setPage(page) {
  if (!settings.logged || !['home', 'jobs', 'files', 'settings'].includes(page)) return;
  settings.page = page;
  $$('.page').forEach((el) => { el.hidden = true; });
  const target = $(`#${page}Page`);
  target.hidden = false;
  // Kích hoạt lại hoạt ảnh chuyển trang
  target.style.animation = 'none';
  void target.offsetWidth;
  target.style.animation = '';
  $$('[data-page]').forEach((el) => {
    const active = el.dataset.page === page;
    el.classList.toggle('active', active);
    el.toggleAttribute('disabled', false);
    if (el.classList.contains('bottom-item')) el.setAttribute('aria-current', active ? 'page' : 'false');
  });
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (page === 'jobs' || page === 'files') refreshJobs(true);
}

function setLogged(logged) {
  settings.logged = logged;
  $('#loginView').hidden = logged;
  $('#pages').hidden = !logged;
  const state = $('#authState');
  state.textContent = logged ? 'Đã đăng nhập' : 'Chưa đăng nhập';
  state.classList.toggle('ok', logged);
  $$('.bottom-item, .side-item').forEach((el) => { el.disabled = !logged; });
  if (logged) setPage(settings.page);
}

/* ---------- Gọi cầu nối ---------- */
async function call(path, options = {}) {
  if (!settings.api) throw new Error('Chưa có địa chỉ cầu nối.');
  const headers = {
    'Accept': 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(settings.token ? { 'Authorization': `Bearer ${settings.token}` } : {})
  };
  let response;
  try {
    response = await fetch(settings.api + path, { ...options, headers: { ...headers, ...(options.headers || {}) }, cache: 'no-store' });
  } catch {
    throw new Error('Không kết nối được cầu nối. Kiểm tra mạng rồi thử lại.');
  }
  const data = await response.json().catch(() => ({}));
  if (response.status === 401 && path !== '/auth/exchange' && path !== '/auth/token') {
    settings.token = '';
    sessionStorage.removeItem('m3_session');
    setLogged(false);
    throw new Error('Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.');
  }
  if (!response.ok) throw new Error(data.error || `Yêu cầu gặp lỗi ${response.status}.`);
  return data;
}

/* ---------- Định dạng ---------- */
function prettyTime(sec) {
  return new Date(sec * 1000).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function prettySize(n) {
  let num = Number(n) || 0;
  if (num <= 0) return '0 B';
  const units = ['B', 'KiB', 'MiB', 'GiB'];
  let i = 0;
  while (num >= 1024 && i < 3) { num /= 1024; i += 1; }
  return `${num.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} ${units[i]}`;
}
function titleOf(job) {
  try {
    const url = new URL(job.source_url);
    const path = decodeURIComponent(url.pathname).slice(0, 60);
    return url.hostname.replace(/^www\./, '') + path;
  } catch { return 'Tác vụ tải xuống'; }
}

/* ---------- Nút hành động ---------- */
function actionButton(kind, label, icon) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `small-btn ${kind}-btn`;
  b.innerHTML = ICONS[icon];
  const t = document.createElement('span');
  t.textContent = label;
  b.append(t);
  return b;
}

/* ---------- Thẻ tác vụ ---------- */
function buildJob(job, opts = {}) {
  const showFiles = !!opts.showFiles;
  const el = $('#jobTemplate').content.firstElementChild.cloneNode(true);
  const title = titleOf(job);
  const avatar = el.querySelector('.job-avatar');
  avatar.innerHTML = ICONS[job.mode] || ICONS.auto;

  const titleEl = el.querySelector('.job-title');
  titleEl.textContent = title;
  titleEl.title = title;
  el.querySelector('.job-date').textContent = prettyTime(job.created_at);

  const chip = el.querySelector('.state-chip');
  chip.textContent = statusNames[job.status] || job.status;
  if (/^[a-z]+$/.test(job.status)) chip.classList.add(job.status);

  const card = el;
  card.classList.add(`is-${job.status}`);

  const msg = el.querySelector('.job-message');
  msg.textContent = job.message || 'Đang chuẩn bị…';

  const wrap = el.querySelector('.progress-wrap');
  const percentEl = el.querySelector('.job-percent');
  const speedEl = el.querySelector('.job-speed');
  const fill = el.querySelector('.progress-fill');

  if (opts.summary) {
    // Thẻ ở trang Tệp đã lưu: thay thanh tiến trình bằng tổng kết dung lượng.
    wrap.querySelector('.progress-track').style.display = 'none';
    const files = Array.isArray(job.files) ? job.files : [];
    const total = files.reduce((s, f) => s + (Number(f.bytes) || 0), 0);
    percentEl.textContent = '';
    const summary = document.createElement('strong');
    summary.textContent = `${files.length} tệp · ${prettySize(total)}`;
    percentEl.append(summary);
  } else if (['queued', 'starting'].includes(job.status) && !(Number(job.progress) > 0)) {
    card.classList.add('is-indeterminate');
    percentEl.textContent = 'Đang khởi động máy tải…';
  } else {
    const percent = Math.max(0, Math.min(100, Number(job.progress) || 0));
    fill.style.width = percent + '%';
    percentEl.textContent = job.status === 'done'
      ? 'Đã tải và lưu lên Google Drive'
      : `Tiến trình: ${percent}%`;
  }
  if (typeof job.speed === 'string' && job.speed) speedEl.textContent = job.speed;

  const actions = el.querySelector('.job-actions');
  if (activeStates.has(job.status) && job.status !== 'canceling') {
    const btn = actionButton('cancel', 'Hủy', 'cancel');
    btn.addEventListener('click', async () => {
      if (!window.confirm('Gửi yêu cầu hủy tác vụ này?')) return;
      btn.disabled = true;
      try {
        await call(`/api/jobs/${encodeURIComponent(job.id)}/cancel`, { method: 'POST' });
        notify('Đã gửi yêu cầu hủy. Máy tải sẽ dừng ngay khi có thể.', 'success');
        await refreshJobs();
      } catch (e) { btn.disabled = false; notify(e.message, 'error'); }
    });
    actions.append(btn);
  }
  if (['error', 'canceled'].includes(job.status)) {
    const btn = actionButton('retry', 'Thử lại', 'retry');
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        await call('/api/jobs', {
          method: 'POST',
          body: JSON.stringify({
            url: job.source_url, mode: job.mode, quality: job.quality,
            subtitles: !!job.subtitles
          })
        });
        notify('Đã gửi lại lệnh tải cho liên kết này.', 'success');
        setPage('jobs');
        await refreshJobs(true);
      } catch (e) { btn.disabled = false; notify(e.message, 'error'); }
    });
    actions.append(btn);
  }
  // Nút mở trực tiếp kết quả trên Google Drive — chỉ hiện khi máy tải đã tạo
  // liên kết hợp lệ (tệp nếu tác vụ có 1 tệp, ngược lại là thư mục chứa kết quả).
  const driveLink = typeof job.drive_link === 'string' && job.drive_link.startsWith('https://drive.google.com/') ? job.drive_link : '';
  if (job.status === 'done' && driveLink) {
    const open = document.createElement('a');
    open.className = 'small-btn drive-open';
    open.href = driveLink;
    open.target = '_blank';
    open.rel = 'noopener noreferrer';
    open.innerHTML = ICONS.open;
    const openLabel = document.createElement('span');
    openLabel.textContent = 'Mở trên Google Drive';
    open.append(openLabel);
    const copy = actionButton('drive-copy', 'Sao chép liên kết', 'copy');
    copy.addEventListener('click', async () => {
      copy.disabled = true;
      try {
        await navigator.clipboard.writeText(driveLink);
        notify('Đã sao chép liên kết Google Drive.', 'success');
      } catch {
        notify('Trình duyệt không cho tự sao chép. Hãy bấm Mở trên Google Drive rồi sao chép từ thanh địa chỉ.', 'error');
      } finally { copy.disabled = false; }
    });
    actions.append(open, copy);
  }

  if (showFiles && job.status === 'done' && Array.isArray(job.files) && job.files.length) {
    const box = el.querySelector('.job-files');
    const max = 8;
    job.files.slice(0, max).forEach((f) => {
      const item = document.createElement('span');
      item.className = 'file-pill';
      item.innerHTML = ICONS.filePill;
      const name = document.createElement('span');
      name.textContent = `${f.name} · ${prettySize(f.bytes)}`;
      item.append(name);
      box.append(item);
    });
    if (job.files.length > max) {
      const more = document.createElement('span');
      more.className = 'file-pill file-more';
      more.textContent = `+${job.files.length - max} tệp khác`;
      box.append(more);
    }
  }
  return el;
}

function renderJobs() {
  const recent = $('#recentJobs'), all = $('#allJobs'), files = $('#filesList');
  recent.replaceChildren(); all.replaceChildren(); files.replaceChildren();
  const jobs = settings.jobs;
  const lists = [
    [recent, jobs.slice(0, 3), { showFiles: false }],
    [all, jobs, { showFiles: true }],
    [files, jobs.filter((j) => j.status === 'done'), { showFiles: true, summary: true }]
  ];
  for (const [target, items, opts] of lists) {
    if (!items.length) {
      const e = document.createElement('div');
      e.className = 'empty';
      e.textContent = target === files ? 'Chưa có tệp nào được lưu.' : 'Chưa có tác vụ nào.';
      target.append(e);
      continue;
    }
    for (const job of items) target.append(buildJob(job, opts));
  }
}

async function refreshJobs(silent = false) {
  if (!settings.token || !settings.logged) return;
  try {
    const result = await call('/api/jobs');
    settings.jobs = result.jobs || [];
    renderJobs();
  } catch (e) { if (!silent) notify(e.message, 'error'); }
}

/* ---------- Đăng nhập bằng mã truy cập ---------- */
async function keyLogin() {
  const key = $('#keyInput').value.trim();
  const btn = $('#keyBtn');
  if (!key) { notify('Hãy dán mã truy cập GitHub của bạn vào ô bên trên.', 'error'); return; }
  btn.disabled = true;
  try {
    const result = await call('/auth/token', { method: 'POST', body: JSON.stringify({ token: key }) });
    settings.token = result.token;
    sessionStorage.setItem('m3_session', result.token);
    $('#keyInput').value = '';
    $('#keyLogin').open = false;
    setLogged(true);
    notify('Đăng nhập thành công!', 'success');
    await refreshJobs(true);
  } catch (e) { notify(e.message, 'error'); }
  finally { btn.disabled = false; }
}

/* ---------- Chất lượng mặc định ---------- */
function storedQuality() { return localStorage.getItem('m3_quality') || 'best'; }
function applyQuality(value) {
  if (!['best', '1080', '720', 'audio'].includes(value)) value = 'best';
  localStorage.setItem('m3_quality', value);
  $('#qualityInput').value = value;
  $('#qualityDefault').value = value;
}

/* ---------- Khởi động ---------- */
async function boot() {
  $('#sysVersion').textContent = APP_VERSION;
  themeApply(themeMode(), false);

  $('#themeBtn').addEventListener('click', themeCycle);
  $$('#themeMode .seg-item').forEach((b) => b.addEventListener('click', () => themeApply(b.dataset.mode)));
  $$('[data-page]').forEach((el) => el.addEventListener('click', () => setPage(el.dataset.page)));
  $$('[data-go]').forEach((el) => el.addEventListener('click', () => setPage(el.dataset.go)));
  $('#refreshBtn').addEventListener('click', () => { refreshJobs(); });
  $('#syncBtn').addEventListener('click', async () => {
    try {
      await call('/api/sync', { method: 'POST' });
      await refreshJobs();
      notify('Đã kiểm tra lại trạng thái từ GitHub.', 'success');
    } catch (e) { notify(e.message, 'error'); }
  });
  $('#pasteBtn').addEventListener('click', async () => {
    try { $('#urlInput').value = await navigator.clipboard.readText(); }
    catch { notify('Trình duyệt không cho đọc bộ nhớ tạm. Hãy nhấn giữ ô liên kết và chọn Dán.', 'error'); }
  });
  $('#keyBtn').addEventListener('click', keyLogin);
  $('#keyInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); keyLogin(); } });
  $('#logoutBtn').addEventListener('click', async () => {
    try { await call('/api/logout', { method: 'POST' }); } catch { /* phiên có thể đã hết hạn */ }
    settings.token = '';
    sessionStorage.removeItem('m3_session');
    settings.jobs = [];
    setLogged(false);
    notify('Đã đăng xuất.', 'success');
  });
  applyQuality(storedQuality());
  $('#qualityInput').addEventListener('change', (e) => applyQuality(e.target.value));
  $('#qualityDefault').addEventListener('change', (e) => applyQuality(e.target.value));

  $('#downloadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = $('#urlInput').value.trim();
    if (!/^https?:\/\/.+/i.test(url)) {
      notify('Liên kết phải bắt đầu bằng https:// hoặc http://', 'error');
      $('#urlInput').focus();
      return;
    }
    const btn = $('#submitBtn');
    btn.disabled = true;
    btn.classList.add('loading');
    try {
      const body = {
        url,
        mode: $('#modeInput').value,
        quality: $('#qualityInput').value,
        subtitles: $('#subtitlesInput').checked
      };
      await call('/api/jobs', { method: 'POST', body: JSON.stringify(body) });
      $('#urlInput').value = '';
      notify('Đã gửi lệnh! GitHub Actions sẽ tiếp nhận và bắt đầu tải.', 'success');
      setPage('jobs');
      await refreshJobs(true);
    } catch (err) { notify(err.message, 'error'); }
    finally { btn.disabled = false; btn.classList.remove('loading'); }
  });

  // Giúp ô nhập luôn nhìn thấy khi bàn phím điện thoại mở
  $('#urlInput').addEventListener('focus', () => {
    setTimeout(() => $('#urlInput').scrollIntoView({ block: 'center', behavior: 'smooth' }), 250);
  });

  // Địa chỉ cầu nối: dùng chung nguồn khi trang chạy ngay trên Cloudflare Workers.
  try {
    if (location.hostname.endsWith('.workers.dev')) {
      settings.api = location.origin;
    } else {
      const config = await fetch('./config.json', { cache: 'no-store' }).then((r) => r.json());
      const address = new URL(config.api_base_url);
      const localDev = ['localhost', '127.0.0.1', '[::1]'].includes(address.hostname);
      if (address.protocol !== 'https:' && !localDev) throw new Error('Sai địa chỉ cầu nối.');
      settings.api = address.origin;
    }
    $('#sysGateway').textContent = new URL(settings.api).hostname;
    try {
      const health = await fetch(settings.api + '/health', { cache: 'no-store' }).then((r) => r.json());
      $('#loginBtn').classList.toggle('hidden', !health.oauth_ready);
      if (!health.configured) notify('Cầu nối chưa được cấu hình đầy đủ. Hãy chạy lại quy trình cài đặt trên GitHub Actions.', 'error');
    } catch { /* để trang vẫn dùng được khi cầu nối gián đoạn */ }
  } catch {
    notify('Chưa cấu hình trang web: mở tệp config.json và điền đúng địa chỉ Cloudflare Workers.', 'error');
  }

  $('#loginBtn').addEventListener('click', () => {
    if (!settings.api) { notify('Chưa có địa chỉ cầu nối để đăng nhập.', 'error'); return; }
    window.location.assign(settings.api + '/auth/start');
  });

  // Nhận mã đăng nhập một lần từ địa chỉ chuyển hướng (#auth_code=…)
  const fragment = new URLSearchParams(location.hash.slice(1));
  const code = fragment.get('auth_code');
  const authError = fragment.get('auth_error');
  if (code || authError) history.replaceState(null, '', location.pathname + location.search);
  if (authError) notify('Không đăng nhập được: ' + authError.replaceAll('_', ' '), 'error');
  if (code) {
    try {
      const result = await call('/auth/exchange', { method: 'POST', body: JSON.stringify({ code }) });
      settings.token = result.token;
      sessionStorage.setItem('m3_session', result.token);
      notify('Đăng nhập thành công!', 'success');
    } catch (e) { notify(e.message, 'error'); }
  }

  if (settings.token) {
    try {
      await call('/api/me');
      setLogged(true);
      await refreshJobs(true);
    } catch { setLogged(false); }
  } else setLogged(false);

  setInterval(() => {
    if (settings.token && settings.logged && !document.hidden && settings.jobs.some((j) => activeStates.has(j.status))) {
      refreshJobs(true);
    }
  }, 8000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshJobs(true); });
}

boot();
