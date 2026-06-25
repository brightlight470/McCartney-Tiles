import { NextRequest, NextResponse } from 'next/server'

const COOKIE = 'mc_preview'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get('from') ?? '/'
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>McCartney Tiles — Preview</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100svh;display:flex;align-items:center;justify-content:center;
       background:#14215c;font-family:'Segoe UI',Arial,sans-serif}
  .card{background:#fff;border-radius:14px;padding:40px 36px;width:min(360px,90vw);text-align:center}
  svg{width:200px;height:auto;margin:0 auto 24px;display:block}
  h1{margin:0 0 6px;font-size:18px;color:#14215c;font-weight:700}
  p{margin:0 0 24px;font-size:14px;color:#6b7280}
  input{width:100%;border:1px solid #dde2ec;border-radius:8px;padding:10px 14px;
        font-size:15px;color:#14215c;outline:none;margin-bottom:12px}
  input:focus{border-color:#23349d;box-shadow:0 0 0 3px rgba(35,52,157,.15)}
  button{width:100%;background:#23349d;color:#fff;border:0;border-radius:8px;
         padding:11px;font-size:15px;font-weight:700;cursor:pointer}
  button:hover{background:#1b2a8a}
  .err{color:#b23b3b;font-size:13px;margin:-6px 0 10px}
</style>
</head>
<body>
<div class="card">
  <svg viewBox="0 0 1480 260" role="img" aria-label="McCartney Tiles">
    <g transform="translate(0,24)">
      <rect x="0" y="0" width="100" height="100" fill="#23349d"/>
      <rect x="112" y="0" width="100" height="100" fill="#23349d"/>
      <rect x="224" y="0" width="100" height="100" fill="#23349d"/>
      <rect x="336" y="0" width="100" height="100" fill="#23349d"/>
      <polygon points="112,0 212,0 212,100" fill="#fae351"/>
      <polygon points="324,0 224,0 224,100" fill="#fae351"/>
      <rect x="0" y="112" width="100" height="100" fill="#23349d"/>
      <rect x="112" y="112" width="100" height="100" fill="#fae351"/>
      <rect x="224" y="112" width="100" height="100" fill="#fae351"/>
      <rect x="336" y="112" width="100" height="100" fill="#23349d"/>
    </g>
    <text x="516" y="150" font-family="'Segoe UI',Arial,sans-serif" font-weight="700" font-size="132" fill="#23349d" letter-spacing="-2">McCartney</text>
    <text x="520" y="232" font-family="'Segoe UI',Arial,sans-serif" font-weight="700" font-size="72" fill="#6b7280" letter-spacing="34">TILES</text>
  </svg>
  <h1>Preview access</h1>
  <p>This site is in development. Enter the preview password to continue.</p>
  <form method="POST" action="/preview-login?from=${encodeURIComponent(from)}">
    <input type="password" name="password" placeholder="Preview password" autofocus required>
    <button type="submit">Enter</button>
  </form>
</div>
</body>
</html>`
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
}

export async function POST(req: NextRequest) {
  const from = req.nextUrl.searchParams.get('from') ?? '/'
  const body = await req.formData()
  const entered = body.get('password')?.toString() ?? ''
  const expected = process.env.PREVIEW_PASSWORD ?? ''

  if (!expected || entered !== expected) {
    const url = req.nextUrl.clone()
    url.pathname = '/preview-login'
    url.searchParams.set('from', from)
    url.searchParams.set('error', '1')
    return NextResponse.redirect(url, 303)
  }

  const dest = req.nextUrl.clone()
  dest.pathname = from.startsWith('/') ? from : '/'
  dest.search = ''
  const res = NextResponse.redirect(dest, 303)
  res.cookies.set(COOKIE, expected, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE,
    path: '/',
  })
  return res
}
