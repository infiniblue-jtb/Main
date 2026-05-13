# Project Instructions (dongtan)

이 파일은 Gemini CLI 에이전트가 이 프로젝트에서 코드를 수정하거나 배포 관련 분석을 할 때 반드시 준수해야 하는 규칙을 담고 있습니다.

## 1. 프로젝트 구조 및 경로 규칙
- **Root Directory:** 이 프로젝트의 소스 코드는 레포지토리의 최상위(root)에 위치합니다. 하위 폴더(예: `dongtan/`)를 루트로 가정하지 마십시오.
- **Pathing (The '/' Rule):**
  - Cloudflare Pages나 다른 호스팅 환경에서 절대 경로(`/`)와 상대 경로(`./`) 설정 실수를 방지해야 합니다.
  - `vue.config.js`의 `publicPath`는 기본적으로 `'/'`로 설정되어 있습니다.

## 2. 배포 및 빌드
- 프론트엔드 빌드 도구: Vue CLI (`npm run build`)
- 결과물 위치: `dist/` 폴더
- 사전 렌더링(Prerendering): `@prerenderer/webpack-plugin`을 사용하여 주요 라우트를 미리 렌더링합니다.

## 3. Cloudflare Pages 설정 지침
프로젝트 구조가 루트로 변경됨에 따라 Cloudflare Dashboard의 **Build & deployments** 설정을 다음과 같이 수정해야 합니다:
- **Root Directory:** 반드시 **비워두거나** (Not set) `/`로 설정하십시오. (기존에 `dongtan`으로 설정되어 있었다면 반드시 삭제해야 합니다.)
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Build system version:** 최신 (2.0) 권장

## 4. Git 및 브랜치 관리 규칙
- **브랜치 정책:** GitHub에 코드를 업데이트할 때는 반드시 `main` 브랜치에만 반영하며, 별도의 브랜치를 생성하지 마십시오. 모든 작업은 `main` 브랜치를 기준으로 수행합니다.

## 5. 주의사항
- 모든 작업 전에 레포지토리 루트의 파일 목록을 확인하여 현재 위치를 명확히 파악하십시오.
- 빌드 결과물(`dist/`)은 항상 루트에 위치해야 합니다.
