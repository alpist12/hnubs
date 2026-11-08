export const SENSORS = { full: { name: '풀프레임', width: 36, coc: 0.03 }, apsc: { name: 'APS-C', width: 23.5, coc: 0.02 }, mft: { name: 'Micro 4/3', width: 17.3, coc: 0.015 } };
export const DEFAULT_SCENE = { focal: 50, aperture: 2.8, focus: 5, sensor: 'full', height: 1.5, pitch: 0, yaw: 0, cameraX: 0, cameraZ: 0, selected: 'p1', people: [{ id: 'p1', name: '인물 1', x: -0.55, z: 5, height: 1.72, pose: 'stand' }, { id: 'p2', name: '인물 2', x: 0.55, z: 5.5, height: 1.65, pose: 'stand' }] };
export const freshScene = () => structuredClone(DEFAULT_SCENE);
export function depthOfField(s) {
  const f = s.focal, distance = s.focus * 1000;
  const hyper = f * f / (s.aperture * SENSORS[s.sensor].coc) + f;
  const near = hyper * distance / (hyper + distance - f) / 1000;
  const far = hyper <= distance - f ? Infinity : hyper * distance / (hyper - distance + f) / 1000;
  return { near, far, hyper: hyper / 1000, horizontalFov: 2 * Math.atan(SENSORS[s.sensor].width / (2 * f)) * 180 / Math.PI };
}
export function cameraPoint(s, p) {
  const yaw = s.yaw * Math.PI / 180, pitch = s.pitch * Math.PI / 180;
  const dx = p.x - s.cameraX, dz = p.z - s.cameraZ, dy = p.y - s.height;
  const x = dx * Math.cos(yaw) - dz * Math.sin(yaw);
  const z = dx * Math.sin(yaw) + dz * Math.cos(yaw);
  return { x, y: dy * Math.cos(pitch) - z * Math.sin(pitch), z: dy * Math.sin(pitch) + z * Math.cos(pitch) };
}
export function project(s, p) {
  const v = cameraPoint(s, p), scale = s.focal / SENSORS[s.sensor].width * 960;
  if (v.z <= 0.05) return null;
  return { x: 480 + v.x / v.z * scale, y: 270 - v.y / v.z * scale, depth: v.z };
}
export function blurPixels(s, depth) {
  if (depth <= 0.05) return 18;
  const f = s.focal, focus = s.focus * 1000, d = depth * 1000;
  const circle = f * f * Math.abs(d - focus) / (s.aperture * d * (focus - f));
  return Math.min(18, circle / SENSORS[s.sensor].width * 960 / 2);
}
export function validateScene(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('구도 파일 형식을 확인해 주세요.');
  const ranges = { focal: [16,200], aperture: [1.2,22], focus: [0.5,30], height: [0.3,3], pitch: [-35,35], yaw: [-45,45], cameraX: [-4,4], cameraZ: [-3,3] };
  const s = {};
  for (const [key,[min,max]] of Object.entries(ranges)) {
    if (typeof raw[key] !== 'number' || !Number.isFinite(raw[key]) || raw[key] < min || raw[key] > max) throw new Error('카메라 설정값의 범위를 확인해 주세요.');
    s[key] = raw[key];
  }
  if (!Object.hasOwn(SENSORS,raw.sensor) || !Array.isArray(raw.people) || raw.people.length < 1 || raw.people.length > 6) throw new Error('센서와 인물 수를 확인해 주세요.');
  s.sensor = raw.sensor;
  s.people = raw.people.map((p,i) => {
    if (!p || ![p.x,p.z,p.height].every(Number.isFinite) || Math.abs(p.x)>5 || p.z<1 || p.z>25 || p.height<1.2 || p.height>2.1 || !['stand','sit'].includes(p.pose)) throw new Error('인물 배치값의 범위를 확인해 주세요.');
    return { id: `p${i+1}`, name: String(p.name || `인물 ${i+1}`).slice(0,30), x:p.x, z:p.z, height:p.height, pose:p.pose };
  });
  s.selected = s.people[0].id;
  return s;
}
