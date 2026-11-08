import { SENSORS, freshScene, depthOfField, cameraPoint, project, validateScene } from './optics.mjs';
import { createStage } from './scene3d.bundle.mjs';
import { cameraMarkup } from './view.mjs';
export const cameraView = () => cameraMarkup;
let scene = freshScene(), view = '3d';
export function mountCamera(root, sharedStore) {
let savedEntries=[];
const $ = q => root.querySelector(q);
let stage3d;
const colors = ['#5268ae','#9a6553','#468477','#8b6bab','#a08038','#527c9d'];
const esc = v => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = v => Number.isFinite(v) ? `${v.toFixed(2)} m` : '∞';
const person = () => scene.people.find(p=>p.id===scene.selected) || scene.people[0];
let messageTimer;
function message(text) { $('#message').textContent=text; clearTimeout(messageTimer); messageTimer=setTimeout(()=>$('#message').textContent='',4000); }
function human(p) {
  const h=p.height*(p.pose==='sit'?1.36/1.74:1), head=h-0.12;
  return { h, head, points: [[0,head-0.15],[0,h*.48],[-.23,h*.74],[0,head-.15],[.23,h*.74],[0,head-.15],[0,h*.48],[-.16,p.pose==='sit'?.35:0],[.16,p.pose==='sit'?.35:0]] };
}
function preview() {
  const s=scene, dof=depthOfField(s);
  $('#focus-status').innerHTML=s.people.map((p,i)=>{
    const center=cameraPoint(s,{x:p.x,y:human(p).h/2,z:p.z});
    const sharp=center.z>=dof.near&&center.z<=dof.far;
    const points=[0,human(p).h].map(y=>project(s,{x:p.x,y,z:p.z}));
    const outside=points.some(v=>!v||v.x<0||v.x>960||v.y<0||v.y>540);
    return `<span class="status ${sharp?'sharp':''}">${esc(p.name)} · ${center.z<=0?'카메라 뒤':sharp?'초점 범위 안':'초점 범위 밖'}${outside?' · 프레임 일부/전체 밖':''}</span>`;
  }).join('');
}
function referenceText() {
  const s=scene,d=depthOfField(s);
  return `HNUBS 촬영 설정\n${SENSORS[s.sensor].name} / 16:9 / ${s.focal} mm / f/${s.aperture}\n초점 거리 ${fmt(s.focus)} / 선명한 범위 ${fmt(d.near)} ~ ${fmt(d.far)}\n카메라 높이 ${fmt(s.height)} / 상하 ${s.pitch}° / 좌우 ${s.yaw}°\n카메라 위치: 앞뒤 ${s.cameraZ} m / 좌우 ${s.cameraX} m\n${s.people.map(p=>`${p.name}: 앞뒤 ${p.z} m, 좌우 ${p.x} m, 키 ${Math.round(p.height*100)} cm, ${p.pose==='sit'?'앉기':'서 있기'} / 카메라와 ${Math.hypot(p.z-s.cameraZ,p.x-s.cameraX).toFixed(2)} m`).join('\n')}\n이론값 기준. 실제 카메라에서 구도와 초점을 확인하세요.`;
}
function draw(sync=true) {
  if(sync) {
    root.querySelectorAll('[data-camera]').forEach(el=>el.value=scene[el.dataset.camera]);
    const p=person();
    $('#person-name').value=p.name; $('#person-z').value=p.z; $('#person-x').value=p.x; $('#person-height').value=Math.round(p.height*100); $('#person-pose').value=p.pose;
  }
  for(const key of ['focal','aperture','focus','height','pitch','yaw','cameraZ']) {
    $(`[data-output=${key}]`).textContent=key==='focal'?`${scene[key]} mm`:key==='aperture'?`f/${scene[key]}`:['pitch','yaw'].includes(key)?`${scene[key]}°`:fmt(scene[key]);
  }
  root.querySelectorAll('[data-lens]').forEach(b=>b.classList.toggle('active',+b.dataset.lens===scene.focal));
  $('#people-tabs').innerHTML=scene.people.map((p,i)=>`<button data-select="${p.id}" style="--person:${colors[i]}" aria-pressed="${p.id===scene.selected}">${esc(p.name)}</button>`).join('');
  $('#remove-person').disabled=scene.people.length===1; $('#add-person').disabled=scene.people.length>=6;
  $('#distance-output').textContent=fmt(person().z);
  const d=depthOfField(scene),p=person();
  $('#summary').innerHTML=[['렌즈 · 조리개',`${scene.focal} mm · f/${scene.aperture}`],['초점이 맞는 범위',`${fmt(d.near)} ~ ${fmt(d.far)}`],['수평 화각',`${d.horizontalFov.toFixed(1)}°`],['선택 인물까지 거리',fmt(Math.hypot(p.x-scene.cameraX,p.z-scene.cameraZ))]].map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  preview(); stage3d?.update(scene); $('#angle-label').textContent=`카메라 높이 ${fmt(scene.height)} · 상하 ${scene.pitch}°`;
}
root.querySelectorAll('[data-camera]').forEach(el=>el.addEventListener('input',()=>{scene[el.dataset.camera]=el.dataset.camera==='sensor'?el.value:Number(el.value);draw(false);}));
root.querySelectorAll('[data-lens]').forEach(el=>el.onclick=()=>{scene.focal=+el.dataset.lens;draw();});
$('#people-tabs').onclick=e=>{const b=e.target.closest('[data-select]');if(b){scene.selected=b.dataset.select;draw();}};
for(const [id,key,factor] of [['person-name','name',1],['person-z','z',1],['person-x','x',1],['person-height','height',.01],['person-pose','pose',1]]) {
  $('#'+id).addEventListener('input',e=>{const el=e.target;if(!el.checkValidity()||!el.value.trim())return;person()[key]=['name','pose'].includes(key)?el.value:Number(el.value)*factor;draw(false);});
  $('#'+id).addEventListener('change',()=>draw());
}
$('#add-person').onclick=()=>{if(scene.people.length>=6)return;const id=`p${Date.now()}-${Math.random().toString(36).slice(2,8)}`;scene.people.push({id,name:`인물 ${scene.people.length+1}`,x:0,z:6,height:1.7,pose:'stand'});scene.selected=id;draw();};
$('#remove-person').onclick=()=>{if(scene.people.length===1)return;scene.people=scene.people.filter(p=>p.id!==scene.selected);scene.selected=scene.people[0].id;draw();};
$('#focus-person').onclick=()=>{const p=person(),d=cameraPoint(scene,{x:p.x,y:human(p).h/2,z:p.z}).z;if(d<.5||d>30){message('인물이 초점 조절 범위 밖에 있어요. 카메라 방향과 위치를 확인해 주세요.');return;}scene.focus=+d.toFixed(2);draw();};
for(const v of ['3d','side','top']) $(`[id="${v}-view"]`).onclick=()=>{view=v;for(const key of ['3d','side','top'])$(`[id="${key}-view"]`).setAttribute('aria-pressed',key===v);stage3d?.setView(v);};
function saved() {const data=JSON.parse(localStorage.getItem('hnubs-camera-scenes-v1')||'[]');if(!Array.isArray(data))throw new Error('저장 목록을 읽지 못했어요.');return data;}
async function library() {$('#saved-list').textContent='저장한 구도를 불러오는 중…';try{savedEntries=sharedStore?await sharedStore.list():saved();$('#saved-list').innerHTML=savedEntries.length?savedEntries.map((x,i)=>`<button data-load="${i}">${esc(x.name)}</button>`).join(''):'<p>아직 저장한 구도가 없습니다.</p>';}catch{$('#saved-list').textContent='목록을 불러오지 못했습니다. 불러오기 버튼으로 다시 시도해 주세요.';message('네트워크와 저장소 연결을 확인해 주세요.');}}
$('#save').onclick=()=>{$('#save-form').hidden=false;$('#scene-name').focus();};$('#cancel-save').onclick=()=>$('#save-form').hidden=true;
$('#save-form').onsubmit=async e=>{e.preventDefault();const button=$('#save-form button[type=submit]');button.disabled=true;const name=$('#scene-name').value.trim()||'이름 없는 구도';try{if(sharedStore){await sharedStore.save(name,structuredClone(scene));}else{const entries=saved();entries.push({name,scene:structuredClone(scene)});localStorage.setItem('hnubs-camera-scenes-v1',JSON.stringify(entries));}$('#save-form').hidden=true;if(!$('#library').hidden)await library();message(sharedStore?'부원들과 공유할 구도를 저장했습니다.':'이 브라우저에 구도를 저장했습니다.');}catch{message('저장하지 못했습니다. 연결을 확인하거나 파일로 내보내 주세요.');}finally{button.disabled=false;}};
$('#load').onclick=()=>{$('#library').hidden=!$('#library').hidden;library();};
$('#saved-list').onclick=e=>{const b=e.target.closest('[data-load]');if(!b)return;try{scene=validateScene(savedEntries[+b.dataset.load].scene);draw();message('저장한 구도를 불러왔습니다.');}catch(err){message(err.message);}};
$('#import').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>100000)throw new Error('100 KB 이하의 구도 파일을 선택해 주세요.');scene=validateScene(JSON.parse(await f.text()).scene);draw();message('구도 파일을 불러왔습니다.');}catch(err){message(err.message);}finally{e.target.value='';}};
$('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,scene},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='HNUBS-camera-scene.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(referenceText());message('촬영 설정을 복사했습니다.');}catch{message('복사 권한을 확인하거나 구도 파일로 내보내 주세요.');}};
$('#reset').onclick=()=>{scene=freshScene();draw();message('기본 2인 구도로 되돌렸습니다.');};
$('#library h2').textContent='부원들과 공유한 구도';
try {
  stage3d=createStage($('#placement'),$('#preview'),(id,x,z)=>{const p=scene.people.find(p=>p.id===id);p.x=+x.toFixed(1);p.z=+z.toFixed(1);draw();},id=>{scene.selected=id;draw();},message);
  stage3d.setView(view);
} catch (error) { message('3D 화면을 시작하지 못했습니다. WebGL을 지원하는 브라우저에서 열어 주세요.'); }
draw();
return ()=>{clearTimeout(messageTimer);stage3d?.dispose();};
}
