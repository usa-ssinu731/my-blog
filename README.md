# My Blog

프레임워크 없이 순수 HTML, CSS, JavaScript로 만든 마크다운 기반 정적 블로그입니다.

## 로컬에서 실행하기

`fetch`로 파일을 불러오기 때문에 `file://`로 직접 열면 동작하지 않습니다. 로컬 정적 서버로 실행하세요.

```bash
python3 -m http.server 8000
```

이후 브라우저에서 `http://localhost:8000` 접속.

## 새 글 추가하기

1. `posts/` 폴더에 `my-new-post.md` 같은 이름으로 마크다운 파일을 만듭니다. 파일 상단에 frontmatter를 작성하세요.

   ```markdown
   ---
   title: 글 제목
   date: 2026-07-04
   tags: [태그1, 태그2]
   ---

   본문 내용...
   ```

2. `posts/index.json`에 항목을 하나 추가합니다.

   ```json
   {
     "slug": "my-new-post",
     "title": "글 제목",
     "date": "2026-07-04",
     "tags": ["태그1", "태그2"],
     "summary": "목록에 보여줄 한 줄 요약"
   }
   ```

`slug`는 마크다운 파일명(확장자 제외)과 동일해야 합니다.
