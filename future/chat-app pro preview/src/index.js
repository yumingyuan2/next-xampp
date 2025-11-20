// 前端 HTML (内嵌)
const HTML_CONTENT = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloudflare 聊天室</title>
    <style>
        :root { --bg: #1a1a1a; --card: #2d2d2d; --text: #e0e0e0; --accent: #f6821f; }
        body { margin: 0; font-family: sans-serif; background: var(--bg); color: var(--text); display: flex; justify-content: center; height: 100vh; }
        #app { width: 100%; max-width: 600px; display: flex; flex-direction: column; background: var(--card); height: 100%; position: relative; }
        
        /* 登录遮罩 */
        #login-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 100; }
        .login-btn { background: #f6821f; color: white; border: none; padding: 12px 24px; font-size: 16px; border-radius: 5px; cursor: pointer; font-weight: bold; }
        .loading { color: #ccc; margin-top: 10px; font-size: 0.9em; }

        /* 聊天界面 */
        header { padding: 15px; background: #00000050; border-bottom: 1px solid #444; display: flex; justify-content: space-between; }
        #chat-box { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
        .message { padding: 8px 12px; border-radius: 8px; background: #3d3d3d; max-width: 80%; }
        .message.mine { align-self: flex-end; background: #00509e; }
        .meta { font-size: 0.75em; color: #888; margin-bottom: 4px; }
        
        #input-area { padding: 15px; border-top: 1px solid #444; display: flex; gap: 10px; background: #252525; }
        input { background: #1a1a1a; border: 1px solid #444; color: white; padding: 10px; border-radius: 4px; flex: 1; outline: none; }
        button.send { background: var(--accent); border: none; color: white; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>
    <div id="app">
        <!-- 遮罩层 -->
        <div id="login-overlay">
            <h2 style="margin-top:0;">🔒 请先登录</h2>
            <button class="login-btn" id="btn-login" onclick="redirectToLogin()">使用 CBZ Auth 登录</button>
            <div id="login-msg" class="loading"></div>
        </div>

        <header>
            <span>💬 聊天室</span>
            <span id="current-user" style="font-size:12px; color:#888;"></span>
            <button onclick="logout()" style="background:none; border:none; color:#666; cursor:pointer;">退出</button>
        </header>

        <div id="chat-box"></div>

        <form id="input-area">
            <input type="text" id="content" placeholder="输入消息..." required autocomplete="off">
            <button type="submit" class="send" id="send-btn">发送</button>
        </form>
    </div>

    <script>
        const AUTH_URL = "https://cbzauth.cbzstudio.qzz.io/"; // 认证主页
        const API_MSG = "/api/messages";
        const API_LOGIN = "/api/auth/callback"; // 新增：后端处理 Code 的接口

        let currentUser = localStorage.getItem('chat_user');

        async function init() {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');

            // 1. 如果 URL 里有 code，说明刚登录回来
            if (code) {
                document.getElementById('btn-login').style.display = 'none';
                document.getElementById('login-msg').innerText = '正在验证身份...';
                
                try {
                    // 发送 Code 给后端 Worker
                    const res = await fetch(API_LOGIN, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ code })
                    });
                    const data = await res.json();
                    
                    if (data.username) {
                        localStorage.setItem('chat_user', data.username);
                        currentUser = data.username;
                        // 清除 URL 参数
                        window.history.replaceState({}, document.title, "/");
                        renderUI();
                    } else {
                        alert('登录失败: ' + (data.error || '未知错误'));
                        document.getElementById('btn-login').style.display = 'block';
                        document.getElementById('login-msg').innerText = '';
                    }
                } catch (e) {
                    alert('网络错误');
                }
            } else if (currentUser) {
                // 2. 如果本地有缓存用户
                renderUI();
            }
        }

        function renderUI() {
            document.getElementById('login-overlay').style.display = 'none';
            document.getElementById('current-user').innerText = currentUser;
            fetchMessages();
            setInterval(fetchMessages, 2000);
        }

        function redirectToLogin() {
            // 必须把当前网页地址作为 redirect 参数传过去
            const redirect = encodeURIComponent(window.location.origin + "/");
            window.location.href = \`\${AUTH_URL}?redirect=\${redirect}\`;
        }

        function logout() {
            localStorage.removeItem('chat_user');
            window.location.href = "/";
        }

        // ... (原有的 fetchMessages 和 send 逻辑保持不变) ...
        async function fetchMessages() {
            try {
                const res = await fetch(API_MSG);
                if(res.ok) {
                    const data = await res.json();
                    const chatBox = document.getElementById('chat-box');
                    // 简单去重渲染逻辑... (略简化以节省空间)
                    chatBox.innerHTML = data.reverse().map(msg => \`
                        <div class="message \${msg.username === currentUser ? 'mine' : ''}">
                            <div class="meta">\${msg.username}</div>
                            <div>\${msg.content}</div>
                        </div>\`).join('');
                }
            } catch(e){}
        }

        document.getElementById('input-area').addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = document.getElementById('content').value;
            if(!content || !currentUser) return;
            await fetch(API_MSG, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ username: currentUser, content })
            });
            document.getElementById('content').value = '';
            fetchMessages();
        });

        init();
    </script>
</body>
</html>
`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    // 1. 返回前端页面
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(HTML_CONTENT, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    // 2. 【新增】处理 Auth Callback (用 Code 换用户信息)
    if (url.pathname === "/api/auth/callback" && request.method === "POST") {
      try {
        const { code } = await request.json();
        
        if (!code) throw new Error("Missing code");

        // ============================================================
        // 【请修改这里】 核心认证逻辑
        // 由于我不确定 CBZ Auth 的具体接口，下面是标准 OAuth 交换逻辑。
        // 你需要查看 CBZ Auth 文档，找到 "Token Endpoint" 和 "User Info Endpoint"
        // ============================================================
        
        // 假设 1: 这是一个简单的服务，直接通过 GET 验证 (可能性较小)
        // const authRes = await fetch(`https://cbzauth.cbzstudio.qzz.io/api/verify?code=${code}`);

        // 假设 2: 标准 OAuth (可能性最大)，通常需要 POST
        // 你需要填入你的 CLIENT_ID 和 CLIENT_SECRET (如果有的话)
        
        /* 
           !!! 既然你是免费用户且可能是简易集成，
           如果不知道怎么配后端，我们这里做一个"临时方案"：
           如果 CBZ Auth 没有提供后端验证接口，只是返回 Code 给前端玩，
           我们暂时假装验证通过（仅用于测试！正式使用必须后端验证）。
        */
        
        // --- 临时模拟代码 (正式上线请删除下行，使用真实 Fetch) ---
        const fakeUsername = "用户_" + code.substring(0, 5); 
        console.log(`[Auth] Received code: ${code}, simulating user: ${fakeUsername}`);
        
        /* 
           --- 真实代码示例 (当你找到了 API 地址后取消注释) ---
           const tokenResponse = await fetch('https://cbzauth.cbzstudio.qzz.io/oauth/token', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                   code: code,
                   client_id: "你的ID",
                   client_secret: "你的密钥",
                   grant_type: "authorization_code"
               })
           });
           const tokenData = await tokenResponse.json();
           const userResponse = await fetch('https://cbzauth.cbzstudio.qzz.io/api/user', {
               headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
           });
           const userData = await userResponse.json();
           const realUsername = userData.username;
        */

        // 返回用户名给前端
        return new Response(JSON.stringify({ username: fakeUsername }), {
            headers: { ...cors, "Content-Type": "application/json" }
        });

      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
      }
    }

    // 3. 消息 API (不变)
    if (url.pathname === "/api/messages") {
        if (request.method === "GET") {
            const { results } = await env.DB.prepare("SELECT * FROM messages ORDER BY created_at DESC LIMIT 50").all();
            return new Response(JSON.stringify(results), { headers: { ...cors, "Content-Type": "application/json" } });
        }
        if (request.method === "POST") {
            const body = await request.json();
            await env.DB.prepare("INSERT INTO messages (username, content, created_at) VALUES (?, ?, ?)").bind(body.username, body.content, Date.now()).run();
            return new Response(JSON.stringify({ success: true }), { headers: { ...cors, "Content-Type": "application/json" } });
        }
    }

    return new Response("Not Found", { status: 404 });
  }
};