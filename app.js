(async function startWorkspace(){
const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js');
const { collection, collectionGroup, doc, getFirestore, onSnapshot, serverTimestamp, setDoc } = await import('https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js');

const firebaseApp = initializeApp({
  apiKey: 'AIzaSyDXmeiQpRSZshFA1_BgZ2z_8AKLy6_Nc8M',
  authDomain: 'hnubs-2sceduler.firebaseapp.com',
  projectId: 'hnubs-2sceduler',
  storageBucket: 'hnubs-2sceduler.firebasestorage.app',
  messagingSenderId: '955574947722',
  appId: '1:955574947722:web:50d14833ae966ea0698273',
});
const db = getFirestore(firebaseApp, 'default');

/* 익명 로그인.
   지금 Firestore 규칙은 인증 없이 읽기·쓰기를 다 허용해서, 주소만 알면 부원 일정이 열린다.
   규칙을 'request.auth != null' 로 좁히려면 앱이 먼저 로그인을 해야 하므로 여기서 해 둔다.
   아직 규칙이 안 좁혀졌거나 콘솔에서 익명 로그인이 꺼져 있어도 앱이 멈추면 안 되니,
   실패해도 그냥 넘어간다. 규칙을 좁히는 순간부터 이 줄이 실제로 일한다.
   (firestore.rules.proposed 참고) */
let authUid = '';
try {
  const { getAuth, signInAnonymously } = await import('https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js');
  const credential = await signInAnonymously(getAuth(firebaseApp));
  authUid = credential.user.uid;
} catch (error) {
  console.warn('익명 로그인 실패 — 규칙이 인증을 요구하면 데이터가 안 보입니다.', error?.code || error);
}

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
document.documentElement.classList.toggle('reduce-motion',localStorage.getItem('hnubs:reduce-motion')==='true');

const icons = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>', 'chevron-left': '<path d="m15 18-6-6 6-6"/>', 'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>', x: '<path d="m18 6-12 12M6 6l12 12"/>', menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>', calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  camera: '<path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3z"/><circle cx="12" cy="13" r="3.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.7M16 3.3a4 4 0 0 1 0 7.4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/>',
  sparkles: '<path d="m12 3-1.2 3.8L7 8l3.8 1.2L12 13l1.2-3.8L17 8l-3.8-1.2zM5 14l-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8zM19 13l-.7 1.8-1.8.7 1.8.7L19 18l.7-1.8 1.8-.7-1.8-.7z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/>',
  pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>', trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/>',
  'more-horizontal': '<circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/>',
  'help-circle': '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.4 2.1c-1.1.8-1.9 1.2-1.9 2.9M12 18h.01"/>', 'log-out': '<path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>',
  check: '<path d="m5 12 4 4L19 6"/>', loader: '<path d="M21 12a9 9 0 1 1-6.2-8.6"/>', star: '<path d="m12 2 3 6 6.5 1-4.7 4.6 1.1 6.4-5.9-3.1L6.1 20l1.1-6.4L2.5 9 9 8z"/>',
};

let schedules = [];
let people = [];
let projects = {};
let availabilityRows = [];
let fixedRows = [];
let rawShootRows = [];
const firebaseState = { pending: new Set(['members','shoots','projects','availability','fixed']), error: '', connected: false, updatedAt: null };
// 공지사항은 Firestore 'notices' 컬렉션에서 온다. 비어 있으면 비어 있는 대로 둔다.
let notices = [];

const state = { route: location.hash.slice(1) || 'home', selectedSlot: '월 09:00', mobileDay: 0, aiProjectId: '', aiFile: '', aiText: '', aiChars: 0, aiExtracting: false, aiRunning: false, aiError: '', aiJob: null, aiSceneIndex: 0, aiMappings: {}, aiPrecision: '균형 (추천)', aiWeek: 0, aiStep: 0, makerTab: 'script', scheduleTab: 'weekly', shortsState: 'idle', shortsSetup: false, aiHealthText: '', settingsSection: 'logs', selectedShoot: '', shootFilter: 'all', shootCategory: 'all', shootQuery: '', shootsMode: 'calendar', shootMonth: 0, shootDay: '', noticeTag: 'all', peopleDept: '전체', peopleQuery: '', personalMemberId: '', personalMonth: 0, homeMonth: 0, personalDay: '', slots: [], mustIds: [], weekOffset: 0 };

function icon(name) { return `<span data-icon="${name}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || ''}</svg></span>`; }
function esc(value = '') { return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function localIso(date = new Date()) { const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return local.toISOString().slice(0,10); }
function hydrateIcons(root = document) { $$('[data-icon]', root).forEach(el => { if (!el.querySelector('svg')) el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[el.dataset.icon] || ''}</svg>`; }); }
function pageHead(title, description, actions = '') { return `<div class="page-head"><div><h1>${title}</h1><p>${description}</p></div><div class="page-actions">${actions}</div></div>`; }
function connectionBar() {
  if (firebaseState.error) return `<div class="connection-bar error" role="status">${icon('help-circle')}<span>Firebase 연결 실패 · ${firebaseState.error}</span></div>`;
  if (!firebaseState.connected) return `<div class="connection-bar" role="status">${icon('loader')}<span>scheduler Firebase 데이터를 불러오는 중입니다.</span></div>`;
  return `<div class="connection-bar connected" role="status">${icon('check')}<span>scheduler Firebase와 실시간으로 연결되었습니다.</span></div>`;
}
function emptyState(message) { return `<div class="empty-row"><span>${message}</span></div>`; }
function scheduleRows(items = schedules.slice(0, 3)) { return items.length ? items.map(s => `<button class="schedule-row" type="button" data-detail="${esc(s.id)}"><span class="schedule-time">${esc(s.time)}</span><span class="row-title"><strong>${esc(s.title)}</strong><small>${icon('pin')}${esc(s.place || '장소 미정')}</small></span><span class="row-meta"><span class="badge">${esc(s.type)}</span><span class="badge ${s.tone}">${s.status}</span></span></button>`).join('') : emptyState('등록된 촬영 일정이 없습니다.'); }
function hourLabel(value) { const h = Math.floor(Number(value) || 0), m = Math.round(((Number(value) || 0) - h) * 60); return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`; }
function memberById(id) { return people.find(p => p[7] === id); }
function shootStatus(data) { const now = new Date(), start = new Date(`${data.date}T${hourLabel(data.startH)}`), end = new Date(`${data.date}T${hourLabel(data.endH)}`); return now >= start && now < end ? ['진행 중','mint'] : now < start ? ['예정','lavender'] : ['완료','gray']; }
function weekDates(offset = 0) {
  const start = new Date(); start.setHours(12,0,0,0); start.setDate(start.getDate() - start.getDay() + offset * 7);
  return Array.from({length:7},(_,i)=>{ const d=new Date(start); d.setDate(start.getDate()+i); return d; });
}
function inRanges(ranges, time) { return (Array.isArray(ranges) ? ranges : []).some(r => Number(r.start) <= time && Number(r.end) >= time + 1); }
function memberAvailable(memberId, iso, dayIndex, time) {
  const personal = availabilityRows.find(r => r.memberId === memberId && r.id === iso)?.data;
  const unavailable = personal?.unavailableRanges || (personal?.status === '불가능' ? (personal.ranges?.length ? personal.ranges : [{start:9,end:23}]) : []);
  const available = personal?.availableRanges || (personal?.status === '가능' ? personal.ranges : []);
  if (inRanges(unavailable, time)) return false;
  const fixed = fixedRows.filter(r => r.memberId === memberId && Number(r.data.day) === dayIndex && Number(r.data.start) < time + 1 && Number(r.data.end) > time);
  if (fixed.length && !inRanges(available, time)) return false;
  if (schedules.some(s => s.date === iso && s.castIds?.includes(memberId) && Number(s.startH) < time + 1 && Number(s.endH) > time)) return false;
  return true;
}
function availabilityCount(iso, dayIndex, time) { return people.filter(p => memberAvailable(p[7], iso, dayIndex, time)).length; }

const AV=[['#E3EAFF','#3F4FD0'],['#E3F7EE','#1C6E4A'],['#EDE6FF','#5B45C8'],['#FFE9DF','#9A3E1E']];
const DOW=['일','월','화','수','목','금','토'];
// fixedClasses.day 는 월=0 으로 저장된다. 표시는 일요일 시작, 조회는 월=0 그대로.
const dataDay=d=>(d.getDay()+6)%7;
const CARD='border-radius:22px;background:rgba(255,255,255,0.9);border:1px solid #FFFFFF;backdrop-filter:blur(14px);box-shadow:0 12px 34px rgba(60,72,140,0.08)';
function initial(name){ return String(name||'?').trim().slice(0,1) || '?'; }
function faces(names,limit=4){ return names.slice(0,limit).map((n,k)=>`<span aria-hidden="true" style="width:28px;height:28px;margin-left:-7px;border-radius:50%;border:2px solid #FFFFFF;background:${AV[k%4][0]};color:${AV[k%4][1]};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800">${esc(initial(n))}</span>`).join(''); }
function pad2(n){ return String(n).padStart(2,'0'); }
function monthDay(iso){ const d=new Date(`${iso}T00:00:00`); return `${d.getMonth()+1}. ${d.getDate()}`; }
function dowOf(iso){ const d=new Date(`${iso}T00:00:00`); return DOW[d.getDay()]; }

const NOTICE_TAGS=[['필독','#FDECEF','#A8324F'],['안내','#E3EAFF','#3F4FD0'],['일정','#EDE6FF','#5B45C8']];
function noticeTag(name){ return NOTICE_TAGS.find(t=>t[0]===name)||NOTICE_TAGS[1]; }
function noticeDate(n){ return n.date||(n.createdAt?localIso(new Date(n.createdAt)):''); }

function noticesView(){
  const rows=notices.filter(n=>state.noticeTag==='all'||n.tag===state.noticeTag);
  const usedTags=NOTICE_TAGS.map(t=>t[0]).filter(t=>notices.some(n=>n.tag===t));
  const tabs=[['all','전체'],...usedTags.map(t=>[t,t])].map(([k,label])=>{ const on=state.noticeTag===k;
    const n=k==='all'?notices.length:notices.filter(x=>x.tag===k).length;
    return `<button role="tab" aria-selected="${on}" data-notice-tag="${esc(k)}" style="height:34px;padding:0 12px;border-radius:9px;border:0;background:${on?'#FFFFFF':'transparent'};color:${on?'#3F4FD0':'#64708F'};box-shadow:${on?'0 2px 8px rgba(60,72,140,0.12)':'none'};font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">${esc(label)} <span class="hn-num" style="opacity:0.8">${n}</span></button>`;}).join('');

  const list=rows.map(n=>{ const [,bg,fg]=noticeTag(n.tag);
    return `<button data-notice="${esc(n.id)}" style="width:100%;display:flex;gap:14px;padding:16px;border:0;border-radius:18px;background:#FFFFFF;box-shadow:0 6px 18px rgba(60,72,140,0.05);font-family:inherit;text-align:left;cursor:pointer;margin-bottom:8px">
      <span aria-hidden="true" style="flex:0 0 44px;height:44px;border-radius:14px;background:${bg};color:${fg};display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:800">${esc(n.tag)}</span>
      <span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:3px">
        <strong style="font-size:15.5px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(n.title)}</strong>
        ${n.body?`<span style="font-size:13px;color:#64708F;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(n.body)}</span>`:''}
        <span style="font-size:12px;color:#64708F">${esc(n.author||'운영진')} · ${esc(noticeDate(n))}</span>
      </span>
    </button>`;}).join('')
    ||`<div style="padding:48px 20px;text-align:center;color:#64708F">등록된 공지가 없어요.<br><span style="font-size:13px">오른쪽 위 ‘공지 작성’으로 첫 공지를 올려 보세요.</span></div>`;

  return `
  <section style="position:relative;overflow:hidden;border-radius:22px;background:linear-gradient(115deg, #3E5FD9 0%, #5A5FE0 50%, #7C5FD8 100%);color:#FFFFFF;padding:20px clamp(20px, 2.4vw, 28px);box-shadow:0 18px 40px rgba(72,82,200,0.26);display:flex;flex-wrap:wrap;gap:16px 24px;align-items:center;justify-content:space-between">
    <svg aria-hidden="true" width="560" height="560" viewBox="0 0 560 560" style="position:absolute;right:22%;top:-260px;opacity:0.14;pointer-events:none"><g fill="none" stroke="#FFFFFF" stroke-width="1.5"><circle cx="280" cy="280" r="90"/><circle cx="280" cy="280" r="150"/><circle cx="280" cy="280" r="210"/><circle cx="280" cy="280" r="270"/></g></svg>
    <div style="position:relative;display:flex;flex-direction:column;gap:2px;min-width:0">
      <span style="font-size:13.5px;color:#DCE2FF">전체 ${notices.length}건 · 필독 ${notices.filter(n=>n.tag==='필독').length}건</span>
      <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.02em">공지사항</h1>
      <span style="font-size:14.5px;color:#EEF0FF">방송국 전체에 알릴 내용을 올리고 확인해요.</span>
    </div>
    <button data-action="new-notice" style="position:relative;display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 18px;border-radius:12px;border:0;background:#FFFFFF;color:#3F4FD0;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 6px 16px rgba(30,30,120,0.18)"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>공지 작성</button>
  </section>

  <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:10px;border-radius:18px;background:rgba(255,255,255,0.9);border:1px solid #FFFFFF;box-shadow:0 8px 24px rgba(60,72,140,0.06)">
    <div role="tablist" aria-label="분류" style="display:flex;gap:4px;padding:4px;border-radius:12px;background:#F4F6FB">${tabs}</div>
    <span style="margin-left:auto;font-size:13px;color:#64708F">${rows.length}건 표시</span>
  </div>

  <section aria-label="공지 목록" style="${CARD};padding:12px">${list}</section>`;
}

function openNoticeDetail(id){
  const n=notices.find(x=>x.id===id); if(!n) return;
  const [,bg,fg]=noticeTag(n.tag);
  openDrawer(drawerTemplate('공지사항',
    `<span style="display:inline-block;padding:3px 10px;border-radius:99px;background:${bg};color:${fg};font-size:12px;font-weight:800">${esc(n.tag)}</span>
     <h2 style="margin:12px 0 4px">${esc(n.title)}</h2>
     <p style="margin:0 0 18px;color:var(--muted)">${esc(n.author||'운영진')} · ${esc(noticeDate(n))}</p>
     <p style="margin:0;padding:14px;border-radius:14px;background:#F6F7FC;font-size:14px;line-height:1.7;color:#3A4466;white-space:pre-wrap">${esc(n.body||'내용이 없습니다.')}</p>`,
    `<button class="primary-button" data-action="close-drawer">확인</button>`));
}

function openNoticeDrawer(){
  openDrawer(drawerTemplate('공지 작성',
    `<form id="notice-form" class="form-stack">
       <label class="field"><span>분류 *</span><select name="tag">${NOTICE_TAGS.map(t=>`<option>${t[0]}</option>`).join('')}</select></label>
       <label class="field"><span>제목 *</span><input name="title" required placeholder="예: 편집실 이용 시간 변경 안내"></label>
       <label class="field"><span>작성자</span><input name="author" value="운영진"></label>
       <label class="field"><span>날짜 *</span><input name="date" type="date" required value="${localIso()}"></label>
       <label class="field"><span>내용</span><textarea name="body" rows="6" placeholder="부원들에게 전달할 내용을 적어주세요."></textarea></label>
     </form>`,
    `<button class="secondary-button" data-action="close-drawer">취소</button><button class="primary-button" id="save-notice">등록하기</button>`));
  $('#save-notice').onclick=async()=>{
    const f=$('#notice-form'); if(!f.reportValidity()) return;
    const button=$('#save-notice'); button.disabled=true; button.textContent='저장 중…';
    try{
      await setDoc(doc(collection(db,'notices')),{tag:f.tag.value,title:f.title.value.trim(),author:f.author.value.trim()||'운영진',date:f.date.value,body:f.body.value.trim(),createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
      closeDrawer(); toast('공지사항이 등록되었습니다.');
    }catch(error){ button.disabled=false; button.textContent='다시 시도'; toast(`저장하지 못했습니다: ${error.code||error.message}`); }
  };
}

// 홈 오른쪽의 작은 달력: 방송국 촬영이 있는 날을 한눈에 보여준다.
function monthCalendar(){
  const today=localIso(), now=new Date();
  const base=new Date(now.getFullYear(),now.getMonth()+state.homeMonth,1);
  const year=base.getFullYear(), month=base.getMonth();
  const lastDay=new Date(year,month+1,0).getDate(), lead=base.getDay();
  const monthStart=`${year}-${pad2(month+1)}-01`, monthEnd=`${year}-${pad2(month+1)}-${pad2(lastDay)}`;
  const inMonth=schedules.filter(s=>s.date>=monthStart&&s.date<=monthEnd);

  let cells='';
  for(let i=0;i<Math.ceil((lead+lastDay)/7)*7;i++){
    const day=i-lead+1;
    if(day<1||day>lastDay){ cells+='<span></span>'; continue; }
    const iso=`${year}-${pad2(month+1)}-${pad2(day)}`;
    const count=inMonth.filter(s=>s.date===iso).length;
    const isToday=iso===today;
    const title=count?`${month+1}월 ${day}일 · 촬영 ${count}건`:`${month+1}월 ${day}일`;
    cells+=`<button ${count?`data-mini-day="${iso}"`:'disabled'} title="${title}" aria-label="${title}" style="position:relative;height:34px;border:0;border-radius:10px;background:${isToday?'linear-gradient(135deg, #4C6FE6, #7C5FD8)':(count?'#EEF2FF':'transparent')};color:${isToday?'#FFFFFF':(count?'#3F55D6':(i%7===0?'#C08097':'#64708F'))};font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:${count||isToday?800:500};cursor:${count?'pointer':'default'}">${day}${count?`<i aria-hidden="true" style="position:absolute;left:50%;bottom:4px;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:${isToday?'#FFFFFF':'#6B6AE6'}"></i>`:''}</button>`;
  }

  return `<section aria-labelledby="a-cal" style="${CARD};padding:16px">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px">
      <h2 id="a-cal" style="margin:0;font-size:16px;font-weight:800">${year}. ${pad2(month+1)} 방송국 일정</h2>
      <span style="display:flex;align-items:center;gap:2px">
        <button data-mini-month="-1" aria-label="이전 달" style="width:28px;height:28px;border:0;border-radius:8px;background:#F2F4FB;color:#3A4466;cursor:pointer">‹</button>
        <button data-mini-month="1" aria-label="다음 달" style="width:28px;height:28px;border:0;border-radius:8px;background:#F2F4FB;color:#3A4466;cursor:pointer">›</button>
      </span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(7, minmax(0, 1fr));gap:3px">
      ${DOW.map((d,i)=>`<span style="height:22px;display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:700;color:${i===0?'#A8324F':'#64708F'}">${d}</span>`).join('')}
      ${cells}
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid #EEF0F6">
      <span style="font-size:12.5px;color:#64708F">이번 달 촬영 ${inMonth.length}건</span>
      <button class="hn-link" data-route="shoots">전체 일정 →</button>
    </div>
  </section>`;
}

function homeView() {
  const now=new Date(), today=localIso(now);
  const dates=weekDates(), weekStart=localIso(dates[0]), weekEnd=localIso(dates[6]);
  const weekShoots=schedules.filter(s=>s.date>=weekStart&&s.date<=weekEnd);
  const nowMs=now.getTime();
  const startMs=s=>new Date(`${s.date}T${hourLabel(s.startH)}:00`).getTime();
  const upcoming=schedules.filter(s=>s.date&&startMs(s)>=nowMs).sort((a,b)=>startMs(a)-startMs(b));
  const next=upcoming[0];

  // --- 히어로 ---
  const todayShoots=schedules.filter(s=>s.date===today);
  const heroSub=todayShoots.length
    ? `오늘 촬영 <strong style="font-weight:700">${todayShoots.length}건</strong> · 첫 일정 ${esc(todayShoots[0].time.split(' - ')[0])}`
    : next ? `오늘 촬영 없음 · 다음 촬영은 <strong style="font-weight:700">${dowOf(next.date)}요일 ${esc(hourLabel(next.startH))}</strong>`
           : '등록된 촬영 일정이 없습니다';
  let countdown='–';
  if(next){ const diff=Math.max(0,startMs(next)-nowMs); const dd=Math.floor(diff/86400000),hh=Math.floor(diff/3600000)%24,mm=Math.floor(diff/60000)%60;
    countdown = diff===0?'곧 시작':(dd>0?dd+'일 ':'')+pad2(hh)+':'+pad2(mm); }
  const nextCue = next ? `
    <button data-detail="${esc(next.id)}" style="position:relative;flex:0 1 460px;min-width:0;display:flex;align-items:center;gap:18px;padding:16px 20px;border-radius:18px;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.28);backdrop-filter:blur(8px);color:#FFFFFF;text-align:left;font-family:inherit;cursor:pointer">
      <span style="flex:0 0 auto;display:flex;flex-direction:column;gap:2px">
        <span style="display:inline-flex;align-items:center;gap:7px;font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:800;letter-spacing:0.16em;color:#E6E9FF"><i aria-hidden="true" style="display:block;width:8px;height:8px;border-radius:50%;background:#FFC15A;box-shadow:0 0 0 4px rgba(255,193,90,0.25);animation:hn-blink 1.6s ease-in-out infinite"></i>NEXT CUE</span>
        <strong class="hn-num" style="font-size:32px;font-weight:800;line-height:1.1;white-space:nowrap">${countdown}</strong>
        <span style="font-size:12.5px;color:#DCE2FF">남음</span>
      </span>
      <span aria-hidden="true" style="align-self:stretch;width:1px;background:rgba(255,255,255,0.25)"></span>
      <span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:6px">
        <strong style="font-size:17px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(next.title)}</strong>
        <span style="font-size:13px;color:#DCE2FF">${monthDay(next.date)} (${dowOf(next.date)}) ${esc(next.time)}<br>${esc(next.place||'장소 미정')}</span>
        <span style="display:flex;align-items:center;padding-left:7px">${faces(next.people,3)}${next.people.length>3?`<span style="margin-left:12px;font-size:12.5px;color:#DCE2FF">외 ${next.people.length-3}명</span>`:''}</span>
      </span>
    </button>` : '';

  // --- 지표 ---
  const dayCounts=dates.map(d=>weekShoots.filter(s=>s.date===localIso(d)).length);
  const spark=dayCounts.map((n,d)=>`<i style="display:block;width:6px;height:${6+n*12}px;border-radius:3px;background:${localIso(dates[d])===today?'#C7CFEA':(n?'#6B7DF0':'#DDE2F1')}"></i>`).join('');
  const weekDone=weekShoots.filter(s=>s.status==='완료').length;
  const next7=schedules.filter(s=>s.date>=today&&s.date<=localIso(new Date(nowMs+7*86400000)));
  const next7Days=[...new Set(next7.map(s=>dowOf(s.date)))].join(' · ');
  const activeMembers=people.filter(p=>p[5]==='활동 중').length;
  const pct=people.length?Math.round(activeMembers/people.length*100):0;
  const tile=(bg,fg,glyph,label,value,unit,extra='')=>`<div style="display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:18px;background:rgba(255,255,255,0.88);border:1px solid #FFFFFF;box-shadow:0 8px 24px rgba(60,72,140,0.06)">
    <span aria-hidden="true" style="flex:0 0 44px;height:44px;border-radius:14px;background:${bg};color:${fg};display:flex;align-items:center;justify-content:center"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${glyph}</svg></span>
    <span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column"><span style="font-size:13px;color:#64708F">${label}</span><span style="display:flex;align-items:baseline;gap:3px"><strong class="hn-num" style="font-size:24px;font-weight:800">${value}</strong><span style="font-size:13px;color:#64708F">${unit}</span></span></span>${extra}</div>`;

  // --- 타임라인 ---
  const START=9, SPAN=14;
  // 선택 카드는 타임라인(이번 주)에 보이는 촬영만 가리킨다.
  if(!weekShoots.some(s=>s.id===state.selectedShoot)) state.selectedShoot=weekShoots[0]?.id||'';
  const palette='linear-gradient(90deg, #DCE5FF, #E6DEFF)';
  const rows=dates.map((dateObj,d)=>{
    const iso=localIso(dateObj);
    const mine=weekShoots.filter(s=>s.date===iso).sort((a,b)=>a.startH-b.startH);
    const lanes=[];
    const clips=mine.map(c=>{
      let lane=0; while(lanes[lane]!==undefined&&lanes[lane]>c.startH) lane++;
      lanes[lane]=c.endH;
      const on=state.selectedShoot===c.id, two=mine.length>1;
      const left=Math.max(0,(c.startH-START)/SPAN*100), width=Math.max(4,Math.min(100-left,(c.endH-c.startH)/SPAN*100));
      const aria=`${DOW[d]}요일 ${esc(c.time)} ${esc(c.title)}`;
      return `<button data-shoot-pick="${esc(c.id)}" aria-pressed="${on}" aria-label="${aria}" title="${aria}" style="position:absolute;left:${left}%;width:${width}%;top:${two?3+lane*20:6}px;height:${two?18:32}px;box-sizing:border-box;padding:0 10px;border-radius:9px;border:0;background:${on?'linear-gradient(90deg, #4C6FE6, #7C5FD8)':palette};color:${on?'#FFFFFF':'#2F3B8F'};box-shadow:${on?'0 6px 14px rgba(90,95,224,0.35)':'none'};font-family:inherit;font-size:12px;font-weight:700;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer">${esc(c.title)}</button>`;
    }).join('');
    const isToday=iso===today;
    const nowH=now.getHours()+now.getMinutes()/60;
    const nowLeft=(Math.min(Math.max(nowH,START),START+SPAN)-START)/SPAN*100;
    const marker=isToday?`${mine.length?'':'<span style="position:absolute;left:12px;top:10px;font-size:12.5px;font-weight:600;color:#3F55D6">오늘 · 등록된 촬영 없음</span>'}<span aria-hidden="true" style="position:absolute;top:-3px;bottom:-3px;left:${nowLeft}%;width:2px;border-radius:2px;background:#E0455F"><i style="position:absolute;top:-3px;left:-3px;width:8px;height:8px;border-radius:50%;background:#E0455F"></i></span>`:'';
    return `<span style="display:flex;align-items:center;gap:6px;height:50px;font-size:13px;font-weight:700;color:${isToday?'#3F55D6':'#20294D'}"><span style="width:18px">${DOW[d]}</span><span class="hn-num" style="font-weight:600;color:#64708F">${dateObj.getDate()}</span></span>
      <div style="position:relative;height:44px;margin:3px 0;border-radius:12px;background:${isToday?'rgba(82,127,240,0.08)':'#F6F7FC'};background-image:repeating-linear-gradient(90deg, rgba(100,112,143,0.10) 0 1px, transparent 1px calc(100% / 7))">${clips}${marker}</div>`;
  }).join('');
  const hours=[]; for(let h=START;h<START+SPAN;h+=2) hours.push(`<span class="hn-num" style="font-size:11.5px;font-weight:600;color:#64708F">${pad2(h)}:00</span>`);
  const weekLabel=`${dates[0].getMonth()+1}월 ${dates[0].getDate()}일 – ${dates[6].getDate()}일`;

  const cur=weekShoots.find(s=>s.id===state.selectedShoot);
  const curStrip=cur?`<div style="margin-top:14px;display:flex;flex-wrap:wrap;align-items:center;gap:12px 18px;padding:14px 16px;border-radius:16px;background:linear-gradient(120deg, #F3F5FF, #F6F2FF)">
      <span style="flex:0 0 auto;padding:6px 10px;border-radius:10px;background:#FFFFFF;color:#4F5770;font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:800;letter-spacing:0.1em">${esc(cur.status)}</span>
      <span style="flex:1 1 220px;min-width:0;display:flex;flex-direction:column;line-height:1.4"><strong style="font-size:16px;font-weight:800">${esc(cur.title)}</strong><span style="font-size:13px;color:#64708F">${monthDay(cur.date)} (${dowOf(cur.date)}) · ${esc(cur.time)} · ${esc(cur.place||'장소 미정')}</span></span>
      <span style="display:flex;align-items:center;padding-left:7px">${faces(cur.people)}<span style="margin-left:8px;font-size:13px;color:#64708F">${cur.people.length}명</span></span>
      <button data-detail="${esc(cur.id)}" style="display:inline-flex;align-items:center;height:36px;padding:0 12px;border:0;border-radius:10px;background:#FFFFFF;color:#3F55D6;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">상세 보기</button>
    </div>`:'';

  const tiles=[['#E3EAFF','#3F4FD0'],['#FFE9DF','#9A3E1E'],['#EDE6FF','#5B45C8']];
  const upcomingCards=upcoming.slice(0,3).map((u,k)=>`<button data-detail="${esc(u.id)}" style="display:flex;gap:12px;padding:12px;border-radius:16px;background:#FFFFFF;border:1px solid #ECEEF6;color:#20294D;font-family:inherit;text-align:left;cursor:pointer">
      <span style="flex:0 0 50px;height:54px;border-radius:14px;background:${tiles[k][0]};color:${tiles[k][1]};display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.1"><span style="font-size:11.5px;font-weight:700">${dowOf(u.date)}</span><strong class="hn-num" style="font-size:20px;font-weight:800">${new Date(`${u.date}T00:00:00`).getDate()}</strong></span>
      <span style="min-width:0;display:flex;flex-direction:column;gap:1px"><strong style="font-size:14.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(u.title)}</strong><span class="hn-num" style="font-size:12.5px;color:#64708F">${esc(u.time)}</span><span style="font-size:12.5px;color:#64708F;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(u.place||'장소 미정')} · ${u.people.length}명</span></span>
    </button>`).join('')||`<div style="padding:14px;border-radius:16px;background:#FFFFFF;border:1px solid #ECEEF6;font-size:13px;color:#64708F">예정된 촬영이 없습니다.</div>`;

  // --- 오른쪽: 참여 가능 ---
  const hour=Math.max(9,Math.min(22,now.getHours()));
  const dayIdx=(now.getDay()+6)%7;
  const availableNow=people.filter(p=>memberAvailable(p[7],today,dayIdx,hour));
  const availPct=people.length?Math.round(availableNow.length/people.length*100):0;
  const teamRows=people.slice(0,4).map((p,k)=>{ const ok=availableNow.includes(p);
    return `<button data-person="${esc(p[7])}" style="width:100%;display:flex;align-items:center;gap:10px;padding:6px 0;border:0;background:none;font-family:inherit;cursor:pointer;text-align:left">
      <span aria-hidden="true" style="width:32px;height:32px;border-radius:11px;background:${AV[k%4][0]};color:${AV[k%4][1]};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800">${esc(initial(p[0]))}</span>
      <span style="flex:1 1 auto;min-width:0;display:flex;align-items:baseline;gap:6px"><strong style="font-size:14px;font-weight:700">${esc(p[0])}</strong><span style="font-size:12px;color:#64708F">${esc(p[2])}</span></span>
      <span style="padding:2px 9px;border-radius:99px;background:${ok?'#E3F7EE':'#FDECEF'};color:${ok?'#1C6E4A':'#A8324F'};font-size:12px;font-weight:700">${ok?'가능':'개인 일정'}</span>
    </button>`;}).join('')||`<p style="margin:6px 0;font-size:13px;color:#64708F">등록된 구성원이 없습니다.</p>`;

  const noticeRows=notices.slice(0,3).map(n=>{ const [,bg,fg]=noticeTag(n.tag);
    return `<button data-notice="${esc(n.id)}" style="width:100%;display:flex;align-items:center;gap:12px;padding:9px 2px;border:0;background:none;font-family:inherit;text-align:left;cursor:pointer">
      <span aria-hidden="true" style="flex:0 0 34px;height:34px;border-radius:11px;background:${bg};color:${fg};display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:800">${esc(n.tag)}</span>
      <span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;line-height:1.35"><strong style="font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(n.title)}</strong><span style="font-size:12px;color:#64708F">${esc(n.author||'운영진')} · ${esc(noticeDate(n))}</span></span>
    </button>`;}).join('')||`<p style="margin:6px 0 14px;font-size:13px;color:#64708F">등록된 공지가 없습니다.</p>`;

  const miniCal=monthCalendar();

  return `
  <section aria-label="오늘의 작업공간" style="position:relative;overflow:hidden;border-radius:22px;background:linear-gradient(115deg, #3E5FD9 0%, #5A5FE0 50%, #7C5FD8 100%);color:#FFFFFF;padding:22px clamp(20px, 2.4vw, 28px);box-shadow:0 18px 40px rgba(72,82,200,0.26);display:flex;flex-wrap:wrap;gap:18px 28px;align-items:center">
    <svg aria-hidden="true" width="560" height="560" viewBox="0 0 560 560" style="position:absolute;right:18%;top:-250px;opacity:0.14;pointer-events:none"><g fill="none" stroke="#FFFFFF" stroke-width="1.5"><circle cx="280" cy="280" r="90"/><circle cx="280" cy="280" r="150"/><circle cx="280" cy="280" r="210"/><circle cx="280" cy="280" r="270"/></g></svg>
    <div style="position:relative;flex:1 1 420px;min-width:0;display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;flex-direction:column;gap:2px">
        <span style="font-size:13.5px;color:#DCE2FF;font-weight:500">${now.getMonth()+1}월 ${now.getDate()}일 ${['일','월','화','수','목','금','토'][now.getDay()]}요일</span>
        <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.02em">작업공간</h1>
        <span style="font-size:14.5px;color:#EEF0FF">${heroSub}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        <button data-action="new-shoot" style="display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 16px;border:0;border-radius:12px;background:#FFFFFF;color:#3F4FD0;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 6px 16px rgba(30,30,120,0.18)"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>일정 등록</button>
        <button data-action="new-personal" style="display:inline-flex;align-items:center;height:40px;padding:0 14px;border-radius:12px;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.28);color:#FFFFFF;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer">개인 일정 등록</button>
      </div>
    </div>
    ${nextCue}
  </section>

  <section aria-label="운영 현황" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(230px, 1fr));gap:12px">
    ${tile('linear-gradient(140deg, #E3EAFF, #D6E0FF)','#3F4FD0','<rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="M16 10.5l5-3v9l-5-3"/>','이번 주 촬영',weekShoots.length,`건${weekShoots.length?` · 완료 ${weekDone}건`:''}`,`<span aria-label="요일별 촬영 수" style="flex:0 0 auto;height:32px;display:flex;align-items:flex-end;gap:3px">${spark}</span>`)}
    ${tile('linear-gradient(140deg, #EDE6FF, #E1D8FF)','#5B45C8','<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>','앞으로 7일 촬영',next7.length,`건${next7Days?` · ${next7Days}`:''}`)}
    ${tile('linear-gradient(140deg, #E3F7EE, #D3F0E2)','#1C6E4A','<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2A5 5 0 0 1 21.5 19"/>','활동 구성원',activeMembers,`/ ${people.length}명`,`<span aria-hidden="true" style="flex:0 0 auto;width:40px;height:40px;border-radius:50%;background:conic-gradient(#3DAA78 0 ${pct}%, #E6EAF2 ${pct}% 100%);display:flex;align-items:center;justify-content:center"><i style="display:block;width:28px;height:28px;border-radius:50%;background:#FFFFFF"></i></span>`)}
    ${tile('linear-gradient(140deg, #FFEFD9, #FFE4C2)','#8A5A10','<path d="M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1z"/><path d="M16 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/>','공지사항',notices.length,`건 · 필독 ${notices.filter(n=>n.tag==='필독').length}`)}
  </section>

  <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:stretch">
    <section aria-labelledby="a-tl" style="flex:7 1 640px;min-width:0;display:flex;flex-direction:column;${CARD};padding:20px 20px 18px">
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px">
        <div style="display:flex;flex-direction:column;line-height:1.35">
          <h2 id="a-tl" style="margin:0;font-size:18px;font-weight:800">이번 주 촬영 타임라인</h2>
          <span style="font-size:13px;color:#64708F">${weekLabel} · 블록을 누르면 상세가 보여요</span>
        </div>
        <button class="hn-link" data-route="weekly" style="display:inline-flex;align-items:center;height:34px;padding:0 12px;border-radius:10px;background:#EEF2FF;font-weight:700">주간 일정표 →</button>
      </div>
      <div style="overflow-x:auto">
        <div style="min-width:680px;display:grid;grid-template-columns:70px minmax(0, 1fr)">
          <span></span>
          <div style="height:22px;display:grid;grid-template-columns:repeat(7, minmax(0, 1fr))">${hours.join('')}</div>
          ${rows}
        </div>
      </div>
      ${curStrip}
      <div style="margin-top:18px;display:flex;align-items:baseline;justify-content:space-between">
        <h3 style="margin:0;font-size:15px;font-weight:800">다가오는 촬영</h3>
        <button class="hn-link" data-route="shoots">전체 일정 →</button>
      </div>
      <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit, minmax(210px, 1fr));gap:10px">${upcomingCards}</div>
    </section>

    <div style="flex:3 1 320px;min-width:0;display:flex;flex-direction:column;gap:16px">
      <section aria-labelledby="a-notice" style="${CARD};padding:16px 16px 8px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <h2 id="a-notice" style="margin:0;font-size:16px;font-weight:800">공지사항 <span class="hn-num" style="display:inline-block;min-width:20px;padding:0 6px;border-radius:99px;background:#3F55D6;color:#FFFFFF;font-size:11.5px;line-height:20px;text-align:center;vertical-align:2px">${notices.length}</span></h2>
          <button class="hn-link" data-route="notices">전체 보기</button>
        </div>
        ${noticeRows}
      </section>

      ${miniCal}

      <section aria-labelledby="a-team" style="flex:1 1 auto;${CARD};padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <h2 id="a-team" style="margin:0;font-size:16px;font-weight:800">지금 참여 가능</h2>
          <button class="hn-link" data-route="people">전체 보기</button>
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin:8px 0 10px">
          <span style="flex:1 1 auto;height:8px;border-radius:99px;background:#EEF0F6;overflow:hidden"><i style="display:block;width:${availPct}%;height:100%;border-radius:99px;background:linear-gradient(90deg, #4C6FE6, #7C5FD8)"></i></span>
          <strong class="hn-num" style="font-size:14px;font-weight:800">${availableNow.length}<span style="font-weight:500;color:#64708F"> / ${people.length}명</span></strong>
        </div>
        <p style="margin:0 0 6px;font-size:12px;color:#64708F">개인 일정 기준 · 오늘 ${pad2(hour)}:00 시점</p>
        ${teamRows}
      </section>
    </div>
  </div>`;
}

function weeklyView() {
  const dates=weekDates(state.weekOffset), today=localIso();
  const hours=[]; for(let h=9;h<=22;h++) hours.push(h);
  const total=people.length;
  const slots=state.slots;

  const heads=dates.map((d,i)=>{ const isToday=localIso(d)===today;
    return `<span style="padding:4px 0 8px;text-align:center;display:flex;flex-direction:column;line-height:1.25">
      <strong style="font-size:13px;font-weight:700;color:${i===0?'#A8324F':'#4F5770'}">${DOW[i]}</strong>
      <span class="hn-num" style="align-self:center;min-width:30px;padding:1px 6px;border-radius:99px;background:${isToday?'linear-gradient(135deg, #4C6FE6, #7C5FD8)':'transparent'};color:${isToday?'#FFFFFF':'#20294D'};font-size:15px;font-weight:800">${d.getDate()}</span>
    </span>`;}).join('');

  let cells='';
  hours.forEach(h=>{
    cells+=`<span class="hn-num" style="display:flex;align-items:center;justify-content:flex-end;padding-right:8px;font-size:12px;font-weight:600;color:#64708F">${pad2(h)}:00</span>`;
    dates.forEach((dateObj,d)=>{
      const iso=localIso(dateObj), key=`${d}-${h}`;
      const n=availabilityCount(iso,dataDay(dateObj),h);
      const shoot=schedules.find(s=>s.date===iso&&Number(s.startH)<h+1&&Number(s.endH)>h);
      const on=slots.includes(key);
      let bg='#FFF4F6', fg='#A13F5A';
      if(total&&n===total){ bg='#F0FAF5'; fg='#2A7553'; }
      else if(n>2){ bg='#FFFAEC'; fg='#7A5E14'; }
      if(shoot){ bg='linear-gradient(90deg, #F0F3FF, #F4F0FF)'; fg='#3A4590'; }
      if(on){ bg='linear-gradient(135deg, #4C6FE6, #7C5FD8)'; fg='#FFFFFF'; }
      const aria=`${DOW[d]}요일 ${h}시, 가능 ${n}명${shoot?`, 촬영 ${esc(shoot.title)}`:''}`;
      cells+=`<button data-week-slot="${key}" aria-pressed="${on}" aria-label="${aria}" title="${aria}" style="height:38px;border-radius:10px;border:0;background:${bg};color:${fg};box-shadow:${on?'0 6px 14px rgba(90,95,224,0.32)':'none'};font-family:'Plus Jakarta Sans','Noto Sans KR',sans-serif;font-size:12.5px;font-weight:700;cursor:pointer;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding:0 6px">${shoot?esc(shoot.title):`${n}명`}</button>`;
    });
  });

  // 선택한 시간대 전부에서 비어 있는 사람
  const parsed=slots.map(k=>k.split('-').map(Number)).sort((a,b)=>a[0]*100+a[1]-(b[0]*100+b[1]));
  const okPeople=parsed.length?people.filter(p=>parsed.every(([d,h])=>memberAvailable(p[7],localIso(dates[d]),dataDay(dates[d]),h))):[];
  const noPeople=parsed.length?people.filter(p=>!okPeople.includes(p)):[];
  const mustMembers=state.mustIds.map(memberById).filter(Boolean);
  const mustOk=mustMembers.length?mustMembers.every(m=>okPeople.includes(m)):null;
  const okPct=total?Math.round(okPeople.length/total*100):0;

  const chips=parsed.map(([d,h])=>`<button data-week-slot="${d}-${h}" aria-label="${DOW[d]}요일 ${h}시 선택 해제" style="display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 10px 0 12px;border-radius:10px;border:0;background:linear-gradient(135deg, #4C6FE6, #7C5FD8);color:#FFFFFF;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">${DOW[d]} ${pad2(h)}:00<span aria-hidden="true" style="opacity:0.8">×</span></button>`).join('');

  const mustChips=mustMembers.map(m=>`<span style="display:inline-flex;align-items:center;gap:2px;height:32px;padding:0 4px 0 12px;border-radius:99px;background:#EDE6FF;color:#4A3FB0;font-size:13px;font-weight:700">${esc(m[0])}<button data-must-remove="${esc(m[7])}" aria-label="필수 인원에서 빼기" style="width:24px;height:24px;border:0;border-radius:50%;background:transparent;color:#4A3FB0;cursor:pointer">×</button></span>`).join('');

  const detail=parsed.length?`
    <div style="padding:0 18px 14px;display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;flex-wrap:wrap;gap:6px">${chips}</div>
      ${mustOk===null?'':`<div style="padding:12px 14px;border-radius:14px;background:${mustOk?'#E3F7EE':'#FFF5D9'};color:${mustOk?'#17603F':'#6E5208'};font-size:13.5px;font-weight:700">${mustOk?`✓ 필수 인원 ${mustMembers.length}명 모두 가능해요`:'! 필수 인원 중 불가능한 사람이 있어요'}</div>`}
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;align-items:center;gap:10px">
          <strong style="flex:1 1 auto;font-size:14.5px;font-weight:800">모든 시간에 가능</strong>
          <span class="hn-num" style="font-size:14px;font-weight:800;color:#1C6E4A">${okPeople.length}<span style="font-weight:500;color:#64708F"> / ${total}</span></span>
        </div>
        <span style="height:8px;border-radius:99px;background:#EEF0F6;overflow:hidden"><i style="display:block;height:100%;width:${okPct}%;border-radius:99px;background:linear-gradient(90deg, #3DAA78, #5CC596)"></i></span>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:2px">
          ${okPeople.map((p,k)=>`<button data-person="${esc(p[7])}" style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px 4px 4px;border:0;border-radius:99px;background:#F6F7FC;font-family:inherit;font-size:12.5px;font-weight:600;cursor:pointer"><span aria-hidden="true" style="width:22px;height:22px;border-radius:8px;background:${AV[k%4][0]};color:${AV[k%4][1]};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800">${esc(initial(p[0]))}</span>${esc(p[0])}</button>`).join('')||'<span style="font-size:13px;color:#64708F">모든 시간에 가능한 구성원이 없습니다.</span>'}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;align-items:center;gap:10px"><strong style="flex:1 1 auto;font-size:14.5px;font-weight:800">일부 시간 불가</strong><span class="hn-num" style="font-size:14px;font-weight:800;color:#A8324F">${noPeople.length}</span></div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">${noPeople.map(p=>`<button data-person="${esc(p[7])}" style="padding:4px 10px;border:0;border-radius:99px;background:#FFF3F5;color:#8C3A4E;font-family:inherit;font-size:12.5px;font-weight:600;cursor:pointer">${esc(p[0])}</button>`).join('')||'<span style="font-size:13px;color:#64708F">없음</span>'}</div>
      </div>
    </div>`
    :`<div style="margin:0 18px;padding:28px 16px;border-radius:16px;background:linear-gradient(120deg, #F3F5FF, #F6F2FF);text-align:center;color:#4F5770;font-size:14px">왼쪽 시간표에서 칸을 눌러 시간대를 고르세요.<br>여러 칸을 함께 고를 수 있어요.</div>`;

  const rangeLabel=`${dates[0].getFullYear()}. ${pad2(dates[0].getMonth()+1)}. ${pad2(dates[0].getDate())} – ${pad2(dates[6].getMonth()+1)}. ${pad2(dates[6].getDate())}`;

  return `
  <section style="position:relative;overflow:hidden;border-radius:22px;background:linear-gradient(115deg, #3E5FD9 0%, #5A5FE0 50%, #7C5FD8 100%);color:#FFFFFF;padding:20px clamp(20px, 2.4vw, 28px);box-shadow:0 18px 40px rgba(72,82,200,0.26);display:flex;flex-wrap:wrap;gap:16px 24px;align-items:center;justify-content:space-between">
    <svg aria-hidden="true" width="560" height="560" viewBox="0 0 560 560" style="position:absolute;right:22%;top:-260px;opacity:0.14;pointer-events:none"><g fill="none" stroke="#FFFFFF" stroke-width="1.5"><circle cx="280" cy="280" r="90"/><circle cx="280" cy="280" r="150"/><circle cx="280" cy="280" r="210"/><circle cx="280" cy="280" r="270"/></g></svg>
    <div style="position:relative;display:flex;flex-direction:column;gap:2px;min-width:0">
      <span style="font-size:13.5px;color:#DCE2FF">촬영 가능 인원 비교</span>
      <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.02em">주간 일정표</h1>
      <span style="font-size:14.5px;color:#EEF0FF">칸을 눌러 여러 시간대를 고르면 오른쪽에서 함께 가능한 인원을 확인할 수 있어요.</span>
    </div>
    <div style="position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:8px">
      <div style="display:flex;align-items:center;gap:2px;height:42px;padding:0 4px;border-radius:12px;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.28)">
        <button data-week-step="-1" aria-label="이전 주" style="width:34px;height:34px;border:0;border-radius:9px;background:transparent;color:#FFFFFF;font-size:16px;cursor:pointer">‹</button>
        <strong class="hn-num" style="padding:0 6px;font-size:14px;font-weight:700;white-space:nowrap">${rangeLabel}</strong>
        <button data-week-step="1" aria-label="다음 주" style="width:34px;height:34px;border:0;border-radius:9px;background:transparent;color:#FFFFFF;font-size:16px;cursor:pointer">›</button>
      </div>
      <button data-week-step="0" style="height:42px;padding:0 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.28);background:rgba(255,255,255,0.14);color:#FFFFFF;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer">오늘</button>
    </div>
  </section>

  <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-radius:18px;background:rgba(255,255,255,0.9);border:1px solid #FFFFFF;box-shadow:0 8px 24px rgba(60,72,140,0.06)">
    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px">
      <span aria-hidden="true" style="width:32px;height:32px;border-radius:10px;background:linear-gradient(140deg, #EDE6FF, #E1D8FF);color:#5B45C8;display:flex;align-items:center;justify-content:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></span>
      <span style="font-size:13.5px;font-weight:700">필수 인원</span>
      ${mustChips}
      <select id="must-add" style="height:32px;padding:0 10px;border-radius:99px;border:1px dashed #B9B0EE;background:transparent;color:#5B45C8;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer">
        <option value="">+ 추가</option>
        ${people.filter(p=>!state.mustIds.includes(p[7])).map(p=>`<option value="${esc(p[7])}">${esc(p[0])} · ${esc(p[2])}</option>`).join('')}
      </select>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:14px;font-size:12.5px;font-weight:600;color:#4F5770">
      <span style="display:inline-flex;align-items:center;gap:6px"><i style="display:block;width:14px;height:14px;border-radius:5px;background:#F0FAF5"></i>전원 가능</span>
      <span style="display:inline-flex;align-items:center;gap:6px"><i style="display:block;width:14px;height:14px;border-radius:5px;background:#FFFAEC"></i>일부 가능</span>
      <span style="display:inline-flex;align-items:center;gap:6px"><i style="display:block;width:14px;height:14px;border-radius:5px;background:#FFF4F6"></i>2명 이하</span>
      <span style="display:inline-flex;align-items:center;gap:6px"><i style="display:block;width:14px;height:14px;border-radius:5px;background:linear-gradient(90deg, #F0F3FF, #F4F0FF)"></i>촬영 일정</span>
      <span style="display:inline-flex;align-items:center;gap:6px"><i style="display:block;width:14px;height:14px;border-radius:5px;background:linear-gradient(135deg, #4C6FE6, #7C5FD8)"></i>선택</span>
    </div>
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:stretch">
    <section aria-label="주간 시간표" style="flex:999 1 700px;min-width:0;${CARD};padding:16px 18px">
      <div style="overflow-x:auto">
        <div style="min-width:700px;display:grid;grid-template-columns:60px repeat(7, minmax(0, 1fr));gap:5px">
          <span></span>${heads}${cells}
        </div>
      </div>
    </section>

    <aside aria-label="선택한 시간대" style="flex:1 1 320px;min-width:0;display:flex;flex-direction:column;${CARD}">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:18px 18px 12px">
        <div style="display:flex;align-items:center;gap:10px">
          <span aria-hidden="true" style="width:38px;height:38px;border-radius:12px;background:linear-gradient(140deg, #E3EAFF, #D6E0FF);color:#3F4FD0;display:flex;align-items:center;justify-content:center"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg></span>
          <h2 style="margin:0;font-size:17px;font-weight:800">선택한 시간대 <span class="hn-num" style="color:#3F55D6">${parsed.length}</span></h2>
        </div>
        <button data-week-clear="1" style="height:32px;padding:0 10px;border:0;border-radius:8px;background:#F2F4FB;color:#4F5770;font-family:inherit;font-size:12.5px;font-weight:600;cursor:pointer">선택 해제</button>
      </div>
      ${detail}
      <div style="margin-top:auto;padding:16px 18px 18px">
        <button ${parsed.length?'data-action="new-shoot"':'disabled'} style="width:100%;display:flex;align-items:center;justify-content:center;gap:6px;height:46px;border:0;border-radius:12px;background:${parsed.length?'linear-gradient(135deg, #416FDE, #6656DA)':'#B9C3E6'};color:#FFFFFF;font-family:inherit;font-size:14.5px;font-weight:700;cursor:${parsed.length?'pointer':'default'};box-shadow:${parsed.length?'0 10px 22px rgba(82,100,224,0.28)':'none'}">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>선택 시간대로 촬영 일정 등록</button>
      </div>
    </aside>
  </div>`;
}

/* ===== AI 대본 분석 =====
   scheduler 의 renderAI 를 옮긴 것. 서버 계약은 그대로다.
     POST /api/analysis/jobs                  → 작업 생성(원문을 묶음으로 쪼갬)
     POST /api/analysis/jobs/:id/retry/:index → 묶음 하나를 분석(NVIDIA 호출 1회)
     GET  /api/analysis/jobs/:id              → 작업 조회
   전체를 한 요청에 몰면 무료 함수 30초에 잘리므로 묶음을 하나씩 돌린다.
   원본 파일은 서버로 보내지 않는다. 브라우저에서 텍스트만 뽑아 보낸다. */
// 서버 _shared.mjs 의 PRECISION 키와 글자까지 같아야 한다. 다르면 조용히 '균형'으로 떨어진다.
const AI_PRECISION=['정확도 우선','균형 (추천)','속도 우선'];

function aiProject(){ return projects[state.aiProjectId]||null; }
function aiSaved(){ return aiProject()?.aiAnalysis||{}; }
function aiScenes(){ return state.aiJob?.scenes||aiSaved().scenes||[]; }

// 씬에 나오는 배역 이름을 모은다.
function aiCharacters(scenes){
  const out=new Set();
  scenes.forEach(s=>(Array.isArray(s.characters)?s.characters:[]).forEach(c=>c&&out.add(String(c).trim())));
  return [...out];
}

async function aiExtract(file){
  state.aiFile=file.name; state.aiExtracting=true; state.aiText=''; render();
  try{
    const { extractText }=await import('./extract-client.js');
    const { text, characters }=await extractText(file,(n,total)=>{
      state.aiExtracting=`${n} / ${total}쪽 읽는 중`; render();
    });
    state.aiText=text; state.aiChars=characters; state.aiStep=1;
  }catch(error){ toast(error.message); state.aiFile=''; }
  finally{ state.aiExtracting=false; render(); }
}

async function aiStart(){
  const pid=state.aiProjectId, project=aiProject();
  if(!state.aiText) return toast('먼저 대본 파일을 올려 주세요.');
  const crew={planning:roleIds(project,'planning'),production:roleIds(project,'production')};
  if(pid&&(!crew.planning.length||!crew.production.length))
    return toast('이 프로젝트의 기획·촬영 담당을 먼저 지정해 주세요.');
  state.aiRunning=true; state.aiError=''; render();
  try{
    const res=await fetch(`${apiBase()}/api/analysis/jobs`,{method:'POST',
      headers:{'Content-Type':'application/json',Accept:'application/json'},
      body:JSON.stringify({text:state.aiText,filename:state.aiFile,projectId:pid,precision:state.aiPrecision,crew})});
    const job=await res.json().catch(()=>null);
    if(!res.ok||!job?.id) throw new Error(job?.error||`분석을 시작하지 못했습니다 (${res.status})`);
    state.aiJob=job; state.aiStep=2; render();
    // 묶음을 하나씩 순서대로 돌린다. 중간에 실패해도 나머지는 계속 간다.
    for(const item of job.items||[]){
      const r=await fetch(`${apiBase()}/api/analysis/jobs/${job.id}/retry/${item.index}`,
        {method:'POST',headers:{Accept:'application/json'}});
      const next=await r.json().catch(()=>null);
      if(next?.id) state.aiJob=next;
      render();
    }
    if(aiScenes().length) state.aiStep=3;
    toast(`${aiScenes().length}개 장면을 정리했습니다.`);
  }catch(error){ state.aiError=error.message; }
  finally{ state.aiRunning=false; render(); }
}

async function aiRetry(index){
  if(!state.aiJob?.id) return;
  state.aiRunning=true; render();
  try{
    const r=await fetch(`${apiBase()}/api/analysis/jobs/${state.aiJob.id}/retry/${index}`,
      {method:'POST',headers:{Accept:'application/json'}});
    const next=await r.json().catch(()=>null);
    if(next?.id) state.aiJob=next; else toast('재시도하지 못했습니다.');
  }finally{ state.aiRunning=false; render(); }
}

// 선택한 씬의 필요 배역을 실제 인원으로 바꾼 뒤, 이번 주에 그들이 모두 비는 시간을 찾는다.
function aiCandidates(scene){
  if(!scene) return [];
  const mappings={...(aiSaved().characterMappings||{}),...state.aiMappings};
  const ids=[...new Set((Array.isArray(scene.characters)?scene.characters:[])
    .map(c=>mappings[String(c).trim()]).filter(Boolean))];
  if(!ids.length) return [];
  const dates=weekDates(state.aiWeek), out=[];
  dates.forEach((dateObj,d)=>{
    const iso=localIso(dateObj), dayIdx=dataDay(dateObj);
    for(let t=9;t<=22;t++){
      const yes=ids.filter(id=>memberAvailable(id,iso,dayIdx,t));
      if(yes.length) out.push({d,t,iso,yes:yes.length,total:ids.length});
    }
  });
  return out.sort((a,b)=>b.yes-a.yes||a.d-b.d||a.t-b.t).slice(0,8);
}

/* ===== 쇼츠 =====
   쇼츠 메이커는 127.0.0.1 에 자기 HTTP 서버를 띄우는 로컬 웹앱이다.
   그 화면을 이 탭 안에 iframe 으로 띄운다.
   - 주소(포트·열쇠)는 쇼츠 메이커가 SHORTS_PORT / SHORTS_KEY 로 고정해 뜰 때만 알 수 있다.
     '쇼츠 메이커 (워크스페이스 연결).bat' 이 그 값을 넣어 준다.
   - 열쇠는 원래 '다른 웹페이지가 이 서버를 못 건드리게' 막는 장치다.
     그래서 여기서 몰래 뚫지 않고, 사용자가 한 번 넣어 둔 값만 쓴다.
   - https 로 배포된 사이트는 http://127.0.0.1 을 못 불러온다(혼합 콘텐츠 차단).
     작업공간을 로컬(http://localhost)로 열었을 때만 보인다. */
/* 주소는 둘 중 하나다.
   - 이 컴퓨터에서 쓸 때: http://127.0.0.1:7731
   - 밖에서 쓸 때: Cloudflare Tunnel 이 만들어 준 https 주소
   예전에 포트만 저장해 둔 사람은 그 값을 주소로 옮겨 준다. */
const SHORTS_DEFAULT = { base: 'http://127.0.0.1:7731', key: 'hnubs-workspace' };
function shortsConf(){
  let base = localStorage.getItem('hnubs:shorts-base');
  if (!base) {
    const port = localStorage.getItem('hnubs:shorts-port');
    base = port ? `http://127.0.0.1:${port}` : SHORTS_DEFAULT.base;
  }
  return { base: base.replace(/\/$/, ''), key: localStorage.getItem('hnubs:shorts-key') || SHORTS_DEFAULT.key };
}
const shortsUrl = c => `${c.base}/?k=${encodeURIComponent(c.key)}`;
// https 페이지는 http 주소를 못 부른다. 둘 다 https 거나 둘 다 http 여야 한다.
const shortsBlocked = c => location.protocol === 'https:' && c.base.startsWith('http://');

/* 켜져 있는지만 본다. no-cors 로 던지면 응답 내용은 못 읽지만,
   연결이 되면 resolve 하고 서버가 없으면 reject 한다 — 딱 그것만 알면 된다.
   쇼츠 메이커에 CORS 헤더를 넣으면 '다른 웹페이지 차단' 장치가 느슨해지므로 서버는 건드리지 않는다.
   (iframe 자체는 CORS 와 무관해서 그대로 뜬다.) */
async function shortsProbe(){
  const c = shortsConf();
  if (shortsBlocked(c)) { state.shortsState = 'https'; render(); return; }
  state.shortsState = 'checking'; render();
  try {
    await fetch(`${c.base}/api/state?k=${encodeURIComponent(c.key)}`,
      { mode: 'no-cors', signal: AbortSignal.timeout(4000) });
    state.shortsState = 'on';
  } catch {
    state.shortsState = 'off';
  }
  render();
}

function shortsView(){
  const c = shortsConf();
  const st = state.shortsState || 'idle';

  const hero = `
  <section style="position:relative;overflow:hidden;border-radius:22px;background:linear-gradient(115deg, #3E5FD9 0%, #5A5FE0 50%, #7C5FD8 100%);color:#FFFFFF;padding:20px clamp(20px, 2.4vw, 28px);box-shadow:0 18px 40px rgba(72,82,200,0.26);display:flex;flex-wrap:wrap;gap:16px 24px;align-items:center;justify-content:space-between;min-height:92px">
    <svg aria-hidden="true" width="560" height="560" viewBox="0 0 560 560" style="position:absolute;right:22%;top:-260px;opacity:0.14;pointer-events:none"><g fill="none" stroke="#FFFFFF" stroke-width="1.5"><circle cx="280" cy="280" r="90"/><circle cx="280" cy="280" r="150"/><circle cx="280" cy="280" r="210"/><circle cx="280" cy="280" r="270"/></g></svg>
    <div style="position:relative;display:flex;flex-direction:column;gap:2px;min-width:0;max-width:720px">
      <span style="font-size:13.5px;color:#DCE2FF">${st==='on'?'쇼츠 메이커 연결됨':'쇼츠 메이커'}</span>
      <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.02em">쇼츠</h1>
      <span style="font-size:14.5px;color:#EEF0FF">긴 공연 영상을 넣으면 짧은 쇼츠로 잘라 줘요.</span>
    </div>
    <div style="position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:8px">
      <button data-shorts-reload="1" style="height:42px;padding:0 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.28);background:rgba(255,255,255,0.14);color:#FFFFFF;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer">연결 확인</button>
      <button data-shorts-setup="1" style="height:42px;padding:0 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.28);background:rgba(255,255,255,0.14);color:#FFFFFF;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer">주소 설정</button>
    </div>
  </section>`;

  /* 연결되면 틀(카드·히어로) 없이 헤더 아래를 꽉 채운다.
     헤더는 남겨야 다른 탭으로 나갈 수 있고, 쇼츠 메이커 자기 헤더(단계·프로젝트)도 가리지 않는다.
     .hn-main 의 안쪽 여백을 음수 마진으로 걷어내 화면 끝까지 쓴다. */
  if (st === 'on') {
    return `<section aria-label="쇼츠 메이커"
      style="margin:0 calc(-1 * clamp(16px, 3vw, 32px)) -48px;height:calc(100vh - 190px);min-height:520px;overflow:hidden;background:#F4F5FC">
      <iframe src="${shortsUrl(c)}" title="쇼츠 메이커" style="display:block;width:100%;height:100%;border:0"></iframe>
    </section>`;
  }

  const panel = {
    checking: ['연결을 확인하는 중이에요', '잠시만 기다려 주세요.'],
    https:    ['주소가 https 여야 해요', '이 사이트는 https 라서 http 주소를 불러올 수 없습니다. Cloudflare Tunnel 로 만든 https 주소를 ‘주소 설정’에 넣어 주세요.'],
    off:      ['쇼츠 메이커가 꺼져 있어요', '아래 파일로 실행하면 이 탭에서 바로 쓸 수 있습니다.'],
    idle:     ['쇼츠 메이커를 불러올게요', '‘연결 확인’을 누르면 시작합니다.'],
  }[st] || ['쇼츠 메이커를 불러올게요', '‘연결 확인’을 누르면 시작합니다.'];

  const howto = (st === 'off' || st === 'idle') ? `
    <div style="display:flex;flex-direction:column;gap:8px;padding:16px;border-radius:14px;background:#F6F7FC;text-align:left">
      <strong style="font-size:13.5px;font-weight:800">실행 방법</strong>
      <code style="font-family:ui-monospace,monospace;font-size:12.5px;color:#4F5770;word-break:break-all">바탕화면 › 프로젝트 › 쇼츠 메이커 › <b>쇼츠 메이커 (워크스페이스 연결).bat</b></code>
      <span style="font-size:12.5px;color:#64708F">평소 쓰던 실행 파일은 주소가 매번 바뀌어서 이 탭이 찾지 못합니다. 위 파일로 실행해 주세요.</span>
    </div>` : '';

  const setup = state.shortsSetup ? `
    <form id="shorts-form" style="display:flex;flex-direction:column;gap:10px;padding:16px;border-radius:14px;background:#F8F9FD;text-align:left">
      <label style="display:flex;flex-direction:column;gap:5px;font-size:12.5px;font-weight:700">주소
        <input name="base" value="${esc(c.base)}" placeholder="http://127.0.0.1:7731" style="height:42px;padding:0 12px;border-radius:11px;border:1px solid #E6E9F3;background:#FFFFFF;font-family:inherit;font-size:14px;color:#20294D"></label>
      <label style="display:flex;flex-direction:column;gap:5px;font-size:12.5px;font-weight:700">열쇠
        <input name="key" value="${esc(c.key)}" style="height:42px;padding:0 12px;border-radius:11px;border:1px solid #E6E9F3;background:#FFFFFF;font-family:inherit;font-size:14px;color:#20294D"></label>
      <button type="submit" style="height:42px;border:0;border-radius:11px;background:linear-gradient(135deg, #416FDE, #6656DA);color:#FFFFFF;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer">저장하고 다시 확인</button>
    </form>` : '';

  return `${hero}
  <section style="${CARD};box-sizing:border-box;width:min(560px, 100%);margin:min(6vh, 56px) auto 0;padding:36px;display:flex;flex-direction:column;gap:18px;text-align:center;align-items:center">
    <span aria-hidden="true" style="width:58px;height:58px;border-radius:18px;background:linear-gradient(140deg, #E3EAFF, #EDE6FF);color:#3F4FD0;display:flex;align-items:center;justify-content:center"><svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="M16 10.5l5-3v9l-5-3"/></svg></span>
    <div style="display:flex;flex-direction:column;gap:6px">
      <h2 style="margin:0;font-size:21px;font-weight:800">${panel[0]}</h2>
      <p style="margin:0;font-size:14px;color:#64708F;line-height:1.6">${panel[1]}</p>
    </div>
    <div style="width:100%;display:flex;flex-direction:column;gap:12px">${howto}${setup}</div>
  </section>`;
}

/* ===== 공유드라이브 =====
   예전엔 이 컴퓨터에서 돌던 로컬 서버(127.0.0.1:3000)를 띄웠다.
   이제 drive/ 폴더에 같이 들어 있어서 같은 출처에서 바로 연다.
   서버 탐지도, 주소 설정도, 꺼져 있다는 안내도 필요 없다. */
const DRIVE_VERSION = '20261027-10';
function driveView(){
  const hash = state.driveSettings ? '#settings' : '';
  state.driveSettings = false;
  return `<section aria-label="공유드라이브"
    style="margin:-22px calc(-1 * clamp(16px, 3vw, 32px)) -48px;height:calc(100vh - 66px);overflow:hidden;background:#F4F5FC">
    <iframe src="./drive/index.html?v=${DRIVE_VERSION}${hash}" title="방송국 공유드라이브" style="display:block;width:100%;height:100%;border:0"></iframe>
  </section>`;
}

/* ===== 메이커스페이스 =====
   대본에서 촬영거리를 뽑는 일(대본 분석)과 영상에서 쇼츠를 뽑는 일(쇼츠)은
   둘 다 '만드는' 작업이라 한 탭 아래 둔다. */
const MAKER_TABS = [['script', 'AI 대본 분석'], ['shorts', '쇼츠']];
/* 주간 일정표와 촬영 일정은 같은 '일정' 탭 안에 둔다 (메이커스페이스와 같은 방식). */
const SCHEDULE_TABS = [['weekly', '주간 일정표'], ['shoots', '촬영 일정'], ['radio', '라디오']];

function subTabBar(list, current, attr, label){
  const tabs = list.map(([k, text]) => {
    const on = current === k;
    return `<button data-${attr}="${k}" aria-selected="${on}" role="tab"
      style="height:38px;padding:0 16px;border:0;border-radius:11px;background:${on ? '#EEF2FF' : 'transparent'};color:${on ? '#3F55D6' : '#64708F'};font-family:inherit;font-size:14.5px;font-weight:${on ? 700 : 600};cursor:pointer">${text}</button>`;
  }).join('');
  return `<div role="tablist" aria-label="${label}" style="display:flex;align-items:center;gap:4px;padding:6px;border-radius:16px;background:rgba(255,255,255,0.9);border:1px solid #FFFFFF;box-shadow:0 8px 24px rgba(60,72,140,0.06)">${tabs}</div>`;
}

const RADIO_SLOTS = [
  { key: 'lunch', label: '점심방송', time: '12:30 – 13:00', hour: 12 },
  { key: 'dinner', label: '저녁방송', time: '18:00 – 18:35', hour: 18 },
];

function radioView(){
  const dates = weekDates(state.weekOffset).slice(1, 6); // 월–금
  const range = `${monthDay(localIso(dates[0]))} – ${monthDay(localIso(dates[4]))}`;
  const today = localIso();

  const grid = RADIO_SLOTS.map(slot => {
    const cells = dates.map(dateObj => {
      const iso = localIso(dateObj);
      const free = people.filter(p => memberAvailable(p[7], iso, dataDay(dateObj), slot.hour));
      const isToday = iso === today;
      return `<div style="display:flex;flex-direction:column;gap:7px;padding:12px;border-radius:16px;background:${isToday ? 'linear-gradient(135deg, #F0F3FF, #F4F0FF)' : '#F8F9FD'};border:1px solid ${isToday ? '#DDE3FF' : '#EEF0F7'}">
        <span style="font-size:12px;font-weight:700;color:#64708F">${DOW[dateObj.getDay()]} ${dateObj.getDate()}일</span>
        <strong class="hn-num" style="font-size:19px;font-weight:800;color:${free.length ? '#20294D' : '#A13F5A'}">${free.length}명</strong>
        <span style="display:flex;padding-left:7px">${free.length ? faces(free.map(p => p[0])) : '<span style="font-size:12px;color:#A13F5A">가능한 부원 없음</span>'}</span>
      </div>`;
    }).join('');

    return `<section style="${CARD};padding:20px clamp(16px, 2vw, 24px);display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;flex-wrap:wrap;align-items:baseline;gap:8px 12px">
        <h2 style="margin:0;font-size:19px;font-weight:800">${slot.label}</h2>
        <span class="hn-num" style="padding:3px 10px;border-radius:99px;background:#E3EAFF;color:#3F4FD0;font-size:13px;font-weight:800">${slot.time}</span>
        <span style="font-size:13px;color:#64708F">월요일부터 금요일까지 매일 진행해요.</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:10px">${cells}</div>
    </section>`;
  }).join('');

  return `
  <section style="position:relative;overflow:hidden;border-radius:22px;background:linear-gradient(115deg, #3E5FD9 0%, #5A5FE0 50%, #7C5FD8 100%);color:#FFFFFF;padding:20px clamp(20px, 2.4vw, 28px);box-shadow:0 18px 40px rgba(72,82,200,0.26);display:flex;flex-wrap:wrap;gap:16px 24px;align-items:center;justify-content:space-between">
    <svg aria-hidden="true" width="560" height="560" viewBox="0 0 560 560" style="position:absolute;right:22%;top:-260px;opacity:0.14;pointer-events:none"><g fill="none" stroke="#FFFFFF" stroke-width="1.5"><circle cx="280" cy="280" r="90"/><circle cx="280" cy="280" r="150"/><circle cx="280" cy="280" r="210"/><circle cx="280" cy="280" r="270"/></g></svg>
    <div style="position:relative;display:flex;flex-direction:column;gap:2px;min-width:0">
      <span style="font-size:13.5px;color:#DCE2FF">${esc(range)}</span>
      <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.02em">라디오</h1>
      <span style="font-size:14.5px;color:#EEF0FF">점심·저녁 두 방송에 그 시간 가능한 부원을 보여 줘요.</span>
    </div>
    <div style="position:relative;display:flex;align-items:center;gap:6px">
      <button data-week-step="-1" aria-label="이전 주" style="width:40px;height:40px;border-radius:12px;border:1px solid rgba(255,255,255,0.28);background:rgba(255,255,255,0.14);color:#FFFFFF;font-family:inherit;font-size:16px;cursor:pointer">‹</button>
      <button data-week-step="0" style="height:40px;padding:0 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.28);background:rgba(255,255,255,0.14);color:#FFFFFF;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer">이번 주</button>
      <button data-week-step="1" aria-label="다음 주" style="width:40px;height:40px;border-radius:12px;border:1px solid rgba(255,255,255,0.28);background:rgba(255,255,255,0.14);color:#FFFFFF;font-family:inherit;font-size:16px;cursor:pointer">›</button>
    </div>
  </section>
  ${grid}`;
}

function scheduleView(){
  return `${subTabBar(SCHEDULE_TABS, state.scheduleTab, 'schedule-tab', '일정')}
  ${state.scheduleTab === 'shoots' ? shootsView() : state.scheduleTab === 'radio' ? radioView() : weeklyView()}`;
}

function makerView(){
  return `${subTabBar(MAKER_TABS, state.makerTab, 'maker-tab', '메이커스페이스')}
  ${state.makerTab === 'shorts' ? shortsView() : scriptView()}`;
}

function scriptView(){
  const projectList=Object.entries(projects).sort((a,b)=>(a[1].createdAt||0)-(b[1].createdAt||0));
  if(!projects[state.aiProjectId]) state.aiProjectId=projectList[0]?.[0]||'';
  const project=aiProject();
  const job=state.aiJob, scenes=aiScenes();
  state.aiSceneIndex=Math.max(0,Math.min(state.aiSceneIndex,Math.max(0,scenes.length-1)));
  const scene=scenes[state.aiSceneIndex]||null;
  const items=job?.items||[];
  const success=items.filter(x=>x.status==='success').length;
  const failed=items.filter(x=>x.status==='failed').length;
  const pending=Math.max(0,items.length-success-failed);
  const progress=job?.status==='completed'?100:(job?.progress||0);
  const chars=aiCharacters(scenes);
  const mappings={...(aiSaved().characterMappings||{}),...state.aiMappings};
  const mapped=chars.filter(c=>mappings[c]).length;

  const crew={planning:roleIds(project,'planning'),production:roleIds(project,'production')};
  const crewOk=crew.planning.length&&crew.production.length;
  const names=ids=>ids.map(id=>memberById(id)?.[0]).filter(Boolean).join(', ')||'미지정';

  // 각 단계에 들어갈 수 있는지. 앞 단계가 안 끝났으면 못 넘어간다.
  const reach=[true,!!state.aiText,!!(job||state.aiRunning),scenes.length>0];
  const step=Math.min(state.aiStep,reach.lastIndexOf(true));
  const field='height:44px;padding:0 10px;border-radius:12px;border:1px solid #E6E9F3;background:#F8F9FD;font-family:inherit;font-size:14px;color:#20294D';

  const steps=['대본 선택','분석 설정','AI 분석','일정 후보'].map((s,i)=>{ const on=i===step, done=i<step;
    return `<button ${reach[i]?`data-ai-step="${i}"`:'disabled'} style="display:flex;align-items:center;gap:8px;padding:0;border:0;background:none;font-family:inherit;cursor:${reach[i]?'pointer':'default'};opacity:${reach[i]?1:.45}">
      <span class="hn-num" style="width:24px;height:24px;border-radius:50%;background:${on||done?'linear-gradient(135deg, #4C6FE6, #7C5FD8)':'#E6EAF2'};color:${on||done?'#FFFFFF':'#8A93AE'};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800">${done?'✓':i+1}</span>
      <b style="font-size:13.5px;font-weight:${on?700:600};color:${on?'#20294D':'#8A93AE'}">${s}</b>
    </button>${i<3?'<span aria-hidden="true" style="flex:0 1 36px;height:2px;background:#E6EAF2"></span>':''}`;}).join('');

  const navBtn=(dir,label,enabled)=>`<button ${enabled?`data-ai-step="${step+dir}"`:'disabled'} style="height:44px;padding:0 18px;border:0;border-radius:12px;background:${dir>0?(enabled?'linear-gradient(135deg, #416FDE, #6656DA)':'#B9C3E6'):'#F2F4FB'};color:${dir>0?'#FFFFFF':'#4F5770'};font-family:inherit;font-size:14px;font-weight:700;cursor:${enabled?'pointer':'default'}">${label}</button>`;

  let panel;

  if(step===0){
    const dropLabel=state.aiExtracting
      ? (typeof state.aiExtracting==='string'?state.aiExtracting:'텍스트 추출 중…')
      : state.aiFile||'파일을 선택하세요 (PDF · DOCX · TXT)';
    panel=`
      <h2 style="margin:0 0 4px;font-size:18px;font-weight:800">대본 선택</h2>
      <p style="margin:0 0 18px;font-size:13.5px;color:#64708F">분석할 프로젝트와 대본 파일을 고르세요. 원본 파일은 서버에 저장하지 않습니다.</p>
      <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">
        <label style="flex:1 1 240px;display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:700">프로젝트
          <select id="ai-project" style="${field}">${projectList.map(([id,p])=>`<option value="${esc(id)}" ${id===state.aiProjectId?'selected':''}>${esc(p.name||id)}</option>`).join('')||'<option value="">프로젝트 없음</option>'}</select>
        </label>
        <div style="flex:999 1 320px;min-width:0">
          <input id="ai-file" type="file" accept=".pdf,.docx,.txt" hidden>
          <button id="ai-pick" style="width:100%;display:flex;flex-direction:column;align-items:center;gap:5px;padding:28px 14px;border:1.5px dashed #B5BEEA;border-radius:16px;background:#F8F9FD;color:#3F55D6;font-family:inherit;cursor:pointer">
            <strong style="font-size:14.5px;font-weight:700">${esc(dropLabel)}</strong>
            <small style="font-size:12px;color:#64708F">${state.aiText?`${state.aiChars.toLocaleString()}자 추출 완료`:'PDF · DOCX · TXT'}</small>
          </button>
        </div>
      </div>`;
  }

  else if(step===1){
    const maxChars={'정확도 우선':6000,'균형 (추천)':11000,'속도 우선':18000}[state.aiPrecision]||11000;
    const estimate=Math.max(1,Math.ceil(state.aiChars/maxChars));
    panel=`
      <h2 style="margin:0 0 4px;font-size:18px;font-weight:800">분석 설정</h2>
      <p style="margin:0 0 18px;font-size:13.5px;color:#64708F">대본을 묶음으로 나눠 분석합니다. 묶음이 작을수록 정확하지만 오래 걸려요.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:18px">
        ${[['정확도 우선','묶음 6,000자 · 가장 정확, 가장 느림'],['균형 (추천)','묶음 11,000자 · 권장'],['속도 우선','묶음 18,000자 · 가장 빠름, 놓칠 수 있음']].map(([v,desc])=>{ const on=state.aiPrecision===v;
          return `<button data-ai-precision="${esc(v)}" aria-pressed="${on}" style="display:flex;align-items:center;gap:12px;padding:14px 16px;border:1.5px solid ${on?'#6B6AE6':'#ECEEF6'};border-radius:14px;background:${on?'linear-gradient(120deg, #F1F4FF, #F5F0FF)':'#FFFFFF'};font-family:inherit;text-align:left;cursor:pointer">
            <span aria-hidden="true" style="flex:0 0 18px;width:18px;height:18px;border-radius:50%;border:2px solid ${on?'#5A5FE0':'#CBD2E6'};background:${on?'#5A5FE0':'transparent'};box-shadow:${on?'inset 0 0 0 3px #FFFFFF':'none'}"></span>
            <span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;line-height:1.4"><strong style="font-size:14.5px;font-weight:800">${esc(v)}</strong><span style="font-size:12.5px;color:#64708F">${esc(desc)}</span></span>
          </button>`;}).join('')}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px">
        <span style="flex:1 1 150px;display:flex;flex-direction:column;gap:2px;padding:12px 14px;border-radius:14px;background:#F6F7FC"><span style="font-size:12px;color:#64708F">대본 길이</span><strong class="hn-num" style="font-size:16px;font-weight:800">${state.aiChars.toLocaleString()}자</strong></span>
        <span style="flex:1 1 150px;display:flex;flex-direction:column;gap:2px;padding:12px 14px;border-radius:14px;background:#F6F7FC"><span style="font-size:12px;color:#64708F">예상 묶음</span><strong class="hn-num" style="font-size:16px;font-weight:800">약 ${estimate}개</strong></span>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;padding:14px 16px;border-radius:14px;background:${crewOk?'#F0FAF5':'#FFF5D9'};color:${crewOk?'#17603F':'#6E5208'};margin-bottom:18px">
        <strong style="font-size:13.5px;font-weight:800">${crewOk?'✓ 담당 지정 완료':'! 담당을 먼저 지정해 주세요'}</strong>
        <span style="font-size:12.5px">기획 ${esc(names(crew.planning))} · 촬영 ${esc(names(crew.production))}</span>
        ${crewOk?'':'<span style="font-size:12px">기획·촬영 담당이 모두 있어야 서버가 분석을 받습니다.</span>'}
      </div>
      <button id="ai-start" ${(!state.aiText||!crewOk||state.aiRunning)?'disabled':''} style="width:100%;height:48px;border:0;border-radius:12px;background:${(!state.aiText||!crewOk||state.aiRunning)?'#B9C3E6':'linear-gradient(135deg, #416FDE, #6656DA)'};color:#FFFFFF;font-family:inherit;font-size:15px;font-weight:700;cursor:${(!state.aiText||!crewOk||state.aiRunning)?'default':'pointer'}">${state.aiRunning?'분석 중…':'분석 시작'}</button>`;
  }

  else if(step===2){
    const failedRows=items.filter(x=>x.status==='failed').map(x=>`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 13px;border-radius:12px;background:#FFF1F4;color:#A8324F;font-size:12.5px;font-weight:600;margin-top:6px">
        <span>묶음 ${x.index+1} · ${esc(x.error||'분석 실패')}</span>
        <button data-ai-retry="${x.index}" style="height:28px;padding:0 10px;border:0;border-radius:8px;background:#FFFFFF;color:#A8324F;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer">재시도</button>
      </div>`).join('');
    panel=`
      <h2 style="margin:0 0 4px;font-size:18px;font-weight:800">AI 분석</h2>
      <p style="margin:0 0 20px;font-size:13.5px;color:#64708F">묶음을 하나씩 NVIDIA NIM에 보내 씬·장소·배역을 뽑습니다.</p>
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:22px;padding:18px;border-radius:16px;background:linear-gradient(120deg, #F3F5FF, #F6F2FF)">
        <span aria-hidden="true" style="flex:0 0 104px;width:104px;height:104px;border-radius:50%;background:conic-gradient(#5A5FE0 0 ${progress}%, #E6EAF2 ${progress}% 100%);display:flex;align-items:center;justify-content:center">
          <span style="width:80px;height:80px;border-radius:50%;background:#FFFFFF;display:flex;align-items:center;justify-content:center"><strong class="hn-num" style="font-size:20px;font-weight:800">${progress}%</strong></span>
        </span>
        <span style="flex:1 1 200px;min-width:0;display:flex;flex-direction:column;gap:7px">
          <span style="font-size:13px;color:#64708F">${job?.status==='completed'?'분석 완료':state.aiRunning?'대본 분석 중':'분석 대기'}</span>
          <strong style="font-size:16px;font-weight:800">${items.length?`묶음 ${success} / ${items.length} 완료`:'분석을 시작하면 진행이 표시됩니다'}</strong>
          <span style="display:flex;gap:18px;font-size:12.5px;color:#64708F">
            <span>완료 <b class="hn-num" style="color:#17603F">${success}</b></span>
            <span>실패 <b class="hn-num" style="color:#A8324F">${failed}</b></span>
            <span>대기 <b class="hn-num">${pending}</b></span>
          </span>
        </span>
      </div>
      ${failedRows}
      ${scenes.length?`<p style="margin:16px 0 0;font-size:13px;color:#17603F;font-weight:600">${scenes.length}개 장면을 찾았어요. ‘다음’을 눌러 일정 후보로 넘어가세요.</p>`:''}`;
  }

  else {
    const detail=scene?`
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px">
          <span class="hn-num" style="padding:3px 10px;border-radius:99px;background:#E8EDFF;color:#3F4FD0;font-size:12px;font-weight:800">${esc(scene.sceneId||'S#')}</span>
          <strong style="font-size:17px;font-weight:800">${esc(scene.location||'장소 미정')}</strong>
          ${scene.interiorExterior&&scene.interiorExterior!=='UNKNOWN'?`<span style="padding:2px 9px;border-radius:99px;background:#EDE6FF;color:#4A3FB0;font-size:12px;font-weight:700">${esc(scene.interiorExterior==='INT'?'실내':'실외')}</span>`:''}
          ${scene.dayNight&&scene.dayNight!=='UNKNOWN'?`<span style="padding:2px 9px;border-radius:99px;background:${scene.dayNight==='DAY'?'#FFF4D6':'#E3EAFF'};color:${scene.dayNight==='DAY'?'#6E5208':'#2F4FC2'};font-size:12px;font-weight:700">${esc(scene.dayNight==='DAY'?'낮':'밤')}</span>`:''}
          ${scene.estimatedMinutes?`<span style="padding:2px 9px;border-radius:99px;background:#E3F7EE;color:#17603F;font-size:12px;font-weight:700">약 ${scene.estimatedMinutes}분</span>`:''}
        </div>
        ${(scene.characters||[]).length?`<div style="display:flex;flex-wrap:wrap;gap:5px">${scene.characters.map(c=>`<span style="padding:3px 10px;border-radius:99px;background:#F2F4FB;color:#4F5770;font-size:12.5px;font-weight:600">${esc(c)}</span>`).join('')}</div>`:''}
        ${scene.summary?`<p style="margin:0;padding:12px 14px;border-radius:14px;background:#F6F7FC;font-size:13.5px;line-height:1.7;color:#4F5770;white-space:pre-wrap">${esc(scene.summary)}</p>`:''}
      </div>`:'<p style="margin:0;font-size:13px;color:#64708F">장면을 선택하세요.</p>';

    const cands=aiCandidates(scene);
    const candidateRows=cands.length?cands.map(c=>`<button data-ai-cand="${c.d}:${c.t}" style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border:0;border-radius:12px;background:${c.yes===c.total?'#F0FAF5':'#FFFAEC'};color:${c.yes===c.total?'#2A7553':'#7A5E14'};font-family:inherit;text-align:left;cursor:pointer;margin-bottom:6px">
        <strong style="font-size:13px;font-weight:700">${monthDay(c.iso)} (${DOW[c.d]}) ${pad2(c.t)}:00–${pad2(c.t+1)}:00</strong>
        <span style="font-size:12px;font-weight:600">${c.yes}/${c.total}명</span>
      </button>`).join('')
      :`<p style="margin:0;font-size:13px;color:#64708F">${scene?'배역을 실제 인원과 연결하면 후보가 계산됩니다.':'먼저 장면을 선택하세요.'}</p>`;

    panel=`
      <h2 style="margin:0 0 4px;font-size:18px;font-weight:800">일정 후보</h2>
      <p style="margin:0 0 18px;font-size:13.5px;color:#64708F">장면을 고르고 배역을 실제 인원과 연결하면 촬영 가능한 시간이 나옵니다.</p>
      <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">
        <div style="flex:1 1 220px;min-width:0">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px">
            <h3 style="margin:0;font-size:14px;font-weight:800">장면 목록</h3><span class="hn-num" style="font-size:13px;color:#3F55D6;font-weight:800">${scenes.length}</span>
          </div>
          <div style="max-height:420px;overflow-y:auto;padding-right:2px">
            ${scenes.map((s,i)=>{ const on=i===state.aiSceneIndex;
              return `<button data-ai-scene="${i}" style="width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;border:0;border-radius:12px;background:${on?'linear-gradient(135deg, #4C6FE6, #7C5FD8)':'#F7F8FC'};color:${on?'#FFFFFF':'#20294D'};font-family:inherit;text-align:left;cursor:pointer;margin-bottom:6px">
                <span class="hn-num" style="flex:0 0 auto;padding:2px 8px;border-radius:8px;background:${on?'rgba(255,255,255,0.22)':'#E8EDFF'};color:${on?'#FFFFFF':'#3F4FD0'};font-size:11.5px;font-weight:800">${esc(s.sceneId||`S#${i+1}`)}</span>
                <span style="flex:1 1 auto;min-width:0;font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(s.location||s.title||'장소 미정')}</span>
              </button>`;}).join('')||'<p style="margin:0;font-size:13px;color:#64708F">장면이 없습니다.</p>'}
          </div>
        </div>
        <div style="flex:999 1 300px;min-width:0">${detail}</div>
        <div style="flex:1 1 240px;min-width:0;display:flex;flex-direction:column;gap:16px">
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px">
              <h3 style="margin:0;font-size:14px;font-weight:800">촬영 후보</h3>
              <button data-ai-week="1" class="hn-link">다음 주 →</button>
            </div>
            ${candidateRows}
          </div>
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px">
              <h3 style="margin:0;font-size:14px;font-weight:800">배역 → 인원</h3><span style="font-size:12.5px;color:#64708F">${mapped}/${chars.length}</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:7px;max-height:260px;overflow-y:auto">
              ${chars.map(c=>`<label style="display:flex;align-items:center;gap:8px;font-size:13px">
                <span style="flex:0 0 70px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c)}</span>
                <select data-ai-map="${esc(c)}" style="flex:1 1 auto;min-width:0;height:36px;padding:0 8px;border-radius:10px;border:1px solid #E6E9F3;background:#F8F9FD;font-family:inherit;font-size:13px;color:#20294D">
                  <option value="">미지정</option>
                  ${people.map(p=>`<option value="${esc(p[7])}" ${mappings[c]===p[7]?'selected':''}>${esc(p[0])} · ${esc(p[2])}</option>`).join('')}
                </select>
              </label>`).join('')||'<p style="margin:0;font-size:13px;color:#64708F">분석이 끝나면 배역이 여기 나옵니다.</p>'}
            </div>
          </div>
        </div>
      </div>`;
  }

  return `
  <section style="position:relative;overflow:hidden;border-radius:22px;background:linear-gradient(115deg, #3E5FD9 0%, #5A5FE0 50%, #7C5FD8 100%);color:#FFFFFF;padding:20px clamp(20px, 2.4vw, 28px);box-shadow:0 18px 40px rgba(72,82,200,0.26);display:flex;flex-wrap:wrap;gap:16px 24px;align-items:center;justify-content:space-between;min-height:92px">
    <svg aria-hidden="true" width="560" height="560" viewBox="0 0 560 560" style="position:absolute;right:22%;top:-260px;opacity:0.14;pointer-events:none"><g fill="none" stroke="#FFFFFF" stroke-width="1.5"><circle cx="280" cy="280" r="90"/><circle cx="280" cy="280" r="150"/><circle cx="280" cy="280" r="210"/><circle cx="280" cy="280" r="270"/></g></svg>
    <div style="position:relative;display:flex;flex-direction:column;gap:2px;min-width:0;max-width:720px">
      <span style="font-size:13.5px;color:#DCE2FF">NVIDIA NIM · ${esc(state.aiHealthText||'서버 확인 중')}</span>
      <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.02em">AI 대본 분석</h1>
      <span style="font-size:14.5px;color:#EEF0FF">대본에서 씬·장소·등장 배역을 찾고 실제 시간표로 촬영 후보를 계산해요.</span>
    </div>
  </section>

  <div style="display:flex;flex-wrap:wrap;align-items:center;gap:14px;padding:12px 16px;border-radius:18px;background:rgba(255,255,255,0.9);border:1px solid #FFFFFF;box-shadow:0 8px 24px rgba(60,72,140,0.06)">${steps}</div>

  ${state.aiError?`<div style="padding:12px 16px;border-radius:14px;background:#FFF1F4;color:#A8324F;font-size:13.5px;font-weight:600">${esc(state.aiError)}</div>`:''}

  <section aria-label="분석 단계" style="${CARD};padding:22px">
    ${panel}
    <div style="display:flex;justify-content:space-between;gap:10px;margin-top:22px;padding-top:18px;border-top:1px solid #EEF0F6">
      ${navBtn(-1,'← 이전',step>0)}
      ${navBtn(1,'다음 →',step<3&&reach[step+1])}
    </div>
  </section>`;
}

const SHOOT_STATUS={'예정':['#EAF0FF','#2F4FC2','STBY'],'진행 중':['#FFE9EC','#B02C48','ON AIR'],'완료':['#EEF0F5','#4F5770','WRAP']};
const SHOOT_TILE={'예정':['linear-gradient(140deg, #E3EAFF, #EDE6FF)','#3F4FD0'],'진행 중':['#FFE9EC','#B02C48'],'완료':['#F0F1F6','#4F5770']};

// 촬영과 방송국 일정(회의·행사)은 같은 shoots 컬렉션에 category 로만 구분해 둔다.
const CATEGORIES=[['촬영','#E3EAFF','#2F4FC2'],['회의','#EDE6FF','#4A3FB0'],['행사','#FFE9DF','#8A3A1A'],['기타','#E3F7EE','#17603F']];
function categoryColor(name){ return CATEGORIES.find(c=>c[0]===name)||CATEGORIES[3]; }

function shootMatches(s){
  const q=(state.shootQuery||'').toLowerCase();
  if(q&&!`${s.title} ${s.place} ${s.type} ${s.people.join(' ')}`.toLowerCase().includes(q)) return false;
  if(state.shootCategory!=='all'&&s.type!==state.shootCategory) return false;
  return state.shootFilter==='all'||s.status===state.shootFilter;
}

// 일정 탭의 월 캘린더.
function shootsCalendar(items){
  const today=localIso(), now=new Date();
  const base=new Date(now.getFullYear(),now.getMonth()+state.shootMonth,1);
  const year=base.getFullYear(), month=base.getMonth();
  const lastDay=new Date(year,month+1,0).getDate(), lead=base.getDay();

  let cells='';
  for(let i=0;i<Math.ceil((lead+lastDay)/7)*7;i++){
    const day=i-lead+1;
    if(day<1||day>lastDay){ cells+='<span style="min-height:104px"></span>'; continue; }
    const iso=`${year}-${pad2(month+1)}-${pad2(day)}`;
    const dayItems=items.filter(s=>s.date===iso).sort((a,b)=>a.startH-b.startH);
    const isToday=iso===today, on=state.shootDay===iso;
    cells+=`<button data-shoot-day="${iso}" aria-pressed="${on}" aria-label="${month+1}월 ${day}일, 일정 ${dayItems.length}건" style="min-height:104px;padding:7px;border:0;border-radius:14px;background:${on?'#FFFFFF':(isToday?'rgba(82,127,240,0.08)':'#F7F8FC')};box-shadow:${on?'inset 0 0 0 2px #6B6AE6, 0 10px 22px rgba(90,95,224,0.18)':'none'};font-family:inherit;text-align:left;display:flex;flex-direction:column;gap:3px;cursor:pointer">
      <span class="hn-num" style="align-self:flex-start;min-width:24px;height:24px;padding:0 4px;box-sizing:border-box;border-radius:8px;background:${isToday?'linear-gradient(135deg, #4C6FE6, #7C5FD8)':'transparent'};color:${isToday?'#FFFFFF':(i%7===0?'#A8324F':'#20294D')};display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:800">${day}</span>
      ${dayItems.slice(0,3).map(s=>{const [,bg,fg]=categoryColor(s.type);
        return `<span title="${esc(s.time)} ${esc(s.title)}" style="display:block;width:100%;box-sizing:border-box;padding:3px 7px;border-radius:7px;background:${bg};color:${fg};font-size:11.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(hourLabel(s.startH))} ${esc(s.title)}</span>`;}).join('')}
      ${dayItems.length>3?`<span style="padding-left:7px;font-size:11px;color:#64708F">+${dayItems.length-3}건</span>`:''}
    </button>`;
  }

  const sel=state.shootDay&&items.filter(s=>s.date===state.shootDay).sort((a,b)=>a.startH-b.startH);
  const dayPanel=!state.shootDay?'':`
    <div style="margin-top:16px;padding-top:16px;border-top:1px solid #EEF0F6">
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:12px">
        <span style="flex:0 0 46px;height:50px;border-radius:14px;background:linear-gradient(135deg, #4C6FE6, #7C5FD8);color:#FFFFFF;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.1;box-shadow:0 8px 18px rgba(90,95,224,0.3)"><span style="font-size:11px;font-weight:700">${dowOf(state.shootDay)}</span><strong class="hn-num" style="font-size:19px;font-weight:800">${new Date(`${state.shootDay}T00:00:00`).getDate()}</strong></span>
        <span style="display:flex;flex-direction:column;line-height:1.35"><strong style="font-size:16px;font-weight:800">${monthDay(state.shootDay)} ${dowOf(state.shootDay)}요일</strong><span style="font-size:13px;color:#64708F">일정 ${sel.length}건</span></span>
        <button data-shoot-day-clear="1" style="margin-left:auto;height:32px;padding:0 10px;border:0;border-radius:8px;background:#F2F4FB;color:#4F5770;font-family:inherit;font-size:12.5px;font-weight:600;cursor:pointer">닫기</button>
      </div>
      ${sel.length?`<div style="display:flex;flex-direction:column">${sel.map((s,k)=>{const [,bg,fg]=categoryColor(s.type);
        return `<div style="display:flex;gap:12px">
          <span class="hn-num" style="flex:0 0 96px;padding-top:12px;font-size:12.5px;font-weight:700;color:#4F5770;text-align:right">${esc(s.time)}</span>
          <span aria-hidden="true" style="flex:0 0 12px;position:relative;display:flex;justify-content:center"><i style="position:absolute;top:0;bottom:0;width:2px;background:#EEF0F6"></i><i style="position:relative;margin-top:16px;width:10px;height:10px;border-radius:50%;background:${fg};box-shadow:0 0 0 3px #FFFFFF"></i></span>
          <button data-detail="${esc(s.id)}" style="flex:1 1 auto;min-width:0;margin-bottom:${k===sel.length-1?0:8}px;padding:12px 14px;border:0;border-radius:14px;background:${bg};color:#20294D;font-family:inherit;text-align:left;cursor:pointer;display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px">
            <span style="padding:2px 9px;border-radius:99px;background:#FFFFFF;color:${fg};font-size:11.5px;font-weight:800">${esc(s.type)}</span>
            <strong style="flex:1 1 auto;min-width:0;font-size:15px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(s.title)}</strong>
            <span style="font-size:12.5px;color:#4F5770">${esc(s.place||'장소 미정')} · ${s.people.length}명</span>
          </button>
        </div>`;}).join('')}</div>`
        :`<div style="padding:24px 16px;border-radius:16px;background:linear-gradient(120deg, #F3F5FF, #F6F2FF);text-align:center;color:#4F5770;font-size:14px">이 날은 등록된 일정이 없어요.</div>`}
    </div>`;

  return `<section aria-label="${year}년 ${month+1}월 일정" style="${CARD};padding:18px">
    <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:8px">
        <button data-shoot-month="-1" aria-label="이전 달" style="width:36px;height:36px;border-radius:10px;border:0;background:#F2F4FB;cursor:pointer;color:#3A4466">‹</button>
        <h2 style="margin:0 4px;font-size:19px;font-weight:800">${year}년 ${month+1}월</h2>
        <button data-shoot-month="1" aria-label="다음 달" style="width:36px;height:36px;border-radius:10px;border:0;background:#F2F4FB;cursor:pointer;color:#3A4466">›</button>
        <button data-shoot-month="0" style="height:36px;padding:0 12px;border-radius:10px;border:0;background:#EEF2FF;color:#3F55D6;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">오늘</button>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:12px;font-size:12px;font-weight:600;color:#4F5770">
        ${CATEGORIES.slice(0,3).map(([label,bg])=>`<span style="display:inline-flex;align-items:center;gap:6px"><i style="width:12px;height:12px;border-radius:4px;background:${bg}"></i>${label}</span>`).join('')}
      </div>
    </div>
    <div style="overflow-x:auto">
      <div style="min-width:680px;padding:2px;display:grid;grid-template-columns:repeat(7, minmax(0, 1fr));gap:6px">
        ${DOW.map((d,i)=>`<span style="padding:4px 8px 2px;font-size:12.5px;font-weight:700;color:${i===0?'#A8324F':'#64708F'}">${d}</span>`).join('')}
        ${cells}
      </div>
    </div>
    ${dayPanel}
  </section>`;
}

function shootRows(items){
  if(!items.length) return `<tr><td colspan="7"><div style="padding:40px 20px;text-align:center;color:#64708F">이 조건에 맞는 촬영 일정이 없어요.</div></td></tr>`;
  return items.map(s=>{
    const [stBg,stFg,code]=SHOOT_STATUS[s.status]||SHOOT_STATUS['완료'];
    const [tileBg,tileFg]=SHOOT_TILE[s.status]||SHOOT_TILE['완료'];
    const d=new Date(`${s.date}T00:00:00`);
    return `<tr style="background:${s.status==='완료'?'#FAFBFD':'#FFFFFF'}">
      <td style="padding:8px 14px;border-radius:14px 0 0 14px">
        <span style="display:flex;align-items:center;gap:10px">
          <span style="width:42px;height:44px;border-radius:12px;background:${tileBg};color:${tileFg};display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.1"><span style="font-size:11px;font-weight:700">${dowOf(s.date)}</span><strong class="hn-num" style="font-size:17px;font-weight:800">${d.getDate()}</strong></span>
          <span style="font-size:12.5px;color:#64708F">${d.getMonth()+1}월</span>
        </span>
      </td>
      <td class="hn-num" style="padding:8px 12px;font-size:13px;font-weight:600;white-space:nowrap">${esc(s.time)}</td>
      <td style="padding:8px 12px"><button data-detail="${esc(s.id)}" style="border:0;background:transparent;padding:4px 0;color:#20294D;font-family:inherit;font-size:15px;font-weight:700;text-align:left;cursor:pointer">${esc(s.title)}</button></td>
      <td style="padding:8px 12px;color:${s.place?'#20294D':'#64708F'}">${esc(s.place||'장소 미정')}</td>
      <td style="padding:8px 12px">
        <span style="display:flex;align-items:center">${s.people.slice(0,3).map((n,k)=>`<span aria-hidden="true" style="width:26px;height:26px;margin-right:-7px;border-radius:9px;border:2px solid #FFFFFF;background:${AV[k%4][0]};color:${AV[k%4][1]};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800">${esc(initial(n))}</span>`).join('')}<span style="font-size:13px;color:#64708F;margin-left:14px">${s.people.length}명</span></span>
      </td>
      <td style="padding:8px 12px"><span style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px 3px 4px;border-radius:99px;background:${stBg};color:${stFg};font-size:12px;font-weight:700;white-space:nowrap"><span class="hn-num" style="padding:0 5px;border-radius:99px;background:#FFFFFF;font-size:10px;font-weight:800;letter-spacing:0.05em">${code}</span>${s.status}</span></td>
      <td style="padding:8px 14px;text-align:right;white-space:nowrap;border-radius:0 14px 14px 0">
        <button data-detail="${esc(s.id)}" aria-label="${esc(s.title)} 상세 보기" style="width:34px;height:34px;border-radius:10px;border:0;background:#F2F4FB;color:#3A4466;cursor:pointer"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button>
      </td>
    </tr>`;
  }).join('');
}

function shootsView() {
  const rows=schedules.filter(shootMatches);
  const count=s=>schedules.filter(x=>x.status===s).length;
  const range=schedules.length?`${monthDay(schedules[0].date)} – ${monthDay(schedules[schedules.length-1].date)}`:'등록된 일정 없음';
  const heroStats=[['전체',schedules.length],['예정',count('예정')],['완료',count('완료')]]
    .map(([label,n])=>`<span style="display:flex;flex-direction:column;min-width:84px;padding:8px 14px;border-radius:14px;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.26);line-height:1.3"><span style="font-size:12px;color:#DCE2FF">${label}</span><strong class="hn-num" style="font-size:20px;font-weight:800">${n}<span style="font-size:12px;font-weight:600;color:#DCE2FF"> 건</span></strong></span>`).join('');
  const filters=[['all','전체',schedules.length],['예정','예정',count('예정')],['진행 중','진행 중',count('진행 중')],['완료','완료',count('완료')]]
    .map(([k,label,n])=>{ const on=state.shootFilter===k;
      return `<button role="tab" aria-selected="${on}" data-shoot-filter="${k}" style="height:34px;padding:0 12px;border-radius:9px;border:0;background:${on?'#FFFFFF':'transparent'};color:${on?'#3F4FD0':'#64708F'};box-shadow:${on?'0 2px 8px rgba(60,72,140,0.12)':'none'};font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">${label} <span class="hn-num" style="opacity:0.8">${n}</span></button>`;}).join('');
  const usedCats=CATEGORIES.map(c=>c[0]).filter(c=>schedules.some(s=>s.type===c));
  const catTabs=[['all','전체'],...usedCats.map(c=>[c,c])].map(([k,label])=>{ const on=state.shootCategory===k;
    const n=k==='all'?schedules.length:schedules.filter(s=>s.type===k).length;
    return `<button role="tab" aria-selected="${on}" data-shoot-category="${esc(k)}" style="height:34px;padding:0 12px;border-radius:9px;border:0;background:${on?'#FFFFFF':'transparent'};color:${on?'#3F4FD0':'#64708F'};box-shadow:${on?'0 2px 8px rgba(60,72,140,0.12)':'none'};font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">${esc(label)} <span class="hn-num" style="opacity:0.8">${n}</span></button>`;}).join('');

  return `
  <section style="position:relative;overflow:hidden;border-radius:22px;background:linear-gradient(115deg, #3E5FD9 0%, #5A5FE0 50%, #7C5FD8 100%);color:#FFFFFF;padding:20px clamp(20px, 2.4vw, 28px);box-shadow:0 18px 40px rgba(72,82,200,0.26);display:flex;flex-wrap:wrap;gap:16px 24px;align-items:center;justify-content:space-between">
    <svg aria-hidden="true" width="560" height="560" viewBox="0 0 560 560" style="position:absolute;right:22%;top:-260px;opacity:0.14;pointer-events:none"><g fill="none" stroke="#FFFFFF" stroke-width="1.5"><circle cx="280" cy="280" r="90"/><circle cx="280" cy="280" r="150"/><circle cx="280" cy="280" r="210"/><circle cx="280" cy="280" r="270"/></g></svg>
    <div style="position:relative;display:flex;flex-direction:column;gap:2px;min-width:0">
      <span class="hn-num" style="font-size:13.5px;color:#DCE2FF">${range}</span>
      <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.02em">일정</h1>
      <span style="font-size:14.5px;color:#EEF0FF">촬영과 방송국 일정을 한 달력에서 봐요. 일정을 누르면 상세가 열려요.</span>
    </div>
    <div style="position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:10px">
      ${heroStats}
      <button data-action="new-shoot" style="display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 18px;border-radius:12px;border:0;background:#FFFFFF;color:#3F4FD0;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 6px 16px rgba(30,30,120,0.18)"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>일정 등록</button>
    </div>
  </section>

  <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:10px;border-radius:18px;background:rgba(255,255,255,0.9);border:1px solid #FFFFFF;box-shadow:0 8px 24px rgba(60,72,140,0.06)">
    <label style="flex:1 1 260px;max-width:380px;display:flex;align-items:center;gap:8px;height:42px;padding:0 12px;border-radius:12px;background:#F4F6FB;color:#64708F">
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      <input id="shoot-search" type="search" value="${esc(state.shootQuery||'')}" placeholder="제목, 장소, 구분, 참여자 검색" aria-label="일정 검색" style="flex:1 1 auto;min-width:0;border:0;outline:none;background:transparent;font-family:inherit;font-size:14px;color:#20294D">
    </label>
    <div role="tablist" aria-label="구분 필터" style="display:flex;gap:4px;padding:4px;border-radius:12px;background:#F4F6FB">${catTabs}</div>
    <div role="tablist" aria-label="상태 필터" style="display:flex;gap:4px;padding:4px;border-radius:12px;background:#F4F6FB">${filters}</div>
    <div role="tablist" aria-label="보기" style="margin-left:auto;display:flex;gap:4px;padding:4px;border-radius:12px;background:#F4F6FB">
      ${[['calendar','캘린더'],['list','목록']].map(([k,label])=>{const on=state.shootsMode===k;
        return `<button role="tab" aria-selected="${on}" data-shoots-mode="${k}" style="height:34px;padding:0 14px;border-radius:9px;border:0;background:${on?'#FFFFFF':'transparent'};color:${on?'#3F4FD0':'#64708F'};box-shadow:${on?'0 2px 8px rgba(60,72,140,0.12)':'none'};font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">${label}</button>`;}).join('')}
    </div>
  </div>

  ${state.shootsMode==='calendar'?shootsCalendar(rows):`
  <section aria-label="일정 목록" style="${CARD};padding:8px;overflow-x:auto">
    <table style="width:100%;min-width:900px;border-collapse:separate;border-spacing:0 4px;font-size:14px">
      <thead><tr style="color:#64708F;font-size:12.5px;text-align:left">
        <th scope="col" style="padding:8px 14px;font-weight:700">날짜</th>
        <th scope="col" style="padding:8px 12px;font-weight:700">시간</th>
        <th scope="col" style="padding:8px 12px;font-weight:700">제목</th>
        <th scope="col" style="padding:8px 12px;font-weight:700">장소</th>
        <th scope="col" style="padding:8px 12px;font-weight:700">참여 인원</th>
        <th scope="col" style="padding:8px 12px;font-weight:700">상태</th>
        <th scope="col" style="padding:8px 14px;font-weight:700;text-align:right">관리</th>
      </tr></thead>
      <tbody id="shoot-table">${shootRows(rows)}</tbody>
    </table>
  </section>`}`;
}
function scheduleDate(s){ return s.date ? new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric'}).format(new Date(`${s.date}T00:00:00`)) : `10월 ${18+s.id}일`; }

const PERSONAL_TONE={
  busy:   ['#EDE6FF','#4A3FB0','linear-gradient(120deg, #F1EDFF, #F6F2FF)'],
  fixed:  ['#FFE9DF','#8A3A1A','linear-gradient(120deg, #FFF2EC, #FFF6F1)'],
  free:   ['#E3F7EE','#17603F','linear-gradient(120deg, #EEFAF4, #F3FBF7)'],
  shoot:  ['#E3EAFF','#2F4FC2','linear-gradient(120deg, #EEF2FF, #F3F5FF)'],
};
function rangeLabel(r){ return `${hourLabel(r.start)} – ${hourLabel(r.end)}`; }

// 일정표에는 수업 시간표(fixedClasses)만 띄운다.
// availability(참여 가능/불가)는 주간 일정표의 인원 계산에만 쓰고 여기서는 가린다.
function personalEvents(memberId, iso){
  const dayIdx=dataDay(new Date(`${iso}T00:00:00`));
  return fixedRows
    .filter(r=>r.memberId===memberId&&Number(r.data.day)===dayIdx)
    .sort((a,b)=>Number(a.data.start)-Number(b.data.start))
    .map(r=>({kind:'fixed',title:r.data.name||r.data.title||r.data.subject||'수업',time:rangeLabel(r.data),repeat:true}));
}

function personalView(){
  if(!people.some(p=>p[7]===state.personalMemberId)) state.personalMemberId=people[0]?.[7]||'';
  const me=memberById(state.personalMemberId);
  const today=localIso();
  const base=new Date(); base.setDate(1); base.setMonth(base.getMonth()+state.personalMonth);
  const year=base.getFullYear(), month=base.getMonth();
  const first=new Date(year,month,1), lastDay=new Date(year,month+1,0).getDate();
  const lead=first.getDay();

  if(!state.personalDay||!state.personalDay.startsWith(`${year}-${pad2(month+1)}`)){
    state.personalDay=`${year}-${pad2(month+1)}-${pad2(month===new Date().getMonth()&&year===new Date().getFullYear()?new Date().getDate():1)}`;
  }

  let monthCount=0, repeatCount=0;
  const cells=[];
  for(let i=0;i<Math.ceil((lead+lastDay)/7)*7;i++){
    const day=i-lead+1, inMonth=day>=1&&day<=lastDay;
    if(!inMonth){ cells.push(`<span style="min-height:100px"></span>`); continue; }
    const iso=`${year}-${pad2(month+1)}-${pad2(day)}`;
    const evs=personalEvents(state.personalMemberId,iso);
    monthCount+=evs.length;
    repeatCount+=evs.filter(e=>e.repeat).length;
    const on=state.personalDay===iso, isToday=iso===today;
    cells.push(`<button data-personal-day="${iso}" aria-pressed="${on}" aria-label="${month+1}월 ${day}일, 일정 ${evs.length}건" style="min-height:100px;padding:8px;border-radius:14px;border:0;background:${on?'#FFFFFF':'#F7F8FC'};box-shadow:${on?'inset 0 0 0 2px #6B6AE6, 0 10px 22px rgba(90,95,224,0.18)':'none'};font-family:inherit;text-align:left;display:flex;flex-direction:column;gap:4px;cursor:pointer">
      <span class="hn-num" style="align-self:flex-start;min-width:26px;height:26px;padding:0 4px;box-sizing:border-box;border-radius:9px;background:${isToday?'linear-gradient(135deg, #4C6FE6, #7C5FD8)':'transparent'};color:${isToday?'#FFFFFF':(i%7===0?'#A8324F':'#20294D')};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800">${day}</span>
      ${evs.slice(0,2).map(e=>{const [bg,fg]=PERSONAL_TONE[e.kind];return `<span style="display:block;padding:3px 7px;border-radius:7px;background:${bg};color:${fg};font-size:11.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(e.time.split(' – ')[0])} ${esc(e.title)}</span>`;}).join('')}
    </button>`);
  }

  const selDate=new Date(`${state.personalDay}T00:00:00`);
  const selEvents=personalEvents(state.personalMemberId,state.personalDay);
  const myShoots=schedules.filter(s=>s.castIds?.includes(state.personalMemberId)&&s.date>=today).slice(0,3);

  const eventCards=selEvents.map(e=>{ const [,fg,cardBg]=PERSONAL_TONE[e.kind];
    return `<div style="padding:14px;border-radius:16px;background:${cardBg};display:flex;flex-direction:column;gap:6px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <strong style="font-size:15px;font-weight:800;color:${fg}">${esc(e.title)}</strong>
        ${e.repeat?'<span style="padding:2px 8px;border-radius:99px;background:#FFFFFF;color:#4A3FB0;font-size:11.5px;font-weight:700">매주 반복</span>':''}
      </div>
      <span class="hn-num" style="font-size:13px;font-weight:600;color:#4F5770">${esc(e.time)}</span>
    </div>`;}).join('')
    ||`<div style="padding:24px 16px;border-radius:16px;background:linear-gradient(120deg, #F3F5FF, #F6F2FF);text-align:center;color:#4F5770;font-size:14px">등록된 수업이 없어요.<br>이 날은 촬영 참여 가능으로 표시돼요.</div>`;

  return `
  <section style="position:relative;overflow:hidden;border-radius:22px;background:linear-gradient(115deg, #3E5FD9 0%, #5A5FE0 50%, #7C5FD8 100%);color:#FFFFFF;padding:20px clamp(20px, 2.4vw, 28px);box-shadow:0 18px 40px rgba(72,82,200,0.26);display:flex;flex-wrap:wrap;gap:16px 24px;align-items:center;justify-content:space-between">
    <svg aria-hidden="true" width="560" height="560" viewBox="0 0 560 560" style="position:absolute;right:22%;top:-260px;opacity:0.14;pointer-events:none"><g fill="none" stroke="#FFFFFF" stroke-width="1.5"><circle cx="280" cy="280" r="90"/><circle cx="280" cy="280" r="150"/><circle cx="280" cy="280" r="210"/><circle cx="280" cy="280" r="270"/></g></svg>
    <div style="position:relative;display:flex;flex-direction:column;gap:6px;min-width:0">
      <label style="display:inline-flex;align-items:center;gap:6px;font-size:13.5px;color:#DCE2FF">
        <select id="personal-member" aria-label="구성원 선택" style="height:30px;padding:0 8px;border-radius:9px;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.14);color:#FFFFFF;font-family:inherit;font-size:13.5px;font-weight:700">
          ${people.map(p=>`<option value="${esc(p[7])}" ${p[7]===state.personalMemberId?'selected':''} style="color:#20294D">${esc(p[0])} · ${esc(p[2])}</option>`).join('')}
        </select>님의 일정
      </label>
      <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.02em">개인 일정</h1>
      <span style="font-size:14.5px;color:#EEF0FF">촬영에 참여할 수 없는 시간을 등록하면 주간 일정표의 가능 인원에 바로 반영돼요.</span>
    </div>
    <div style="position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:10px">
      <span style="display:flex;flex-direction:column;min-width:96px;padding:8px 14px;border-radius:14px;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.26);line-height:1.3"><span style="font-size:12px;color:#DCE2FF">이번 달 수업</span><strong class="hn-num" style="font-size:20px;font-weight:800">${monthCount}<span style="font-size:12px;font-weight:600;color:#DCE2FF"> 건</span></strong></span>
      <span style="display:flex;flex-direction:column;min-width:96px;padding:8px 14px;border-radius:14px;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.26);line-height:1.3"><span style="font-size:12px;color:#DCE2FF">매주 반복</span><strong class="hn-num" style="font-size:20px;font-weight:800">${repeatCount}<span style="font-size:12px;font-weight:600;color:#DCE2FF"> 개</span></strong></span>
      <button data-action="new-personal" style="display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 18px;border-radius:12px;border:0;background:#FFFFFF;color:#3F4FD0;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 6px 16px rgba(30,30,120,0.18)"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>일정 추가</button>
    </div>
  </section>

  <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:stretch">
    <section aria-label="${year}년 ${month+1}월 캘린더" style="flex:999 1 660px;min-width:0;${CARD};padding:18px">
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:8px">
          <button data-personal-month="-1" aria-label="이전 달" style="width:36px;height:36px;border-radius:10px;border:0;background:#F2F4FB;cursor:pointer;color:#3A4466">‹</button>
          <h2 style="margin:0 4px;font-size:19px;font-weight:800">${year}년 ${month+1}월</h2>
          <button data-personal-month="1" aria-label="다음 달" style="width:36px;height:36px;border-radius:10px;border:0;background:#F2F4FB;cursor:pointer;color:#3A4466">›</button>
          <button data-personal-month="0" style="height:36px;padding:0 12px;border-radius:10px;border:0;background:#EEF2FF;color:#3F55D6;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">오늘</button>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:12px;font-size:12px;font-weight:600;color:#4F5770">
          <span style="display:inline-flex;align-items:center;gap:6px"><i style="width:12px;height:12px;border-radius:4px;background:#FFE9DF"></i>수업 시간표</span>
        </div>
      </div>
      <div style="overflow-x:auto">
        <div style="min-width:640px;padding:2px;display:grid;grid-template-columns:repeat(7, minmax(0, 1fr));gap:6px">
          ${DOW.map((d,i)=>`<span style="padding:4px 8px 2px;font-size:12.5px;font-weight:700;color:${i===0?'#A8324F':'#64708F'}">${d}</span>`).join('')}
          ${cells.join('')}
        </div>
      </div>
    </section>

    <aside aria-label="선택한 날짜" style="flex:1 1 320px;min-width:0;${CARD};display:flex;flex-direction:column">
      <div style="padding:18px 18px 12px;display:flex;align-items:center;gap:12px">
        <span style="flex:0 0 50px;height:54px;border-radius:14px;background:linear-gradient(135deg, #4C6FE6, #7C5FD8);color:#FFFFFF;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.1;box-shadow:0 8px 18px rgba(90,95,224,0.3)"><span style="font-size:11.5px;font-weight:700">${dowOf(state.personalDay)}</span><strong class="hn-num" style="font-size:20px;font-weight:800">${selDate.getDate()}</strong></span>
        <span style="display:flex;flex-direction:column;line-height:1.35"><h2 style="margin:0;font-size:17px;font-weight:800">${selDate.getMonth()+1}월 ${selDate.getDate()}일 ${dowOf(state.personalDay)}요일</h2><span style="font-size:13px;color:#64708F">${esc(me?.[0]||'구성원')} · 일정 ${selEvents.length}건</span></span>
      </div>
      <div style="padding:0 18px 18px;display:flex;flex-direction:column;gap:10px">
        ${eventCards}
        <button data-action="new-personal" style="height:44px;border-radius:12px;border:1px dashed #B5BEEA;background:transparent;color:#3F55D6;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer">+ 이 날짜에 일정 추가</button>
        <div style="margin-top:10px;padding-top:16px;border-top:1px solid #EEF0F6;display:flex;flex-direction:column;gap:8px">
          <span style="font-size:13px;font-weight:800">참여하는 촬영</span>
          ${myShoots.map(s=>`<button data-detail="${esc(s.id)}" style="display:flex;align-items:center;gap:12px;padding:10px 12px;border:0;border-radius:14px;background:#F7F8FC;color:#20294D;font-family:inherit;text-align:left;cursor:pointer">
            <span style="flex:0 0 auto;padding:4px 8px;border-radius:9px;background:#E3EAFF;color:#3F4FD0;font-size:12px;font-weight:800">${monthDay(s.date)} ${dowOf(s.date)}</span>
            <span style="display:flex;flex-direction:column;line-height:1.35"><strong style="font-size:14px;font-weight:700">${esc(s.title)}</strong><span class="hn-num" style="font-size:12.5px;color:#64708F">${esc(s.time)}</span></span>
          </button>`).join('')||'<span style="font-size:13px;color:#64708F">예정된 촬영이 없습니다.</span>'}
        </div>
      </div>
    </aside>
  </div>`;
}

// 부서 표시 순서. 여기 없는 부서는 뒤로 밀고 그들끼리 ㄱㄴㄷ순으로 둔다.
const DEPARTMENT_ORDER=['기획부','아나운서부','기술부'];
const deptRank=name=>{ const i=DEPARTMENT_ORDER.indexOf(name); return i<0?DEPARTMENT_ORDER.length:i; };

/* 부서 색. 정해진 부서는 순서대로 하나씩 가져가 절대 겹치지 않는다.
   (예전에는 이름 해시로 골라서 아나운서부와 기술부가 같은 색으로 떨어졌다.)
   목록에 없는 부서만 남은 색을 해시로 나눠 쓴다. */
const DEPT_COLORS=[['#EDE6FF','#4A3FB0'],['#E3EAFF','#2F4FC2'],['#FFE9DF','#8A3A1A'],['#E3F7EE','#17603F'],['#FFF1CC','#6E5208'],['#FDECEF','#A8324F']];
function deptColor(name){
  const i=DEPARTMENT_ORDER.indexOf(name);
  if(i>=0) return DEPT_COLORS[i%DEPT_COLORS.length];
  let h=0; for(const ch of String(name||'')) h=(h*31+ch.charCodeAt(0))>>>0;
  const rest=DEPT_COLORS.length-DEPARTMENT_ORDER.length;
  return DEPT_COLORS[DEPARTMENT_ORDER.length+(h%Math.max(1,rest))];
}
const PERSON_STATUS={'활동 중':['#E3F7EE','#17603F'],'수습':['#FFF1CC','#6E5208'],'휴학':['#EEF0F5','#4F5770']};

function peopleMatches(p){
  const q=(state.peopleQuery||'').trim().toLowerCase();
  if(q&&!`${p[0]} ${p[2]} ${p[3]}`.toLowerCase().includes(q)) return false;
  return state.peopleDept==='전체'||p[2]===state.peopleDept;
}

function peopleRows(items){
  if(!items.length) return `<tr><td colspan="5"><div style="padding:40px 20px;text-align:center;color:#64708F">조건에 맞는 구성원이 없어요.</div></td></tr>`;
  return items.map(p=>{
    const [dBg,dFg]=deptColor(p[2]);
    const [sBg,sFg]=PERSON_STATUS[p[5]]||PERSON_STATUS['활동 중'];
    return `<tr style="background:#FAFBFD">
      <td style="padding:8px 14px;border-radius:14px 0 0 14px">
        <span style="display:flex;align-items:center;gap:10px">
          <span aria-hidden="true" style="width:36px;height:36px;border-radius:12px;background:${dBg};color:${dFg};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800">${esc(initial(p[0]))}</span>
          <strong style="font-size:14.5px;font-weight:700">${esc(p[0])}</strong>
          ${/국장|대표|운영/.test(p[3])?'<span style="padding:1px 7px;border-radius:6px;background:linear-gradient(135deg, #4C6FE6, #7C5FD8);color:#FFFFFF;font-size:11px;font-weight:800">운영진</span>':''}
        </span>
      </td>
      <td style="padding:8px 12px"><span style="padding:3px 10px;border-radius:8px;background:${dBg};color:${dFg};font-size:12.5px;font-weight:700">${esc(p[2])}</span></td>
      <td style="padding:8px 12px;font-weight:600">${esc(p[3])}</td>
      <td style="padding:8px 12px"><span style="padding:3px 10px;border-radius:99px;background:${sBg};color:${sFg};font-size:12.5px;font-weight:700">${esc(p[5])}</span></td>
      <td style="padding:8px 14px;text-align:right;border-radius:0 14px 14px 0"><button data-person="${esc(p[7])}" aria-label="${esc(p[0])} 상세 보기" style="height:34px;padding:0 12px;border-radius:10px;border:0;background:#EEF2FF;color:#3F55D6;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">상세</button></td>
    </tr>`;
  }).join('');
}

function peopleView(){
  const rows=people.filter(peopleMatches);
  const depts=['전체',...new Set(people.map(p=>p[2]).filter(Boolean))];
  const tabs=depts.map(label=>{ const on=state.peopleDept===label;
    const n=label==='전체'?people.length:people.filter(p=>p[2]===label).length;
    return `<button role="tab" aria-selected="${on}" data-people-dept="${esc(label)}" style="height:34px;padding:0 12px;border-radius:9px;border:0;background:${on?'#FFFFFF':'transparent'};color:${on?'#3F4FD0':'#64708F'};box-shadow:${on?'0 2px 8px rgba(60,72,140,0.12)':'none'};font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">${esc(label)} <span class="hn-num" style="opacity:0.75">${n}</span></button>`;}).join('');
  const stats=[['전체',people.length],...Object.keys(PERSON_STATUS).map(s=>[s,people.filter(p=>p[5]===s).length])]
    .filter(([,n],i)=>i===0||n)
    .map(([label,n])=>`<span style="display:flex;flex-direction:column;min-width:84px;padding:8px 14px;border-radius:14px;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.26);line-height:1.3"><span style="font-size:12px;color:#DCE2FF">${label}</span><strong class="hn-num" style="font-size:20px;font-weight:800">${n}<span style="font-size:12px;font-weight:600;color:#DCE2FF"> 명</span></strong></span>`).join('');

  return `
  <section style="position:relative;overflow:hidden;border-radius:22px;background:linear-gradient(115deg, #3E5FD9 0%, #5A5FE0 50%, #7C5FD8 100%);color:#FFFFFF;padding:20px clamp(20px, 2.4vw, 28px);box-shadow:0 18px 40px rgba(72,82,200,0.26);display:flex;flex-wrap:wrap;gap:16px 24px;align-items:center;justify-content:space-between">
    <svg aria-hidden="true" width="560" height="560" viewBox="0 0 560 560" style="position:absolute;right:22%;top:-260px;opacity:0.14;pointer-events:none"><g fill="none" stroke="#FFFFFF" stroke-width="1.5"><circle cx="280" cy="280" r="90"/><circle cx="280" cy="280" r="150"/><circle cx="280" cy="280" r="210"/><circle cx="280" cy="280" r="270"/></g></svg>
    <div style="position:relative;display:flex;flex-direction:column;gap:2px;min-width:0">
      <span style="display:inline-flex;align-items:center;gap:6px;font-size:13.5px;color:#DCE2FF"><svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>관리자 권한으로 보는 중</span>
      <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.02em">인원 관리</h1>
      <span style="font-size:14.5px;color:#EEF0FF">구성원을 검색하고 부서·직책을 관리해요.</span>
    </div>
    <div style="position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:10px">
      ${stats}
      <button data-action="new-person" style="display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 18px;border-radius:12px;border:0;background:#FFFFFF;color:#3F4FD0;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 6px 16px rgba(30,30,120,0.18)"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>구성원 등록</button>
    </div>
  </section>

  <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:10px;border-radius:18px;background:rgba(255,255,255,0.9);border:1px solid #FFFFFF;box-shadow:0 8px 24px rgba(60,72,140,0.06)">
    <label style="flex:1 1 260px;max-width:380px;display:flex;align-items:center;gap:8px;height:42px;padding:0 12px;border-radius:12px;background:#F4F6FB;color:#64708F">
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      <input id="people-search" type="search" value="${esc(state.peopleQuery||'')}" placeholder="이름, 부서, 직책 검색" aria-label="구성원 검색" style="flex:1 1 auto;min-width:0;border:0;outline:none;background:transparent;font-family:inherit;font-size:14px;color:#20294D">
    </label>
    <div role="tablist" aria-label="부서" style="display:flex;flex-wrap:wrap;gap:4px;padding:4px;border-radius:12px;background:#F4F6FB">${tabs}</div>
    <span style="margin-left:auto;font-size:13px;color:#64708F">${rows.length}명 표시</span>
  </div>

  <section aria-label="구성원 목록" style="${CARD};padding:8px;overflow-x:auto">
    <table style="width:100%;min-width:640px;border-collapse:separate;border-spacing:0 4px;font-size:14px">
      <thead><tr style="color:#64708F;font-size:12.5px;text-align:left">
        <th scope="col" style="padding:8px 14px;font-weight:700">이름</th>
        <th scope="col" style="padding:8px 12px;font-weight:700">부서</th>
        <th scope="col" style="padding:8px 12px;font-weight:700">직책</th>
        <th scope="col" style="padding:8px 12px;font-weight:700">상태</th>
        <th scope="col" style="padding:8px 14px;font-weight:700;text-align:right">관리</th>
      </tr></thead>
      <tbody id="people-table">${peopleRows(rows)}</tbody>
    </table>
  </section>`;
}

function pref(key,fallback=true){const value=localStorage.getItem(`hnubs:${key}`);return value===null?fallback:value==='true';}
function serviceSettings(section='service'){
  if(section==='alerts'){const options=[['shoot-alert','촬영 일정 알림','일정 시작 하루 전과 1시간 전에 알려드려요.'],['notice-alert','공지사항 알림','중요 공지가 등록되면 알려드려요.']];return `<section class="panel settings-section"><h2>알림</h2><p>이 기기에서 받을 업무 알림을 선택하세요.</p>${options.map(([key,title,desc])=>{const active=pref(key,true);return `<div class="setting-row"><span><strong>${title}</strong><small>${desc}</small></span><button class="switch ${active?'active':''}" data-setting="${key}" role="switch" aria-label="${title}" aria-checked="${active}"></button></div>`}).join('')}</section>`;}
  if(section==='defaults'){return `<section class="panel settings-section"><h2>일정 기본값</h2><p>새 촬영 일정을 만들 때 먼저 채워 둘 값을 정합니다.</p><div class="form-stack settings-form"><label class="field"><span>기본 촬영 시간</span><select data-preference="shoot-duration"><option value="2">2시간</option><option value="3">3시간</option><option value="4">4시간</option></select></label><label class="field"><span>기본 일정 유형</span><select data-preference="shoot-category"><option>촬영</option><option>회의</option><option>인터뷰</option></select></label><small>설정은 현재 기기에 저장됩니다.</small></div></section>`;}
  if(section==='display'){const active=pref('reduce-motion',false);return `<section class="panel settings-section"><h2>화면 설정</h2><p>화면 움직임과 표시 방식을 편하게 조절하세요.</p><div class="setting-row"><span><strong>동작 줄이기</strong><small>화면 전환 애니메이션을 최소화합니다.</small></span><button class="switch ${active?'active':''}" data-setting="reduce-motion" role="switch" aria-label="동작 줄이기" aria-checked="${active}"></button></div></section>`;}
  return `<section class="panel settings-section"><h2>시범 운영 안내</h2><p>올해는 로그인 없이 기능을 검증하고, 2027년 정식 운영 시 계정 기능을 추가할 예정입니다.</p><div class="pilot-banner"><span class="status-icon">β</span><span><strong>HNUBS workspace</strong><small>시범 운영 · 로그인 없음</small></span><span class="badge lavender">BETA</span></div></section>`;
}
function driveSettings(){
  return `<section class="panel settings-section"><h2>공유드라이브</h2><p>저장소 총 용량과 구글 드라이브 동기화를 설정합니다. 설정 창은 공유드라이브 화면 위에서 열려요.</p>
    <div class="setting-row"><span><strong>총 용량 설정 · 구글 동기화</strong><small>드라이브 전체 용량과 연동 계정을 여기서 바꿉니다.</small></span>
    <button class="secondary-button" data-drive-settings="1">열기</button></div></section>`;
}
function systemLogSettings(){
  const stamp=firebaseState.updatedAt?new Intl.DateTimeFormat('ko-KR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(firebaseState.updatedAt):'연결 확인 중';
  const status=firebaseState.error?'오류':firebaseState.connected?'성공':'연결 중';
  const tone=firebaseState.error?'pink':firebaseState.connected?'mint':'yellow';
  const rows=[['members',people.length],['shoots',schedules.length],['projects',Object.keys(projects).length],['availability',availabilityRows.length],['fixedClasses',fixedRows.length]];
  return `<section class="panel settings-section system-log"><div class="log-heading"><div><h2>시스템 로그</h2><p>Firebase 데이터 연결 상태를 이 화면에서만 확인합니다.</p></div><button class="secondary-button" id="reload-data">${icon('loader')}새로고침</button></div><div class="log-summary"><span class="status-icon ${tone}">${icon(firebaseState.error?'help-circle':'check')}</span><span><strong>scheduler Firebase</strong><small>${firebaseState.error?`연결 오류 · ${esc(firebaseState.error)}`:`${stamp} 기준 · ${rows.length}개 컬렉션 확인`}</small></span><span class="badge ${tone}">${status}</span></div><div class="log-table-wrap"><table class="data-table log-table"><thead><tr><th>시간</th><th>상태</th><th>소스</th><th>컬렉션</th><th>상세</th></tr></thead><tbody>${rows.map(([name,count])=>`<tr><td>${stamp}</td><td><span class="log-status ${tone}"><i></i>${status}</span></td><td>scheduler/Firebase</td><td><strong>${name}</strong></td><td>${firebaseState.error?'연결을 확인해 주세요.':`${count}개 항목을 불러왔습니다.`}</td></tr>`).join('')}</tbody></table></div></section>`;
}
const SETTINGS_NAV=[
  ['people','users','인원 관리','구성원을 검색하고 부서·직책을 관리해요.'],
  ['service','help-circle','서비스 안내','시범 운영 환경을 확인하세요.'],
  ['alerts','bell','알림','이 기기에서 받을 업무 알림을 선택하세요.'],
  ['defaults','calendar','일정 기본값','새 일정을 만들 때 먼저 채울 값을 정합니다.'],
  ['display','settings','화면 설정','화면 움직임과 표시 방식을 조절하세요.'],
  ['drive','folder','공유드라이브','저장소 총 용량과 구글 동기화를 설정하세요.'],
  ['logs','file','시스템 로그','Firebase 연동 이력과 데이터 상태를 확인하세요.'],
];

/* 설정 잠금.
   비밀번호는 서버(/api/maintenance)에서만 확인한다. 화면에서 비교하면 개발자 도구로 뚫린다.
   서버에 닿지 못하면 잠긴 채로 둔다 — 예전 게이트가 fail-open 이라 비번 없이 들어가졌던 적이 있다.
   이 잠금은 '설정 화면을 가리는 것'이지 데이터를 지키는 게 아니다.
   Firestore 규칙이 열려 있어서 데이터 자체는 따로 막아야 한다. */
const adminUnlocked = () => sessionStorage.getItem('hnubs:admin') === 'ok';

async function adminVerify(password){
  const res = await fetch(`${apiBase()}/api/maintenance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ action: 'verify', password }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok && data.ok) return { ok: true };
  if (res.status === 429) return { ok: false, message: data.error || '잠시 후 다시 시도해 주세요.' };
  if (res.status === 503) return { ok: false, message: '서버에 관리자 비밀번호가 설정되지 않았습니다.' };
  if (res.status === 401) return { ok: false, message: '비밀번호가 올바르지 않습니다.' };
  // 정적 서버로 열면 함수가 없다 (python http.server 는 501, 미배포는 404).
  if ([404, 405, 501].includes(res.status))
    return { ok: false, message: '이 주소에는 관리 서버가 없습니다. 배포된 사이트에서 열어 주세요.' };
  return { ok: false, message: data.error || `확인하지 못했습니다 (${res.status}).` };
}

function adminGateView(){
  // 잠금 화면에는 히어로를 띄우지 않는다. 비밀번호를 통과해야 설정 화면이 나온다.
  return `
  <section style="${CARD};box-sizing:border-box;width:min(520px, 100%);margin:min(9vh, 80px) auto 0;padding:40px;display:flex;flex-direction:column;gap:20px">
    <span aria-hidden="true" style="width:60px;height:60px;border-radius:19px;background:linear-gradient(140deg, #E3EAFF, #EDE6FF);color:#3F4FD0;display:flex;align-items:center;justify-content:center"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></span>
    <div style="display:flex;flex-direction:column;gap:6px">
      <h2 style="margin:0;font-size:24px;font-weight:800;letter-spacing:-0.01em">관리자 비밀번호</h2>
      <p style="margin:0;font-size:15px;color:#64708F">설정과 인원 관리는 운영진만 볼 수 있어요.</p>
    </div>
    <form id="admin-form" style="display:flex;flex-direction:column;gap:12px">
      <input id="admin-pw" type="password" autocomplete="current-password" placeholder="비밀번호" required
        style="height:56px;padding:0 18px;border-radius:14px;border:1px solid #E6E9F3;background:#F8F9FD;font-family:inherit;font-size:16px;color:#20294D">
      <button type="submit" id="admin-submit" style="height:56px;border:0;border-radius:14px;background:linear-gradient(135deg, #416FDE, #6656DA);color:#FFFFFF;font-family:inherit;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 10px 22px rgba(82,100,224,0.28)">확인</button>
    </form>
    <p id="admin-msg" role="status" style="margin:0;min-height:20px;font-size:14px;font-weight:600;color:#A8324F"></p>
  </section>`;
}

function settingsViewLocked(){ return adminUnlocked() ? settingsView() : adminGateView(); }

function settingsView(){
  const current=SETTINGS_NAV.find(n=>n[0]===state.settingsSection)||SETTINGS_NAV[0];
  const nav=SETTINGS_NAV.map(([id,ico,label])=>{ const on=state.settingsSection===id;
    return `<button data-settings-section="${id}" style="display:flex;align-items:center;gap:10px;height:42px;padding:0 12px;border:0;border-radius:12px;background:${on?'#EEF2FF':'transparent'};color:${on?'#3F55D6':'#3A4466'};font-family:inherit;font-size:14px;font-weight:${on?700:600};cursor:pointer;text-align:left">${icon(ico)}${label}</button>`;}).join('');

  const body=state.settingsSection==='people'?peopleSettings()
    :state.settingsSection==='drive'?driveSettings()
    :state.settingsSection==='logs'?systemLogSettings()
    :serviceSettings(state.settingsSection);

  return `
  <section style="position:relative;overflow:hidden;border-radius:22px;background:linear-gradient(115deg, #3E5FD9 0%, #5A5FE0 50%, #7C5FD8 100%);color:#FFFFFF;padding:20px clamp(20px, 2.4vw, 28px);box-shadow:0 18px 40px rgba(72,82,200,0.26);display:flex;flex-wrap:wrap;gap:16px 24px;align-items:center;justify-content:space-between">
    <svg aria-hidden="true" width="560" height="560" viewBox="0 0 560 560" style="position:absolute;right:22%;top:-260px;opacity:0.14;pointer-events:none"><g fill="none" stroke="#FFFFFF" stroke-width="1.5"><circle cx="280" cy="280" r="90"/><circle cx="280" cy="280" r="150"/><circle cx="280" cy="280" r="210"/><circle cx="280" cy="280" r="270"/></g></svg>
    <div style="position:relative;display:flex;flex-direction:column;gap:2px;min-width:0">
      <span style="display:inline-flex;align-items:center;gap:6px;font-size:13.5px;color:#DCE2FF"><svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>관리자 권한으로 보는 중</span>
      <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.02em">설정</h1>
      <span style="font-size:14.5px;color:#EEF0FF">${esc(current[3])}</span>
    </div>
    ${state.settingsSection==='people'?`<button data-action="new-person" style="position:relative;display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 18px;border-radius:12px;border:0;background:#FFFFFF;color:#3F4FD0;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 6px 16px rgba(30,30,120,0.18)"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>구성원 등록</button>`:''}
  </section>

  <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">
    <nav aria-label="설정 분류" style="flex:1 1 220px;max-width:260px;min-width:200px;${CARD};padding:10px;display:flex;flex-direction:column;gap:2px">${nav}</nav>
    <div style="flex:999 1 560px;min-width:0;display:flex;flex-direction:column;gap:16px">${body}</div>
  </div>`;
}

function peopleSettings(){
  const rows=people.filter(peopleMatches);
  const depts=['전체',...new Set(people.map(p=>p[2]).filter(Boolean))];
  const tabs=depts.map(label=>{ const on=state.peopleDept===label;
    const n=label==='전체'?people.length:people.filter(p=>p[2]===label).length;
    return `<button role="tab" aria-selected="${on}" data-people-dept="${esc(label)}" style="height:34px;padding:0 12px;border-radius:9px;border:0;background:${on?'#FFFFFF':'transparent'};color:${on?'#3F4FD0':'#64708F'};box-shadow:${on?'0 2px 8px rgba(60,72,140,0.12)':'none'};font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">${esc(label)} <span class="hn-num" style="opacity:0.75">${n}</span></button>`;}).join('');

  return `
  <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:10px;border-radius:18px;background:rgba(255,255,255,0.9);border:1px solid #FFFFFF;box-shadow:0 8px 24px rgba(60,72,140,0.06)">
    <label style="flex:1 1 240px;max-width:380px;display:flex;align-items:center;gap:8px;height:42px;padding:0 12px;border-radius:12px;background:#F4F6FB;color:#64708F">
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      <input id="people-search" type="search" value="${esc(state.peopleQuery||'')}" placeholder="이름, 부서, 직책 검색" aria-label="구성원 검색" style="flex:1 1 auto;min-width:0;border:0;outline:none;background:transparent;font-family:inherit;font-size:14px;color:#20294D">
    </label>
    <div role="tablist" aria-label="부서" style="display:flex;flex-wrap:wrap;gap:4px;padding:4px;border-radius:12px;background:#F4F6FB">${tabs}</div>
    <span style="margin-left:auto;font-size:13px;color:#64708F">${rows.length}명 표시</span>
  </div>

  <section aria-label="구성원 목록" style="${CARD};padding:8px;overflow-x:auto">
    <table style="width:100%;min-width:640px;border-collapse:separate;border-spacing:0 4px;font-size:14px">
      <thead><tr style="color:#64708F;font-size:12.5px;text-align:left">
        <th scope="col" style="padding:8px 14px;font-weight:700">이름</th>
        <th scope="col" style="padding:8px 12px;font-weight:700">부서</th>
        <th scope="col" style="padding:8px 12px;font-weight:700">직책</th>
        <th scope="col" style="padding:8px 12px;font-weight:700">상태</th>
        <th scope="col" style="padding:8px 14px;font-weight:700;text-align:right">관리</th>
      </tr></thead>
      <tbody id="people-table">${peopleRows(rows)}</tbody>
    </table>
  </section>`;
}

const views={home:homeView,schedule:scheduleView,maker:makerView,drive:driveView,personal:personalView,notices:noticesView,settings:settingsViewLocked};

function render(){
  // 인원 관리는 설정 안으로 옮겼다. 예전 #people 주소도 그쪽으로 보낸다.
  if(state.route==='people'){ state.settingsSection='people'; state.route='settings'; }
  // 시간 분석은 주간 일정표와 같은 계산이라 없앴다. 옛 주소는 그쪽으로 보낸다.
  if(state.route==='analysis') state.route='weekly';
  // 대본 분석과 쇼츠는 메이커스페이스 안으로 들어갔다. 예전 주소도 그쪽으로 보낸다.
  if(state.route==='script'||state.route==='shorts'){ state.makerTab=state.route; state.route='maker'; }
  if(state.route==='weekly'||state.route==='shoots'){ state.scheduleTab=state.route; state.route='schedule'; }
  if(!views[state.route]) state.route='home';
  $('#app').innerHTML=views[state.route]();
  $$('[data-route]').forEach(b=>b.classList.toggle('active',b.dataset.route===state.route));
  document.body.classList.toggle('hn-shorts', state.route==='maker' && state.makerTab==='shorts');
  renderNotifications();
  hydrateIcons(); bindView(); document.title=`${{home:'홈',schedule:'일정',maker:'메이커스페이스',drive:'공유드라이브',notices:'공지사항',personal:'개인 일정',people:'인원 관리',settings:'설정'}[state.route]} · HNUBS`;
}

function renderNotifications(){
  const list=$('#notification-list'); if(!list) return;
  const now=Date.now();
  const soon=schedules.filter(s=>s.date&&new Date(`${s.date}T${hourLabel(s.startH)}:00`).getTime()>=now).slice(0,3);
  list.innerHTML=soon.map(s=>`<button class="notification-item" type="button" data-detail="${esc(s.id)}"><span class="notice-icon blue" data-icon="calendar"></span><span><strong>${esc(monthDay(s.date))} ${esc(s.time)} ${esc(s.title)}</strong><small>${esc(s.place||'장소 미정')} · ${s.people.length}명</small></span></button>`).join('')
    ||`<div class="empty-row"><span>예정된 촬영이 없습니다.</span></div>`;
  $('#notification-button')?.querySelector('.hn-dot')?.toggleAttribute('hidden',!soon.length);
  hydrateIcons(list);
}

// 홈의 NEXT CUE 카운트다운 — 홈에 있을 때만 다시 그린다.
setInterval(()=>{ if(state.route==='home'&&!document.hidden) render(); },30000);

function bindView(){
  $$('[data-shoot-pick]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();state.selectedShoot=b.dataset.shootPick;render();}));
  $('#ai-project')?.addEventListener('change',e=>{state.aiProjectId=e.target.value;state.aiJob=null;state.aiSceneIndex=0;render();});
  $$('[data-maker-tab]').forEach(b=>b.addEventListener('click',()=>{state.makerTab=b.dataset.makerTab;render();}));
  $$('[data-schedule-tab]').forEach(b=>b.addEventListener('click',()=>{state.scheduleTab=b.dataset.scheduleTab;render();}));
  $$('[data-shorts-reload]').forEach(b=>b.addEventListener('click',shortsProbe));
  $$('[data-shorts-setup]').forEach(b=>b.addEventListener('click',()=>{state.shortsSetup=!state.shortsSetup;render();}));
  $('#shorts-form')?.addEventListener('submit',e=>{
    e.preventDefault();
    const f=e.currentTarget;
    localStorage.setItem('hnubs:shorts-base',f.base.value.trim().replace(/\/$/,''));
    localStorage.setItem('hnubs:shorts-key',f.key.value.trim());
    state.shortsSetup=false; shortsProbe();
  });
  if(state.route==='maker'&&state.makerTab==='shorts'&&state.shortsState==='idle') shortsProbe();
  $('#admin-form')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const pw=$('#admin-pw'), btn=$('#admin-submit'), msg=$('#admin-msg');
    if(!pw.value) return;
    btn.disabled=true; btn.textContent='확인 중…'; msg.textContent='';
    try{
      const result=await adminVerify(pw.value);
      if(result.ok){ sessionStorage.setItem('hnubs:admin','ok'); render(); return; }
      msg.textContent=result.message;
    }catch{
      // 서버에 못 닿으면 열어 주지 않는다. 열어 주면 비번이 의미가 없어진다.
      msg.textContent='AI/관리 서버에 연결하지 못했습니다. 배포된 사이트에서 시도해 주세요.';
    }
    btn.disabled=false; btn.textContent='확인'; pw.value=''; pw.focus();
  });
  $$('[data-ai-step]').forEach(b=>b.addEventListener('click',()=>{state.aiStep=Number(b.dataset.aiStep);render();}));
  $$('[data-ai-precision]').forEach(b=>b.addEventListener('click',()=>{state.aiPrecision=b.dataset.aiPrecision;render();}));
  $('#ai-pick')?.addEventListener('click',()=>$('#ai-file').click());
  $('#ai-file')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)aiExtract(f);});
  $('#ai-start')?.addEventListener('click',aiStart);
  $$('[data-ai-scene]').forEach(b=>b.addEventListener('click',()=>{state.aiSceneIndex=Number(b.dataset.aiScene);render();}));
  $$('[data-ai-retry]').forEach(b=>b.addEventListener('click',()=>aiRetry(Number(b.dataset.aiRetry))));
  $$('[data-ai-week]').forEach(b=>b.addEventListener('click',()=>{state.aiWeek+=Number(b.dataset.aiWeek);render();}));
  $$('[data-ai-cand]').forEach(b=>b.addEventListener('click',()=>openShootDrawer()));
  $$('[data-ai-map]').forEach(sel=>sel.addEventListener('change',()=>{state.aiMappings={...state.aiMappings,[sel.dataset.aiMap]:sel.value};render();}));
  $$('[data-week-slot]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.weekSlot;state.slots=state.slots.includes(k)?state.slots.filter(x=>x!==k):[...state.slots,k];render();}));
  $$('[data-week-step]').forEach(b=>b.addEventListener('click',()=>{const step=Number(b.dataset.weekStep);state.weekOffset=step?state.weekOffset+step:0;state.slots=[];render();}));
  $$('[data-week-clear]').forEach(b=>b.addEventListener('click',()=>{state.slots=[];render();}));
  $$('[data-must-remove]').forEach(b=>b.addEventListener('click',()=>{state.mustIds=state.mustIds.filter(id=>id!==b.dataset.mustRemove);render();}));
  $('#must-add')?.addEventListener('change',e=>{if(e.target.value){state.mustIds=[...state.mustIds,e.target.value];render();}});
  $$('[data-slot]').forEach(b=>b.addEventListener('click',()=>{state.selectedSlot=b.dataset.slot;render();if(innerWidth<768) openSlotDrawer();}));
  $$('[data-mobile-day]').forEach(b=>b.addEventListener('click',()=>{state.mobileDay=Number(b.dataset.mobileDay);render();}));
  $('#shoot-search')?.addEventListener('input',e=>{state.shootQuery=e.target.value;$('#shoot-table').innerHTML=shootRows(schedules.filter(shootMatches));});
  $$('[data-shoot-filter]').forEach(b=>b.addEventListener('click',()=>{state.shootFilter=b.dataset.shootFilter;render();}));
  $$('[data-notice-tag]').forEach(b=>b.addEventListener('click',()=>{state.noticeTag=b.dataset.noticeTag;render();}));
  $$('[data-shoot-category]').forEach(b=>b.addEventListener('click',()=>{state.shootCategory=b.dataset.shootCategory;render();}));
  $$('[data-shoots-mode]').forEach(b=>b.addEventListener('click',()=>{state.shootsMode=b.dataset.shootsMode;render();}));
  $$('[data-shoot-month]').forEach(b=>b.addEventListener('click',()=>{const step=Number(b.dataset.shootMonth);state.shootMonth=step?state.shootMonth+step:0;state.shootDay='';render();}));
  $$('[data-shoot-day]').forEach(b=>b.addEventListener('click',()=>{state.shootDay=state.shootDay===b.dataset.shootDay?'':b.dataset.shootDay;render();}));
  $$('[data-shoot-day-clear]').forEach(b=>b.addEventListener('click',()=>{state.shootDay='';render();}));
  $('#people-search')?.addEventListener('input',e=>{state.peopleQuery=e.target.value;$('#people-table').innerHTML=peopleRows(people.filter(peopleMatches));});
  $$('[data-people-dept]').forEach(b=>b.addEventListener('click',()=>{state.peopleDept=b.dataset.peopleDept;render();}));
  $$('[data-mini-month]').forEach(b=>b.addEventListener('click',()=>{state.homeMonth+=Number(b.dataset.miniMonth);render();}));
  $$('[data-mini-day]').forEach(b=>b.addEventListener('click',()=>{const hit=schedules.find(x=>x.date===b.dataset.miniDay);if(hit)openScheduleDetail(hit.id);}));
  $$('[data-personal-day]').forEach(b=>b.addEventListener('click',()=>{state.personalDay=b.dataset.personalDay;render();}));
  $$('[data-personal-month]').forEach(b=>b.addEventListener('click',()=>{const step=Number(b.dataset.personalMonth);state.personalMonth=step?state.personalMonth+step:0;state.personalDay='';render();}));
  $('#personal-member')?.addEventListener('change',e=>{state.personalMemberId=e.target.value;render();});
  $$('[data-drive-settings]').forEach(b=>b.addEventListener('click',()=>{state.driveSettings=true;navigate('drive');}));
  $$('[data-settings-section]').forEach(button=>button.addEventListener('click',()=>{state.settingsSection=button.dataset.settingsSection;render();}));
  $('#reload-data')?.addEventListener('click',()=>location.reload());
  $$('.switch').forEach(s=>s.addEventListener('click',()=>{s.classList.toggle('active');const active=s.classList.contains('active');s.setAttribute('aria-checked',active);if(s.dataset.setting)localStorage.setItem(`hnubs:${s.dataset.setting}`,String(active));if(s.dataset.setting==='reduce-motion')document.documentElement.classList.toggle('reduce-motion',active);toast('이 기기에 설정이 저장되었습니다.')}));
  $$('[data-preference]').forEach(select=>{const key=`hnubs:${select.dataset.preference}`;const saved=localStorage.getItem(key);if(saved!==null)select.value=saved;select.addEventListener('change',()=>{localStorage.setItem(key,select.value);toast('이 기기에 기본값이 저장되었습니다.');});});
}

function navigate(route){ if(route==='people'){state.settingsSection='people';route='settings';} if(route==='analysis')route='weekly';
  if(route==='weekly'||route==='shoots'){state.scheduleTab=route;route='schedule';}
  if(route==='script'||route==='shorts'){ state.makerTab=route; route='maker'; } state.route=route; location.hash=route; closeMobileMenu(); closePopovers(); render(); scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); }
document.addEventListener('click',e=>{
  const routeTarget=e.target.closest('[data-route]');const route=routeTarget?.dataset.route;if(route){if(routeTarget.dataset.settingsTarget)state.settingsSection=routeTarget.dataset.settingsTarget;navigate(route);return;}
  const action=e.target.closest('[data-action]')?.dataset.action;if(action==='new-shoot')openShootDrawer();if(action==='new-personal')openPersonalDrawer();if(action==='new-person')openPersonDrawer();if(action==='new-notice')openNoticeDrawer();if(action==='close-drawer')closeDrawer();if(action==='close-popover')closePopovers();if(action==='close-mobile-menu')closeMobileMenu();
  const detail=e.target.closest('[data-detail]')?.dataset.detail;if(detail)openScheduleDetail(detail);
  const notice=e.target.closest('[data-notice]')?.dataset.notice;if(notice)openNoticeDetail(notice);
  const person=e.target.closest('[data-person]')?.dataset.person;if(person!==undefined)openPersonDetail(person);
});

function drawerTemplate(title,body,footer=''){return `<div class="drawer-head"><h2>${title}</h2><button class="icon-button" data-action="close-drawer" aria-label="닫기">${icon('x')}</button></div><div class="drawer-body">${body}</div>${footer?`<div class="drawer-footer">${footer}</div>`:''}`}
function openDrawer(html){$('#drawer-content').innerHTML=html;hydrateIcons($('#drawer'));$('#drawer-backdrop').hidden=false;$('#drawer').classList.add('open');$('#drawer').setAttribute('aria-hidden','false');setTimeout(()=>$('#drawer button, #drawer input')?.focus(),80)}
function closeDrawer(){$('#drawer').classList.remove('open');$('#drawer').setAttribute('aria-hidden','true');setTimeout(()=>$('#drawer-backdrop').hidden=true,250)}
function openShootDrawer(){
  const defaultDate=localIso();
  openDrawer(drawerTemplate('일정 등록',`<form id="shoot-form" class="form-stack"><label class="field"><span>구분 *</span><select name="category">${CATEGORIES.map(c=>`<option>${c[0]}</option>`).join('')}</select></label><label class="field"><span>제목 *</span><input name="title" required placeholder="예: 10월 캠퍼스 뉴스"></label><div class="check-grid"><label class="field"><span>날짜 *</span><input name="date" type="date" required value="${defaultDate}"></label><label class="field"><span>시작 시간 *</span><input name="time" type="time" required value="14:00"></label></div><label class="field"><span>장소 *</span><input name="place" required placeholder="예: 본관 앞"></label><label class="field"><span>담당 인원</span><select name="people" multiple size="4">${people.map(p=>`<option value="${esc(p[7])}">${esc(p[0])} · ${esc(p[2])}</option>`).join('')}</select><small>Ctrl 또는 ⌘ 키를 누르면 여러 명을 선택할 수 있어요.</small></label><label class="field"><span>메모</span><textarea name="memo" placeholder="준비물이나 전달 사항을 적어주세요."></textarea></label></form>`,`<button class="secondary-button" data-action="close-drawer">취소</button><button class="primary-button" id="save-shoot">등록하기</button>`));
  $('#save-shoot').onclick=async()=>{const f=$('#shoot-form');if(!f.reportValidity())return;const button=$('#save-shoot');button.disabled=true;button.textContent='저장 중…';const startH=Number(f.time.value.slice(0,2))+Number(f.time.value.slice(3,5))/60;const castIds=[...f.people.selectedOptions].map(o=>o.value);const ref=doc(collection(db,'shoots'));try{await setDoc(ref,{date:f.date.value,title:f.title.value.trim(),category:f.category.value,uploadWeek:'',startH,endH:Math.min(startH+2,24),location:f.place.value.trim(),note:f.memo.value.trim(),castIds,cast:castIds.map(id=>({id,name:memberById(id)?.[0]||''})),projectId:'',createdAt:serverTimestamp(),updatedAt:serverTimestamp()});closeDrawer();toast(f.category.value+' 일정이 Firebase에 등록되었습니다.');}catch(error){button.disabled=false;button.textContent='다시 시도';toast(`저장하지 못했습니다: ${error.code||error.message}`);}};
}
function openPersonalDrawer(){
  openDrawer(drawerTemplate('개인 일정 추가',`<form id="personal-form" class="form-stack"><label class="field"><span>구성원 *</span><select name="member" required><option value="">선택하세요</option>${people.map(p=>`<option value="${esc(p[7])}">${esc(p[0])} · ${esc(p[2])}</option>`).join('')}</select></label><label class="field"><span>일정 메모</span><input name="memo" placeholder="예: 전공 수업"></label><label class="field"><span>날짜 *</span><input name="date" required type="date" value="${localIso()}"></label><div class="check-grid"><label class="field"><span>시작 *</span><input name="start" required type="time" value="09:00"></label><label class="field"><span>종료 *</span><input name="end" required type="time" value="10:00"></label></div><label class="field"><span>이 시간에는</span><select name="status"><option value="불가능">참여 불가능</option><option value="가능">참여 가능</option></select></label></form>`,`<button class="secondary-button" data-action="close-drawer">취소</button><button class="primary-button" id="save-personal">저장하기</button>`));
  $('#save-personal').onclick=async()=>{const f=$('#personal-form');if(!f.reportValidity())return;const start=Number(f.start.value.slice(0,2))+Number(f.start.value.slice(3,5))/60;const end=Number(f.end.value.slice(0,2))+Number(f.end.value.slice(3,5))/60;if(end<=start){toast('종료 시간은 시작 시간보다 늦어야 합니다.');return;}const button=$('#save-personal');button.disabled=true;button.textContent='저장 중…';const range=[{start,end}];try{await setDoc(doc(db,'members',f.member.value,'availability',f.date.value),{memberId:f.member.value,date:f.date.value,status:f.status.value,entryMode:'range',availableRanges:f.status.value==='가능'?range:[],unavailableRanges:f.status.value==='불가능'?range:[],memo:f.memo.value.trim(),mandatory:false,createdAt:serverTimestamp(),updatedAt:serverTimestamp()},{merge:true});closeDrawer();toast('개인 일정이 Firebase에 저장되었습니다.');}catch(error){button.disabled=false;button.textContent='다시 시도';toast(`저장하지 못했습니다: ${error.code||error.message}`);}};
}
function openPersonDrawer(){
  openDrawer(drawerTemplate('구성원 등록',`<form id="person-form" class="form-stack"><label class="field"><span>이름 *</span><input name="name" required autocomplete="name" placeholder="이름"></label><div class="check-grid"><label class="field"><span>부서 *</span><select name="department">${DEPARTMENT_ORDER.map(d=>`<option>${d}</option>`).join('')}</select></label><label class="field"><span>직책</span><input name="role" placeholder="예: PD"></label></div><label class="field"><span>연락처</span><input name="contact" type="tel" autocomplete="tel" placeholder="010-0000-0000"></label></form>`,`<button class="secondary-button" data-action="close-drawer">취소</button><button class="primary-button" id="save-person">등록하기</button>`));
  $('#save-person').onclick=async()=>{const f=$('#person-form');if(!f.reportValidity())return;const button=$('#save-person');button.disabled=true;button.textContent='저장 중…';const ref=doc(collection(db,'members'));try{await setDoc(ref,{name:f.name.value.trim(),department:f.department.value,role:f.role.value.trim()||'구성원',contact:f.contact.value.trim(),status:'활동 중',createdAt:serverTimestamp(),updatedAt:serverTimestamp()});closeDrawer();toast('구성원이 Firebase에 등록되었습니다.');}catch(error){button.disabled=false;button.textContent='다시 시도';toast(`저장하지 못했습니다: ${error.code||error.message}`);}};
}
// 역할은 촬영이 아니라 프로젝트(화)에 붙어 있다: roles.planning / production / cast.
// 값이 ['id', …] 일 때도 [{id,name}, …] 일 때도 있어서 둘 다 받는다.
const ROLE_LABELS=[['planning','기획','#EDE6FF','#4A3FB0'],['production','촬영','#E3EAFF','#2F4FC2'],['cast','출연','#E3F7EE','#17603F']];
function roleIds(project,key){ return (project?.roles?.[key]||[]).map(v=>typeof v==='string'?v:v?.id).filter(Boolean); }
function memberRole(projectId,memberId){
  const project=projects[projectId];
  for(const [key,label,bg,fg] of ROLE_LABELS) if(roleIds(project,key).includes(memberId)) return [label,bg,fg];
  return null;
}

function personRow(memberId,name,role){
  const p=memberById(memberId);
  const [dBg,dFg]=deptColor(p?.[2]);
  const label=role?`<span style="padding:2px 9px;border-radius:99px;background:${role[1]};color:${role[2]};font-size:12px;font-weight:700;white-space:nowrap">${role[0]}</span>`
    :'<span style="font-size:12.5px;color:#64708F;white-space:nowrap">참여</span>';
  return `<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;background:#F8F9FD">
    <span aria-hidden="true" style="width:30px;height:30px;border-radius:10px;background:${dBg};color:${dFg};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800">${esc(initial(name))}</span>
    <span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;line-height:1.3"><strong style="font-size:14px;font-weight:700">${esc(name)}</strong><span style="font-size:12px;color:#64708F">${esc(p?.[2]||'부서 미정')}</span></span>
    ${label}
  </div>`;
}

function openScheduleDetail(id){
  const s=schedules.find(x=>x.id===id); if(!s) return;
  const project=projects[s.raw?.projectId];
  const cast=Array.isArray(s.raw?.cast)?s.raw.cast:[];
  const members=(s.castIds?.length?s.castIds:cast.map(c=>c?.id).filter(Boolean))
    .map(mid=>({id:mid,name:memberById(mid)?.[0]||cast.find(c=>c?.id===mid)?.name||'이름 미확인',role:memberRole(s.raw?.projectId,mid)}));
  // 역할 순서(기획 → 촬영 → 출연 → 미지정)로 묶어 보여준다.
  const order=['기획','촬영','출연'];
  members.sort((a,b)=>(order.indexOf(a.role?.[0])+1||99)-(order.indexOf(b.role?.[0])+1||99));

  const roleSummary=ROLE_LABELS.map(([key,label,bg,fg])=>{
    const names=roleIds(project,key).map(mid=>memberById(mid)?.[0]).filter(Boolean);
    if(!names.length) return '';
    return `<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:99px;background:${bg};color:${fg};font-size:12.5px;font-weight:700">${label} · ${esc(names.join(', '))}</span>`;
  }).join('');

  openDrawer(drawerTemplate('촬영 일정 상세',
    `<span class="badge ${s.tone}">${s.status}</span>
     <h2 style="margin:12px 0 4px">${esc(s.title)}</h2>
     <p style="margin:0 0 18px;color:var(--muted)">${esc(project?.name||s.type)} 일정</p>
     <div class="form-stack">
       <div class="field"><span>일시</span><strong>${scheduleDate(s)} · ${esc(s.time)}</strong></div>
       <div class="field"><span>장소</span><strong>${esc(s.place||'미정')}</strong></div>
       ${roleSummary?`<div class="field"><span>${esc(project?.name||'프로젝트')} 담당</span><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">${roleSummary}</div></div>`:''}
       <div class="field"><span>이 촬영 참여 인원 (${members.length}명)</span>
         <div style="display:flex;flex-direction:column;gap:6px;margin-top:6px">${members.map(m=>personRow(m.id,m.name,m.role)).join('')||emptyState('담당 인원이 지정되지 않았습니다.')}</div>
       </div>
       ${s.raw?.note?`<div class="field"><span>메모</span><p style="margin:6px 0 0;padding:12px;border-radius:12px;background:#F6F7FC;font-size:14px;color:#4F5770">${esc(s.raw.note)}</p></div>`:''}
     </div>`,
    `<button class="primary-button" data-action="close-drawer">확인</button>`));
}
function openPersonDetail(id){const p=memberById(id);if(!p)return;openDrawer(drawerTemplate('구성원 상세',`<div class="people-avatar" style="margin-bottom:24px"><span class="avatar avatar-${p[6]}" style="width:56px;height:56px;font-size:18px">${esc(p[0][0]||'?')}</span><span><strong style="font-size:18px">${esc(p[0])}</strong><small>${esc(p[2])} · ${esc(p[3])}</small></span></div><div class="form-stack"><div class="field"><span>연락처</span><strong>${esc(p[4]||'미등록')}</strong></div><div class="field"><span>활동 상태</span><span class="badge mint">${esc(p[5])}</span></div></div>`,`<button class="primary-button" data-action="close-drawer">확인</button>`))}
function openSlotDrawer(){const dayNames=['월','화','수','목','금','토','일'],parts=state.selectedSlot.split(' '),day=Math.max(0,dayNames.indexOf(parts[0])),hour=Number((parts[1]||'09:00').slice(0,2)),dates=weekDates(),iso=localIso(dates[day]),available=people.filter(p=>memberAvailable(p[7],iso,day,hour));openDrawer(drawerTemplate('선택 시간 상세',`<span class="badge mint">${available.length}명 가능</span><h2>${state.selectedSlot}</h2><p style="color:var(--muted)">개인 일정과 고정 시간표를 반영한 실시간 결과입니다.</p><div class="member-list">${available.slice(0,8).map(p=>`<div class="member-mini"><span class="avatar avatar-${p[6]}">${esc(p[0][0]||'?')}</span><span><strong>${esc(p[0])}</strong><small>${esc(p[2])} · ${esc(p[3])}</small></span><span class="badge mint">가능</span></div>`).join('')||emptyState('이 시간에 가능한 구성원이 없습니다.')}</div>`,`<button class="primary-button" data-action="new-shoot">이 시간으로 등록</button>`))}

function toast(message){const el=document.createElement('div');el.className='toast';el.innerHTML=`${icon('check')}<strong>${message}</strong>`;$('#toast-region').append(el);hydrateIcons(el);setTimeout(()=>el.remove(),2800)}
function closePopovers(){['notification-popover','profile-popover'].forEach(id=>$('#'+id).hidden=true);$('#notification-button').setAttribute('aria-expanded','false');$('#profile-button').setAttribute('aria-expanded','false')}
function closeMobileMenu(){$('#mobile-menu').classList.remove('open');$('#mobile-menu').setAttribute('aria-hidden','true');setTimeout(()=>$('#mobile-menu-backdrop').hidden=true,220)}

$('#notification-button').addEventListener('click',e=>{e.stopPropagation();const p=$('#notification-popover');const opening=p.hidden;closePopovers();p.hidden=!opening;e.currentTarget.setAttribute('aria-expanded',opening)});
$('#profile-button').addEventListener('click',e=>{e.stopPropagation();const p=$('#profile-popover');const opening=p.hidden;closePopovers();p.hidden=!opening;e.currentTarget.setAttribute('aria-expanded',opening)});
$('#mobile-more').addEventListener('click',()=>{$('#mobile-menu-backdrop').hidden=false;$('#mobile-menu').classList.add('open');$('#mobile-menu').setAttribute('aria-hidden','false')});
$('#mobile-menu-backdrop').addEventListener('click',closeMobileMenu);$('#drawer-backdrop').addEventListener('click',closeDrawer);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDrawer();closeMobileMenu();closePopovers()}if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#global-search')?.focus()}});
document.addEventListener('click',e=>{if(!e.target.closest('.popover,.header-actions'))closePopovers()});
window.addEventListener('hashchange',()=>{const route=location.hash.slice(1);if(route&&route!==state.route){state.route=route;render()}});

function snapshotRows(snapshot){return snapshot.docs.map(item=>({id:item.id,data:item.data()||{},ref:item.ref}));}
function finishFirebase(key){firebaseState.pending.delete(key);firebaseState.updatedAt=new Date();if(firebaseState.pending.size===0&&!firebaseState.error)firebaseState.connected=true;render();}
function failFirebase(key,error){firebaseState.pending.delete(key);firebaseState.connected=false;firebaseState.updatedAt=new Date();firebaseState.error=error?.code||error?.message||'알 수 없는 오류';console.error(`Firebase ${key} 구독 실패`,error);render();}
function applyShoots(){
  schedules=rawShootRows.map(({id,data})=>{
    const castIds=Array.isArray(data.castIds)?data.castIds:Array.isArray(data.cast)?data.cast.map(v=>typeof v==='string'?v:v?.id).filter(Boolean):[];
    const names=castIds.map(memberId=>memberById(memberId)?.[0]).filter(Boolean);
    if(!names.length&&Array.isArray(data.cast))data.cast.forEach(value=>{const name=typeof value==='string'?value:value?.name;if(name)names.push(name);});
    const startH=Number(data.startH??9),endH=Number(data.endH??(startH+2));
    const [status,tone]=shootStatus({date:data.date,startH,endH});
    return {id,date:data.date||'',startH,endH,time:`${hourLabel(startH)} - ${hourLabel(endH)}`,title:projects[data.projectId]?.name||data.title||'제목 없는 촬영',place:data.location||'',type:data.category||'촬영',status,tone,people:names,castIds,raw:data};
  }).sort((a,b)=>`${a.date}-${a.startH}`.localeCompare(`${b.date}-${b.startH}`));
}

onSnapshot(collection(db,'members'),snapshot=>{
  const colors=['blue','mint','lavender','pink'];
  // 부서는 정해진 순서, 그 안에서 이름 ㄱㄴㄷ순.
  // 화면마다 따로 정렬하지 않도록 여기서 한 번만 맞춘다.
  people=snapshotRows(snapshot)
    .map(({id,data},index)=>[data.name||'이름 미등록',data.legacyId||data.studentId||'',data.department||'미지정',data.role||'구성원',data.contact||'',data.status||'활동 중',colors[index%colors.length],id])
    .sort((a,b)=>deptRank(a[2])-deptRank(b[2])||a[2].localeCompare(b[2],'ko')||a[0].localeCompare(b[0],'ko'));
  applyShoots();finishFirebase('members');
},error=>failFirebase('members',error));
onSnapshot(collection(db,'notices'),snapshot=>{notices=snapshotRows(snapshot).map(({id,data})=>({id,...data})).sort((a,b)=>String(noticeDate(b)).localeCompare(String(noticeDate(a))));render();},error=>console.error('공지 구독 실패',error));
onSnapshot(collection(db,'projects'),snapshot=>{projects=Object.fromEntries(snapshotRows(snapshot).map(({id,data})=>[id,data]));applyShoots();finishFirebase('projects');},error=>failFirebase('projects',error));
onSnapshot(collection(db,'shoots'),snapshot=>{rawShootRows=snapshotRows(snapshot);applyShoots();finishFirebase('shoots');},error=>failFirebase('shoots',error));
onSnapshot(collectionGroup(db,'availability'),snapshot=>{availabilityRows=snapshotRows(snapshot).map(row=>({...row,memberId:row.ref.parent.parent?.id||row.data.memberId||''}));finishFirebase('availability');},error=>failFirebase('availability',error));
onSnapshot(collectionGroup(db,'fixedClasses'),snapshot=>{fixedRows=snapshotRows(snapshot).map(row=>({...row,memberId:row.ref.parent.parent?.id||row.data.memberId||''}));finishFirebase('fixed');},error=>failFirebase('fixed',error));

/* ===== Air(에어) =====
   scheduler 의 Air 를 이 앱으로 옮긴 것. 전송 계약(/api/chat)은 그대로 쓰고,
   보내는 컨텍스트만 이 앱이 직접 들고 있는 Firestore 데이터로 채운다.
   NVIDIA 키는 api/ 함수(서버)에만 있다. 여기에는 절대 두지 않는다. */
const apiBase = () => (window.HNUBS_API || '').replace(/\/$/, '');
const airEl = {
  button: $('#air-button'), chat: $('#air-chat'), messages: $('#air-messages'),
  form: $('#air-form'), input: $('#air-input'), status: $('#air-status'), bubble: $('#air-bubble'),
};
let airBusy = false, airHistory = [], airConfigured = null;

function airBubble(message){
  if(!airEl.bubble) return;
  airEl.bubble.textContent=message; airEl.bubble.classList.add('show');
  clearTimeout(airBubble.timer); airBubble.timer=setTimeout(()=>airEl.bubble.classList.remove('show'),5000);
}
function airSay(text,kind='bot'){
  const el=document.createElement('div'); el.className=`air-msg ${kind}`; el.textContent=text;
  airEl.messages.append(el); airEl.messages.scrollTop=airEl.messages.scrollHeight; return el;
}

async function airHealth(){
  if(!airEl.status) return;
  try{
    const res=await fetch(`${apiBase()}/api/health`,{headers:{Accept:'application/json'}});
    const data=await res.json();
    airConfigured=!!data.configured;
    const label=airConfigured?`${data.model||'NIM'} 연결됨`:'서버 설정 필요';
    state.aiHealthText=label; airEl.status.textContent=airConfigured?`NVIDIA ${label}`:'AI 서버 설정 필요';
  }catch{
    airConfigured=false;
    state.aiHealthText='서버 없음 (로컬)'; airEl.status.textContent='AI 서버 없음 (로컬)';
  }
}

// 모델에게는 요약만 간다. 내부 id 나 연락처 같은 건 싣지 않는다.
function airContext(){
  const today=localIso(), dates=weekDates().map(localIso);
  return {
    currentDate: today,
    currentHour: new Date().getHours(),
    weekLabel: `${dates[0]} ~ ${dates[6]}`,
    dateIsos: dates,
    members: people.map(p=>({
      id:p[7], name:p[0], dept:p[2], role:p[3],
      schedules: Object.fromEntries(availabilityRows.filter(r=>r.memberId===p[7])
        .map(r=>[r.id,{status:r.data.status,memo:r.data.memo,available:r.data.availableRanges,unavailable:r.data.unavailableRanges}])),
      fixedSchedule: fixedRows.filter(r=>r.memberId===p[7])
        .map(r=>({day:Number(r.data.day),start:r.data.start,end:r.data.end,label:r.data.name||r.data.title||''})),
    })),
    projects: Object.values(projects).map(p=>p.name).filter(Boolean),
    shoots: schedules.map(s=>({id:s.id,date:s.date,startH:s.startH,endH:s.endH,title:s.title,place:s.place,category:s.type,people:s.people})),
    notices: notices.map(n=>({tag:n.tag,title:n.title,date:noticeDate(n)})),
  };
}

function airConfirmAsk(title,details,okLabel='추가'){
  return new Promise(resolve=>{
    const box=$('#air-confirm');
    $('#air-confirm-title').textContent=title;
    $('#air-confirm-details').textContent=details;
    $('#air-confirm-ok').textContent=okLabel;
    box.hidden=false;
    const finish=v=>{ box.hidden=true; resolve(v); };
    $('#air-confirm-ok').onclick=()=>finish(true);
    $('#air-confirm-cancel').onclick=()=>finish(false);
    box.onclick=e=>{ if(e.target===box) finish(false); };
  });
}

async function airFetch(payload){
  const url=`${apiBase()}/api/chat`;
  let res;
  // 재시도하지 않는다. 타임아웃에 재시도하면 사용자가 두 배로 기다린 뒤 실패한다.
  try{
    res=await fetch(url,{signal:AbortSignal.timeout(28000),method:'POST',
      headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)});
  }catch(error){
    throw new Error(error.name==='TimeoutError'
      ? 'AI 서버가 28초 안에 응답하지 않았어요. 잠시 후 다시 물어봐 주세요.'
      : 'AI 서버에 연결하지 못했어요. 네트워크를 확인해 주세요.');
  }
  const raw=await res.text();
  let data=null;
  try{ data=JSON.parse(raw); }
  catch{
    /* 정적 서버로 열면 API 함수가 없다. python http.server 는 501, Netlify 미배포는 404,
       둘 다 HTML 을 돌려준다. 코드 문제와 구분해서 안내한다. */
    if([404,405,501].includes(res.status)||/^\s*</.test(raw))
      throw new Error('이 주소에는 AI 서버가 없습니다. 배포된 사이트에서 이용해 주세요.');
    throw new Error('AI 서버 응답 형식이 올바르지 않습니다.');
  }
  if(res.ok) return data;
  throw new Error(data.error||`AI 서버 오류 (${res.status})`);
}

// 에어가 제안한 등록은 반드시 사용자가 확인한 뒤에만 저장한다.
async function airApply(action){
  if(action?.type==='personal_schedule'){
    const it=action.item||action;
    const member=people.find(p=>p[7]===it.memberId)||people.find(p=>p[0]===it.memberName);
    if(!member) return airSay('누구의 일정인지 찾지 못했어요.','err');
    const detail=`${member[0]} · ${it.date}\n${hourLabel(it.start)} – ${hourLabel(it.end)} · ${it.status||'불가능'}\n${it.memo||''}`;
    if(!await airConfirmAsk('개인 일정을 추가할까요?',detail,'개인 일정 추가')) return;
    const range=[{start:Number(it.start),end:Number(it.end)}];
    await setDoc(doc(db,'members',member[7],'availability',it.date),{
      memberId:member[7],date:it.date,status:it.status||'불가능',entryMode:'range',
      availableRanges:it.status==='가능'?range:[],unavailableRanges:it.status==='가능'?[]:range,
      memo:it.memo||'Air(에어)에서 등록',mandatory:false,createdAt:serverTimestamp(),updatedAt:serverTimestamp()},{merge:true});
    toast('개인 일정이 등록되었습니다.');
    return;
  }
  if(action?.type==='shoot_schedules'){
    const items=action.items||[];
    if(!items.length) return;
    const detail=items.map(i=>`${i.date} ${hourLabel(i.startH)} – ${hourLabel(i.endH)}\n${i.title||'제목 없음'} · ${i.location||'장소 미정'}`).join('\n\n');
    if(!await airConfirmAsk(`촬영 ${items.length}건을 추가할까요?`,detail,'일정 추가')) return;
    for(const i of items){
      const castIds=Array.isArray(i.castIds)?i.castIds:[];
      await setDoc(doc(collection(db,'shoots')),{
        date:i.date,title:i.title||'제목 없는 일정',category:i.category||'촬영',uploadWeek:'',
        startH:Number(i.startH),endH:Number(i.endH),location:i.location||'',note:i.note||'Air(에어)에서 등록',
        castIds,cast:castIds.map(id=>({id,name:memberById(id)?.[0]||''})),projectId:i.projectId||'',
        createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
    }
    toast(`${items.length}건이 등록되었습니다.`);
  }
}

if(airEl.button){
  const grow=()=>{ airEl.input.style.height='auto'; airEl.input.style.height=Math.min(airEl.input.scrollHeight,140)+'px'; };
  airEl.input.addEventListener('input',grow);
  airEl.input.addEventListener('keydown',e=>{
    if(e.key!=='Enter'||e.shiftKey||e.isComposing) return;
    e.preventDefault(); airEl.form.requestSubmit();
  });
  airEl.button.addEventListener('click',()=>{
    const open=airEl.chat.hidden;
    airEl.chat.hidden=!open;
    airEl.button.setAttribute('aria-expanded',String(open));
    if(open){
      // 예시에 실제 부원 이름을 쓰지 않는다. 쓰면 누가 누구와 겹치는지가 인사말로 새어 나간다.
      if(!airEl.messages.children.length) airSay('안녕하세요, Air입니다. 이렇게 물어보세요.\n\n· 다음 주 촬영 일정 알려줘\n· 철수랑 영희 둘 다 되는 시간 알려줘\n· 11월 3일 19시부터 21시까지 회의 잡아줘');
      airEl.input.focus();
    }
  });
  $('#air-close').addEventListener('click',()=>{ airEl.chat.hidden=true; airEl.button.setAttribute('aria-expanded','false'); });

  airEl.form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(airBusy){ airBubble('에어가 앞 질문에 답하는 중이에요.'); return; }
    const message=airEl.input.value.trim(); if(!message) return;
    airBusy=true;
    const send=airEl.form.querySelector('button');
    airEl.input.disabled=true; send.disabled=true;
    airEl.input.value=''; grow();
    airSay(message,'user');
    const startedAt=performance.now();
    const wait=airSay('','bot');
    wait.innerHTML='<span class="air-pulse" aria-hidden="true"><i></i><i></i><i></i></span>';
    try{
      const data=await airFetch({message,context:airContext(),history:airHistory.slice(-10)});
      wait.textContent=data.reply||'답변을 받지 못했어요.';
      const took=document.createElement('span');
      took.className='air-took'; took.textContent=`${((performance.now()-startedAt)/1000).toFixed(1)}초`;
      wait.append(took);
      airHistory.push({role:'user',content:message},{role:'assistant',content:data.reply||''});
      if(airHistory.length>10) airHistory.splice(0,airHistory.length-10);
      if(data.action){
        const btn=document.createElement('button');
        btn.type='button'; btn.className='air-action';
        btn.textContent=data.action.type==='personal_schedule'?'개인 일정에 추가':'일정에 추가';
        btn.onclick=()=>airApply(data.action).catch(err=>airSay(`저장하지 못했어요: ${err.code||err.message}`,'err'));
        airEl.messages.append(btn);
      }
    }catch(error){
      wait.className='air-msg err'; wait.textContent=error.message;
    }finally{
      airBusy=false; airEl.input.disabled=false; send.disabled=false; airEl.input.focus();
      airEl.messages.scrollTop=airEl.messages.scrollHeight;
    }
  });

  airHealth();
}

/* ===== 전체 검색 =====
   일정·구성원·공지를 한 번에 찾는다. 결과를 누르면 그 상세로 바로 간다. */
const searchInput=$('#global-search'), searchPanel=$('#search-results');
let searchHits=[], searchActive=-1;

function searchFind(q){
  const key=q.trim().toLowerCase();
  if(!key) return [];
  const hit=[];
  schedules.filter(s=>`${s.title} ${s.place} ${s.type} ${s.people.join(' ')}`.toLowerCase().includes(key))
    .slice(0,6).forEach(s=>hit.push({group:'일정',badge:s.type,bg:'#E3EAFF',fg:'#2F4FC2',
      title:s.title,meta:`${monthDay(s.date)} (${dowOf(s.date)}) ${s.time}`,run:()=>openScheduleDetail(s.id)}));
  people.filter(p=>`${p[0]} ${p[2]} ${p[3]}`.toLowerCase().includes(key))
    .slice(0,6).forEach(p=>hit.push({group:'구성원',badge:p[2],bg:'#E3F7EE',fg:'#17603F',
      title:p[0],meta:p[3],run:()=>openPersonDetail(p[7])}));
  notices.filter(n=>`${n.title} ${n.body||''} ${n.tag}`.toLowerCase().includes(key))
    .slice(0,5).forEach(n=>{ const [,bg,fg]=noticeTag(n.tag);
      hit.push({group:'공지사항',badge:n.tag,bg,fg,title:n.title,meta:noticeDate(n),run:()=>openNoticeDetail(n.id)});});
  return hit;
}

function searchRender(){
  if(!searchPanel) return;
  const q=searchInput.value.trim();
  if(!q){ searchClose(); return; }
  searchHits=searchFind(q); searchActive=-1;
  if(!searchHits.length){
    searchPanel.innerHTML=`<div class="hn-search-empty">‘${esc(q)}’에 해당하는 결과가 없어요.</div>`;
  }else{
    let html='', group='';
    searchHits.forEach((h,i)=>{
      if(h.group!==group){ group=h.group; html+=`<div class="hn-search-group">${group}</div>`; }
      html+=`<button class="hn-search-item" role="option" aria-selected="false" data-hit="${i}">
        <span class="hn-search-badge" style="background:${h.bg};color:${h.fg}">${esc(h.badge||'')}</span>
        <b>${esc(h.title)}</b><small>${esc(h.meta||'')}</small></button>`;
    });
    searchPanel.innerHTML=html;
  }
  searchPanel.hidden=false; searchInput.setAttribute('aria-expanded','true');
}

function searchClose(){
  if(!searchPanel) return;
  searchPanel.hidden=true; searchPanel.innerHTML='';
  searchHits=[]; searchActive=-1;
  searchInput.setAttribute('aria-expanded','false');
}

function searchGo(i){
  const hit=searchHits[i]; if(!hit) return;
  searchClose(); searchInput.value=''; searchInput.blur(); hit.run();
}

function searchMove(step){
  if(!searchHits.length) return;
  searchActive=(searchActive+step+searchHits.length)%searchHits.length;
  $$('.hn-search-item',searchPanel).forEach((el,i)=>{
    const on=i===searchActive;
    el.classList.toggle('active',on); el.setAttribute('aria-selected',String(on));
    if(on) el.scrollIntoView({block:'nearest'});
  });
}

if(searchInput){
  searchInput.addEventListener('input',searchRender);
  searchInput.addEventListener('focus',()=>{ if(searchInput.value.trim()) searchRender(); });
  searchInput.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){ e.preventDefault(); searchMove(1); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); searchMove(-1); }
    else if(e.key==='Enter'){ if(searchHits.length){ e.preventDefault(); searchGo(searchActive<0?0:searchActive); } }
    else if(e.key==='Escape'){ searchClose(); }
  });
  searchPanel.addEventListener('click',e=>{
    const item=e.target.closest('[data-hit]');
    if(item) searchGo(Number(item.dataset.hit));
  });
  document.addEventListener('click',e=>{ if(!e.target.closest('.hn-search-wrap')) searchClose(); });
}

hydrateIcons();render();
})().catch(error=>{
  console.error('HNUBS workspace 시작 실패',error);
  const app=document.querySelector('#app');
  if(app)app.innerHTML=`<div class="connection-bar error" role="alert"><span>Firebase를 불러오지 못했습니다. 인터넷 연결을 확인한 뒤 새로고침해 주세요.</span></div>`;
});
