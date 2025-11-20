// src/index.js

// 导入 Durable Object 类
import { ChatRoom } from './room-do.js';

// 导出 Durable Object 类供 Wrangler 使用
export { ChatRoom };

// Worker 主入口
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS 预检请求
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // WebSocket 连接请求
    if (url.pathname === '/ws') {
      const roomId = url.searchParams.get('room') || 'general';
      
      // 根据房间ID获取 Durable Object
      const roomDOId = env.ROOMS.idFromName(roomId);
      const roomDOStub = env.ROOMS.get(roomDOId);

      // 将 WebSocket 请求转发给对应的 Durable Object
      return roomDOStub.fetch(request);
    }

    // API 请求
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env, url);
    }

    // 健康检查
    if (url.pathname === '/health') {
      const roomDOId = env.ROOMS.idFromName('general');
      const roomDOStub = env.ROOMS.get(roomDOId);
      
      try {
        // 调用 Durable Object 的统计方法
        const statsResponse = await roomDOStub.fetch(new Request('https://dummy-url/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }));
        
        const stats = await statsResponse.json();
        
        return new Response(JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          service: 'ChatHub Workers (DO)',
          room_stats: stats
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({
          status: 'error',
          message: 'Failed to get room stats',
          error: err.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 默认响应
    return new Response('ChatHub Workers Backend', { 
      status: 200,
      headers: corsHeaders
    });
  }
};

// CORS 处理
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function handleOptions() {
  return new Response(null, { 
    status: 200, 
    headers: corsHeaders 
  });
}

// API 处理函数
async function handleAPI(request, env, url) {
  switch (url.pathname) {
    case '/api/rooms':
      const rooms = [
        { id: 'general', name: '综合讨论', description: '自由讨论各种话题', users: 0 },
        { id: 'tech', name: '技术交流', description: '分享技术经验和知识', users: 0 },
        { id: 'random', name: '随机聊天', description: '轻松愉快的聊天环境', users: 0 },
        { id: 'gaming', name: '游戏讨论', description: '游戏相关话题讨论', users: 0 }
      ];
      
      return new Response(JSON.stringify(rooms), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    case '/api/create-room':
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      try {
        const roomData = await request.json();
        const roomId = roomData.id || `room_${Date.now()}`;
        
        // 这里可以实现房间创建逻辑
        return new Response(JSON.stringify({
          success: true,
          room: {
            id: roomId,
            name: roomData.name || roomId,
            description: roomData.description || '',
            created_at: new Date().toISOString()
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ 
          error: 'Invalid JSON',
          message: err.message 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

    default:
      return new Response(JSON.stringify({
        error: 'API endpoint not found',
        available_endpoints: ['/api/rooms', '/api/create-room', '/api/health']
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
  }
}
