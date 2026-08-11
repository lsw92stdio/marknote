# MarkNote

실시간 미리보기를 지원하는 웹 마크다운 노트 에디터. 설치 없이 브라우저에서 바로 쓰고, 문서는 브라우저 로컬 저장소에 보관됩니다.

**➡️ https://lsw92stdio.github.io/marknote/**

## 기능

- **실시간 미리보기** — 편집기 / 미리보기 / 분할 3가지 보기 모드
- **GFM 마크다운** — 표, 체크리스트, 취소선 등 GitHub 스타일 문법
- **코드 하이라이팅** — highlight.js, 6가지 테마 (github-dark, dracula, night-owl 등)
- **수식** — KaTeX 기반 LaTeX 수식 렌더링
- **파일 관리** — 폴더 분류, 즐겨찾기, 목차(TOC) 자동 생성
- **내보내기** — `.md`, `.html`, PNG 이미지
- **스타일 커스터마이징** — 글꼴, 크기, 줄 간격, 강조 색상 지정
- **다크 모드**
- **로컬 저장** — localStorage에 자동 저장, 새로고침해도 유지
- **구글 드라이브 동기화** — 각자 자기 구글 계정으로 로그인해 자기 드라이브에 저장 (아래 참고)

## 로컬 실행

필요: [Bun](https://bun.sh)

```bash
bun install
```

```bash
bun run dev
```

http://localhost:3000 에서 열립니다.

| 명령 | 설명 |
| --- | --- |
| `bun run dev` | 개발 서버 |
| `bun run build` | 프로덕션 빌드 (`dist/`) |
| `bun run preview` | 빌드 결과 미리보기 |
| `bun run lint` | 타입 체크 (`tsc --noEmit`) |

## 배포

`main` 브랜치에 푸시하면 [GitHub Actions](.github/workflows/deploy.yml)가 빌드해서 GitHub Pages에 자동 배포합니다.

## 구글 드라이브 동기화

배포된 사이트는 이미 설정이 완료되어 있어 방문자는 별도 설정 없이 "Google 계정 원클릭 동기화 연결" 버튼만 누르면 됩니다. 각자 자기 구글 계정으로 로그인해 **자기 드라이브에만** 접근합니다 — 요청하는 권한 범위가 `drive.file`이라 이 앱이 만든 파일 외에는 읽지 않습니다.

로그인 시 "Google에서 이 앱을 확인하지 않았습니다"라는 경고가 한 번 뜰 수 있습니다. 앱을 Google 정식 검증(도메인 소유권 증명, 개인정보처리방침 페이지 등)에 아직 등록하지 않아서인데, 경고 화면에서 "고급 → (앱 이름)으로 이동"을 누르면 정상적으로 로그인됩니다.

### 로컬 개발 시 연동하려면

OAuth 클라이언트의 "승인된 JavaScript 원본"에 `http://localhost:3000`을 등록해뒀다면, 저장소 루트에 `.env.local` 파일을 만들고 아래처럼 채웁니다 (`.env.example` 참고, `.env.local`은 커밋되지 않음):

```
VITE_GOOGLE_CLIENT_ID="<Google Cloud Console에서 발급받은 클라이언트 ID>"
```

배포 빌드는 GitHub Actions 저장소 시크릿(`VITE_GOOGLE_CLIENT_ID`)에서 값을 읽어 자동으로 주입합니다.

## 기술 스택

React 19 · TypeScript · Vite · Tailwind CSS v4 · react-markdown · highlight.js · KaTeX · Motion
