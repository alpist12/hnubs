/* 공유드라이브 쓰기 — 업로드 · 폴더 만들기 · 이름/설명 고치기 · 휴지통.
 *
 * 읽기(drive-files.mjs)와 나눠 둔다. 권한 범위가 다르다:
 * 읽기는 drive.readonly, 쓰기는 drive 다. 한 함수에 섞으면 목록만 보는 요청에도
 * 쓰기 권한 토큰이 붙는다.
 *
 * 로그인이 없는 서비스라 "주소를 아는 사람은 올릴 수 있다"가 전제다.
 * 그래서 지우기만 관리자 비밀번호를 받는다 — 올리는 사고는 되돌릴 수 있지만
 * 지우는 사고는 그렇지 않다. 휴지통으로만 보내고 완전 삭제는 하지 않는다.
 *
 * 준비물:
 *  1) Netlify 환경변수 GOOGLE_DRIVE_SERVICE_ACCOUNT (드라이브 전용 계정 JSON)
 *  2) 지정 폴더를 그 계정과 '편집자'로 공유 (읽기만 할 때의 뷰어로는 부족하다)
 *  3) 지우기를 쓰려면 SCHEDULER_ADMIN_PASSWORD
 */
import { parseBody, preflight, rateLimited, response, tooMany } from './_shared.mjs';
import { googleToken } from './_google.mjs';

const ROOT_FOLDER_ID = '1Sb255-QJM--dC_1YGzJax-VlqpWtAxif';
const SCOPE = 'https://www.googleapis.com/auth/drive';
const FOLDER_MIME = 'application/vnd.google-apps.folder';

// Netlify 함수는 요청 본문이 6MB 를 넘으면 받기 전에 끊는다.
// base64 로 싸면 4/3 배가 되니 실제 파일은 4MB 가 한계다.
const MAX_BYTES = 4 * 1024 * 1024;

const FS_ID = /^[A-Za-z0-9_-]{1,128}$/;
const safeId = v => (FS_ID.test(String(v || '')) ? String(v) : '');

const fail = (event, status, message) => response(status, { error: message }, event);

/** 그 파일이 지정 폴더 안에 있는지 확인한다.
 *  id 만 받고 그대로 쓰면 서비스 계정이 닿는 아무 파일이나 건드릴 수 있다. */
async function insideRoot(token, id, depth = 0) {
  if (depth > 20) return false;
  if (id === ROOT_FOLDER_ID) return true;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?fields=parents&supportsAllDrives=true`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  if (!res.ok) return false;
  const parents = (await res.json()).parents || [];
  for (const p of parents) {
    if (p === ROOT_FOLDER_ID) return true;
    if (await insideRoot(token, p, depth + 1)) return true;
  }
  return false;
}

async function createFolder(token, name, parent) {
  const res = await fetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true&fields=id,name', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ name, mimeType: FOLDER_MIME, parents: [parent] }),
  });
  if (!res.ok) throw new Error(`폴더를 만들지 못했습니다 (${res.status})`);
  return res.json();
}

async function uploadFile(token, { name, parent, mimeType, bytes }) {
  const boundary = `hnubs${Date.now().toString(36)}`;
  const meta = JSON.stringify({ name, parents: [parent] });
  const head = Buffer.from(
    `--${boundary}\r\ncontent-type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n`
    + `--${boundary}\r\ncontent-type: ${mimeType || 'application/octet-stream'}\r\n\r\n`,
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,size',
    {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': `multipart/related; boundary=${boundary}` },
      body: Buffer.concat([head, bytes, tail]),
    },
  );
  if (!res.ok) throw new Error(`올리지 못했습니다 (${res.status})`);
  return res.json();
}

async function patchFile(token, id, fields) {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?supportsAllDrives=true&fields=id,name,description,trashed`,
    {
      method: 'PATCH',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(fields),
    },
  );
  if (!res.ok) throw new Error(`고치지 못했습니다 (${res.status})`);
  return res.json();
}

export const handler = async event => {
  const pre = preflight(event); if (pre) return pre;
  if (event.httpMethod !== 'POST') return fail(event, 405, 'POST 로 보내 주세요.');

  const wait = rateLimited(event, 'drive-write', 20, 60_000);
  if (wait) return tooMany(wait, event);

  const body = parseBody(event) || {};
  const action = String(body.action || '');

  let token;
  try {
    token = await googleToken(SCOPE);
  } catch (error) {
    console.error('[drive-write] 토큰 발급 실패:', error.message);
    return fail(event, 503, '드라이브 설정이 끝나지 않았습니다.');
  }
  if (!token) return fail(event, 503, '드라이브 설정이 끝나지 않았습니다.');

  // 부모는 늘 지정 폴더 안이어야 한다. 'root' 는 지정 폴더를 가리킨다.
  const rawParent = body.parent === 'root' || !body.parent ? ROOT_FOLDER_ID : safeId(body.parent);
  if (!rawParent) return fail(event, 400, '폴더 주소가 올바르지 않습니다.');

  try {
    if (action === 'mkdir') {
      const name = String(body.name || '').trim();
      if (!name) return fail(event, 400, '폴더 이름을 입력해 주세요.');
      if (!(await insideRoot(token, rawParent))) return fail(event, 403, '지정 폴더 밖에는 만들 수 없습니다.');
      return response(200, { ok: true, item: await createFolder(token, name, rawParent) }, event);
    }

    if (action === 'upload') {
      const name = String(body.name || '').trim();
      if (!name) return fail(event, 400, '파일 이름이 없습니다.');
      const b64 = String(body.dataBase64 || '');
      if (!b64) return fail(event, 400, '파일 내용이 비어 있습니다.');
      const bytes = Buffer.from(b64, 'base64');
      if (bytes.length > MAX_BYTES) {
        return fail(event, 413, `${Math.round(MAX_BYTES / 1024 / 1024)}MB 까지만 올릴 수 있습니다. 큰 영상은 구글 드라이브에서 직접 올려 주세요.`);
      }
      if (!(await insideRoot(token, rawParent))) return fail(event, 403, '지정 폴더 밖에는 올릴 수 없습니다.');
      return response(200, { ok: true, item: await uploadFile(token, { name, parent: rawParent, mimeType: body.mimeType, bytes }) }, event);
    }

    if (action === 'rename') {
      const id = safeId(body.id);
      if (!id) return fail(event, 400, '파일 주소가 올바르지 않습니다.');
      if (!(await insideRoot(token, id))) return fail(event, 403, '지정 폴더 밖의 파일은 고칠 수 없습니다.');
      const fields = {};
      if (body.name !== undefined) fields.name = String(body.name).trim();
      if (body.description !== undefined) fields.description = String(body.description);
      if (!Object.keys(fields).length) return fail(event, 400, '바꿀 내용이 없습니다.');
      return response(200, { ok: true, item: await patchFile(token, id, fields) }, event);
    }

    if (action === 'trash') {
      // 지우기만 비밀번호를 받는다. 올리는 사고는 되돌릴 수 있지만 지우는 사고는 그렇지 않다.
      const expected = process.env.SCHEDULER_ADMIN_PASSWORD;
      if (!expected) return fail(event, 503, '삭제는 아직 쓸 수 없습니다.');
      if (String(body.password || '') !== expected) return fail(event, 401, '관리자 비밀번호가 맞지 않습니다.');
      const id = safeId(body.id);
      if (!id) return fail(event, 400, '파일 주소가 올바르지 않습니다.');
      if (!(await insideRoot(token, id))) return fail(event, 403, '지정 폴더 밖의 파일은 지울 수 없습니다.');
      // 휴지통으로만 보낸다. 완전 삭제는 여기서 하지 않는다.
      return response(200, { ok: true, item: await patchFile(token, id, { trashed: true }) }, event);
    }

    return fail(event, 400, '알 수 없는 요청입니다.');
  } catch (error) {
    console.error('[drive-write]', action, error.message);
    return fail(event, 502, error.message);
  }
};
