import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const cookie = req.cookies.get('site_auth');
  
  // 1. 设置免校验的路径（如 API 请求、静态资源等）
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // 2. 检查 Cookie 是否已验证
  if (cookie?.value === 'true') {
    return NextResponse.next();
  }

  // 3. 如果没验证，拦截请求并返回一个独立的“密码输入页面”
  // 这里读取你设置的 Vercel 环境变量
  const CORRECT_PASSWORD = process.env.SITE_PASSWORD || "666888";

  // 获取用户提交的密码（通过 URL 参数，简单有效）
  const url = new URL(req.url);
  const inputPassword = url.searchParams.get('pw');

  if (inputPassword === CORRECT_PASSWORD) {
    const response = NextResponse.redirect(url.origin + url.pathname);
    response.cookies.set('site_auth', 'true', { maxAge: 86400, path: '/' });
    return response;
  }

  // 返回美观的输入界面
  return new NextResponse(
    `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>访问认证 - Xs的工具箱</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-[#fafafa] h-screen flex items-center justify-center font-sans">
        <div class="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 text-center max-w-sm w-full mx-4">
            <div class="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fa-solid fa-shield-halved text-2xl"></i>
            </div>
            <h2 class="text-xl font-bold text-gray-800 mb-2">访问受限</h2>
            <p class="text-gray-500 text-sm mb-6">请输入 6 位身份验证码以继续</p>
            
            <input type="password" id="pw" maxlength="6" autofocus
                class="w-full text-center text-2xl tracking-[1em] font-bold border-2 border-gray-100 rounded-xl py-3 focus:border-indigo-500 focus:outline-none transition-all mb-4"
                placeholder="••••••">
            
            <button onclick="go()" 
                class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-200">
                验证并进入
            </button>
        </div>
        <script>
            function go() {
                const val = document.getElementById('pw').value;
                if (val.length === 6) {
                    window.location.href = window.location.pathname + '?pw=' + val;
                } else {
                    alert('请输入6位密码');
                }
            }
            document.getElementById('pw').addEventListener('keypress', (e) => { if(e.key === 'Enter') go(); });
        </script>
    </body>
    </html>
    `,
    { headers: { 'content-type': 'text/html' } }
  );
}

// 匹配所有路径
export const config = {
  matcher: '/:path*',
};
