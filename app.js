// Giao diện thuần: không thư viện ngoài, không mật khẩu trong mã nguồn.
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const settings = {api: '', token: sessionStorage.getItem('m3_session') || '', jobs: [], page:'home'};
const activeStates = new Set(['queued','starting','downloading','uploading','canceling']);
const statusNames = {queued:'Đang chờ',starting:'Chuẩn bị',downloading:'Đang tải',uploading:'Đang lưu',done:'Hoàn tất',error:'Có lỗi',canceling:'Đang hủy',canceled:'Đã hủy'};

function notify(message, kind='') {
  const e=$('#notice');e.textContent=message;e.className='notice'+(kind?' '+kind:'');
  if (!message) e.classList.add('hidden');
}
function themeApply(name) {
  const val=name==='dark'?'dark':'light';
  document.documentElement.dataset.theme=val;
  localStorage.setItem('m3_theme',val);
}
function toggleTheme() { themeApply(document.documentElement.dataset.theme==='dark'?'light':'dark'); }
function setPage(page) {
  if (!['home','jobs','files','settings'].includes(page)) return;
  settings.page=page;
  $$('.page').forEach(el=>el.classList.add('hidden'));
  $(`#${page}Page`).classList.remove('hidden');
  $$('[data-page]').forEach(el=>el.classList.toggle('selected',el.dataset.page===page));
  const titles={home:'Tải xuống thật dễ',jobs:'Tác vụ của bạn',files:'Tệp đã lưu',settings:'Cài đặt'};
  $('#page-title').textContent=titles[page];
  window.scrollTo({top:0,behavior:'instant'});
}
function setLogged(logged) {
  $('#loginCard').classList.toggle('hidden',logged);
  $('#authLabel').textContent=logged?'Đã đăng nhập':'Chưa đăng nhập';
  if (!logged) {
    $$('.page').forEach(el=>el.classList.add('hidden'));
    $$('.bottom-item').forEach(el=>el.disabled=true);
    $$('.nav-item').forEach(el=>el.disabled=true);
  } else {
    $$('.bottom-item').forEach(el=>el.disabled=false);
    $$('.nav-item').forEach(el=>el.disabled=false);
    setPage(settings.page);
  }
}
async function call(path,options={}) {
  if (!settings.api) throw new Error('Chưa đặt địa chỉ cầu nối trong config.json.');
  const headers={'Accept':'application/json',...(options.body?{'Content-Type':'application/json'}:{}),...(settings.token?{'Authorization':`Bearer ${settings.token}`}:{})};
  let response;
  try {response=await fetch(settings.api+path,{...options,headers:{...headers,...options.headers},cache:'no-store'});}
  catch {throw new Error('Không kết nối được Cloudflare. Kiểm tra mạng và địa chỉ cầu nối.');}
  const data=await response.json().catch(()=>({}));
  if(response.status===401 && path!=='/auth/exchange') {
    settings.token='';sessionStorage.removeItem('m3_session');setLogged(false);
  }
  if (!response.ok) throw new Error(data.error || `Yêu cầu gặp lỗi ${response.status}.`);
  return data;
}
function prettyTime(sec) {return new Date(sec*1000).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});}
function prettySize(n) {if(!n) return '0 B';let num=Number(n),i=0;const units=['B','KiB','MiB','GiB'];while(num>=1024&&i<3){num/=1024;i++;}return `${num.toLocaleString('vi-VN',{maximumFractionDigits:1})} ${units[i]}`;}
function titleOf(job) {
  try {const url=new URL(job.source_url);return url.hostname.replace(/^www\./,'')+decodeURIComponent(url.pathname).slice(0,55);} catch {return 'Tác vụ tải xuống';}
}
function buildJob(job, showFiles=false) {
  const el=$('#jobTemplate').content.firstElementChild.cloneNode(true);
  const title=titleOf(job);
  el.querySelector('.job-title').textContent=title;
  el.querySelector('.job-title').title=title;
  el.querySelector('.job-date').textContent=prettyTime(job.created_at);
  const chip=el.querySelector('.state-chip');chip.textContent=statusNames[job.status]||job.status;chip.classList.add(job.status);
  el.querySelector('.job-message').textContent=job.message || 'Đang chuẩn bị…';
  const percent=Math.max(0,Math.min(100,Number(job.progress)||0));
  el.querySelector('.progress-fill').style.width=percent+'%';
  el.querySelector('.job-percent').textContent=job.status==='done'?'Đã tải và đối chiếu tệp trên Drive':`Bước xử lý: ${percent}%`;
  const actions=el.querySelector('.job-actions');
  if (!activeStates.has(job.status)||job.status==='canceling') actions.replaceChildren();
  else {
    const btn=el.querySelector('.cancel-btn');
    btn.addEventListener('click',async()=>{
      if(!window.confirm('Gửi yêu cầu hủy tác vụ này?'))return;
      btn.disabled=true;
      try{await call(`/api/jobs/${encodeURIComponent(job.id)}/cancel`,{method:'POST'});notify('Đã gửi yêu cầu hủy.','success');await refreshJobs();}
      catch(e){btn.disabled=false;notify(e.message,'error');}
    });
  }
  // Nút mở trực tiếp kết quả trên Google Drive — chỉ hiện khi máy tải đã tạo
  // liên kết hợp lệ (tệp nếu tác vụ có 1 tệp, ngược lại là thư mục chứa kết quả).
  const driveLink = typeof job.drive_link==='string' && job.drive_link.startsWith('https://drive.google.com/') ? job.drive_link : '';
  if (job.status==='done' && driveLink) {
    const open=document.createElement('a');
    open.className='small-btn drive-open';
    open.href=driveLink; open.target='_blank'; open.rel='noopener noreferrer';
    open.textContent='Mở trên Google Drive';
    const copy=document.createElement('button');
    copy.type='button'; copy.className='small-btn drive-copy';
    copy.textContent='Sao chép liên kết';
    copy.addEventListener('click',async()=>{
      copy.disabled=true;
      try{await navigator.clipboard.writeText(driveLink);notify('Đã sao chép liên kết Google Drive.','success');}
      catch{notify('Trình duyệt không cho tự sao chép. Hãy bấm Mở trên Google Drive rồi sao chép từ thanh địa chỉ.','error');}
      finally{copy.disabled=false;}
    });
    actions.append(open,copy);
  }
  if (showFiles && job.status==='done' && Array.isArray(job.files)) {
    const box=el.querySelector('.job-files');
    for(const f of job.files.slice(0,30)) {
      const item=document.createElement('span');item.className='file-pill';item.textContent=`▧ ${f.name} · ${prettySize(f.bytes)}`;box.append(item);
    }
  }
  return el;
}
function renderJobs() {
  const recent=$('#recentJobs'),all=$('#allJobs'),files=$('#filesList');
  recent.replaceChildren();all.replaceChildren();files.replaceChildren();
  const jobs=settings.jobs;
  for(const [target,items,showFiles] of [[recent,jobs.slice(0,3),false],[all,jobs,true],[files,jobs.filter(j=>j.status==='done'),true]]){
    if (!items.length){const e=document.createElement('div');e.className='empty';e.textContent=target===files?'Chưa có tệp nào được lưu.':'Chưa có tác vụ nào.';target.append(e);}
    for(const job of items)target.append(buildJob(job,showFiles));
  }
}
async function refreshJobs(silent=false){
  if(!settings.token)return;
  try {const result=await call('/api/jobs');settings.jobs=result.jobs||[];renderJobs();}
  catch(e){if(!silent)notify(e.message,'error');}
}
async function keyLogin() {
  const key=$('#keyInput').value.trim();
  const btn=$('#keyBtn');
  if(!key){notify('Hãy dán mã truy cập GitHub của bạn vào ô bên trên.','error');return;}
  btn.disabled=true;
  try{
    const result=await call('/auth/token',{method:'POST',body:JSON.stringify({token:key})});
    settings.token=result.token;sessionStorage.setItem('m3_session',result.token);
    $('#keyInput').value='';
    setLogged(true);notify('Đăng nhập thành công!','success');
    await refreshJobs(true);
  }catch(e){notify(e.message,'error');}
  finally{btn.disabled=false;}
}
async function boot() {
  themeApply(localStorage.getItem('m3_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
  $('#themeBtn').addEventListener('click',toggleTheme);$('#themeSetting').addEventListener('click',toggleTheme);
  $$('[data-page]').forEach(el=>el.addEventListener('click',()=>setPage(el.dataset.page)));
  $$('[data-go]').forEach(el=>el.addEventListener('click',()=>setPage(el.dataset.go)));
  $('#refreshBtn').addEventListener('click',()=>refreshJobs());
  $('#syncBtn').addEventListener('click',async()=>{try{await call('/api/sync',{method:'POST'});await refreshJobs();notify('Đã kiểm tra lại trạng thái từ GitHub.','success');}catch(e){notify(e.message,'error');}});
  $('#pasteBtn').addEventListener('click',async()=>{try{$('#urlInput').value=await navigator.clipboard.readText();}catch{notify('Trình duyệt không cho đọc bộ nhớ tạm. Bạn hãy nhấn giữ ô liên kết và chọn Dán.');}});
  $('#keyBtn').addEventListener('click',keyLogin);
  $('#keyInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();keyLogin();}});
  $('#logoutBtn').addEventListener('click',async()=>{try{await call('/api/logout',{method:'POST'});}catch{}settings.token='';sessionStorage.removeItem('m3_session');settings.jobs=[];setLogged(false);notify('Đã đăng xuất.','success');});
  try{
    const config=await fetch('./config.json',{cache:'no-store'}).then(r=>r.json());
    const address=new URL(config.api_base_url);
    if(address.protocol!=='https:'||address.hostname.includes('TEN_'))throw new Error('Sai địa chỉ cầu nối.');
    settings.api=address.origin;
    $('#systemInfo').textContent='Cầu nối: '+address.hostname;
    try{
      const health=await fetch(settings.api+'/health',{cache:'no-store'}).then(r=>r.json());
      $('#loginBtn').classList.toggle('hidden',!health.oauth_ready);
      if(!health.configured)notify('Cầu nối chưa được cấu hình đầy đủ. Hãy chạy lại quy trình cài đặt trên GitHub Actions.','error');
    }catch{}
  }catch {notify('Chưa cấu hình trang web: mở tệp config.json và điền đúng địa chỉ Cloudflare Workers.','error');}
  $('#loginBtn').addEventListener('click',()=>{if(!settings.api){notify('Chưa có địa chỉ cầu nối để đăng nhập.','error');return;}window.location.assign(settings.api+'/auth/start');});
  $('#downloadForm').addEventListener('submit',async e=>{
    e.preventDefault();const b=$('#submitBtn');b.disabled=true;
    try {
      const body={url:$('#urlInput').value.trim(),mode:$('#modeInput').value,quality:$('#qualityInput').value,subtitles:$('#subtitlesInput').checked};
      await call('/api/jobs',{method:'POST',body:JSON.stringify(body)});
      $('#urlInput').value='';settings.page='jobs';setPage('jobs');await refreshJobs(true);
      notify('Đã gửi lệnh! GitHub Actions sẽ tiếp nhận và bắt đầu tải.','success');
    } catch(e){notify(e.message,'error');}
    finally{b.disabled=false;}
  });
  const fragment=new URLSearchParams(location.hash.slice(1));
  const code=fragment.get('auth_code');const authError=fragment.get('auth_error');
  if(code||authError)history.replaceState(null,'',location.pathname+location.search);
  if(authError)notify('Không đăng nhập được: '+authError.replaceAll('_',' '),'error');
  if(code){
    try{const result=await call('/auth/exchange',{method:'POST',body:JSON.stringify({code})});settings.token=result.token;sessionStorage.setItem('m3_session',result.token);notify('Đăng nhập thành công!','success');}
    catch(e){notify(e.message,'error');}
  }
  if(settings.token){
    try{await call('/api/me');setLogged(true);await refreshJobs(true);}catch{setLogged(false);}
  }else setLogged(false);
  setInterval(()=>{if(settings.token && !document.hidden && settings.jobs.some(j=>activeStates.has(j.status)))refreshJobs(true);},8000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshJobs(true);});
}
boot();
