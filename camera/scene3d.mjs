import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SENSORS, depthOfField } from './optics.mjs';

export function configureCamera(camera,s) {
  camera.fov=2*Math.atan(SENSORS[s.sensor].width*9/16/(2*s.focal))*180/Math.PI;
  camera.aspect=16/9;
  camera.position.set(-s.cameraX,s.height,s.cameraZ);
  const yaw=s.yaw*Math.PI/180,pitch=s.pitch*Math.PI/180;
  camera.lookAt(-s.cameraX-Math.sin(yaw)*Math.cos(pitch),s.height+Math.sin(pitch),s.cameraZ+Math.cos(yaw)*Math.cos(pitch));
  camera.updateProjectionMatrix();camera.updateMatrixWorld();
}
const palette=['#5268ae','#9a6553','#468477','#8b6bab','#a08038','#527c9d'];
const templates=new Map();
const pendingModels=new Map();
function loadPeople(keys) {
  return Promise.all(keys.map(key=>{
    if(templates.has(key))return;
    if(pendingModels.has(key))return pendingModels.get(key);
    const promise=(async()=>{
    const gltf=await new GLTFLoader().loadAsync(new URL(`./models/person-${key}.glb`,import.meta.url).href);
    gltf.scene.traverse(node=>{node.userData.sharedAsset=true;});
    templates.set(key,gltf.scene);
    })().catch(error=>{pendingModels.delete(key);throw error;});
    pendingModels.set(key,promise);return promise;
  }));
}
export function createStage(stageElement,previewElement,onMove,onSelect,onMessage) {
  const world=new THREE.Scene();world.background=new THREE.Color('#edf1f7');
  world.add(new THREE.HemisphereLight(0xffffff,0x8a9bb8,2.4));
  const light=new THREE.DirectionalLight(0xffffff,2.5);light.position.set(-3,8,-4);world.add(light);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:'#e3e9f1',roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.015;world.add(floor);
  const grid=new THREE.GridHelper(40,40,0xadbcd0,0xcbd5e3);world.add(grid);
  const shoot=new THREE.PerspectiveCamera(30,16/9,.05,30);
  const orbitCamera=new THREE.PerspectiveCamera(40,1,.05,100);orbitCamera.position.set(10,7,-6);orbitCamera.layers.enable(1);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  const previewRenderer=new THREE.WebGLRenderer({antialias:true});previewRenderer.setPixelRatio(Math.min(devicePixelRatio,2));previewRenderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-label','회전과 확대가 가능한 3D 촬영 배치');previewRenderer.domElement.setAttribute('aria-label','동일한 3D 장면의 카메라 시점');
  stageElement.append(renderer.domElement);previewElement.append(previewRenderer.domElement);
  const controls=new OrbitControls(orbitCamera,renderer.domElement);controls.target.set(0,1,4);controls.maxPolarAngle=Math.PI*.49;controls.minDistance=2;controls.maxDistance=35;controls.update();
  const composer=new EffectComposer(previewRenderer);composer.addPass(new RenderPass(world,shoot));
  const bokeh=new BokehPass(world,shoot,{focus:5,aperture:.00015,maxblur:.012});composer.addPass(bokeh);composer.addPass(new OutputPass());
  let people=new THREE.Group(),guides=new THREE.Group(),current=null,disposed=false,loadingAssets=false,assetsFailed=false;world.add(people,guides);
  const render=()=>{if(!current)return;renderer.render(world,orbitCamera);composer.render();};
  controls.addEventListener('change',render);
  function resize() {
    const w=stageElement.clientWidth,h=stageElement.clientHeight;
    if(w&&h){renderer.setSize(w,h,false);orbitCamera.aspect=w/h;orbitCamera.updateProjectionMatrix();}
    const pw=previewElement.clientWidth,ph=previewElement.clientHeight;
    if(pw&&ph){previewRenderer.setSize(pw,ph,false);composer.setSize(pw,ph);}
    render();
  }
  const observer=new ResizeObserver(resize);observer.observe(stageElement);observer.observe(previewElement);
  function clear(group){while(group.children.length){const obj=group.children[0];group.remove(obj);obj.traverse(n=>{if(n.userData.sharedAsset)return;n.geometry?.dispose();if(n.material){n.material.map?.dispose();n.material.dispose();}});}}
  function mesh(geometry,material,position,parent=people){const m=new THREE.Mesh(geometry,material);m.position.set(...position);parent.add(m);return m;}
  function limb(a,b,r,material,parent){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),delta=vb.clone().sub(va);const m=mesh(new THREE.CylinderGeometry(r,r,delta.length(),12),material,va.clone().add(vb).multiplyScalar(.5).toArray(),parent);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());}
  function label(text,color){const canvas=document.createElement('canvas');canvas.width=384;canvas.height=64;const ctx=canvas.getContext('2d');ctx.fillStyle='#edf1f7';ctx.fillRect(0,0,384,64);ctx.font='600 28px sans-serif';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(text,192,42);const texture=new THREE.CanvasTexture(canvas);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));sprite.scale.set(1.7,.28,1);sprite.layers.set(1);return sprite;}
  function update(s) {
    const needed=[...new Set(s.people.map(p=>p.pose==='sit'?'seated':'standing'))].filter(key=>!templates.has(key));
    if(needed.length&&!loadingAssets&&!assetsFailed){
      loadingAssets=true;stageElement.dataset.loading='true';
      loadPeople(needed).then(()=>{if(!disposed){loadingAssets=false;delete stageElement.dataset.loading;update(current);}}).catch(()=>{if(!disposed){assetsFailed=true;loadingAssets=false;delete stageElement.dataset.loading;onMessage('사람 모델을 불러오지 못했습니다. 연결을 확인한 뒤 탭을 다시 열어 주세요.');}});
    }
    current=s;configureCamera(shoot,s);clear(people);clear(guides);
    s.people.forEach((p,i)=>{
      const group=new THREE.Group();group.userData.personId=p.id;group.position.set(-p.x,0,p.z);people.add(group);
      const seated=p.pose==='sit',h=p.height*(seated?1.36/1.74:1),hip=seated?.52:h*.48,shoulder=h-.32;
      const template=templates.get(seated?'seated':'standing');
      if(template) {
        const model=template.clone(true),bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
        const scale=h/size.y;model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);model.scale.setScalar(scale);
        const facing=new THREE.Group();facing.rotation.y=Math.PI;facing.add(model);group.add(facing);
      } else {
      const material=new THREE.MeshStandardMaterial({color:palette[i],roughness:.78});
      mesh(new THREE.SphereGeometry(.115,20,16),material,[0,h-.115,0],group);
      mesh(new THREE.CylinderGeometry(.18,.14,shoulder-hip,16),material,[0,(shoulder+hip)/2,0],group);
      limb([0,shoulder,0],[0,h-.22,0],.065,material,group);
      for(const sign of [-1,1]) {
        limb([sign*.17,shoulder-.04,0],[sign*.25,hip+.08,-.04],.055,material,group);
        if(seated){limb([sign*.1,hip,0],[sign*.13,.48,-.36],.075,material,group);limb([sign*.13,.48,-.36],[sign*.13,.06,-.36],.06,material,group);}
        else{limb([sign*.09,hip,0],[sign*.14,.06,0],.07,material,group);}
      }
      }
      if(seated){const chair=new THREE.MeshStandardMaterial({color:'#a7b3c5'});mesh(new THREE.BoxGeometry(.5,.05,.5),chair,[0,.5,.03],group);for(const x of [-.21,.21])for(const z of [-.18,.24])mesh(new THREE.CylinderGeometry(.018,.018,.48,8),chair,[x,.24,z],group);}
      const text=label(p.name,palette[i]);text.position.set(0,h+.24,0);group.add(text);
      if(p.id===s.selected){const ring=mesh(new THREE.RingGeometry(.28,.32,48),new THREE.MeshBasicMaterial({color:'#465ed1',side:THREE.DoubleSide}),[0,.015,0],group);ring.rotation.x=-Math.PI/2;ring.layers.set(1);}
    });
    const body=new THREE.Group();body.position.copy(shoot.position);body.quaternion.copy(shoot.quaternion);guides.add(body);
    const dark=new THREE.MeshStandardMaterial({color:'#354667'});
    mesh(new THREE.BoxGeometry(.32,.25,.28),dark,[0,0,.2],body);const lens=mesh(new THREE.CylinderGeometry(.09,.1,.16,16),dark,[0,0,.02],body);lens.rotation.x=Math.PI/2;
    for(const [x,z] of [[-.28,.2],[.28,.2],[0,.5]])limb([0,-.12,.2],[x,-s.height,z],.02,dark,body);
    const d=depthOfField(s),reach=Math.min(30,Math.max(s.focus+2,...s.people.map(p=>p.z-s.cameraZ+1)));
    const points=[],halfWidth=distance=>distance*SENSORS[s.sensor].width/(2*s.focal);
    for(const x of [-1,1])for(const y of [-1,1])points.push(new THREE.Vector3(0,0,0),new THREE.Vector3(x*halfWidth(reach),y*halfWidth(reach)*9/16,-reach));
    body.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#91a3c6',transparent:true,opacity:.65})));
    for(const distance of [d.near,Math.min(d.far,30),s.focus]) {
      const width=2*halfWidth(distance),height=width*9/16;
      const plane=new THREE.PlaneGeometry(width,height),outline=new THREE.EdgesGeometry(plane);plane.dispose();
      const frame=new THREE.LineSegments(outline,new THREE.LineBasicMaterial({color:distance===s.focus?'#4c7990':'#77a995',transparent:true,opacity:.65}));frame.position.z=-distance;body.add(frame);
    }
    mesh(new THREE.PlaneGeometry(2*halfWidth(s.focus),2*halfWidth(s.focus)*9/16),new THREE.MeshBasicMaterial({color:'#639c89',transparent:true,opacity:.07,side:THREE.DoubleSide,depthWrite:false}),[0,0,-s.focus],body);
    const groundZone=mesh(new THREE.PlaneGeometry(Math.max(2,2*halfWidth(s.focus)),Math.max(.01,Math.min(d.far,30)-d.near)),new THREE.MeshBasicMaterial({color:'#75a48f',transparent:true,opacity:.16,depthWrite:false}),[-s.cameraX,.012,s.cameraZ+(d.near+Math.min(d.far,30))/2],guides);groundZone.rotation.x=-Math.PI/2;
    guides.traverse(n=>n.layers.set(1));
    bokeh.uniforms.focus.value=s.focus;
    bokeh.uniforms.aperture.value=.00015*(s.focal/50)**2*(2.8/s.aperture);
    render();
  }
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),ground=new THREE.Plane(new THREE.Vector3(0,1,0),0);
  let drag=null;
  function rayAt(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,orbitCamera);}
  renderer.domElement.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;rayAt(e);const hit=ray.intersectObjects(people.children,true).find(h=>h.object.type==='Mesh');if(!hit)return;
    let group=hit.object;while(group.parent!==people)group=group.parent;
    const point=ray.ray.intersectPlane(ground,new THREE.Vector3());if(!point)return;
    drag={id:group.userData.personId,offset:point.clone().sub(group.position)};controls.enabled=false;renderer.domElement.setPointerCapture(e.pointerId);onSelect(drag.id);
  },true);
  renderer.domElement.addEventListener('pointermove',e=>{if(!drag)return;rayAt(e);const point=ray.ray.intersectPlane(ground,new THREE.Vector3());if(point){point.sub(drag.offset);onMove(drag.id,Math.max(-5,Math.min(5,-point.x)),Math.max(1,Math.min(25,point.z)));}});
  for(const type of ['pointerup','pointercancel'])renderer.domElement.addEventListener(type,()=>{drag=null;controls.enabled=true;});
  function setView(v) {
    controls.enableRotate=v==='3d';
    if(v==='top'){orbitCamera.position.set(0,19,4.001);controls.target.set(0,0,4);}
    else if(v==='side'){orbitCamera.position.set(13,2,4);controls.target.set(0,1,4);}
    else{orbitCamera.position.set(8,5,-3);controls.target.set(0,1,3.5);}
    controls.update();render();
  }
  function dispose(){disposed=true;observer.disconnect();controls.dispose();clear(people);clear(guides);world.traverse(n=>{if(!n.userData.sharedAsset){n.geometry?.dispose();n.material?.dispose();}});bokeh.dispose();composer.dispose();renderer.dispose();previewRenderer.dispose();renderer.domElement.remove();previewRenderer.domElement.remove();}
  resize();return {update,setView,dispose};
}
