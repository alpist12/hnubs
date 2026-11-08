import assert from 'node:assert/strict';
import { freshScene, depthOfField, project, blurPixels, validateScene, cameraPoint } from '../camera/optics.mjs';
import { PerspectiveCamera, Vector3 } from 'three';
import { configureCamera } from '../camera/scene3d.mjs';
const s=freshScene(),d=depthOfField(s);
assert.ok(Math.abs(d.near-4.288)<.01);
assert.ok(Math.abs(d.far-5.996)<.01);
assert.equal(blurPixels(s,s.focus),0);
assert.ok(blurPixels(s,10)>blurPixels(s,6));
assert.ok(depthOfField({...s,aperture:8}).near<d.near);
assert.ok(depthOfField({...s,aperture:8}).far>d.far);
assert.equal(depthOfField({...s,focus:30,aperture:8}).far,Infinity);
assert.ok(depthOfField({...s,sensor:'apsc'}).horizontalFov<d.horizontalFov);
assert.deepEqual(project(s,{x:0,y:s.height,z:5}),{x:480,y:270,depth:5});
assert.equal(project(s,{x:0,y:0,z:-1}),null);
assert.ok(project({...s,pitch:10},{x:0,y:s.height,z:5}).y>270);
assert.ok(project({...s,yaw:10},{x:0,y:s.height,z:5}).x<480);
assert.equal(cameraPoint({...s,cameraZ:1},{x:0,y:s.height,z:5}).z,4);
assert.deepEqual(validateScene(s),s);
// 실제 3D 카메라와 수치 계산이 같은 프레임 좌표를 반환해야 한다.
for(const config of [s,{...s,pitch:18,yaw:-20,cameraX:1.2,cameraZ:-1},{...s,sensor:'apsc',focal:85,height:.6,pitch:-12,yaw:25}]) {
  const camera=new PerspectiveCamera();configureCamera(camera,config);
  for(const point of [{x:0,y:1.7,z:5},{x:1,y:.4,z:8},{x:-.5,y:1,z:3}]) {
    const expected=project(config,point),actual=new Vector3(-point.x,point.y,point.z).project(camera);
    assert.ok(Math.abs((actual.x+1)*480-expected.x)<1e-7);
    assert.ok(Math.abs((1-actual.y)*270-expected.y)<1e-7);
  }
}
for(const raw of [{...s,focal:NaN},{...s,sensor:'toString'},{...s,people:[]},{...s,people:[{...s.people[0],height:100}]}]) assert.throws(()=>validateScene(raw));
console.log('Camera optics, projection and file validation passed.');
