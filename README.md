# 경력 번역기 — 직업상담 도구

경력보유여성이 "경력이 아니다"라고 여기는 생활 경험에서 직무 역량의 근거를 찾아, 채용공고의 언어로 옮깁니다.
상담 한 회차에 **인출 → 매핑 → 번역 → 검토** 네 화면을 그대로 따라갑니다.

- **1단계 인출** — 돈·사람·기한·정보·소속 다섯 주제를 돌며 들은 사실을 기간·규모·역할·난점으로 나눠 적습니다.
- **2단계 매핑** — 적어 둔 사실을 NCS 직업기초능력 10개 영역에 배치하고 상·중·하를 판정합니다. 근거 없는 영역은 빠집니다.
- **3단계 번역** — 고용24에서 공고를 불러와 이력서·자기소개서·면접 답변·근거 대조표를 만듭니다. 근거로 충족을 주장할 수 없는 요건은 "보완 필요"로 따로 나옵니다.
- **검토** — 과장어·직위 오인·자격 연상 표현을 자동으로 찾아 표시하고, 전달 전 체크리스트 14항목을 확인합니다.

상담 기록은 **브라우저에만** 저장됩니다. 서버로 보내지 않습니다.

---

## 1. 배포 — GitHub Pages

1. GitHub에서 저장소를 새로 만듭니다. 비공개(Private) 저장소는 Pages를 쓰려면 유료 플랜이 필요하니, 무료로 쓰시려면 공개(Public)로 만듭니다.
2. 이 폴더를 그 저장소에 올립니다.

   ```
   git init
   git add .
   git commit -m "경력 번역기 상담 도구"
   git branch -M main
   git remote add origin https://github.com/<계정>/<저장소>.git
   git push -u origin main
   ```

3. 저장소 **Settings → Pages**에서 Source를 `Deploy from a branch`, 브랜치를 `main`, 폴더를 `/ (root)`로 지정하고 저장합니다.
4. 1~2분 뒤 `https://<계정>.github.io/<저장소>/` 로 열립니다.

`.nojekyll` 파일이 들어 있습니다. GitHub Pages가 파일을 Jekyll로 다시 처리하지 않게 하는 빈 파일이니 지우지 마십시오.

### GitHub Pages에서는 붙여넣기 방식으로 돕니다

정적 파일만 올라가므로 중계할 서버가 없습니다. 브라우저에서 고용24 API를 직접 부를 수 없는 이유는 CORS입니다 — 고용24 서버가 다른 도메인의 브라우저 요청을 허용하지 않습니다. 그래서 이렇게 씁니다.

- **고용24** — 1단계에서 조건을 고르면 3단계가 요청 주소를 만들어 줍니다. 인증키를 한 번 넣어 두고(브라우저가 기억합니다) 그 주소를 새 탭에서 열어, 나온 내용을 통째로 복사해 붙여넣으면 공고 목록으로 풀립니다. 공고를 고르면 상세 주소도 같은 방식으로 만들어 줍니다.
- **매핑·번역** — "프롬프트 복사"를 눌러 쓰시는 AI 대화창에 붙여넣고, 받은 JSON을 다시 화면에 붙여넣습니다.

버튼 한 번으로 끝내고 싶으시면 아래 2·3번처럼 함수를 돌려 주는 무료 호스팅으로 옮기면 됩니다. 저장소에 들어 있는 `functions/`와 `netlify/` 폴더가 그때 쓰이고, GitHub Pages에서는 쓰이지 않습니다.

## 2. 버튼 하나로 검색까지 — Cloudflare Pages (무료)

1. [Cloudflare Pages](https://pages.cloudflare.com/)에서 저장소를 연결합니다.
2. 빌드 설정: **빌드 명령 없음**, 출력 디렉터리 `/` (루트).
3. **Settings → Environment variables**에 넣습니다.
   - `WORK24_KEY` — 고용24 인증키 (공고 검색용)
   - `ANTHROPIC_API_KEY` — Claude API 키 (매핑·번역 자동 실행용)
   - `CLAUDE_MODEL` — 선택. 기본값 `claude-sonnet-5-5`
4. 배포하면 `functions/api/` 안의 함수가 `/api/...` 주소로 붙습니다.

둘 중 하나만 넣어도 됩니다. 넣은 것만 자동으로 바뀌고 나머지는 수동 모드로 남습니다. 시작 안내 탭에서 지금 어느 모드인지 보여 줍니다.

## 3. Netlify (무료)

1. 저장소를 연결합니다. 빌드 명령 없음, publish 디렉터리 `/`.
2. **Site configuration → Environment variables**에 위와 같은 값을 넣습니다.
3. `netlify/functions/*.mjs`가 `/api/...` 주소로 붙습니다.

## 4. 직접 열어 보기

```
python -m http.server 8080
```

브라우저에서 `http://localhost:8080` 을 엽니다. 이때도 수동 모드입니다.

---

## 고용24 Open API

- 신청: [고용24 Open API 안내](https://www.work24.go.kr/cm/e/a/0110/selectOpenApiSvcInfo.do?fullApiSvcId=000000000000000000000000000000) 에서 회원가입 후 인증키를 발급받습니다.
- 목록: `callOpenApiSvcInfo210L01.do` · `callTp=L`
- 상세: `callOpenApiSvcInfo210D01.do` · `callTp=D` · `wantedAuthNo`
- 이 도구가 쓰는 검색 파라미터는 네 가지입니다.
  - `region` 근무지역 코드 — 시·도와 시·군·구를 드롭다운으로 고릅니다
  - `occupation` 직종 코드 — 대분류와 중분류를 드롭다운으로 고릅니다
  - `salTp` + `minPay` + `maxPay` 임금형태와 급여 범위 — 만원 단위. 임금형태를 고르면 최소·최대가 모두 필요합니다
  - `keyword` 검색어

코드표는 `data/region.json`(시·도 17 + 시·군·구 268)과 `data/jobs.json`(대분류 13 + 중분류)에 들어 있습니다. 고용24가 배포하는 코드표에서 뽑은 값입니다. 코드표가 바뀌면 아래에서 다시 내려받아 같은 형식으로 갈아 끼우면 됩니다.

```
https://openapi.work.go.kr/opi/opi/common/useApi/apiCdList.do?cdGbn=region
https://openapi.work.go.kr/opi/opi/common/useApi/apiCdList.do?cdGbn=jobs
```

상세 응답의 필드 이름은 공개 명세에 표가 없어서, 받은 XML의 모든 항목을 "라벨: 값"으로 풀어 공고 전문에 넣습니다. 아는 필드는 한글 이름으로, 모르는 필드는 태그 이름 그대로 나옵니다.

## 파일

```
index.html              화면 뼈대
styles.css              디자인 토큰과 레이아웃 (밝은 화면 / 어두운 화면)
app.js                  전체 로직
data/region.json        고용24 근무지역 코드
data/jobs.json          고용24 직종 코드
functions/api/*.js      Cloudflare Pages 함수 (중계)
netlify/functions/*.mjs Netlify 함수 (중계)
```

## 지켜야 할 것

- **AI 산출물을 구직자에게 그대로 전달하지 마십시오.** 상담사가 사실과 표현을 확인한 뒤에 전달합니다.
- 성명·생년월일·연락처·주소·가족 신상은 입력하지 않습니다. 상담 녹취를 붙여넣지 않습니다.
- 인증키와 API 키는 서버 환경변수에 둡니다. 저장소에 커밋하지 마십시오.
- 수동 모드에서 인증키를 페이지에 넣으면 요청 주소에 키가 섞입니다. 화면을 공유할 때 조심하세요.
