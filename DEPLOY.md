# 배포

두 곳에 올라간다. **둘 다 올려야** 전부 동작한다.

```
GitHub Pages (정식 사이트)        Netlify (API 전용)              Firebase
화면·정적 파일             →     /api/* (NVIDIA 키, 관리자 비번)  →  Firestore (일정)
alpist12.github.io/scheduler      hnubs.netlify.app            기존 그대로
```

Netlify 는 안내 페이지 한 장(`netlify-public/`)만 올리고 나머지는 전부 함수다.
레포 루트를 올리면 소스가 그대로 열린다 — 실제로 `api/_shared.mjs` 까지 200 이었다.

## 왜 서버가 아직 필요한가

GitHub Pages 는 정적 파일만 내보내고 **서버 코드를 실행하지 않는다.** NVIDIA 키를
JS 파일이든 Firestore 든 어디에 넣어도 브라우저까지 내려가고, 내려간 값은 누구나
개발자 도구로 꺼낼 수 있다. 관리자 비밀번호도 같다.

그래서 **비밀값이 필요한 것만** Netlify 에 남는다:

| 경로 | 왜 서버인가 |
|---|---|
| `/api/chat` | NVIDIA 키 |
| `/api/analysis/*` | NVIDIA 키 |
| `/api/maintenance` | 관리자 비밀번호 검증 |
| `/api/drive/files` | Drive 전용 서비스 계정으로 지정 폴더 읽기 |

### Google Drive 연결

`GOOGLE_DRIVE_SERVICE_ACCOUNT`에 Drive 전용 서비스 계정 JSON을 서버 환경변수로
설정하고, 지정 폴더 `1Sb255-QJM--dC_1YGzJax-VlqpWtAxif`를 그 계정 이메일에
뷰어로 공유해야 한다. 키를 클라이언트 파일이나 저장소에 넣지 않는다.
`api-config.js`의 실제 API 주소에도 `/api/drive/files` 함수가 배포되어 있어야 한다.
연결 전에는 실제 목록 대신 연결 안내를 표시한다. 현재 서버 연결은 읽기 전용이며
업로드·수정은 Google Drive에서 진행한다.

메이커스페이스의 카메라 구도는 기존 Firestore `cameraScenes` 컬렉션에 공유 저장한다.
`npm run build`는 Three.js 모듈을 묶고 사람 GLB 모델과 함께 `dist/client/camera`로 복사한다.

나머지는 전부 브라우저에서 한다. 일정·인원·촬영·자동배치는 Firebase SDK 로
Firestore 에 직접 붙고, 대본 추출(PDF·DOCX)도 브라우저에서 푼다.

## 1. 화면 (GitHub Pages)

`main` 에 푸시하면 `.github/workflows/deploy.yml` 이 `npm run build` 를 돌리고
**`dist/client`** 를 올린다. 레포 루트가 아니라 빌드 결과를 올린다는 점이 중요하다.

> 정적 파일을 새로 추가했다면 `tools/build-sites.mjs` 의 복사 목록에도 넣어야 한다.
> 빠뜨리면 로컬에서는 되는데 배포본에서만 404 가 난다.

## 2. API (Netlify)

**화면만 올리고 끝내면 안 된다.** API 는 따로 배포해야 반영된다.

Site configuration → Environment variables 에 **세 개**를 넣는다:

| 이름 | 값 |
|---|---|
| `NVIDIA_API_KEY` | NVIDIA 키 |
| `SCHEDULER_ADMIN_PASSWORD` | 점검 모드 비밀번호 |
| `ALLOWED_ORIGINS` | `https://alpist12.github.io` |

**`ALLOWED_ORIGINS` 를 빠뜨리면 CORS 헤더가 안 나가고, 화면은 멀쩡한데 AI 기능만
조용히 죽는다.** 정식 사이트와 API 가 다른 주소에 있어서 그렇다.

넣은 뒤 Deploys → Trigger deploy. 확인:

```bash
curl -s https://hnubs.netlify.app/api/health
```

`configured` 가 `true` 면 키까지 들어간 것이다. CORS 까지 보려면:

```bash
curl -sD - -o /dev/null -H "Origin: https://alpist12.github.io"   https://hnubs.netlify.app/api/health | grep -i access-control
```

> **빌드 분은 월 300분이고 하드 리밋이다.** 화면은 GitHub Pages 가 맡으므로
> 여기 배포는 API 코드를 고칠 때만 하면 된다. 한도가 모자라면 Cloudflare
> Workers 로 옮길 수 있다 — `wrangler.toml` 이 준비돼 있고 `npm run api:deploy`
> 한 줄이다. 코드는 양쪽에서 그대로 돈다.

### 무료 플랜에 맞춰 둔 것들

무료 Workers 는 요청당 CPU 10ms, 백그라운드 30초, 외부 호출 50회가 한도다.
이 한도를 넘지 않도록 두 가지를 구조로 해결해 두었다. 되돌리면 다시 걸린다.

- **대본 추출은 브라우저에서 한다.** 서버에서 PDF 를 풀면 CPU 10ms 를 바로 넘는다.
- **분석은 묶음 하나당 요청 하나다.** 서버가 전부 백그라운드로 돌면 30초에 잘려
  작업이 '분석 중'인 채로 남는다.

## 3. 둘을 잇는 설정

`api-config.js`가 화면이 어느 API를 부를지 정한다.

```js
window.HNUBS_API = location.hostname.endsWith('github.io')
  || (['localhost', '127.0.0.1'].includes(location.hostname) && location.port === '4321')
  ? 'https://hnubs.netlify.app' : '';
```

GitHub Pages와 4321 포트의 정적 미리보기는 `hnubs.netlify.app`을 사용한다.
다른 포트의 로컬 API 개발 서버는 같은 출처를 유지한다.
공유드라이브 iframe도 이 설정 파일을 읽으므로 API 주소를 따로 바꾸지 않는다.

출처가 다르므로 **CORS 가 필수**다. `api/_shared.mjs` 의 `response()` 가 헤더를
붙인다. 이게 빠지면 브라우저가 응답을 버려서 AI 기능만 조용히 죽는다.

CSP 도 마찬가지다. `netlify.toml` 의 `script-src` 에 `cdnjs.cloudflare.com` 이 있어야
대본 추출(pdf.js, mammoth)이 로드된다.

## 로컬에서

```bash
npm run build
cd dist/client && python -m http.server 4321
```

4321 정적 미리보기에서도 운영 API를 사용한다. Netlify의 `ALLOWED_ORIGINS`에는
`https://alpist12.github.io`, `http://localhost:4321`, `http://127.0.0.1:4321`을 등록한다.
일정 관리는 Firestore에 직접 붙는다. 정적 서버는 `dist/client`만 제공하여
서버 소스나 로컬 인증 파일을 노출하지 않는다.

### Drive 연결 상태 (2026-11-11)

`hnubs-drive-server@hnubs-drive.iam.gserviceaccount.com`의 인증정보를
`hnubs.netlify.app`의 `GOOGLE_DRIVE_SERVICE_ACCOUNT`에 설정했다.
Google Cloud 프로젝트 IAM 역할은 부여하지 않았다. 비공개 키는 웹 작업 폴더와
Git 외부에 보관한다. 업로드한 인증서 만료일은 **2027-11-11**이며 이전에 키를 교체해야 한다.
목록 조회와 폴더 이동을 실제 데이터로 검증했다. 업로드·삭제 동작은 검증하지 않았다.

## Firestore 규칙

`firestore.rules` 는 현재 날짜 제한만 걸린 전면 허용이다.

```
allow read, write: if request.time < timestamp.date(2027, 12, 31);
```

인증을 도입하기 전까지는 좁힐 수 없는 구조다(앱이 익명 쓰기에 의존). 레포가
공개이므로, 데이터를 지키는 건 사실상 문서 ID 가 UUID 라는 점뿐이다.
