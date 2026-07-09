# 바이브코딩 스터디 실습 가이드 (정적 사이트)

빌드 도구 없이 HTML/CSS/JS만으로 만든 정적 사이트입니다. 폴더 그대로 어떤 정적 호스팅에도 올릴 수 있습니다.

## 로컬 확인

```
cd study-site
npx serve .
```
또는 `index.html`을 브라우저로 바로 열어도 됩니다. (단, 클립보드 복사 기능은 `https` 또는 `localhost` 환경에서만 정상 동작합니다.)

## 배포

### GitHub Pages
1. 이 `study-site` 폴더 내용을 저장소 루트(또는 `docs/` 폴더)에 푸시
2. 저장소 Settings → Pages → 소스 브랜치/폴더 지정
3. 발급된 URL로 접속 확인

### Netlify / Vercel
1. 새 프로젝트 생성 시 `study-site` 폴더를 배포 대상(Root/Publish Directory)으로 지정
2. Build Command는 비워두고 Output Directory만 `study-site`(또는 `.`)로 설정
3. 배포 후 발급 URL 공유

## 구성
- `index.html` — 타이틀 화면 + 1~4단계 실습 가이드 (프롬프트 직접 수정, 챗봇/AI Studio 바로가기, 오류 대응 토글, 배포 URL 공유)
- `extras.html` — 번외 1·2 (AI별 결과/프롬프트 비교) 별도 페이지
- `assets/style.css` — 스타일
- `assets/script.js` — 클립보드 복사, 아코디언, 타이틀 화면 스크롤 전환, 프롬프트 자동저장/초기화
- `assets/firebase-config.js` — Firebase 프로젝트 설정값 (배포 URL 공유 기능용)
- `assets/url-share.js` — 배포 URL 제출/실시간 목록(Firestore) 스크립트

## 커스터마이징 메모
- 챗봇 바로가기(Gemini/ChatGPT/Claude)는 `index.html`의 1단계 `.chatbot-links`, AI Studio Build 바로가기는 2단계 `.step-actions`에서 수정
- 오류 유형 FAQ는 `index.html`의 `.faq-item` 블록을 복제해서 추가/수정
- 색상 테마는 `assets/style.css` 상단 `:root` 변수로 관리 (라이트/다크 자동 대응)
- 프롬프트(`prompt1`/`prompt2`/`prompt4`, FAQ 해결 프롬프트 `sol1~3`)는 실습 화면에서 직접 수정 가능하며 브라우저 `localStorage`에 자동 저장됩니다. "↺ 초기화" 버튼으로 원본 텍스트로 되돌릴 수 있습니다.

## 배포 URL 공유 기능 설정 (Firebase)
스터디원들이 제출한 배포 URL을 서로 볼 수 있으려면 Firebase 프로젝트 연동이 필요합니다.

1. [Firebase Console](https://console.firebase.google.com)에서 프로젝트 생성 (또는 기존 프로젝트 사용)
2. 프로젝트 설정 → 일반 → 내 앱 → 웹 앱 추가 → SDK 설정 및 구성에서 `firebaseConfig` 값 복사
3. `assets/firebase-config.js`의 `firebaseConfig` 값을 복사한 값으로 교체 (공개 클라이언트 값이라 그대로 커밋해도 안전)
4. Firestore Database 생성 (콘솔에서 "Firestore Database" → 데이터베이스 만들기)
5. Firestore 규칙(Rules) 탭에서 아래 규칙 적용 — 로그인 없이 제출하는 구조이므로 항목 개수/크기를 제한해 남용을 방지합니다:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /deployUrls/{docId} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasOnly(['name', 'url', 'createdAt'])
                    && request.resource.data.name is string
                    && request.resource.data.name.size() > 0
                    && request.resource.data.name.size() < 40
                    && request.resource.data.url is string
                    && request.resource.data.url.size() < 500;
      allow update, delete: if false;
    }
  }
}
```

설정 전에는 "배포 URL 공유하기" 폼이 비활성화되고 안내 메시지가 표시됩니다.
