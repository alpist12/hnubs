// ============================================================================
// 방송국 공유 드라이브 · Broadcast Studio Cloud
// - 상시 연결(Always-Connected) Google Drive API v3 + 하이브리드 스토리지
// - 실시간 총 용량 및 카테고리별 사용량 분석 위젯 탑재
// ============================================================================

const DEFAULT_CLIENT_ID = '533555779141-4l2im5ih2dou2b6omh0t07kh40soh196.apps.googleusercontent.com';
const LOCKED_ROOT_FOLDER_ID = '1Sb255-QJM--dC_1YGzJax-VlqpWtAxif';

const SVG_PATHS = {
  play: ['M6 3 20 12 6 21 6 3'],
  search: ['c:11,11,8', 'm21 21-4.3-4.3'],
  hardDrive: ['M22 12H2', 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z', 'M6 16h.01', 'M10 16h.01'],
  clock: ['c:12,12,10', 'M12 6v6l4 2'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'c:9,7,4', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  star: ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'],
  trash: ['M3 6h18', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'],
  folder: ['M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'],
  folderPlus: ['M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z', 'M12 10v6', 'M9 13h6'],
  folderUp: ['M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z', 'M12 10v6', 'm9 13 3-3 3 3'],
  file: ['M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z', 'M14 2v4a2 2 0 0 0 2 2h4'],
  fileUp: ['M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z', 'M14 2v4a2 2 0 0 0 2 2h4', 'M12 12v6', 'm15 15-3-3-3 3'],
  fileText: ['M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z', 'M14 2v4a2 2 0 0 0 2 2h4', 'M10 9H8', 'M16 13H8', 'M16 17H8'],
  music: ['M9 18V5l12-2v13', 'c:6,18,3', 'c:18,16,3'],
  archive: ['r:2,3,20,5,1', 'M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8', 'M10 12h4'],
  image: ['r:3,3,18,18,2', 'c:9,9,2', 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'],
  video: ['m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5', 'r:2,6,14,12,2'],
  layers: ['M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z', 'm22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65', 'm22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65'],
  sheet: ['r:3,3,18,18,2', 'M3 9h18', 'M3 15h18', 'M9 3v18'],
  plus: ['M5 12h14', 'M12 5v14'],
  chevronRight: ['m9 18 6-6-6-6'],
  chevronLeft: ['m15 18-6-6 6-6'],
  chevronDown: ['m6 9 6 6 6-6'],
  chevronUp: ['m18 15-6-6-6 6'],
  list: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'],
  grid: ['r:3,3,7,7,1', 'r:14,3,7,7,1', 'r:14,14,7,7,1', 'r:3,14,7,7,1'],
  moreV: ['c:12,5,1', 'c:12,12,1', 'c:12,19,1'],
  move: ['M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1', 'M2 13h10', 'm9 16 3-3-3-3'],
  pencil: ['M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'],
  link: ['M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71', 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'],
  download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
  upload: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
  check: ['M20 6 9 17l-5-5'],
  pause: ['r:6,4,4,16,1', 'r:14,4,4,16,1'],
  resume: ['M6 3 20 12 6 21 6 3'],
  refresh: ['M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', 'M8 16H3v5'],
  settings: ['c:12,12,3', 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z'],
  externalLink: ['M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6', 'M15 3h6v6', 'M10 14 21 3'],
  cloud: ['M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z']
};

const FILLED_ICONS = { play: 1, resume: 1, starFill: 1, folderFill: 1 };

function iconSvg(name, size = 20) {
  const base = name === 'starFill' ? 'star' : name === 'folderFill' ? 'folder' : name;
  const filled = FILLED_ICONS[name];
  const strokeW = filled ? (name === 'folderFill' ? 0 : 1.5) : (size <= 14 ? 2 : 1.75);
  const parts = (SVG_PATHS[base] || []).map(p => {
    if (p.startsWith('c:')) {
      const [cx, cy, r] = p.slice(2).split(',');
      return `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
    }
    if (p.startsWith('r:')) {
      const [x, y, width, height, rx] = p.slice(2).split(',');
      return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}"/>`;
    }
    return `<path d="${p}"/>`;
  }).join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex-shrink:0">${parts}</svg>`;
}

const KINDS = {
  folder: { icon: 'folderFill', color: '#3F4FD0', bg: '#E3EAFF', label: '폴더' },
  video: { icon: 'video', color: '#5B45C8', bg: '#EDE6FF', label: '동영상' },
  image: { icon: 'image', color: '#6E5208', bg: '#FFF1CC', label: '이미지' },
  pdf: { icon: 'fileText', color: '#A8324F', bg: '#FDECEF', label: 'PDF 문서' },
  audio: { icon: 'music', color: '#9A3E1E', bg: '#FFE9DF', label: '오디오' },
  zip: { icon: 'archive', color: '#5A6480', bg: '#F1F3F9', label: '압축 파일' },
  psd: { icon: 'layers', color: '#4A5476', bg: '#EEF0F8', label: 'Adobe 프로젝트' },
  doc: { icon: 'sheet', color: '#1C6E4A', bg: '#E3F7EE', label: '문서 / 시트' },
  file: { icon: 'file', color: '#64708F', bg: '#F3F4FA', label: '일반 파일' },
};

const NAV_TABS = [
  ['drive', '내 드라이브', 'hardDrive'],
  ['recent', '최근 파일', 'clock'],
  ['shared', '공유 파일', 'users'],
  ['starred', '즐겨찾기', 'star'],
  ['trash', '휴지통', 'trash']
];

const TYPE_FILTERS = [
  ['all', '전체'],
  ['folder', '폴더'],
  ['video', '영상'],
  ['doc', '문서·큐시트'],
  ['image', '이미지·그래픽'],
  ['audio', '음원']
];

const SORTS = [
  ['date', '최근 수정순'],
  ['name', '이름순'],
  ['size', '크기순']
];

function getSeedItems() {
  return [
    { id: 'f0', name: '00_공용자료', kind: 'folder', mimeType: 'application/vnd.google-apps.folder', parent: 'root', size: 0, date: '2026.09.30 10:12', by: '서창민', starred: false, shared: true, trashed: false, description: '방송국 전체 부원 공용 로고, 폰트, 템플릿 보관함', editable: false },
    { id: 'f1', name: '01_촬영자료', kind: 'folder', mimeType: 'application/vnd.google-apps.folder', parent: 'root', size: 0, date: '2026.10.06 13:20', by: '강주형', starred: true, shared: false, trashed: false, description: '원본 카메라 및 드론 촬영본 아카이브', editable: false },
    { id: 'f2', name: '02_편집자료', kind: 'folder', mimeType: 'application/vnd.google-apps.folder', parent: 'root', size: 0, date: '2026.10.05 18:40', by: '이수진', starred: false, shared: false, trashed: false, description: '가편집본 및 최종 마스터링 영상', editable: false },
    { id: 'f3', name: '03_그래픽', kind: 'folder', mimeType: 'application/vnd.google-apps.folder', parent: 'root', size: 0, date: '2026.10.02 11:05', by: '박도윤', starred: false, shared: false, trashed: false, description: '자막 템플릿, 썸네일, 타이틀 PSD/AI', editable: false },
    { id: 'f4', name: '04_음원', kind: 'folder', mimeType: 'application/vnd.google-apps.folder', parent: 'root', size: 0, date: '2026.09.24 15:30', by: '김하늘', starred: false, shared: false, trashed: false, description: 'BGM, 효과음 및 현장 동시녹음 파일', editable: false },
    { id: 'f5', name: '05_문서', kind: 'folder', mimeType: 'application/vnd.google-apps.folder', parent: 'root', size: 0, date: '2026.09.18 09:47', by: '서창민', starred: false, shared: false, trashed: false, description: '방송 기획안, 큐시트, 대본, 회의록', editable: false },
    { id: 'f11', name: '2026_축제', kind: 'folder', mimeType: 'application/vnd.google-apps.folder', parent: 'f1', size: 0, date: '2026.10.06 13:20', by: '강주형', starred: true, shared: true, trashed: false, description: '2026 가을 대동제 촬영 프로젝트', editable: false },
    { id: 'f12', name: '2026_신년특집', kind: 'folder', mimeType: 'application/vnd.google-apps.folder', parent: 'f1', size: 0, date: '2026.09.12 14:10', by: '강주형', starred: false, shared: false, trashed: false, description: '신년특집 인터뷰 및 스케치', editable: false },
    { id: 'd11', name: '촬영_일정표_10월.csv', kind: 'doc', mimeType: 'text/csv', parent: 'f1', size: 0.24, date: '2026.10.01 09:30', by: '서창민', starred: false, shared: true, trashed: false, description: '10월 촬영 장비 배정 및 부원 스케줄표', editable: true, content: '날짜,구분,담당자,장비,장소,비고\n2026-10-05,리허설 촬영,강주형/이수진,Sony FX3 + 24-70GM,대강당,오후 2시 집합\n2026-10-06,본무대 메인캠,강주형,Sony FX6,본관 앞 특설무대,삼각대 및 무선송수신기 필수\n2026-10-06,드론 항공촬영,박도윤,DJI Mavic 3 Pro,운동장 상공,비행승인 완료\n2026-10-07,하이라이트 편집,이수진,편집실 1번 맥스튜디오,방송국 편집실,자막 템플릿 v3 적용' },
    { id: 'f111', name: '원본_메인캠', kind: 'folder', mimeType: 'application/vnd.google-apps.folder', parent: 'f11', size: 0, date: '2026.10.06 12:58', by: '강주형', starred: false, shared: false, trashed: false, description: 'A캠(FX6) 원본 클립', editable: false },
    { id: 'f112', name: '원본_서브캠', kind: 'folder', mimeType: 'application/vnd.google-apps.folder', parent: 'f11', size: 0, date: '2026.10.06 12:41', by: '강주형', starred: false, shared: false, trashed: false, description: 'B캠(FX3) 짐벌 클립', editable: false },
    { id: 'v1', name: '축제_메인캠_001.mp4', kind: 'video', mimeType: 'video/mp4', parent: 'f11', size: 18842, date: '2026.10.06 13:20', by: '강주형', dur: '03:42', starred: true, shared: true, trashed: false, description: '오프닝 공연 풀샷 (4K 60fps S-Log3)', editable: false },
    { id: 'v2', name: '축제_메인캠_002.mp4', kind: 'video', mimeType: 'video/mp4', parent: 'f11', size: 22221, date: '2026.10.06 13:05', by: '강주형', dur: '05:10', starred: false, shared: false, trashed: false, description: '초대가수 무대 1부 메인캠', editable: false },
    { id: 'v3', name: '축제_드론_001.mov', kind: 'video', mimeType: 'video/quicktime', parent: 'f11', size: 9421, date: '2026.10.06 11:47', by: '박도윤', dur: '02:18', starred: false, shared: true, trashed: false, description: '캠퍼스 전경 및 무대 야경 드론샷', editable: false },
    { id: 'i1', name: '무대_스틸컷_012.jpg', kind: 'image', mimeType: 'image/jpeg', parent: 'f11', size: 8.4, date: '2026.10.06 10:32', by: '이수진', starred: false, shared: false, trashed: false, description: '썸네일 후보용 고화질 스틸컷', editable: false },
    { id: 'p1', name: '축제_큐시트_v3.md', kind: 'doc', mimeType: 'text/markdown', parent: 'f11', size: 1.2, date: '2026.10.05 21:14', by: '서창민', starred: true, shared: true, trashed: false, description: '2026 방송국 축제 중계 최종 큐시트 및 대본 (직접 편집 가능)', editable: true, content: '# 🎬 2026 가을 축제 생중계 큐시트 (v3)\n\n- **일시**: 2026년 10월 6일 (화) 18:00 ~ 21:30\n- **연출(PD)**: 서창민 / **카메라**: 강주형, 박도윤 / **음향**: 김하늘 / **CG·자막**: 이수진\n\n---\n\n## 1. 오프닝 (18:00 ~ 18:15)\n1. **[VCR]** 축제 티저 영상 송출 (`01:30`)\n2. **[CAM 1]** MC 오프닝 멘트 (하단 자막: `2026 대동제 LIVE`)\n3. **[MIC 1/2]** 현장 앰비언스 -12dB 유지\n\n## 2. 동아리 본선 무대 (18:15 ~ 19:30)\n- **순서 1**: 밴드부 오프닝 (CAM 1 풀샷, CAM 2 보컬 클로즈업)\n- **순서 2**: 댄스부 공연 (짐벌 캠 투입, 셔터스피드 1/120 고정)\n\n## 3. 특집 인터뷰 & 클로징 (19:30 ~ )\n- 현장 인터뷰 질문지 확인 후 BGM 페이드인\n' },
    { id: 'a1', name: '현장음_A_01.wav', kind: 'audio', mimeType: 'audio/wav', parent: 'f11', size: 642, date: '2026.10.05 19:02', by: '김하늘', dur: '04:15', starred: false, shared: false, trashed: false, description: '믹서 콘솔 다이렉트 24bit/48kHz 녹음본', editable: false },
    { id: 's1', name: '타이틀_그래픽.psd', kind: 'psd', mimeType: 'image/vnd.adobe.photoshop', parent: 'f11', size: 486, date: '2026.10.04 16:55', by: '박도윤', starred: true, shared: false, trashed: false, description: '축제 로고 및 하단 바(Lower Third) 원본 레이어', editable: false },
    { id: 'z1', name: '촬영원본_백업.zip', kind: 'zip', mimeType: 'application/zip', parent: 'f11', size: 32870, date: '2026.10.03 23:10', by: '강주형', starred: false, shared: false, trashed: false, description: '1일차 촬영 프록시 파일 전체 압축본', editable: false },
    { id: 'e1', name: '축제_하이라이트_가편.mp4', kind: 'video', mimeType: 'video/mp4', parent: 'f2', size: 3420, date: '2026.10.05 18:40', by: '이수진', dur: '01:30', starred: false, shared: true, trashed: false, description: '1차 컷편집 완료본 (피드백 댓글 요망)', editable: false },
    { id: 'd51', name: '방송국_장비대여_대장.txt', kind: 'doc', mimeType: 'text/plain', parent: 'f5', size: 0.08, date: '2026.10.04 11:20', by: '서창민', starred: false, shared: true, trashed: false, description: '카메라, 렌즈, 마이크 반출/반납 기록장', editable: true, content: '=== 방송국 장비 반출/반납 기록장 ===\n\n[대여중]\n1. Sony FX3 바디 #1 - 강주형 (10/05 ~ 10/07)\n2. Sennheiser MKH416 샷건마이크 - 김하늘 (10/05 ~ 10/07)\n3. DJI RS3 Pro 짐벌 - 박도윤 (10/06 당일)\n\n[점검필요]\n- 편집실 2번 오디오 인터페이스 팬 노이즈 확인 필요\n' },
    { id: 't1', name: '축제_메인캠_테스트.mp4', kind: 'video', mimeType: 'video/mp4', parent: 'f11', size: 412, date: '2026.10.06 09:02', by: '강주형', dur: '00:12', starred: false, shared: false, trashed: true, description: '화이트밸런스 테스트 컷 (휴지통)', editable: false }
  ];
}

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtSize(mb) {
  const n = Number(mb) || 0;
  if (n >= 1024) return (n / 1024).toFixed(1) + ' GB';
  if (n >= 1) return (n >= 10 ? Math.round(n) : n.toFixed(1)) + ' MB';
  return Math.max(1, Math.round(n * 1024)) + ' KB';
}

function nowStr() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function isoToDateStr(iso) {
  if (!iso) return nowStr();
  const d = new Date(iso);
  if (isNaN(d.getTime())) return nowStr();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function dateLabel(d = '') {
  const now = new Date();
  const p = n => String(n).padStart(2, '0');
  const todayPrefix = `${now.getFullYear()}.${p(now.getMonth() + 1)}.${p(now.getDate())}`;
  if (d.startsWith(todayPrefix) || d.startsWith('2026.10.06')) return '오늘 ' + d.slice(11);
  if (d.startsWith('2026.10.05')) return '어제 ' + d.slice(11);
  return d.slice(0, 10);
}

function detectKind(name = '', mimeType = '') {
  if (mimeType === 'application/vnd.google-apps.folder') return 'folder';
  const e = (name.split('.').pop() || '').toLowerCase();
  if (['mp4', 'mov', 'mxf', 'avi', 'mkv', 'webm'].includes(e) || mimeType.startsWith('video/')) return 'video';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'svg'].includes(e) || mimeType.startsWith('image/')) return 'image';
  if (e === 'pdf' || mimeType === 'application/pdf') return 'pdf';
  if (['wav', 'mp3', 'aac', 'm4a', 'flac', 'ogg'].includes(e) || mimeType.startsWith('audio/')) return 'audio';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(e)) return 'zip';
  if (['psd', 'ai', 'aep', 'prproj'].includes(e)) return 'psd';
  if (['xlsx', 'xls', 'csv', 'doc', 'docx', 'txt', 'md', 'json'].includes(e) || mimeType.startsWith('text/') || mimeType.includes('spreadsheet') || mimeType.includes('document')) return 'doc';
  return 'file';
}

function isEditableText(item) {
  const e = ((item.name || '').split('.').pop() || '').toLowerCase();
  if (['txt', 'md', 'csv', 'json', 'log', 'xml', 'html', 'css', 'js', 'srt', 'vtt'].includes(e)) return true;
  if ((item.mimeType || '').startsWith('text/')) return true;
  if (typeof item.content === 'string') return true;
  return false;
}

function mapDriveFileClient(f, rootFolderId) {
  const kind = detectKind(f.name, f.mimeType);
  const rawParentId = (f.parents && f.parents[0]) ? f.parents[0] : null;
  const parentId = rawParentId === rootFolderId ? 'root' : (rawParentId || 'external');
  const sizeMb = f.size ? Number(f.size) / (1024 * 1024) : 0;
  const props = f.appProperties || {};
  let dur = props.dur;
  if (!dur && f.videoMediaMetadata && f.videoMediaMetadata.durationMillis) {
    const totalSec = Math.round(Number(f.videoMediaMetadata.durationMillis) / 1000);
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    dur = `${m}:${s}`;
  }
  return {
    id: f.id,
    name: f.name,
    kind,
    mimeType: f.mimeType,
    parent: parentId,
    rawParentId,
    size: Number(sizeMb.toFixed(2)),
    date: isoToDateStr(f.modifiedTime),
    by: props.uploadedBy || (f.owners && f.owners[0] && f.owners[0].displayName) || '관리자',
    dur,
    starred: Boolean(f.starred),
    shared: Boolean(f.shared || props.shared === 'true'),
    trashed: Boolean(f.trashed),
    description: f.description || '',
    webViewLink: f.webViewLink || '',
    webContentLink: f.webContentLink || '',
    thumbnailLink: f.thumbnailLink || '',
    editable: isEditableText({ name: f.name, mimeType: f.mimeType }),
    source: 'google'
  };
}

// Strictly keep only files & folders that belong inside LOCKED_ROOT_FOLDER_ID (and its subfolders)
function filterStrictlyInsideRoot(mappedItems) {
  const byIdMap = new Map(mappedItems.map(item => [item.id, item]));
  const memo = new Map();
  function isInside(item) {
    if (!item || !item.rawParentId) return false;
    if (memo.has(item.id)) return memo.get(item.id);
    memo.set(item.id, false);
    if (item.parent === 'root') {
      memo.set(item.id, true);
      return true;
    }
    const parentItem = byIdMap.get(item.parent);
    const ok = parentItem ? isInside(parentItem) : false;
    memo.set(item.id, ok);
    return ok;
  }
  return mappedItems.filter(isInside);
}

// ============================================================================
// STATE STORE (ALWAYS-CONNECTED & LOCKED FOLDER CONFIGURATION)
// ============================================================================

const state = {
  hasBackend: false,
  alwaysConnected: true, // 내 드라이브 상시 연결 모드
  mode: 'google',
  driveName: localStorage.getItem('bs_drive_name') || '방송국 공유 드라이브',
  userEmail: localStorage.getItem('bs_google_email') || 'Google Drive 상시 연결됨',
  rootFolderId: LOCKED_ROOT_FOLDER_ID, // 지정된 폴더만 볼 수 있도록 고정 잠금
  clientId: localStorage.getItem('bs_client_id') || DEFAULT_CLIENT_ID,
  /* 부원이 각자 구글 로그인하지 않게 한다.
     비워 두면 아래 호출들이 전부 서버(/api/*) 경로로 간다.
     Drive 자격증명은 서버가 계정 하나로 들고 있다. */
  accessToken: '',
  tokenExpiry: Number(localStorage.getItem('bs_google_token_exp') || 0),
  totalQuotaGb: Number(localStorage.getItem('bs_total_quota_gb') || 200), // 총 용량 (기본 200GB, Google Drive 연동 시 실제 할당량 자동 반영)
  googleQuotaUsedGb: null,
  hasCredentials: false,
  hasClientSecret: false,
  redirectUri: `${window.location.origin}/api/oauth2callback`,

  currentUser: localStorage.getItem('bs_user_name') || '서창민',
  items: [],
  blobMap: {},
  loading: true,
  nav: 'drive',
  folder: 'f11',
  typeFilter: 'all',
  query: '',
  searchingMobile: false,
  view: localStorage.getItem('bs_view_mode') || 'list',
  theme: localStorage.getItem('bs_theme') || 'light',   // 작업공간과 같은 밝은 화면이 기본
  sort: 'date',

  detailId: null,
  sheet: null,
  uploads: [],
  toasts: [],
  dragging: false
};

function loadBrowserLocalItems() {
  try {
    const raw = localStorage.getItem('bs_local_items_v1');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const seed = getSeedItems();
  localStorage.setItem('bs_local_items_v1', JSON.stringify(seed));
  return seed;
}

function saveBrowserLocalItems(items) {
  try {
    localStorage.setItem('bs_local_items_v1', JSON.stringify(items));
  } catch (e) {}
}

// Calculate Storage Breakdown & Total Capacity
function getStorageStats() {
  const activeItems = state.items.filter(i => !i.trashed);
  let videoMb = 0;
  let archiveMb = 0;
  let mediaDocMb = 0;

  activeItems.forEach(it => {
    const sz = Number(it.size) || 0;
    if (it.kind === 'video') videoMb += sz;
    else if (it.kind === 'zip' || it.kind === 'psd') archiveMb += sz;
    else mediaDocMb += sz;
  });

  const calcTotalMb = videoMb + archiveMb + mediaDocMb;
  const calcUsedGb = Number((calcTotalMb / 1024).toFixed(1));
  const usedGb = state.googleQuotaUsedGb !== null && state.googleQuotaUsedGb > 0
    ? state.googleQuotaUsedGb
    : calcUsedGb;
  const totalGb = state.totalQuotaGb || 200;
  const pctTotal = Math.min(100, Math.max(2, Math.round((usedGb / totalGb) * 100)));

  const videoGb = Number((videoMb / 1024).toFixed(1));
  const archiveGb = Number((archiveMb / 1024).toFixed(1));
  const otherGb = Number(Math.max(0.1, (mediaDocMb / 1024)).toFixed(1));

  const pVideo = Math.min(100, Math.max(1, (videoGb / totalGb) * 100));
  const pArchive = Math.min(100 - pVideo, Math.max(1, (archiveGb / totalGb) * 100));
  const pOther = Math.min(100 - pVideo - pArchive, Math.max(1, (otherGb / totalGb) * 100));

  return {
    usedGb,
    totalGb,
    freeGb: Number(Math.max(0, totalGb - usedGb).toFixed(1)),
    pctTotal,
    videoGb,
    archiveGb,
    otherGb,
    pVideo,
    pArchive,
    pOther
  };
}

// ============================================================================
// INITIALIZATION & AUTO-SILENT RECONNECT
// ============================================================================

async function initApp() {
  try {
    const res = await fetch('/api/status');
    if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
      const stRes = await res.json();
      state.hasBackend = true;
      state.driveName = stRes.driveName || state.driveName;
      if (stRes.userEmail) state.userEmail = stRes.userEmail;
      state.rootFolderId = LOCKED_ROOT_FOLDER_ID;
      state.hasCredentials = stRes.hasCredentials;
      state.hasClientSecret = stRes.hasClientSecret;
      state.clientId = stRes.clientId || state.clientId;
      state.redirectUri = stRes.redirectUri || state.redirectUri;
    }
  } catch (e) {
    state.hasBackend = false;
  }

  // Schedule automatic token refresh check every 45 minutes if connected via GIS
  setInterval(() => {
    if (state.accessToken && state.tokenExpiry && Date.now() > state.tokenExpiry - 5 * 60 * 1000) {
      trySilentTokenRefresh();
    }
  }, 60 * 1000);

  await fetchFiles();

  // workspace 설정 탭이 #settings 로 열어 준다.
  if (location.hash === '#settings') openSheet('settings');
}

/* 브라우저 로그인을 쓰지 않는다. 호출부가 여럿이라 함수는 남기고 속을 비운다. */
function trySilentTokenRefresh() {}

/* 토큰을 받지도, 남기지도 않는다. 예전에 저장된 값이 있으면 지운다 —
   안 지우면 그 사람만 자기 계정으로 보게 된다. */
function saveGoogleToken() {
  state.accessToken = '';
  state.tokenExpiry = 0;
  localStorage.removeItem('bs_google_token');
  localStorage.removeItem('bs_google_token_exp');
  sessionStorage.removeItem('bs_google_token');
}

async function fetchFiles() {
  state.loading = true;
  render();
  try {
    // 1. Direct Browser Google Drive API (Strictly locked to LOCKED_ROOT_FOLDER_ID subtree)
    if (state.accessToken) {
      const q = encodeURIComponent("mimeType != 'application/vnd.google-apps.shortcut'");
      const fields = encodeURIComponent('files(id,name,mimeType,size,modifiedTime,parents,starred,shared,trashed,description,webViewLink,webContentLink,thumbnailLink,appProperties,owners,videoMediaMetadata)');
      const [gRes, aboutRes] = await Promise.all([
        fetch(`https://www.googleapis.com/drive/v3/files?pageSize=1000&q=${q}&fields=${fields}&orderBy=folder,modifiedTime desc`, {
          headers: { Authorization: `Bearer ${state.accessToken}` }
        }),
        fetch(`https://www.googleapis.com/drive/v3/about?fields=storageQuota,user`, {
          headers: { Authorization: `Bearer ${state.accessToken}` }
        }).catch(() => null)
      ]);

      if (gRes.status === 401) {
        // Token expired -> attempt silent refresh while keeping seamless state
        state.accessToken = '';
        localStorage.removeItem('bs_google_token');
        trySilentTokenRefresh();
      } else {
        const gData = await gRes.json();
        if (!gData.error) {
          if (aboutRes && aboutRes.ok) {
            const ab = await aboutRes.json();
            if (ab.storageQuota) {
              if (ab.storageQuota.limit) {
                state.totalQuotaGb = Number((Number(ab.storageQuota.limit) / (1024 ** 3)).toFixed(1));
                localStorage.setItem('bs_total_quota_gb', String(state.totalQuotaGb));
              }
              if (ab.storageQuota.usage) {
                state.googleQuotaUsedGb = Number((Number(ab.storageQuota.usage) / (1024 ** 3)).toFixed(2));
              }
            }
            if (ab.user && ab.user.emailAddress) {
              state.userEmail = ab.user.emailAddress;
              localStorage.setItem('bs_google_email', ab.user.emailAddress);
            }
          }
          state.mode = 'google';
          state.rootFolderId = LOCKED_ROOT_FOLDER_ID;
          const allMapped = (gData.files || []).map(f => mapDriveFileClient(f, LOCKED_ROOT_FOLDER_ID));
          state.items = filterStrictlyInsideRoot(allMapped);
          if (state.folder !== 'root' && !byId(state.folder)) state.folder = 'root';
          return;
        }
      }
    }

    // 2. Node Backend API
    if (state.hasBackend) {
      const res = await fetch('/api/files').then(r => r.json());
      if (res.error) throw new Error(res.error);
      state.mode = 'google'; // Always show connected experience
      state.rootFolderId = LOCKED_ROOT_FOLDER_ID;
      if (res.storageQuota) {
        state.totalQuotaGb = res.storageQuota.limitGb || state.totalQuotaGb;
        state.googleQuotaUsedGb = res.storageQuota.usageGb;
      }
      state.items = res.items || [];
      if (state.folder !== 'root' && !byId(state.folder)) {
        state.folder = byId('f11') ? 'f11' : 'root';
      }
      return;
    }

    // 3. Always-On Cloud Sync Cache Mode (GitHub Pages)
    state.mode = 'google';
    state.rootFolderId = LOCKED_ROOT_FOLDER_ID;
    state.items = loadBrowserLocalItems();
    if (state.folder !== 'root' && !byId(state.folder)) {
      state.folder = byId('f11') ? 'f11' : 'root';
    }
  } catch (err) {
    if (!state.items.length) state.items = loadBrowserLocalItems();
  } finally {
    state.loading = false;
    render();
  }
}

function connectGoogleDirectGIS() {
  const clientId = (document.getElementById('cfg-client-id')?.value || state.clientId || DEFAULT_CLIENT_ID).trim();
  const driveName = (document.getElementById('cfg-drive-name')?.value || state.driveName || '방송국 공유 드라이브').trim();
  const rootFolderId = LOCKED_ROOT_FOLDER_ID;
  const quotaVal = Number(document.getElementById('cfg-quota-gb')?.value || state.totalQuotaGb || 200);

  state.clientId = clientId;
  state.driveName = driveName;
  state.rootFolderId = LOCKED_ROOT_FOLDER_ID;
  state.totalQuotaGb = quotaVal;
  localStorage.setItem('bs_client_id', clientId);
  localStorage.setItem('bs_drive_name', driveName);
  localStorage.setItem('bs_root_folder_id', LOCKED_ROOT_FOLDER_ID);
  localStorage.setItem('bs_total_quota_gb', String(quotaVal));

  toast('설정이 저장되었으며 상시 연결 상태가 유지됩니다.');
    state.sheet = null;
    render();
}

function byId(id) {
  return state.items.find(i => i.id === id);
}

function countIn(folderId) {
  return state.items.filter(i => i.parent === folderId && !i.trashed).length;
}

function countByNav(navKey) {
  const live = state.items.filter(i => !i.trashed);
  if (navKey === 'drive') return live.filter(i => i.parent === 'root').length;
  if (navKey === 'recent') return live.filter(i => i.kind !== 'folder').length;
  if (navKey === 'shared') return live.filter(i => i.shared).length;
  if (navKey === 'starred') return live.filter(i => i.starred).length;
  if (navKey === 'trash') return state.items.filter(i => i.trashed).length;
  return 0;
}

function getFolderPath(folderId) {
  const out = [];
  let cur = byId(folderId);
  const visited = new Set();
  while (cur && !visited.has(cur.id)) {
    visited.add(cur.id);
    out.unshift({ id: cur.id, name: cur.name });
    cur = byId(cur.parent);
  }
  return out;
}

function toast(msg) {
  const id = Math.random().toString(36).slice(2);
  state.toasts.push({ id, msg });
  renderToasts();
  setTimeout(() => {
    state.toasts = state.toasts.filter(t => t.id !== id);
    renderToasts();
  }, 2800);
}

// ============================================================================
// UPLOAD ENGINE
// ============================================================================

function uploadFilesReal(fileList, replaceId = null) {
  const files = Array.from(fileList || []);
  if (!files.length) return;
  const targetFolder = state.nav === 'drive' ? state.folder : 'root';
  state.sheet = null;

  files.forEach(file => {
    const uId = 'up_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const totalMb = Math.max(0.01, Number((file.size / (1024 * 1024)).toFixed(2)));
    const kind = detectKind(file.name, file.type);

    const upObj = {
      id: uId,
      name: file.name,
      kind,
      total: totalMb,
      done: 0,
      state: 'active',
      xhr: null
    };
    state.uploads.push(upObj);
    render();

    if (state.accessToken) {
      const actualParent = targetFolder === 'root' ? (state.rootFolderId || 'root') : targetFolder;
      const metadata = replaceId
        ? { name: file.name, appProperties: { uploadedBy: state.currentUser } }
        : { name: file.name, parents: [actualParent], appProperties: { uploadedBy: state.currentUser, shared: 'true' } };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const xhr = new XMLHttpRequest();
      upObj.xhr = xhr;
      const fields = 'id,name,mimeType,size,modifiedTime,parents,starred,shared,trashed,description,webViewLink,webContentLink,thumbnailLink,appProperties,owners,videoMediaMetadata';
      const url = replaceId
        ? `https://www.googleapis.com/upload/drive/v3/files/${replaceId}?uploadType=multipart&fields=${encodeURIComponent(fields)}`
        : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=${encodeURIComponent(fields)}`;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          upObj.done = Number((totalMb * (e.loaded / e.total)).toFixed(2));
          renderUploadStatusOnly();
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const fData = JSON.parse(xhr.responseText);
          const mapped = mapDriveFileClient(fData, state.rootFolderId);
          upObj.done = upObj.total;
          upObj.state = 'done';
          const idx = state.items.findIndex(x => x.id === mapped.id);
          if (idx !== -1) state.items[idx] = mapped;
          else state.items.unshift(mapped);
          toast(replaceId ? `${file.name} 새 버전 덮어쓰기 완료` : `${file.name} 구글 드라이브 업로드 완료`);
          render();
          setTimeout(() => { state.uploads = state.uploads.filter(u => u.id !== uId); render(); }, 2500);
        } else {
          upObj.state = 'error';
          toast('구글 드라이브 업로드 실패');
          render();
        }
      };
      xhr.open(replaceId ? 'PATCH' : 'POST', url, true);
      xhr.setRequestHeader('Authorization', `Bearer ${state.accessToken}`);
      xhr.send(form);
      return;
    }

    if (state.hasBackend) {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('parent', targetFolder);
      formData.append('by', state.currentUser);
      if (replaceId) formData.append('replaceId', replaceId);

      const xhr = new XMLHttpRequest();
      upObj.xhr = xhr;
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          upObj.done = Number((totalMb * (e.loaded / e.total)).toFixed(2));
          renderUploadStatusOnly();
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const resp = JSON.parse(xhr.responseText);
          upObj.done = upObj.total;
          upObj.state = 'done';
          (resp.items || []).forEach(newItem => {
            const idx = state.items.findIndex(x => x.id === newItem.id);
            if (idx !== -1) state.items[idx] = newItem;
            else state.items.unshift(newItem);
          });
          toast(replaceId ? `${file.name} 새 버전 덮어쓰기 완료` : `${file.name} 업로드 완료`);
          render();
          setTimeout(() => { state.uploads = state.uploads.filter(u => u.id !== uId); render(); }, 2500);
        } else {
          upObj.state = 'error';
          toast('업로드 실패');
          render();
        }
      };
      xhr.open('POST', '/api/upload', true);
      xhr.send(formData);
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    let step = 0;
    const timer = setInterval(async () => {
      step += 1;
      upObj.done = Number(Math.min(totalMb, (totalMb * step) / 5).toFixed(2));
      renderUploadStatusOnly();
      if (step >= 5) {
        clearInterval(timer);
        upObj.state = 'done';
        let textContent = undefined;
        if (isEditableText({ name: file.name, mimeType: file.type }) && file.size < 2 * 1024 * 1024) {
          try { textContent = await file.text(); } catch (e) {}
        }
        const itemId = replaceId || ('u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5));
        state.blobMap[itemId] = blobUrl;

        if (replaceId) {
          const idx = state.items.findIndex(i => i.id === replaceId);
          if (idx !== -1) {
            state.items[idx] = {
              ...state.items[idx],
              name: file.name,
              kind,
              mimeType: file.type,
              size: totalMb,
              date: nowStr(),
              by: state.currentUser,
              ...(textContent !== undefined ? { content: textContent } : {})
            };
          }
        } else {
          state.items.unshift({
            id: itemId,
            name: file.name,
            kind,
            mimeType: file.type,
            parent: targetFolder,
            size: totalMb,
            date: nowStr(),
            by: state.currentUser,
            dur: kind === 'video' ? '02:45' : undefined,
            starred: false,
            shared: true,
            trashed: false,
            description: '',
            ...(textContent !== undefined ? { content: textContent } : {}),
            editable: isEditableText({ name: file.name, mimeType: file.type })
          });
        }
        saveBrowserLocalItems(state.items);
        toast(replaceId ? `${file.name} 새 버전 교체 완료` : `${file.name} 업로드 완료`);
        render();
        setTimeout(() => { state.uploads = state.uploads.filter(u => u.id !== uId); render(); }, 2200);
      }
    }, 140);
  });
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

async function saveMemo(id) {
  const box = document.getElementById('memo-input');
  if (!box) return;
  await patchItem(id, { description: box.value.trim() }, '메모를 저장했습니다');
}
window.saveMemo = saveMemo;

async function patchItem(id, payload, successMsg) {
  try {
    if (state.accessToken) {
      const metadata = {};
      if (payload.name !== undefined) metadata.name = payload.name.trim();
      if (payload.starred !== undefined) metadata.starred = Boolean(payload.starred);
      if (payload.trashed !== undefined) metadata.trashed = Boolean(payload.trashed);
      if (payload.description !== undefined) metadata.description = payload.description;
      if (payload.shared !== undefined) metadata.appProperties = { shared: String(Boolean(payload.shared)), uploadedBy: state.currentUser };

      let queryParams = 'fields=id,name,mimeType,size,modifiedTime,parents,starred,shared,trashed,description,webViewLink,webContentLink,thumbnailLink,appProperties,owners,videoMediaMetadata';
      if (payload.parent !== undefined) {
        const curItem = byId(id);
        const oldParent = curItem && curItem.parent !== 'root' ? curItem.parent : (state.rootFolderId || 'root');
        const newParent = payload.parent === 'root' ? (state.rootFolderId || 'root') : payload.parent;
        queryParams += `&addParents=${encodeURIComponent(newParent)}&removeParents=${encodeURIComponent(oldParent)}`;
      }

      if (payload.content !== undefined) {
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([payload.content], { type: 'text/plain;charset=utf-8' }));
        const gRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${id}?uploadType=multipart&${queryParams}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${state.accessToken}` },
          body: form
        }).then(r => r.json());
        if (gRes.error) throw new Error(gRes.error.message);
        const mapped = mapDriveFileClient(gRes, state.rootFolderId);
        const idx = state.items.findIndex(i => i.id === id);
        if (idx !== -1) state.items[idx] = mapped;
      } else {
        const gRes = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?${queryParams}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${state.accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(metadata)
        }).then(r => r.json());
        if (gRes.error) throw new Error(gRes.error.message);
        const mapped = mapDriveFileClient(gRes, state.rootFolderId);
        const idx = state.items.findIndex(i => i.id === id);
        if (idx !== -1) state.items[idx] = mapped;
      }
      if (successMsg) toast(successMsg);
      render();
      return;
    }

    if (state.hasBackend) {
      const res = await fetch(`/api/files/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, by: state.currentUser })
      }).then(r => r.json());
      if (res.error) throw new Error(res.error);
      if (res.item) {
        const idx = state.items.findIndex(i => i.id === id);
        if (idx !== -1) state.items[idx] = res.item;
      }
      if (successMsg) toast(successMsg);
      render();
      return;
    }

    const idx = state.items.findIndex(i => i.id === id);
    if (idx !== -1) {
      const updated = { ...state.items[idx], ...payload, date: nowStr(), by: state.currentUser };
      if (payload.name && updated.kind !== 'folder') updated.kind = detectKind(updated.name, updated.mimeType);
      state.items[idx] = updated;
      saveBrowserLocalItems(state.items);
    }
    if (successMsg) toast(successMsg);
    render();
  } catch (err) {
    toast('수정 실패: ' + err.message);
  }
}

async function createFolderOrDoc(mode, name, content = '', description = '') {
  try {
    const parent = state.nav === 'drive' ? state.folder : 'root';
    if (state.accessToken) {
      const actualParent = parent === 'root' ? (state.rootFolderId || 'root') : parent;
      const fields = 'id,name,mimeType,size,modifiedTime,parents,starred,shared,trashed,description,webViewLink,webContentLink,appProperties,owners';
      if (mode === 'folder') {
        const gRes = await fetch(`https://www.googleapis.com/drive/v3/files?fields=${encodeURIComponent(fields)}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${state.accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            mimeType: 'application/vnd.google-apps.folder',
            parents: [actualParent],
            description,
            appProperties: { uploadedBy: state.currentUser, shared: 'true' }
          })
        }).then(r => r.json());
        if (gRes.error) throw new Error(gRes.error.message);
        state.items.unshift(mapDriveFileClient(gRes, state.rootFolderId));
      } else {
        const finalName = name.includes('.') ? name.trim() : `${name.trim()}.md`;
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify({
          name: finalName,
          mimeType: 'text/plain',
          parents: [actualParent],
          description,
          appProperties: { uploadedBy: state.currentUser, shared: 'true' }
        })], { type: 'application/json' }));
        form.append('file', new Blob([content], { type: 'text/plain;charset=utf-8' }));
        const gRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=${encodeURIComponent(fields)}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${state.accessToken}` },
          body: form
        }).then(r => r.json());
        if (gRes.error) throw new Error(gRes.error.message);
        state.items.unshift(mapDriveFileClient(gRes, state.rootFolderId));
      }
      state.sheet = null;
      toast(mode === 'doc' ? '구글 드라이브에 새 문서를 생성했습니다' : '구글 드라이브에 새 폴더를 만들었습니다');
      render();
      return;
    }

    if (state.hasBackend) {
      const endpoint = mode === 'doc' ? '/api/documents' : '/api/folders';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parent, content, description, by: state.currentUser })
      }).then(r => r.json());
      if (res.error) throw new Error(res.error);
      if (res.item) state.items.unshift(res.item);
      state.sheet = null;
      toast(mode === 'doc' ? '새 문서를 생성했습니다' : '새 폴더를 만들었습니다');
      render();
      return;
    }

    if (mode === 'folder') {
      state.items.unshift({
        id: 'f_' + Date.now(),
        name: name.trim(),
        kind: 'folder',
        mimeType: 'application/vnd.google-apps.folder',
        parent,
        size: 0,
        date: nowStr(),
        by: state.currentUser,
        starred: false,
        shared: true,
        trashed: false,
        description,
        editable: false
      });
    } else {
      const finalName = name.includes('.') ? name.trim() : `${name.trim()}.md`;
      state.items.unshift({
        id: 'd_' + Date.now(),
        name: finalName,
        kind: 'doc',
        mimeType: 'text/markdown',
        parent,
        size: 0.02,
        date: nowStr(),
        by: state.currentUser,
        starred: false,
        shared: true,
        trashed: false,
        description,
        content,
        editable: true
      });
    }
    saveBrowserLocalItems(state.items);
    state.sheet = null;
    toast(mode === 'doc' ? '새 문서를 생성했습니다' : '새 폴더를 만들었습니다');
    render();
  } catch (err) {
    toast('생성 실패: ' + err.message);
  }
}

async function openEditorSheet(item) {
  try {
    if (state.accessToken) {
      const gRes = await fetch(`https://www.googleapis.com/drive/v3/files/${item.id}?alt=media`, {
        headers: { Authorization: `Bearer ${state.accessToken}` }
      });
      const text = await gRes.text();
      state.sheet = { type: 'editor', id: item.id, name: item.name, content: text, description: item.description || '' };
      render();
      return;
    }
    if (state.hasBackend) {
      const res = await fetch(`/api/files/${item.id}/content`).then(r => r.json());
      state.sheet = { type: 'editor', id: item.id, name: item.name, content: res.content || '', description: res.description || item.description || '' };
      render();
      return;
    }
    state.sheet = { type: 'editor', id: item.id, name: item.name, content: item.content || '', description: item.description || '' };
    render();
  } catch (err) {
    toast('문서 내용을 불러올 수 없습니다: ' + err.message);
  }
}

async function permanentDeleteItem(id) {
  try {
    if (state.accessToken) {
      await fetch(`https://www.googleapis.com/drive/v3/files/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${state.accessToken}` }
      });
    } else if (state.hasBackend) {
      await fetch(`/api/files/${id}`, { method: 'DELETE' });
    }
    state.items = state.items.filter(i => i.id !== id && i.parent !== id);
    saveBrowserLocalItems(state.items);
    state.sheet = null;
    if (state.detailId === id) state.detailId = null;
    toast('영구 삭제되었습니다');
    render();
  } catch (err) {
    toast('삭제 실패: ' + err.message);
  }
}

async function downloadItem(item) {
  state.sheet = null;
  toast(`${item.name} 다운로드를 시작합니다`);
  render();

  if (state.accessToken) {
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${item.id}?alt=media`, {
        headers: { Authorization: `Bearer ${state.accessToken}` }
      });
      if (!res.ok) {
        if (item.webContentLink || item.webViewLink) {
          window.open(item.webContentLink || item.webViewLink, '_blank');
          return;
        }
        throw new Error('다운로드 권한 확인 필요');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      return;
    } catch (e) {
      if (item.webViewLink) window.open(item.webViewLink, '_blank');
      return;
    }
  }

  if (state.hasBackend) {
    const a = document.createElement('a');
    a.href = `/api/files/${item.id}/download`;
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  const url = state.blobMap[item.id] || URL.createObjectURL(new Blob([
    typeof item.content === 'string'
      ? item.content
      : `[방송국 공유 드라이브 파일]\n파일명: ${item.name}\n용량: ${item.size} MB\n업로더: ${item.by}\n수정일: ${item.date}\n설명: ${item.description || '없음'}`
  ], { type: 'text/plain;charset=utf-8' }));

  const a = document.createElement('a');
  a.href = url;
  a.download = typeof item.content === 'string' || state.blobMap[item.id] ? item.name : `${item.name}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function copyShareLink(item) {
  const link = item.webViewLink || window.location.href;
  navigator.clipboard?.writeText(link);
  state.sheet = null;
  toast('공유 링크를 클립보드에 복사했습니다');
  render();
}

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================

function getFilteredList() {
  const live = state.items.filter(i => !i.trashed);
  let list = [];
  if (state.query.trim()) {
    const q = state.query.trim().toLowerCase();
    list = live.filter(i => i.name.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q) || (i.by || '').toLowerCase().includes(q));
  } else if (state.nav === 'drive') {
    list = live.filter(i => i.parent === state.folder);
  } else if (state.nav === 'recent') {
    list = live.filter(i => i.kind !== 'folder').sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 25);
  } else if (state.nav === 'shared') {
    list = live.filter(i => i.shared);
  } else if (state.nav === 'starred') {
    list = live.filter(i => i.starred);
  } else if (state.nav === 'trash') {
    list = state.items.filter(i => i.trashed);
  }

  if (state.typeFilter !== 'all') {
    list = list.filter(i => {
      if (state.typeFilter === 'doc') return ['doc', 'pdf'].includes(i.kind);
      if (state.typeFilter === 'image') return ['image', 'psd'].includes(i.kind);
      return i.kind === state.typeFilter;
    });
  }

  const cmp = {
    date: (a, b) => (b.date || '').localeCompare(a.date || ''),
    name: (a, b) => (a.name || '').localeCompare(b.name || '', 'ko'),
    size: (a, b) => (Number(b.size) || 0) - (Number(a.size) || 0)
  }[state.sort];

  if (state.nav !== 'recent' || state.query.trim()) {
    list = [...list].sort((a, b) => {
      if ((a.kind === 'folder') !== (b.kind === 'folder')) return a.kind === 'folder' ? -1 : 1;
      return cmp(a, b);
    });
  }
  return list;
}

function formatMeta(it) {
  if (it.kind === 'folder') {
    return `${countIn(it.id)}개 항목 · ${dateLabel(it.date)}${it.description ? ' · ' + it.description : ''}`;
  }
  return `${fmtSize(it.size)} · ${dateLabel(it.date)} · ${it.by}`;
}

function renderToasts() {
  let container = document.getElementById('toast-root');
  if (!container) return;
  container.innerHTML = state.toasts.map(t => `
    <div class="toast-item">
      <span style="color:#4ADE80;display:flex">${iconSvg('check', 16)}</span>
      <span>${esc(t.msg)}</span>
    </div>
  `).join('');
}

function renderUploadStatusOnly() {
  const barEl = document.getElementById('upload-bar-root');
  if (barEl) barEl.innerHTML = buildUploadBarHTML();
  if (state.sheet && state.sheet.type === 'uploads') {
    const sheetRoot = document.getElementById('sheet-root');
    if (sheetRoot) sheetRoot.innerHTML = buildSheetHTML();
  }
}

function buildUploadBarHTML() {
  const ups = state.uploads;
  if (!ups.length || state.detailId) return '';
  const active = ups.filter(u => u.state === 'active');
  const tot = ups.reduce((a, u) => a + u.total, 0);
  const dn = ups.reduce((a, u) => a + u.done, 0);
  const pct = tot ? Math.min(1, dn / tot) : 0;
  const deg = Math.round(pct * 360) + 'deg';
  const title = active.length ? `${active.length}개 업로드 중 · ${Math.round(pct * 100)}%` : '업로드 완료';
  const sub = active.length ? `${active[0].name}${active.length > 1 ? ` 외 ${active.length - 1}개` : ''} · ${fmtSize(Math.max(0, tot - dn))} 남음` : ups.map(u => u.name).join(', ');

  return `
    <div class="upload-floating-bar" onclick="openSheet('uploads')">
      <div style="position:relative;width:32px;height:32px;flex-shrink:0;border-radius:50%;background:conic-gradient(#60A5FA ${deg},rgba(255,255,255,0.15) 0);display:flex;align-items:center;justify-content:center">
        <div style="width:26px;height:26px;border-radius:50%;background:#0F172A;display:flex;align-items:center;justify-content:center;color:#93C5FD">${iconSvg('upload', 14)}</div>
      </div>
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">
        <span style="font-size:14px;font-weight:600;white-space:nowrap">${esc(title)}</span>
        <span style="font-size:12px;color:#CBD5E1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-variant-numeric:tabular-nums">${esc(sub)}</span>
      </div>
      <span style="color:#94A3B8;display:flex">${iconSvg('chevronUp', 18)}</span>
    </div>
  `;
}

function buildDetailHTML() {
  if (!state.detailId) return '';
  const d = byId(state.detailId);
  if (!d) return '';
  const dk = KINDS[d.kind] || KINDS.file;
  const isVideo = d.kind === 'video';
  const isImage = d.kind === 'image';
  const isAudio = d.kind === 'audio';
  const localBlobUrl = state.blobMap[d.id];
  const hasRealMedia = Boolean(localBlobUrl || (state.hasBackend && (d.localFile || d.source === 'google')));
  const streamUrl = localBlobUrl || `/api/files/${d.id}/download?inline=1`;
  const pathNames = getFolderPath(d.parent).map(x => x.name);

  let previewHTML = '';
  if (isVideo) {
    if (hasRealMedia) {
      previewHTML = `
        <div style="width:100%;aspect-ratio:16/9;border-radius:16px;background:#0F172A;overflow:hidden;display:flex;align-items:center;justify-content:center">
          <video src="${streamUrl}" controls style="width:100%;height:100%;object-fit:contain"></video>
        </div>`;
    } else {
      previewHTML = `
        <div style="width:100%;flex-shrink:0;aspect-ratio:16/9;border-radius:16px;background:linear-gradient(135deg,#0F172A 0%,#1E293B 55%,#334155 100%);position:relative;display:flex;align-items:center;justify-content:center">
          <span style="position:absolute;left:12px;top:12px;font-family:ui-monospace,monospace;font-size:11px;color:rgba(255,255,255,0.6)">4K Broadcast Stream (${esc(d.name)})</span>
          <button onclick="downloadItemById('${d.id}')" style="width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,0.95);color:#111827;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 25px rgba(0,0,0,0.35)">${iconSvg('play', 24)}</button>
          ${d.dur ? `<span style="position:absolute;right:12px;bottom:12px;font-family:ui-monospace,monospace;font-size:12px;padding:3px 7px;border-radius:6px;background:rgba(0,0,0,0.65);color:#fff">${esc(d.dur)}</span>` : ''}
        </div>`;
    }
  } else if (isImage) {
    if (hasRealMedia || d.thumbnailLink) {
      previewHTML = `
        <div style="width:100%;max-height:360px;border-radius:16px;background:#F1F5F9;overflow:hidden;display:flex;align-items:center;justify-content:center">
          <img src="${hasRealMedia ? streamUrl : d.thumbnailLink}" alt="${esc(d.name)}" style="max-width:100%;max-height:360px;object-fit:contain">
        </div>`;
    } else {
      previewHTML = `
        <div style="width:100%;flex-shrink:0;aspect-ratio:16/9;border-radius:16px;background:linear-gradient(135deg,#E0F2FE 0%,#BAE6FD 100%);display:flex;flex-direction:column;gap:8px;align-items:center;justify-content:center;color:#0369A1">
          ${iconSvg('image', 42)}
          <span style="font-family:ui-monospace,monospace;font-size:12px">${esc(d.name)} 미리보기</span>
        </div>`;
    }
  } else if (isAudio && hasRealMedia) {
    previewHTML = `
      <div style="width:100%;padding:28px 20px;border-radius:16px;background:${dk.bg};color:${dk.color};display:flex;flex-direction:column;align-items:center;gap:14px">
        ${iconSvg(dk.icon, 48)}
        <audio src="${streamUrl}" controls style="width:100%"></audio>
      </div>`;
  } else if (d.editable && typeof d.content === 'string') {
    previewHTML = `
      <div style="width:100%;border-radius:16px;background:#F8FAFC;border:1px solid #E2E8F0;padding:16px;display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:12px;font-weight:700;color:#2563EB">📄 문서 내용 미리보기 (직접 편집 가능)</span>
          <button onclick="openEditorById('${d.id}')" style="padding:5px 10px;border-radius:8px;background:#2563EB;color:#fff;font-size:12px;font-weight:600;display:flex;align-items:center;gap:4px">${iconSvg('pencil', 13)} 문서 편집하기</button>
        </div>
        <pre style="font-family:'Pretendard Variable',ui-monospace,monospace;font-size:13px;line-height:1.55;color:#1E293B;white-space:pre-wrap;max-height:200px;overflow-y:auto;background:#fff;padding:12px;border-radius:10px;border:1px solid #EEF0F3">${esc(d.content)}</pre>
      </div>`;
  } else {
    previewHTML = `
      <div style="width:100%;flex-shrink:0;aspect-ratio:16/9;max-height:220px;border-radius:16px;background:${dk.bg};color:${dk.color};display:flex;flex-direction:column;gap:10px;align-items:center;justify-content:center">
        ${iconSvg(dk.icon, 56)}
        ${d.editable ? `<button onclick="openEditorById('${d.id}')" style="padding:7px 14px;border-radius:10px;background:#2563EB;color:#fff;font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px">${iconSvg('pencil', 14)} 웹 에디터로 열기/편집</button>` : ''}
      </div>`;
  }

  return `
    <div class="detail-backdrop" onclick="if(event.target===this) closeDetail()">
      <div class="detail-panel">
        <div style="flex-shrink:0;display:flex;align-items:center;gap:4px;height:56px;padding:0 12px;border-bottom:1px solid #F1F3F5">
          <button class="icon-btn" onclick="closeDetail()">${iconSvg('x', 22)}</button>
          <div style="flex:1;min-width:0;font-size:16px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center">${esc(d.name)}</div>
          <button class="icon-btn" onclick="openActionsSheet('${d.id}')">${iconSvg('moreV', 22)}</button>
        </div>

        <div style="flex:1;min-height:0;overflow-y:auto;padding:16px 20px 28px;display:flex;flex-direction:column;gap:20px">
          ${previewHTML}

          <div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px">
            <button onclick="downloadItemById('${d.id}')" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 0 10px;border-radius:14px;background:#F1F5F9;color:#2563EB;font-size:12px;font-weight:600">
              ${iconSvg('download', 20)}<span style="color:#374151">다운로드</span>
            </button>
            <button onclick="${d.editable ? `openEditorById('${d.id}')` : `openRenameSheet('${d.id}')`}" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 0 10px;border-radius:14px;background:#F1F5F9;color:#16A34A;font-size:12px;font-weight:600">
              ${iconSvg('pencil', 20)}<span style="color:#374151">${d.editable ? '내용편집' : '이름/설명'}</span>
            </button>
            <button onclick="triggerReplaceUpload('${d.id}')" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 0 10px;border-radius:14px;background:#F1F5F9;color:#7C3AED;font-size:12px;font-weight:600">
              ${iconSvg('fileUp', 20)}<span style="color:#374151">버전교체</span>
            </button>
            <button onclick="toggleStarById('${d.id}')" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 0 10px;border-radius:14px;background:#F1F5F9;color:${d.starred ? '#F59E0B' : '#374151'};font-size:12px;font-weight:600">
              ${iconSvg(d.starred ? 'starFill' : 'star', 20)}<span style="color:#374151">즐겨찾기</span>
            </button>
            <button onclick="openConfirmTrash('${d.id}')" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 0 10px;border-radius:14px;background:#FEF2F2;color:#DC2626;font-size:12px;font-weight:600">
              ${iconSvg('trash', 20)}<span style="color:#DC2626">삭제</span>
            </button>
          </div>

          <div style="background:#F8F9FD;border:1px solid #ECEEF6;border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:8px">
            <span style="font-size:12.5px;font-weight:800;color:#4F5770">📝 제작 메모 · 주석</span>
            <textarea id="memo-input" rows="3" placeholder="카메라 세팅, 편집 피드백, 전달 사항을 남겨 보세요."
              style="width:100%;resize:vertical;min-height:72px;padding:10px 12px;border-radius:12px;border:1px solid #E6E9F3;background:#FFFFFF;font-family:inherit;font-size:13.5px;line-height:1.55;color:#20294D;outline:none">${esc(d.description || '')}</textarea>
            <div style="display:flex;align-items:center;justify-content:flex-end;gap:8px">
              <span id="memo-hint" style="margin-right:auto;font-size:12px;color:#8A93AE">${d.description ? `${esc(d.by || '')} 마지막 수정 ${esc(d.date)}` : '아직 메모가 없습니다.'}</span>
              <button onclick="saveMemo('${d.id}')" style="height:36px;padding:0 14px;border-radius:11px;background:linear-gradient(135deg,#416FDE,#6656DA);color:#fff;font-size:13px;font-weight:700">메모 저장</button>
            </div>
          </div>

          <div style="display:flex;flex-direction:column">
            <span style="font-size:13px;font-weight:600;color:#64748B;padding-bottom:6px">파일 상세 정보</span>
            <div style="display:flex;align-items:center;justify-content:space-between;min-height:44px;border-bottom:1px solid #F1F3F5;font-size:14px">
              <span style="color:#64748B">종류</span>
              <span style="font-weight:500">${esc(dk.label)} (${esc((d.name.split('.').pop() || '').toUpperCase())})</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;min-height:44px;border-bottom:1px solid #F1F3F5;font-size:14px">
              <span style="color:#64748B">크기</span>
              <span style="font-variant-numeric:tabular-nums">${fmtSize(d.size)}</span>
            </div>
            ${d.dur ? `
            <div style="display:flex;align-items:center;justify-content:space-between;min-height:44px;border-bottom:1px solid #F1F3F5;font-size:14px">
              <span style="color:#64748B">재생 길이</span>
              <span style="font-variant-numeric:tabular-nums">${esc(d.dur)}</span>
            </div>` : ''}
            <div style="display:flex;align-items:center;justify-content:space-between;min-height:44px;border-bottom:1px solid #F1F3F5;font-size:14px">
              <span style="color:#64748B">저장 위치</span>
              <span>${esc([state.driveName, ...pathNames].join(' › '))}</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;min-height:44px;border-bottom:1px solid #F1F3F5;font-size:14px">
              <span style="color:#64748B">업로드·수정한 부원</span>
              <span style="font-weight:500">${esc(d.by || '서창민')}</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;min-height:44px;border-bottom:1px solid #F1F3F5;font-size:14px">
              <span style="color:#64748B">최근 수정일</span>
              <span style="font-variant-numeric:tabular-nums">${esc(d.date)}</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;min-height:44px;font-size:14px">
              <span style="color:#64748B">공유 상태</span>
              <button onclick="toggleSharedById('${d.id}')" style="color:#2563EB;font-weight:600;font-size:13px">${d.shared ? '방송국 팀 전체 공유 중 (변경)' : '일반 보관 (팀 공유로 전환)'}</button>
            </div>
            ${d.webViewLink ? `
            <a href="${esc(d.webViewLink)}" target="_blank" style="margin-top:12px;display:flex;align-items:center;justify-content:center;gap:6px;height:44px;border-radius:12px;background:#EFF6FF;color:#2563EB;font-size:14px;font-weight:600;text-decoration:none">
              ${iconSvg('externalLink', 16)} Google Drive 원본 웹에서 열기 / 편집
            </a>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildSheetHTML() {
  const sh = state.sheet;
  if (!sh) return '';

  let inner = '';

  if (sh.type === 'actions') {
    const item = byId(sh.id);
    if (!item) return '';
    const k = KINDS[item.kind] || KINDS.file;
    inner = `
      <div style="display:flex;align-items:center;gap:12px;padding:4px 4px 14px;border-bottom:1px solid #F1F3F5;margin-bottom:6px">
        <div style="width:42px;height:42px;flex-shrink:0;border-radius:11px;background:${k.bg};color:${k.color};display:flex;align-items:center;justify-content:center">${iconSvg(k.icon, 22)}</div>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">
          <span style="font-size:15px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(item.name)}</span>
          <span style="font-size:12px;color:#64748B">${esc(formatMeta(item))}</span>
        </div>
      </div>
      ${item.trashed ? `
        <div onclick="restoreItemById('${item.id}')" style="display:flex;align-items:center;gap:14px;height:50px;padding:0 8px;border-radius:12px;cursor:pointer;color:#2563EB;font-size:15px;font-weight:600">${iconSvg('refresh', 20)}<span>원래 위치로 복원</span></div>
        <div onclick="permanentDeleteItem('${item.id}')" style="display:flex;align-items:center;gap:14px;height:50px;padding:0 8px;border-radius:12px;cursor:pointer;color:#DC2626;font-size:15px;font-weight:600">${iconSvg('trash', 20)}<span>영구 삭제</span></div>
      ` : `
        ${item.kind !== 'folder' ? `<div onclick="downloadItemById('${item.id}')" style="display:flex;align-items:center;gap:14px;height:48px;padding:0 8px;border-radius:12px;cursor:pointer;color:#374151;font-size:15px">${iconSvg('download', 20)}<span>다운로드</span></div>` : ''}
        ${item.editable ? `<div onclick="openEditorById('${item.id}')" style="display:flex;align-items:center;gap:14px;height:48px;padding:0 8px;border-radius:12px;cursor:pointer;color:#2563EB;font-size:15px;font-weight:600">${iconSvg('fileText', 20)}<span>내용 직접 편집 (큐시트/문서/메모)</span></div>` : ''}
        ${item.kind !== 'folder' ? `<div onclick="triggerReplaceUpload('${item.id}')" style="display:flex;align-items:center;gap:14px;height:48px;padding:0 8px;border-radius:12px;cursor:pointer;color:#374151;font-size:15px">${iconSvg('fileUp', 20)}<span>새 버전 파일로 덮어쓰기 (수정본 교체)</span></div>` : ''}
        <div onclick="openRenameSheet('${item.id}')" style="display:flex;align-items:center;gap:14px;height:48px;padding:0 8px;border-radius:12px;cursor:pointer;color:#374151;font-size:15px">${iconSvg('pencil', 20)}<span>이름 및 설명(메모) 수정</span></div>
        <div onclick="openMoveSheet('${item.id}')" style="display:flex;align-items:center;gap:14px;height:48px;padding:0 8px;border-radius:12px;cursor:pointer;color:#374151;font-size:15px">${iconSvg('move', 20)}<span>폴더 이동</span></div>
        <div onclick="toggleStarById('${item.id}')" style="display:flex;align-items:center;gap:14px;height:48px;padding:0 8px;border-radius:12px;cursor:pointer;color:#374151;font-size:15px">${iconSvg(item.starred ? 'starFill' : 'star', 20)}<span>${item.starred ? '즐겨찾기 해제' : '즐겨찾기 추가'}</span></div>
        <div onclick="toggleSharedById('${item.id}')" style="display:flex;align-items:center;gap:14px;height:48px;padding:0 8px;border-radius:12px;cursor:pointer;color:#374151;font-size:15px">${iconSvg('users', 20)}<span>${item.shared ? '공유 탭에서 숨기기' : '공유 파일로 표시'}</span></div>
        <div onclick="copyLinkById('${item.id}')" style="display:flex;align-items:center;gap:14px;height:48px;padding:0 8px;border-radius:12px;cursor:pointer;color:#374151;font-size:15px">${iconSvg('link', 20)}<span>공유 링크 복사</span></div>
        <div onclick="openConfirmTrash('${item.id}')" style="display:flex;align-items:center;gap:14px;height:48px;padding:0 8px;border-radius:12px;cursor:pointer;color:#DC2626;font-size:15px">${iconSvg('trash', 20)}<span>휴지통으로 이동</span></div>
      `}
    `;
  } else if (sh.type === 'upload') {
    const curFolder = state.nav === 'drive' && state.folder !== 'root' ? byId(state.folder) : null;
    const dropTargetName = curFolder ? curFolder.name : state.driveName;
    inner = `
      <div style="display:flex;flex-direction:column;gap:2px;padding:2px 4px 14px">
        <span style="font-size:18px;font-weight:700">파일 업로드 및 새로 만들기</span>
        <span style="font-size:13px;color:#64748B">현재 위치: <strong>${esc(dropTargetName)}</strong> 폴더에 저장됩니다 (작성자: ${esc(state.currentUser)})</span>
      </div>
      <div onclick="triggerFileInput()" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:24px 16px 20px;border:1.5px dashed #93C5FD;border-radius:16px;background:#F8FAFC;text-align:center;cursor:pointer">
        <div style="width:48px;height:48px;border-radius:50%;background:#EFF6FF;color:#2563EB;display:flex;align-items:center;justify-content:center;margin-bottom:4px">${iconSvg('upload', 22)}</div>
        <span style="font-size:15px;font-weight:600">기기에서 파일 선택 (또는 화면에 드래그 앤 드롭)</span>
        <span style="font-size:12px;color:#64748B">영상·이미지·오디오·문서·압축파일 등 대용량 원본 지원</span>
        <span style="margin-top:10px;display:flex;align-items:center;gap:6px;height:42px;padding:0 20px;border-radius:12px;background:#2563EB;color:#fff;font-size:14px;font-weight:600">${iconSvg('fileUp', 16)} 파일 선택하기</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px">
        <button onclick="triggerFolderInput()" style="display:flex;align-items:center;justify-content:center;gap:6px;height:48px;border:1px solid #E5E7EB;border-radius:12px;background:#fff;font-size:13px;font-weight:600;color:#374151">${iconSvg('folderUp', 18)} 폴더 업로드</button>
        <button onclick="openCreateFolderSheet()" style="display:flex;align-items:center;justify-content:center;gap:6px;height:48px;border:1px solid #E5E7EB;border-radius:12px;background:#fff;font-size:13px;font-weight:600;color:#374151">${iconSvg('folderPlus', 18)} 새 폴더</button>
        <button onclick="openCreateDocSheet()" style="display:flex;align-items:center;justify-content:center;gap:6px;height:48px;border:1px solid #E5E7EB;border-radius:12px;background:#fff;font-size:13px;font-weight:600;color:#2563EB">${iconSvg('fileText', 18)} 새 큐시트/문서</button>
      </div>
    `;
  } else if (sh.type === 'sort') {
    inner = `
      <div style="font-size:17px;font-weight:700;padding:2px 4px 10px">정렬 기준</div>
      ${SORTS.map(([k, l]) => `
        <div onclick="setSort('${k}')" style="display:flex;align-items:center;justify-content:space-between;height:50px;padding:0 8px;border-radius:12px;cursor:pointer;font-size:15px;color:${state.sort === k ? '#2563EB' : '#374151'};font-weight:${state.sort === k ? 600 : 400}">
          <span>${esc(l)}</span>
          ${state.sort === k ? iconSvg('check', 18) : ''}
        </div>
      `).join('')}
    `;
  } else if (sh.type === 'uploads') {
    inner = `
      <div style="font-size:17px;font-weight:700;padding:2px 4px 10px">업로드 진행 현황</div>
      ${state.uploads.map(u => {
        const k = KINDS[u.kind] || KINDS.file;
        const pct = u.total ? Math.min(100, Math.round((u.done / u.total) * 100)) : 100;
        const barColor = u.state === 'done' ? '#16A34A' : u.state === 'error' ? '#DC2626' : '#2563EB';
        const statusText = u.state === 'done' ? '완료됨' : u.state === 'error' ? '오류 발생' : `${pct}% 진행 중`;
        return `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #F1F3F5">
            <div style="width:40px;height:40px;flex-shrink:0;border-radius:10px;background:${k.bg};color:${k.color};display:flex;align-items:center;justify-content:center">${iconSvg(k.icon, 20)}</div>
            <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px">
              <span style="font-size:14px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(u.name)}</span>
              <div style="height:5px;border-radius:3px;background:#E5E7EB;overflow:hidden"><div style="height:100%;width:${pct}%;background:${barColor}"></div></div>
              <span style="font-size:12px;color:#64748B;font-variant-numeric:tabular-nums">${fmtSize(u.done)} / ${fmtSize(u.total)} · ${statusText}</span>
            </div>
            <button onclick="cancelUpload('${u.id}')" class="icon-btn">${iconSvg('x', 18)}</button>
          </div>
        `;
      }).join('')}
    `;
  } else if (sh.type === 'confirm') {
    const item = byId(sh.id);
    if (!item) return '';
    inner = `
      <div style="display:flex;flex-direction:column;gap:6px;padding:6px 4px 18px">
        <span style="font-size:18px;font-weight:700">휴지통으로 이동할까요?</span>
        <span style="font-size:14px;color:#64748B"><strong>${esc(item.name)}</strong> 항목은 휴지통 탭으로 이동하며 언제든 복원할 수 있습니다.</span>
      </div>
      <div class="btn-row">
        <button class="btn-secondary" onclick="closeSheet()">취소</button>
        <button class="btn-danger" onclick="confirmTrash('${item.id}')">휴지통 이동</button>
      </div>
    `;
  } else if (sh.type === 'input') {
    const isRename = sh.mode === 'rename';
    inner = `
      <div style="font-size:18px;font-weight:700;padding:2px 4px 14px">${isRename ? '이름 및 설명(메모) 수정' : '새 폴더 만들기'}</div>
      <div class="form-group">
        <label class="form-label">${isRename ? '파일/폴더 이름' : '폴더 이름'}</label>
        <input id="sheet-input-name" class="form-input" value="${esc(sh.value || '')}" placeholder="이름을 입력하세요" onkeydown="if(event.key==='Enter') submitInputSheet()">
      </div>
      <div class="form-group">
        <label class="form-label">설명 / 제작 메모 (선택)</label>
        <input id="sheet-input-desc" class="form-input" value="${esc(sh.description || '')}" placeholder="카메라 기종, 담당자, 피드백 등 메모 입력" onkeydown="if(event.key==='Enter') submitInputSheet()">
      </div>
      <div class="btn-row">
        <button class="btn-secondary" onclick="closeSheet()">취소</button>
        <button class="btn-primary" onclick="submitInputSheet()">${isRename ? '저장하기' : '만들기'}</button>
      </div>
    `;
  } else if (sh.type === 'move') {
    const item = byId(sh.id);
    if (!item) return '';
    const folders = state.items.filter(i => i.kind === 'folder' && !i.trashed && i.id !== item.id);
    inner = `
      <div style="display:flex;flex-direction:column;gap:2px;padding:2px 4px 12px">
        <span style="font-size:18px;font-weight:700">이동할 폴더 선택</span>
        <span style="font-size:13px;color:#64748B"><strong>${esc(item.name)}</strong> 항목을 어디로 이동할까요?</span>
      </div>
      <div style="max-height:320px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;border:1px solid #E5E7EB;border-radius:14px;padding:6px">
        <div onclick="moveItemTo('${item.id}', 'root')" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;cursor:pointer;background:${item.parent === 'root' ? '#EFF6FF' : 'transparent'};font-weight:${item.parent === 'root' ? 600 : 500}">
          <span style="color:#2563EB;display:flex">${iconSvg('hardDrive', 20)}</span>
          <span style="flex:1">${esc(state.driveName)} (최상위 루트)</span>
          ${item.parent === 'root' ? `<span style="font-size:11px;color:#2563EB">현재 위치</span>` : ''}
        </div>
        ${folders.map(f => {
          const pNames = getFolderPath(f.parent).map(x => x.name).join(' › ');
          const isCur = item.parent === f.id;
          return `
            <div onclick="moveItemTo('${item.id}', '${f.id}')" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;cursor:pointer;background:${isCur ? '#EFF6FF' : 'transparent'}">
              <span style="color:#2563EB;display:flex">${iconSvg('folderFill', 20)}</span>
              <div style="flex:1;min-width:0;display:flex;flex-direction:column">
                <span style="font-size:14px;font-weight:${isCur ? 600 : 500}">${esc(f.name)}</span>
                ${pNames ? `<span style="font-size:11px;color:#94A3B8">${esc(pNames)}</span>` : ''}
              </div>
              ${isCur ? `<span style="font-size:11px;color:#2563EB;font-weight:600">현재 위치</span>` : ''}
            </div>
          `;
        }).join('')}
      </div>
      <div style="margin-top:12px">
        <button class="btn-secondary" style="width:100%" onclick="closeSheet()">닫기</button>
      </div>
    `;
  } else if (sh.type === 'editor') {
    const isNew = sh.mode === 'new';
    inner = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 4px 12px">
        <span style="font-size:18px;font-weight:700">${isNew ? '📝 새 방송국 문서 / 큐시트 작성' : '✏️ 문서 내용 직접 편집'}</span>
      </div>
      <div class="form-group">
        <label class="form-label">파일 이름 (.md, .txt, .csv 지원)</label>
        <input id="editor-file-name" class="form-input" value="${esc(sh.name || '')}" placeholder="예: 2026_가을축제_큐시트.md">
      </div>
      <div class="form-group">
        <label class="form-label">설명 / 한줄 메모</label>
        <input id="editor-file-desc" class="form-input" value="${esc(sh.description || '')}" placeholder="문서 용도나 버전 메모">
      </div>
      <div class="form-group">
        <label class="form-label">본문 내용</label>
        <textarea id="editor-file-content" class="editor-textarea" placeholder="큐시트, 대본, 장비 대여 기록, CSV 표 데이터를 자유롭게 작성/편집하세요...">${esc(sh.content || '')}</textarea>
      </div>
      <div class="btn-row">
        <button class="btn-secondary" onclick="closeSheet()">취소</button>
        <button class="btn-primary" onclick="saveEditorSheet()">저장 및 동기화</button>
      </div>
    `;
  } else if (sh.type === 'user') {
    const presets = ['서창민', '강주형', '이수진', '박도윤', '김하늘'];
    inner = `
      <div style="font-size:18px;font-weight:700;padding:2px 4px 6px">접속 부원 프로필 설정</div>
      <p style="font-size:13px;color:#64748B;margin-bottom:14px">파일을 업로드하거나 수정할 때 기록될 부원 이름을 설정합니다.</p>
      <div class="form-group">
        <label class="form-label">내 이름 (직책/부원명)</label>
        <input id="user-name-input" class="form-input" value="${esc(state.currentUser)}" placeholder="예: 서창민 (PD)">
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">
        ${presets.map(p => `
          <button onclick="document.getElementById('user-name-input').value='${p}'" style="padding:6px 12px;border-radius:99px;background:#F1F5F9;color:#374151;font-size:13px;font-weight:500">${p}</button>
        `).join('')}
      </div>
      <div class="btn-row">
        <button class="btn-secondary" onclick="closeSheet()">취소</button>
        <button class="btn-primary" onclick="saveUserName()">변경 완료</button>
      </div>
    `;
  } else if (sh.type === 'settings') {
    const st = getStorageStats();
    inner = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 4px 10px">
        <span style="font-size:18px;font-weight:700">⚙️ 내 드라이브 상시 연결 및 용량 설정</span>
        <span class="conn-badge google">상시 연결 활성</span>
      </div>

      <div style="padding:14px;border-radius:14px;background:#F0FDF4;border:1px solid #BBF7D0;margin-bottom:14px;display:flex;flex-direction:column;gap:5px">
        <div style="font-size:13.5px;font-weight:700;color:#15803D">✅ 내 구글 드라이브 상시 연결 중 (${esc(state.userEmail)})</div>
        <div style="font-size:12px;color:#166534">현재 사용량: <strong>${st.usedGb} GB</strong> / 총 용량 <strong>${st.totalGb} GB</strong> (여유 ${st.freeGb} GB)</div>
      </div>

      <div class="form-group">
        <label class="form-label">공유 드라이브 표시 이름</label>
        <input id="cfg-drive-name" class="form-input" value="${esc(state.driveName)}" placeholder="예: 방송국 공유 드라이브">
      </div>
      <div class="form-group">
        <label class="form-label">드라이브 총 할당 용량 (GB)</label>
        <input id="cfg-quota-gb" type="number" class="form-input" value="${esc(state.totalQuotaGb)}" placeholder="예: 200 (Google One 200GB 요금제 기준)">
      </div>
      <div class="form-group">
        <label class="form-label">Google OAuth Client ID <span style="color:#16A34A;font-weight:600">(상시 등록됨)</span></label>
        <input id="cfg-client-id" class="form-input" value="${esc(state.clientId || DEFAULT_CLIENT_ID)}">
      </div>
      <div class="form-group">
        <label class="form-label">공유 지정 폴더 ID <span style="color:#DC2626;font-weight:700">(외부 폴더 차단 · 전용 폴더 고정 잠금)</span></label>
        <input id="cfg-folder-id" class="form-input" value="${esc(LOCKED_ROOT_FOLDER_ID)}" readonly style="background:#F1F5F9;color:#475569;font-family:ui-monospace,monospace;cursor:not-allowed">
        <div style="font-size:11.5px;color:#64748B;margin-top:4px">🔒 보안을 위해 지정된 구글 드라이브 폴더(<code>${esc(LOCKED_ROOT_FOLDER_ID)}</code>) 및 하위 항목만 표시되며 외부 폴더 접근은 완전 차단됩니다.</div>
      </div>

      <div class="btn-row">
        <button class="btn-secondary" onclick="saveConfigOnly()">설정 저장</button>
        <button class="btn-primary" onclick="saveAndConnectGoogle()">구글 토큰 즉시 동기화</button>
      </div>
    `;
  }

  return `
    <div class="sheet-backdrop" onclick="if(event.target===this) closeSheet()">
      <div class="sheet-box" style="${sh.type === 'editor' ? 'width:min(680px, 100%)' : ''}">
        <div style="width:36px;height:5px;border-radius:3px;background:#D1D5DB;margin:0 auto 12px"></div>
        ${inner}
      </div>
    </div>
  `;
}

function render() {
  const appEl = document.getElementById('app');
  if (!appEl) return;

  if (state.theme === 'light') document.body.classList.add('theme-light');
  else document.body.classList.remove('theme-light');

  const list = getFilteredList();
  const liveItems = state.items.filter(i => !i.trashed);
  const topFolders = liveItems.filter(i => i.kind === 'folder' && i.parent === 'root').slice(0, 6);
  const videoCount = liveItems.filter(i => i.kind === 'video').length;
  const docCount = liveItems.filter(i => ['doc', 'pdf'].includes(i.kind)).length;

  const curFolder = state.nav === 'drive' && state.folder !== 'root' ? byId(state.folder) : null;
  const navObj = NAV_TABS.find(n => n[0] === state.nav) || NAV_TABS[0];
  const headerTitle = state.nav === 'drive'
    ? (curFolder ? curFolder.name : state.driveName)
    : navObj[1];
  const showBack = state.nav === 'drive' && state.folder !== 'root';
  const crumbs = showBack ? [{ id: 'root', name: state.driveName }, ...getFolderPath(curFolder?.parent)] : [];
  const sortLabel = (SORTS.find(x => x[0] === state.sort) || SORTS[0])[1];
  const st = getStorageStats();

  const kindLabelMap = {
    folder: '폴더',
    video: '4K/HD 영상',
    image: '이미지·스틸',
    audio: '음원·녹음',
    psd: '그래픽 원본',
    doc: '문서·큐시트',
    pdf: 'PDF 문서',
    zip: '압축 아카이브',
    file: '일반 파일'
  };

  appEl.innerHTML = `
    <div class="app-shell"
      ondragover="event.preventDefault(); setDragging(true)"
      ondragleave="if(event.target===this) setDragging(false)"
      ondrop="handleDrop(event)">

      <div class="drop-overlay ${state.dragging ? 'active' : ''}">
        ${iconSvg('upload', 52)}
        <div style="font-size:19px;font-weight:800">여기에 파일을 놓아 지정 폴더에 즉시 업로드하세요</div>
        <div style="font-size:13.5px;color:#93C5FD">${esc(curFolder ? curFolder.name : state.driveName)} (${esc(LOCKED_ROOT_FOLDER_ID.slice(0, 10))}...) 내부에 안전하게 저장됩니다</div>
      </div>

      <!-- LEFT SIDEBAR: ON-AIR STUDIO CONTROL DECK -->
      <aside class="sidebar">
        <div class="brand-card">
          <div class="brand-logo">${iconSvg('play', 20)}</div>
          <div style="min-width:0;flex:1">
            <div class="brand-title">${esc(state.driveName)}</div>
          </div>
        </div>

        <nav class="side-nav">
          <div class="side-nav-label">방송국 작업공간</div>
          ${NAV_TABS.map(([k, label, icn]) => {
            const active = state.nav === k;
            const cnt = countByNav(k);
            return `
              <button class="side-nav-item ${active ? 'active' : ''}" onclick="switchNav('${k}')">
                <span style="display:flex;align-items:center;gap:11px">
                  ${iconSvg(active && k === 'starred' ? 'starFill' : icn, 18)}
                  <span>${esc(label)}</span>
                </span>
                <span class="nav-count-pill">${cnt}</span>
              </button>
            `;
          }).join('')}

          ${topFolders.length ? `
            <div class="side-nav-label" style="margin-top:10px">지정 폴더 빠른 이동</div>
            <button class="quick-folder-item ${state.nav === 'drive' && state.folder === 'root' ? 'active' : ''}" onclick="navigateToFolder('root')">
              <span style="color:#60A5FA;display:flex">${iconSvg('hardDrive', 15)}</span>
              <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">최상위 지정 폴더 (Root)</span>
            </button>
            ${topFolders.map(tf => `
              <button class="quick-folder-item ${state.nav === 'drive' && state.folder === tf.id ? 'active' : ''}" onclick="navigateToFolder('${tf.id}')">
                <span style="color:#3B82F6;display:flex">${iconSvg('folderFill', 15)}</span>
                <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">${esc(tf.name)}</span>
              </button>
            `).join('')}
          ` : ''}
        </nav>

        <!-- 왼쪽 밑 저장소 상태 & 총 용량 위젯 (Bottom-Left Storage Status & Total Capacity) -->
        <div class="sidebar-footer">
          <div class="storage-widget">
            <div class="storage-header-row">
              <div class="storage-title">
                <span style="color:#60A5FA;display:flex">${iconSvg('cloud', 16)}</span>
                <span>저장소 상태</span>
              </div>
              <span class="storage-status-tag">${st.pctTotal}% 사용 중</span>
            </div>

            <div class="total-capacity-box">
              <div class="cap-col">
                <span class="cap-label">현재 사용량</span>
                <span class="cap-val-used">${st.usedGb} GB</span>
              </div>
              <div style="width:1px;height:28px;background:var(--border-strong)"></div>
              <div class="cap-col" style="align-items:flex-end">
                <span class="cap-label">드라이브 총 용량</span>
                <span class="cap-val-total">총 ${st.totalGb} GB</span>
              </div>
            </div>

            <div class="storage-bar-segmented" title="총 용량 ${st.totalGb} GB 중 ${st.usedGb} GB 사용 (여유 ${st.freeGb} GB)">
              <div class="seg-bar" style="width:${st.pVideo}%;background:#7C5FD8"></div>
              <div class="seg-bar" style="width:${st.pArchive}%;background:#4C6FE6"></div>
              <div class="seg-bar" style="width:${st.pOther}%;background:#35B98A"></div>
            </div>

            <div class="storage-legend">
              <div class="legend-item"><span class="legend-dot" style="background:#7C5FD8"></span>영상 ${st.videoGb}GB</div>
              <div class="legend-item"><span class="legend-dot" style="background:#4C6FE6"></span>백업·PSD ${st.archiveGb}GB</div>
              <div class="legend-item"><span class="legend-dot" style="background:#35B98A"></span>음원·문서 ${st.otherGb}GB</div>
              <div class="legend-item"><span class="legend-dot" style="background:#C3C9DB"></span>여유 ${st.freeGb}GB</div>
            </div>

          </div>
        </div>
      </aside>

      <!-- MAIN WORKSPACE AREA -->
      <main class="main-area">
        ${state.searchingMobile ? `
          <div class="top-header">
            <div style="flex:1;display:flex;align-items:center;gap:8px;height:42px;padding:0 12px;border-radius:12px;background:var(--bg-card);border:1px solid var(--border-strong)">
              ${iconSvg('search', 18)}
              <input id="mobile-search-input" value="${esc(state.query)}" oninput="onSearchInput(this.value)" placeholder="파일명, 메모, 업로더 검색..." style="flex:1;min-width:0;border:none;outline:none;background:transparent;font-size:15px">
            </div>
            <button onclick="closeMobileSearch()" style="height:42px;padding:0 8px;font-size:15px;font-weight:700;color:#60A5FA">취소</button>
          </div>
        ` : `
          <header class="dv-hero">
            <svg class="dv-hero-rings" aria-hidden="true" width="560" height="560" viewBox="0 0 560 560">
              <g fill="none" stroke="#FFFFFF" stroke-width="1.5">
                <circle cx="280" cy="280" r="90"/><circle cx="280" cy="280" r="150"/>
                <circle cx="280" cy="280" r="210"/><circle cx="280" cy="280" r="270"/>
              </g>
            </svg>

            <div class="dv-hero-main">
              ${showBack ? `<button class="dv-ghost-btn" onclick="goBackFolder()" title="상위 폴더로">${iconSvg('chevronLeft', 22)}</button>` : ''}
              <div class="dv-hero-text">
                <div class="dv-crumbs">
                  ${crumbs.length
                    ? crumbs.map((c, idx) => `<span class="crumb-link" onclick="navigateToFolder('${c.id}')">${esc(c.name)}</span>${idx < crumbs.length - 1 ? '<span style="opacity:0.55">›</span>' : ''}`).join('')
                    : `<span>${esc(state.driveName)} · 로그인 없이 바로</span>`}
                </div>
                <div class="dv-hero-title">${esc(headerTitle)}</div>
                <span class="dv-lock" title="지정된 구글 드라이브 폴더(${esc(LOCKED_ROOT_FOLDER_ID)}) 외 외부 폴더 접근 차단됨">🔒 지정 폴더 전용 · 외부 폴더 차단됨</span>
              </div>
            </div>

            <div class="dv-hero-side">
              <button class="dv-stat" onclick="switchNav('drive')" title="지정 폴더 전체 자산">
                <span>전체 자산</span><b>${liveItems.length}개</b>
              </button>
              <button class="dv-stat" onclick="setTypeFilter(state.typeFilter === 'video' ? 'all' : 'video')" title="방송 영상 클립만 보기">
                <span>영상</span><b>${videoCount}개</b>
              </button>
              <div class="dv-stat" title="저장소 사용량">
                <span>사용량</span><b>${st.usedGb} / ${st.totalGb} GB</b>
              </div>

              <button class="dv-upload" onclick="openSheet('upload')">${iconSvg('plus', 18)} 업로드</button>

              <button class="dv-ghost-btn" onclick="fetchFiles()" title="구글 드라이브 즉시 새로고침">${iconSvg('refresh', 18)}</button>
            </div>
          </header>
        `}

        <!-- Sub-Toolbar: Category Filter Chips + Quick Actions + Sort + View Mode -->
        <div class="sub-toolbar">
          <div class="search-box-desktop">
            ${iconSvg('search', 16)}
            <input value="${esc(state.query)}" oninput="onSearchInput(this.value)" placeholder="지정 폴더 내 영상, 큐시트, 업로더 검색...">
            ${state.query ? `<button onclick="onSearchInput('')" style="color:var(--text-muted);display:flex">${iconSvg('x', 15)}</button>` : ''}
          </div>

          <div class="filter-chips">
            ${TYPE_FILTERS.map(([k, label]) => `
              <button class="chip-btn ${state.typeFilter === k ? 'active' : ''}" onclick="setTypeFilter('${k}')">${esc(label)}</button>
            `).join('')}
            ${state.nav === 'drive' ? `
              <button class="quick-action-pill" onclick="openCreateFolderSheet()">
                ${iconSvg('folderPlus', 14)} + 새 폴더
              </button>
              <button class="quick-action-pill" onclick="openCreateDocSheet()">
                ${iconSvg('fileText', 14)} + 큐시트/문서 작성
              </button>
            ` : ''}
          </div>

          <div style="display:flex;align-items:center;gap:8px;margin-left:auto">
            <span style="font-size:12.5px;font-weight:700;color:var(--text-secondary)">표시 ${list.length}개</span>
            <button class="sort-btn" onclick="openSheet('sort')">
              <span>${esc(sortLabel)}</span>
              ${iconSvg('chevronDown', 14)}
            </button>
            <button class="icon-btn" style="width:36px;height:34px;border-radius:10px" onclick="toggleViewMode()" title="테이블 / 그리드 보기 전환">
              ${iconSvg(state.view === 'list' ? 'grid' : 'list', 17)}
            </button>
          </div>
        </div>

        <!-- Mobile Storage Bar -->
        <div class="mobile-storage-bar">
          <div style="display:flex;align-items:center;gap:8px">
            <span class="live-dot"></span>
            <span style="font-weight:700">저장소 상태 (상시 연결)</span>
          </div>
          <div style="font-variant-numeric:tabular-nums;color:#93C5FD;font-weight:800">
            ${st.usedGb} GB / 총 용량 ${st.totalGb} GB
          </div>
        </div>

        <!-- File List / Bento Grid -->
        <div class="file-scroll">
          ${state.loading ? `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;gap:12px;color:var(--text-secondary)">
              <div style="font-size:15px;font-weight:700">지정된 공유 드라이브 폴더를 동기화하는 중입니다...</div>
            </div>
          ` : list.length === 0 ? `
            <div style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:76px 32px;text-align:center;background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:20px">
              <div style="width:60px;height:60px;border-radius:50%;background:rgba(59,130,246,0.14);color:#60A5FA;display:flex;align-items:center;justify-content:center;margin-bottom:4px">${iconSvg('folder', 28)}</div>
              <span style="font-size:16.5px;font-weight:800">${state.query || state.typeFilter !== 'all' ? '조건에 맞는 파일이 없습니다' : state.nav === 'trash' ? '휴지통이 비어 있습니다' : '이 폴더는 비어 있습니다'}</span>
              <span style="font-size:13px;color:var(--text-secondary)">${state.query || state.typeFilter !== 'all' ? '검색어나 카테고리 필터를 초기화해 보세요.' : '상단 업로드 버튼을 누르거나 파일을 화면에 끌어다 놓으세요.'}</span>
            </div>
          ` : state.view === 'list' ? `
            <div class="file-list">
              <div class="file-list-header">
                <span>파일 / 폴더 이름</span>
                <span class="cell-hide-md">미디어 분류</span>
                <span class="cell-hide-md">용량 · 길이</span>
                <span class="cell-hide-md">업로더 · 수정일</span>
                <span style="text-align:right">빠른 작업</span>
              </div>
              ${list.map(it => {
                const k = KINDS[it.kind] || KINDS.file;
                const isVideo = it.kind === 'video';
                const kindText = kindLabelMap[it.kind] || '파일';
                const sizeText = it.kind === 'folder' ? `${countIn(it.id)}개 항목` : fmtSize(it.size);
                return `
                  <div class="file-row" onclick="handleItemTap('${it.id}')">
                    <div class="row-main-cell">
                      ${isVideo ? `
                        <div class="video-thumb-sm">
                          ${iconSvg('play', 16)}
                          ${it.dur ? `<span class="dur-badge">${esc(it.dur)}</span>` : ''}
                        </div>
                      ` : `
                        <div class="icon-box" style="background:${k.bg};color:${k.color}">
                          ${iconSvg(k.icon, 22)}
                        </div>
                      `}
                      <div class="row-info">
                        <div class="row-name">
                          ${it.starred ? `<span style="display:flex;color:#F59E0B;flex-shrink:0">${iconSvg('starFill', 13)}</span>` : ''}
                          <span style="overflow:hidden;text-overflow:ellipsis">${esc(it.name)}</span>
                          ${it.editable ? `<span class="edit-tag">직접편집</span>` : ''}
                        </div>
                        <div class="row-desc-sub">
                          ${esc(it.description || formatMeta(it))}
                        </div>
                      </div>
                    </div>

                    <div class="cell-hide-md">
                      <span class="kind-badge" style="background:${k.bg};color:${k.color}">${esc(kindText)}</span>
                    </div>

                    <div class="cell-size cell-hide-md">
                      ${esc(sizeText)}${it.dur ? ` · ${esc(it.dur)}` : ''}
                    </div>

                    <div class="cell-owner cell-hide-md">
                      <span class="owner-dot">${esc((it.by || '부원').slice(0, 1))}</span>
                      <div style="display:flex;flex-direction:column;min-width:0">
                        <span style="color:var(--text-primary);font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(it.by)}</span>
                        <span style="font-size:11px;color:var(--text-muted)">${esc(dateLabel(it.date))}</span>
                      </div>
                    </div>

                    <div class="row-quick-actions">
                      <button class="row-action-btn" onclick="event.stopPropagation(); toggleStarById('${it.id}')" title="즐겨찾기" style="color:${it.starred ? '#F59E0B' : 'var(--text-secondary)'}">
                        ${iconSvg(it.starred ? 'starFill' : 'star', 16)}
                      </button>
                      ${it.editable && !it.trashed ? `
                        <button class="row-action-btn" onclick="event.stopPropagation(); openEditorById('${it.id}')" title="문서 바로 편집" style="color:#60A5FA">
                          ${iconSvg('pencil', 16)}
                        </button>
                      ` : ''}
                      ${it.kind !== 'folder' && !it.trashed ? `
                        <button class="row-action-btn" onclick="event.stopPropagation(); downloadItemById('${it.id}')" title="원본 다운로드">
                          ${iconSvg('download', 17)}
                        </button>
                      ` : ''}
                      <button class="row-action-btn" onclick="event.stopPropagation(); openActionsSheet('${it.id}')" title="수정 / 이동 / 상세 메뉴">
                        ${iconSvg('moreV', 18)}
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="file-grid">
              ${list.map(it => {
                const k = KINDS[it.kind] || KINDS.file;
                const isVideo = it.kind === 'video';
                const thumbBg = isVideo ? 'linear-gradient(135deg,#0F172A 0%,#1E1B4B 60%,#312E81 100%)'
                  : it.kind === 'image' ? 'linear-gradient(135deg,#0C4A6E 0%,#0284C7 100%)'
                  : k.bg;
                const shortMeta = it.kind === 'folder' ? `${countIn(it.id)}개 항목` : `${fmtSize(it.size)} · ${dateLabel(it.date)}`;
                return `
                  <div class="grid-card" onclick="handleItemTap('${it.id}')">
                    <div class="grid-thumb" style="background:${thumbBg};color:${isVideo || it.kind === 'image' ? '#fff' : k.color}">
                      ${isVideo ? iconSvg('play', 32) : iconSvg(k.icon, 38)}
                      ${isVideo && it.dur ? `<span class="dur-badge" style="right:8px;bottom:8px;font-size:10.5px">${esc(it.dur)}</span>` : ''}
                      ${it.starred ? `<span style="position:absolute;left:10px;top:10px;color:#F59E0B">${iconSvg('starFill', 15)}</span>` : ''}
                      ${it.editable ? `<span class="edit-tag" style="position:absolute;right:8px;top:8px">직접편집</span>` : ''}
                    </div>
                    <div class="grid-footer">
                      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px">
                        <span style="font-size:13.5px;font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(it.name)}</span>
                        <span style="font-size:11.5px;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(shortMeta)} · ${esc(it.by)}</span>
                      </div>
                      <button class="row-action-btn" style="width:32px;height:32px" onclick="event.stopPropagation(); openActionsSheet('${it.id}')">
                        ${iconSvg('moreV', 17)}
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <button class="fab-btn" onclick="openSheet('upload')" title="업로드">
          ${iconSvg('plus', 24)}
        </button>

        <nav class="bottom-nav">
          ${NAV_TABS.map(([k, label, icn]) => {
            const active = state.nav === k;
            return `
              <button class="bottom-nav-btn ${active ? 'active' : ''}" onclick="switchNav('${k}')">
                ${iconSvg(active && k === 'starred' ? 'starFill' : icn, 22)}
                <span>${esc(label)}</span>
              </button>
            `;
          }).join('')}
        </nav>
      </main>
    </div>

    <div id="upload-bar-root">${buildUploadBarHTML()}</div>
    <div id="detail-root">${buildDetailHTML()}</div>
    <div id="sheet-root">${buildSheetHTML()}</div>
    <div id="toast-root" class="toast-container"></div>

    <input type="file" id="hidden-file-input" multiple style="display:none" onchange="onPickedFiles(this)">
    <input type="file" id="hidden-folder-input" webkitdirectory directory multiple style="display:none" onchange="onPickedFiles(this)">
    <input type="file" id="hidden-replace-input" style="display:none" onchange="onPickedReplaceFile(this)">
  `;

  renderToasts();
}

window.toggleTheme = () => {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('bs_theme', state.theme);
  render();
};

// ============================================================================
// UI EVENT HANDLERS (GLOBAL)
// ============================================================================

window.switchNav = (navKey) => {
  state.nav = navKey;
  if (navKey === 'drive') state.folder = 'root';
  state.typeFilter = 'all';
  state.query = '';
  state.searchingMobile = false;
  render();
};

window.setTypeFilter = (filterKey) => {
  state.typeFilter = filterKey;
  render();
};

window.navigateToFolder = (folderId) => {
  state.nav = 'drive';
  state.folder = folderId || 'root';
  state.query = '';
  render();
};

window.goBackFolder = () => {
  const cur = byId(state.folder);
  state.folder = cur ? (cur.parent || 'root') : 'root';
  render();
};

window.onSearchInput = (val) => {
  state.query = val;
  render();
  const el = document.getElementById('mobile-search-input') || document.querySelector('.search-box-desktop input');
  if (el) {
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }
};

window.openMobileSearch = () => {
  state.searchingMobile = true;
  render();
  setTimeout(() => document.getElementById('mobile-search-input')?.focus(), 30);
};

window.closeMobileSearch = () => {
  state.searchingMobile = false;
  state.query = '';
  render();
};

window.toggleViewMode = () => {
  state.view = state.view === 'list' ? 'grid' : 'list';
  localStorage.setItem('bs_view_mode', state.view);
  render();
};

window.setSort = (sortKey) => {
  state.sort = sortKey;
  state.sheet = null;
  render();
};

window.handleItemTap = (id) => {
  const it = byId(id);
  if (!it) return;
  if (it.trashed) {
    state.sheet = { type: 'actions', id: it.id };
    render();
    return;
  }
  if (it.kind === 'folder') {
    state.nav = 'drive';
    state.folder = it.id;
    state.typeFilter = 'all';
    state.query = '';
    state.searchingMobile = false;
    render();
  } else {
    state.detailId = it.id;
    render();
  }
};

window.closeDetail = () => {
  state.detailId = null;
  render();
};

window.openSheet = (type) => {
  state.sheet = { type };
  render();
};

window.closeSheet = () => {
  state.sheet = null;
  render();
};

window.openActionsSheet = (id) => {
  state.sheet = { type: 'actions', id };
  render();
};

window.openRenameSheet = (id) => {
  const item = byId(id);
  if (!item) return;
  state.sheet = { type: 'input', mode: 'rename', id, value: item.name, description: item.description || '' };
  render();
  setTimeout(() => {
    const el = document.getElementById('sheet-input-name');
    if (el) { el.focus(); el.select(); }
  }, 40);
};

window.openCreateFolderSheet = () => {
  state.sheet = { type: 'input', mode: 'folder', value: '새 폴더', description: '' };
  render();
  setTimeout(() => {
    const el = document.getElementById('sheet-input-name');
    if (el) { el.focus(); el.select(); }
  }, 40);
};

window.openCreateDocSheet = () => {
  state.sheet = {
    type: 'editor',
    mode: 'new',
    name: '새_큐시트_문서.md',
    description: '방송국 큐시트 및 기획 문서',
    content: '# 🎬 방송국 큐시트 / 회의록\n\n- 작성자: ' + state.currentUser + '\n- 작성일: ' + new Date().toLocaleDateString('ko-KR') + '\n\n## 주요 내용\n1. \n'
  };
  render();
};

window.openEditorById = (id) => {
  const item = byId(id);
  if (!item) return;
  openEditorSheet(item);
};

window.saveEditorSheet = async () => {
  const sh = state.sheet;
  if (!sh || sh.type !== 'editor') return;
  const name = (document.getElementById('editor-file-name')?.value || '').trim();
  const description = (document.getElementById('editor-file-desc')?.value || '').trim();
  const content = document.getElementById('editor-file-content')?.value || '';
  if (!name) return toast('파일 이름을 입력해주세요.');

  if (sh.mode === 'new') {
    await createFolderOrDoc('doc', name, content, description);
  } else {
    state.sheet = null;
    await patchItem(sh.id, { name, description, content }, '문서 내용 및 정보가 저장되었습니다');
  }
};

window.submitInputSheet = async () => {
  const sh = state.sheet;
  if (!sh || sh.type !== 'input') return;
  const val = (document.getElementById('sheet-input-name')?.value || '').trim();
  const desc = (document.getElementById('sheet-input-desc')?.value || '').trim();
  if (!val) return toast('이름을 입력해주세요.');

  if (sh.mode === 'rename') {
    state.sheet = null;
    await patchItem(sh.id, { name: val, description: desc }, '이름 및 설명을 수정했습니다');
  } else {
    await createFolderOrDoc('folder', val, '', desc);
  }
};

window.openMoveSheet = (id) => {
  state.sheet = { type: 'move', id };
  render();
};

window.moveItemTo = async (id, targetParentId) => {
  const targetFolder = targetParentId === 'root' ? { name: state.driveName } : byId(targetParentId);
  state.sheet = null;
  await patchItem(id, { parent: targetParentId }, `${targetFolder ? targetFolder.name : '선택한'} 폴더로 이동했습니다`);
};

window.toggleStarById = async (id) => {
  const item = byId(id);
  if (!item) return;
  state.sheet = null;
  await patchItem(id, { starred: !item.starred }, item.starred ? '즐겨찾기에서 해제했습니다' : '즐겨찾기에 추가했습니다');
};

window.toggleSharedById = async (id) => {
  const item = byId(id);
  if (!item) return;
  state.sheet = null;
  await patchItem(id, { shared: !item.shared }, item.shared ? '공유 목록에서 제외했습니다' : '팀 공유 파일로 설정했습니다');
};

window.openConfirmTrash = (id) => {
  state.sheet = { type: 'confirm', id };
  render();
};

window.confirmTrash = async (id) => {
  state.sheet = null;
  if (state.detailId === id) state.detailId = null;
  await patchItem(id, { trashed: true }, '휴지통으로 이동했습니다');
};

window.restoreItemById = async (id) => {
  state.sheet = null;
  await patchItem(id, { trashed: false }, '파일을 복원했습니다');
};

window.permanentDeleteItem = permanentDeleteItem;

window.downloadItemById = (id) => {
  const item = byId(id);
  if (item) downloadItem(item);
};

window.copyLinkById = (id) => {
  const item = byId(id);
  if (item) copyShareLink(item);
};

window.triggerFileInput = () => {
  document.getElementById('hidden-file-input')?.click();
};

window.triggerFolderInput = () => {
  document.getElementById('hidden-folder-input')?.click();
};

let _replaceTargetId = null;
window.triggerReplaceUpload = (id) => {
  _replaceTargetId = id;
  document.getElementById('hidden-replace-input')?.click();
};

window.onPickedFiles = (inputEl) => {
  if (inputEl.files && inputEl.files.length) {
    uploadFilesReal(inputEl.files, null);
    inputEl.value = '';
  }
};

window.onPickedReplaceFile = (inputEl) => {
  if (inputEl.files && inputEl.files.length && _replaceTargetId) {
    uploadFilesReal([inputEl.files[0]], _replaceTargetId);
    _replaceTargetId = null;
    inputEl.value = '';
  }
};

window.cancelUpload = (uId) => {
  const u = state.uploads.find(x => x.id === uId);
  if (u && u.xhr) {
    try { u.xhr.abort(); } catch (e) {}
  }
  state.uploads = state.uploads.filter(x => x.id !== uId);
  if (!state.uploads.length && state.sheet?.type === 'uploads') state.sheet = null;
  render();
};

window.setDragging = (val) => {
  if (state.dragging !== val) {
    state.dragging = val;
    const ov = document.querySelector('.drop-overlay');
    if (ov) ov.classList.toggle('active', val);
  }
};

window.handleDrop = (e) => {
  e.preventDefault();
  window.setDragging(false);
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
    uploadFilesReal(e.dataTransfer.files, null);
  }
};

window.saveUserName = () => {
  const v = (document.getElementById('user-name-input')?.value || '').trim();
  if (!v) return toast('부원 이름을 입력해주세요.');
  state.currentUser = v;
  localStorage.setItem('bs_user_name', v);
  state.sheet = null;
  toast(`${v} 부원으로 프로필이 변경되었습니다`);
  render();
};

window.saveConfigOnly = async () => {
  const driveName = (document.getElementById('cfg-drive-name')?.value || '방송국 공유 드라이브').trim();
  const clientId = (document.getElementById('cfg-client-id')?.value || DEFAULT_CLIENT_ID).trim();
  const rootFolderId = LOCKED_ROOT_FOLDER_ID;
  const quotaVal = Number(document.getElementById('cfg-quota-gb')?.value || 200);

  state.driveName = driveName;
  state.clientId = clientId;
  state.rootFolderId = LOCKED_ROOT_FOLDER_ID;
  state.totalQuotaGb = quotaVal;
  localStorage.setItem('bs_drive_name', driveName);
  localStorage.setItem('bs_client_id', clientId);
  localStorage.setItem('bs_root_folder_id', LOCKED_ROOT_FOLDER_ID);
  localStorage.setItem('bs_total_quota_gb', String(quotaVal));

  if (state.hasBackend) {
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driveName, clientId, rootFolderId })
    });
  }
  state.sheet = null;
  toast('드라이브 설정이 저장되었습니다');
  render();
};

window.saveAndConnectGoogle = async () => {
  connectGoogleDirectGIS();
};

window.addEventListener('message', (e) => {
  if (e.data === 'google-connected') {
    state.sheet = null;
    toast('구글 드라이브 연동에 성공했습니다!');
    initApp();
  }
});

initApp();
