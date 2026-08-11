import { MarkdownFile, Folder } from '../types';

export const INITIAL_FOLDERS: Folder[] = [
  {
    id: 'folder-1',
    name: '문서 샘플',
    parentId: null,
    createdAt: Date.now() - 1000000,
  },
];

export const INITIAL_FILES: MarkdownFile[] = [
  {
    id: 'file-welcome',
    name: '환영합니다.md',
    folderId: 'folder-1',
    createdAt: Date.now() - 100000,
    updatedAt: Date.now() - 10000,
    isFavorite: true,
    syncStatus: 'local_only',
    content: `# ✨ 웹 마크다운 에디터에 오신 것을 환영합니다!

이 앱은 **실시간 미리보기**, **구글 드라이브 동기화**, **강조 색상 커스텀**, **코드 하이라이팅**, **다양한 포맷 내보내기**를 지원하는 강력한 웹 마크다운 에디터입니다.

---

## 🎨 주요 특징 소개

### 1. 실시간 미리보기 & 뷰 모드
- **같이보기 모드**: 왼쪽에서 에디터 입력, 오른쪽에서 실시간 결과 확인!
- **미리보기 모드**: 작성된 문서만 깨끗하게 감상할 수 있습니다.
- **에디터 모드**: 작성에만 몰입할 수 있습니다.

### 2. 커스텀 강조(Bold) & 스타일 설정
- **강조 문구**에 내가 원하는 **컬러**(레드, 블루, 핑크, 에메랄드, 바이올렛 등)나 **배경색**을 지정할 수 있습니다!
- 상단 툴바의 **🎨 커스텀 스타일** 버튼을 눌러 본문 폰트, 링크 색상, 코드 블록 테마를 자유롭게 조절해보세요.

---

## 💻 소스 코드 하이라이팅 지원

자주 사용하는 다양한 언어의 코드 블록 하이라이팅을 지원합니다.

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
  isDriveConnected: boolean;
}

async function syncFileToGoogleDrive(file: UserFile): Promise<void> {
  console.log(\`Syncing \${file.name} to Google Drive...\`);
  // Google Drive REST API 연동
}
\`\`\`

\`\`\`python
def calculate_markdown_stats(text: str):
    words = len(text.split())
    chars = len(text)
    read_time_min = round(words / 200, 1)
    return {"words": words, "chars": chars, "read_time": read_time_min}
\`\`\`

---

## 📊 표 및 태스크 리스트 지원

| 기능명 | 설명 | 지원 여부 |
| :--- | :--- | :---: |
| **실시간 동기화** | 구글 드라이브 클라우드 파일 자동 동기화 | ✅ |
| **파일 내보내기** | .md, .txt, .html, 이미지(.png) 생성 | ✅ |
| **다크/라이트 모드** | 눈이 편안한 테마 전환 | ✅ |
| **수식 지원** | KaTeX 기반 LaTeX 수식 표현 | ✅ |

### 오늘 할 일 (Task List)
- [x] 마크다운 에디터 실행하기
- [x] 강조 색상 원하는 컬러로 변경해보기
- [ ] 구글 드라이브 계정 연결하기
- [ ] 작성한 문서를 이미지로 내보내기

---

## 📐 수학 공식 (LaTeX)

인라인 수식 $E = mc^2$ 및 블록 수식을 지원합니다:

$$
\\lim_{n \\to \\infty} \\left(1 + \\frac{1}{n}\\right)^n = e
$$

---

> **Tip:** 사이드바 하단의 **☁️ Google Drive** 버튼을 클릭하여 구글 계정을 연결하면, 작성한 모든 문서를 드라이브에 안전하게 동기화하고 관리할 수 있습니다!
`
  },
];
