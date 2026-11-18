import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const home=source.slice(source.indexOf('function homeView()'),source.indexOf('function weeklyView()'));
const fixed='2026-11-18T10:00:00';
class DashboardDate extends Date { constructor(value){super(value??fixed);} }
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const context={
  Date:DashboardDate,people:[['부원 A','','기획부','','','','','a'],['부원 B','','편집부','','','','','b']],
  projects:{p:{name:'<프로젝트>',createdAt:1}},notices:[],
  schedules:[
    {id:'1',title:'첫 촬영',date:'2026-11-19',startH:10,endH:11,people:[],place:'방송실',status:'완료',raw:{projectId:'p'}},
    {id:'2',title:'두 번째 촬영',date:'2026-11-20',startH:10,endH:11,people:[],place:'방송실',status:'완료',raw:{projectId:'p'}},
    {id:'3',title:'세 번째 촬영',date:'2026-11-21',startH:10,endH:11,people:[],place:'방송실',status:'예정',raw:{projectId:'p'}},
  ],
  localIso:(d=new Date(fixed))=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
  hourLabel:h=>`${String(Math.floor(h)).padStart(2,'0')}:00`,pad2:n=>String(n).padStart(2,'0'),
  memberAvailable:()=>true,radioOff:()=>false,radioCast:()=>[],
  RADIO_SLOTS:[{key:'lunch',label:'점심방송',time:'12:30 – 13:00'},{key:'dinner',label:'저녁방송',time:'18:00 – 18:35'}],
  DOW:['일','월','화','수','목','금','토'],monthDay:s=>s.slice(5).replace('-','.'),dowOf:()=> '목',
  AV:Array(4).fill(['#eee','#333']),initial:s=>s[0],faces:()=>'',icon:name=>`<svg data-test-icon="${name}"></svg>`,
  esc:escape,projectArt:()=> 'drama',noticeTag:()=>['안내','#eee','#333'],noticeDate:()=> '11.18',
};
const render=()=>runInNewContext(`(${home})()`,context);
const html=render();
assert(html.includes('width:67%'),'Progress must reflect completed shoots, not demo values');
assert(html.includes('&lt;프로젝트&gt;'),'Project names must remain escaped');
assert(html.includes('오늘 일정</small><strong>2건'),'Include both real radio slots');
assert(html.includes('담당 미정'),'Show empty assignment state');
assert.equal((html.match(/class="ld-card(?: |")/g)||[]).length,6);
context.projects={};context.schedules=[];context.people=[];context.radioOff=()=>true;
const empty=render();
assert(empty.includes('등록된 프로젝트가 없어요.'));
assert(empty.includes('예정된 촬영이 없어요.'));
assert(empty.includes('오늘은 라디오 방송이 없어요.'));
assert(!empty.includes('NaN')&&!empty.includes('Infinity'));
console.log('Dashboard: real counts, progress, escaping and empty states passed.');
