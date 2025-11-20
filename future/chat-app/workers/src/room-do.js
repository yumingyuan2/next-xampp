// src/room-do.js

export class ChatRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map(); // 存储所有WebSocket会话
    this.roomId = 'general'; // 默认房间ID
  }

  async fetch(request) {
    const url = new URL(request.url);
    
    // 只处理WebSocket升级请求
    if (url.pathname === '/ws') {
      return this.handleWebSocket(request);
    }
    
    return new Response('ChatRoom Durable Object', { status: 200 });
  }

  async handleWebSocket(request) {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    
    server.accept();
    
    // 为每个连接生成唯一ID
    const sessionId = crypto.randomUUID();
    const sessionMeta = {
      ws: server,
      username: null,
      joinedAt: new Date().toISOString()
    };
    
    this.sessions.set(sessionId, sessionMeta);
    
    // 立即发送连接确认
    this.sendToSession(sessionId, {
      type: 'connected',
      clientId: sessionId,
      room: this.roomId,
      timestamp: new Date().toISOString(),
      message: 'Welcome to ChatRoom!'
    });
    
    // 绑定事件处理器
    server.addEventListener('message', (event) => {
      this.handleMessage(sessionId, event);
    });
    
    server.addEventListener('close', (event) => {
      this.handleClose(sessionId, event);
    });
    
    server.addEventListener('error', (event) => {
      console.error(`WebSocket error in room ${this.roomId}:`, event);
      this.sessions.delete(sessionId);
    });
    
    // 返回WebSocket升级响应
    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  async handleMessage(sessionId, event) {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (err) {
      console.error('Invalid JSON from client:', err);
      return;
    }

    const sessionMeta = this.sessions.get(sessionId);
    if (!sessionMeta) return;

    switch (data.type) {
      case 'join':
        // 设置用户名并广播加入消息
        sessionMeta.username = data.user?.username || `User_${sessionId.substring(0, 8)}`;
        this.broadcast({
          type: 'system',
          message: `${sessionMeta.username} joined the room`,
          room: this.roomId,
          timestamp: new Date().toISOString(),
          user: { username: sessionMeta.username, id: sessionId }
        });
        
        // 发送当前用户列表给新用户
        this.sendUserList(sessionId);
        break;

      case 'message':
        // 广播普通消息
        if (sessionMeta.username) {
          const messagePayload = {
            type: 'message',
            id: data.id || Date.now().toString(),
            user: { username: sessionMeta.username, id: sessionId },
            text: data.text,
            room: this.roomId,
            timestamp: new Date().toISOString()
          };
          
          this.broadcast(messagePayload);
          
          // 向发送者发送确认
          this.sendToSession(sessionId, {
            type: 'message_delivered',
            id: messagePayload.id
          });
        }
        break;

      case 'typing':
        // 广播正在输入状态
        if (sessionMeta.username) {
          this.broadcast({
            type: 'typing',
            username: sessionMeta.username,
            room: this.roomId
          }, sessionId); // 不发送给发送者自己
        }
        break;

      case 'stop_typing':
        // 广播停止输入状态
        if (sessionMeta.username) {
          this.broadcast({
            type: 'stop_typing',
            username: sessionMeta.username,
            room: this.roomId
          }, sessionId); // 不发送给发送者自己
        }
        break;

      default:
        console.warn('Unknown message type:', data.type);
    }
  }

  handleClose(sessionId, event) {
    const sessionMeta = this.sessions.get(sessionId);
    if (sessionMeta && sessionMeta.username) {
      // 广播离开消息
      this.broadcast({
        type: 'system',
        message: `${sessionMeta.username} left the room`,
        room: this.roomId,
        timestamp: new Date().toISOString(),
        user: { username: sessionMeta.username, id: sessionId }
      });
    }
    
    // 从会话列表中移除
    this.sessions.delete(sessionId);
  }

  // 向单个会话发送消息
  sendToSession(sessionId, message) {
    const sessionMeta = this.sessions.get(sessionId);
    if (sessionMeta && sessionMeta.ws.readyState === WebSocket.OPEN) {
      try {
        sessionMeta.ws.send(JSON.stringify(message));
      } catch (err) {
        console.error(`Failed to send to session ${sessionId}:`, err);
        this.sessions.delete(sessionId);
      }
    }
  }

  // 向房间内所有会话广播消息
  broadcast(message, excludeSessionId = null) {
    const messageStr = JSON.stringify(message);
    
    for (const [id, sessionMeta] of this.sessions.entries()) {
      // 排除指定的会话（例如 'typing' 事件）
      if (id === excludeSessionId) continue;
      
      if (sessionMeta.ws.readyState === WebSocket.OPEN) {
        try {
          sessionMeta.ws.send(messageStr);
        } catch (err) {
          console.warn(`Broadcast failed for session ${id}, removing.`, err);
          this.sessions.delete(id);
        }
      }
    }
  }

  // 获取当前用户列表
  getUserList() {
    return Array.from(this.sessions.values())
      .filter(meta => meta.username) // 只返回已设置用户名的用户
      .map(meta => ({ 
        username: meta.username, 
        id: Array.from(this.sessions.entries()).find(([id, m]) => m === meta)?.[0] || meta.sessionId
      }));
  }

  // 向指定用户发送用户列表
  sendUserList(targetSessionId) {
    this.sendToSession(targetSessionId, {
      type: 'user_list',
      users: this.getUserList(),
      room: this.roomId,
      timestamp: new Date().toISOString(),
      online_count: this.sessions.size
    });
  }

  // 获取房间统计信息
  getRoomStats() {
    return {
      room: this.roomId,
      online_users: this.sessions.size,
      user_list: this.getUserList(),
      timestamp: new Date().toISOString()
    };
  }
}
