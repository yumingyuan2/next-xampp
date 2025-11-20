<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CBZ帖子 - 管理员端</title>
    <link rel="stylesheet" href="../../css/common.css">
    <link rel="stylesheet" href="../css/talk.css">
</head>
<body>
    <!-- 认证页面 -->
    <div class="auth-container" id="authPage">
        <div class="auth-card">
            <div class="auth-header">
                <h1 class="auth-title">🔐 管理员认证</h1>
                <p class="auth-subtitle">请输入管理员密码以访问管理功能</p>
            </div>
            
            <form id="authForm" onsubmit="handleAuth(event)">
                <div class="form-group">
                    <label class="form-label">管理员密码</label>
                    <input type="password" class="form-input" id="passwordInput" placeholder="请输入管理员密码" required>
                </div>
                
                <button type="submit" class="btn btn-primary" style="width: 100%;">
                    登录
                </button>
            </form>
            
            <div style="margin-top: 1rem; text-align: center;">
                <a href="../index.html" class="nav-link">← 返回浏览</a>
            </div>
        </div>
    </div>

    <!-- 管理页面 -->
    <div class="container" id="adminPage" style="display: none;">
        <!-- 头部 -->
        <header class="header">
            <div class="header-content">
                <a href="../index.html" class="logo">
                    <span>📝</span>
                    <span>CBZ帖子</span>
                </a>
                <nav class="nav-menu">
                    <a href="../index.html" class="nav-link">浏览帖子</a>
                    <a href="../user/index.html" class="nav-link">发帖</a>
                    <a href="index.html" class="nav-link active">管理</a>
                    <a href="#" class="nav-link" onclick="logout()">退出</a>
                </nav>
            </div>
        </header>

        <!-- 主要内容 -->
        <main class="main-content">
            <!-- 统计信息 -->
            <div class="admin-stats" id="adminStats">
                <!-- 统计数据将动态加载 -->
            </div>

            <!-- 工具栏 -->
            <div class="toolbar">
                <div class="search-box">
                    <input type="text" class="search-input" id="searchInput" placeholder="搜索帖子...">
                    <button class="btn btn-primary btn-sm" onclick="searchPosts()">搜索</button>
                </div>
                <div class="filter-buttons">
                    <select class="form-select" id="sortSelect" onchange="sortPosts()">
                        <option value="latest">最新发布</option>
                        <option value="popular">最受欢迎</option>
                        <option value="most_comments">评论最多</option>
                    </select>
                    <select class="form-select" id="tagFilter" onchange="filterByTag()">
                        <option value="">所有标签</option>
                    </select>
                    <button class="btn btn-success btn-sm" onclick="exportData()">导出数据</button>
                </div>
            </div>

            <!-- 帖子管理 -->
            <div class="card">
                <div class="card-header">
                    <h3>帖子管理</h3>
                </div>
                <div class="card-body">
                    <div class="post-list" id="postList">
                        <!-- 帖子将动态加载 -->
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="../../js/common.js"></script>
    <script src="../js/talk.js"></script>
    <script>
        // 页面初始化
        document.addEventListener('DOMContentLoaded', function() {
            checkAuthStatus();
        });

        // 检查认证状态
        function checkAuthStatus() {
            if (talkSystem.isAdmin) {
                showAdminPage();
                loadStats();
                loadPosts();
                loadTags();
            } else {
                showAuthPage();
            }
        }

        // 显示认证页面
        function showAuthPage() {
            document.getElementById('authPage').style.display = 'flex';
            document.getElementById('adminPage').style.display = 'none';
        }

        // 显示管理页面
        function showAdminPage() {
            document.getElementById('authPage').style.display = 'none';
            document.getElementById('adminPage').style.display = 'block';
        }

        // 处理认证
        function handleAuth(event) {
            event.preventDefault();
            
            const password = document.getElementById('passwordInput').value;
            const result = talkSystem.authenticate(password, 'admin');
            
            if (result.success) {
                TalkUtils.showMessage(result.message, 'success');
                showAdminPage();
                loadStats();
                loadPosts();
                loadTags();
            } else {
                TalkUtils.showMessage(result.message, 'error');
            }
        }

        // 加载统计信息
        function loadStats() {
            const stats = talkSystem.getStats();
            const statsContainer = document.getElementById('adminStats');
            
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-value">${stats.totalPosts}</div>
                    <div class="stat-label">总帖子数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.totalLikes}</div>
                    <div class="stat-label">总点赞数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.totalComments}</div>
                    <div class="stat-label">总评论数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.totalViews}</div>
                    <div class="stat-label">总浏览数</div>
                </div>
            `;
        }

        // 加载帖子
        function loadPosts() {
            const options = {
                sort: document.getElementById('sortSelect').value,
                search: document.getElementById('searchInput').value,
                tag: document.getElementById('tagFilter').value
            };
            
            const posts = talkSystem.getPosts(options);
            renderPosts(posts);
        }

        // 渲染帖子
        function renderPosts(posts) {
            const postList = document.getElementById('postList');
            
            if (posts.length === 0) {
                postList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📭</div>
                        <div class="empty-text">暂无帖子</div>
                    </div>
                `;
                return;
            }

            postList.innerHTML = posts.map(post => `
                <div class="post-item">
                    <div class="post-header">
                        <div class="post-author">
                            <div class="author-avatar">${post.avatar}</div>
                            <div class="author-info">
                                <div class="author-name">${TalkUtils.escapeHtml(post.author)}</div>
                                <div class="post-time">${new Date(post.time).toLocaleString('zh-CN')}</div>
                            </div>
                        </div>
                        <div class="post-actions">
                            ${post.pinned ? '<span class="tag">📌 置顶</span>' : ''}
                            <button class="btn btn-warning btn-sm" onclick="togglePin(${post.id})">
                                ${post.pinned ? '取消置顶' : '置顶'}
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deletePost(${post.id})">删除</button>
                        </div>
                    </div>
                    <div class="post-body">
                        <h4 class="post-title">${TalkUtils.escapeHtml(post.title)}</h4>
                        <div class="post-content">${TalkUtils.truncateText(TalkUtils.escapeHtml(post.content))}</div>
                        <div class="post-tags">
                            ${post.tags.map(tag => `<span class="tag">${TalkUtils.escapeHtml(tag)}</span>`).join('')}
                        </div>
                    </div>
                    <div class="post-footer">
                        <div class="post-stats">
                            <div class="stat-item">
                                <span>👍</span>
                                <span>${post.likes}</span>
                            </div>
                            <div class="stat-item">
                                <span>💬</span>
                                <span>${post.comments.length}</span>
                            </div>
                            <div class="stat-item">
                                <span>👁️</span>
                                <span>${post.views}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // 切换置顶
        function togglePin(postId) {
            const post = talkSystem.getPost(postId);
            if (!post) return;
            
            const updatedPost = talkSystem.updatePost(postId, { pinned: !post.pinned });
            
            if (updatedPost) {
                TalkUtils.showMessage(updatedPost.pinned ? '帖子已置顶' : '帖子已取消置顶', 'success');
                loadPosts();
            }
        }

        // 删除帖子
        function deletePost(postId) {
            if (!TalkUtils.confirmAction('确定要删除这个帖子吗？此操作不可恢复！')) {
                return;
            }
            
            const deletedPost = talkSystem.deletePost(postId);
            
            if (deletedPost) {
                TalkUtils.showMessage('帖子删除成功！', 'success');
                loadStats();
                loadPosts();
            }
        }

        // 搜索帖子
        function searchPosts() {
            loadPosts();
        }

        // 排序帖子
        function sortPosts() {
            loadPosts();
        }

        // 按标签过滤
        function filterByTag() {
            loadPosts();
        }

        // 加载标签
        function loadTags() {
            const tagFilter = document.getElementById('tagFilter');
            const tags = talkSystem.getAllTags();
            
            tagFilter.innerHTML = '<option value="">所有标签</option>' + 
                tags.map(tag => `<option value="${TalkUtils.escapeHtml(tag)}">${TalkUtils.escapeHtml(tag)}</option>`).join('');
        }

        // 导出数据
        function exportData() {
            const posts = talkSystem.getPosts();
            const dataStr = JSON.stringify(posts, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `cbz_posts_${new Date().toISOString().split('T')[0]}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            TalkUtils.showMessage('数据导出成功！', 'success');
        }

        // 退出登录
        function logout() {
            talkSystem.logout('admin');
            TalkUtils.showMessage('已退出管理员登录', 'info');
            showAuthPage();
        }

        // 监听Enter键搜索
        document.getElementById('searchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchPosts();
            }
        });
    </script>
</body>
</html>
