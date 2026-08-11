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
- **구글 드라이브 동기화** — 별도 설정 필요 (아래 참고)

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

## 구글 드라이브 동기화 설정

드라이브 동기화는 **기본적으로 비활성 상태**입니다. [App.tsx](src/App.tsx)의 `DEFAULT_CLIENT_ID`는 자리표시자 값이라 그대로는 인증되지 않습니다. 나머지 기능은 설정 없이 모두 동작합니다.

사용하려면:

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트를 만들고 **Google Drive API**를 활성화합니다.
2. **사용자 인증 정보 → OAuth 클라이언트 ID → 웹 애플리케이션**을 생성합니다.
3. **승인된 JavaScript 원본**에 사이트 주소를 추가합니다:
   - `https://lsw92stdio.github.io`
   - 로컬 개발용으로 `http://localhost:3000`도 함께 추가
4. 발급받은 클라이언트 ID를 적용합니다. 둘 중 하나:
   - 앱 안의 구글 드라이브 설정 창에 직접 입력 (localStorage에 저장됨)
   - 또는 빌드 시 환경변수로 주입 — `.env.local`에 `VITE_GOOGLE_CLIENT_ID=...`

요청하는 권한 범위는 `drive.file`로, **이 앱이 만든 파일에만** 접근합니다. 드라이브의 다른 파일은 읽지 않습니다.

## 기술 스택

React 19 · TypeScript · Vite · Tailwind CSS v4 · react-markdown · highlight.js · KaTeX · Motion
