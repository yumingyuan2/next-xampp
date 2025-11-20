<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CBZ帖子 - 发帖端</title>
    <link rel="stylesheet" href="../../css/common.css">
    <link rel="stylesheet" href="../css/talk.css">
</head>
<body>
    <!-- 认证页面 -->
    <div class="auth-container" id="authPage">
        <div class="auth-card">
            <div class="auth-header">
                <h1 class="auth-title">🔐 发帖认证</h1>
                <p class="auth-subtitle">请输入密码以访问发帖功能</p>
            </div>
            
            <form id="authForm" onsubmit="handleAuth(event)">
                <div class="form-group">
                    <label class="form-label">密码</label>
                    <input type="password" class="form-input" id="passwordInput" placeholder="请输入密码" required>
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

    <!-- 发帖页面 -->
    <div class="container" id="postPage" style="display: none;">
        <!-- 头部 -->
        <header class="header">
            <div class="header-content">
                <a href="../index.html" class="logo">
                    <span>📝</span>
                    <span>CBZ帖子</span>
                </a>
                <nav class="nav-menu">
                    <a href="../index.html" class="nav-link">浏览帖子</a>
                    <a href="index.html" class="nav-link active">发帖</a>
                    <a href="../admin/index.html" class="nav-link">管理</a>
                </nav>
            </div>
        </header>

        <!-- 主要内容 -->
        <main class="main-content">
            <div class="card">
                <div class="card-header">
                    <h2>创建新帖子</h2>
                </div>
                <div class="card-body">
                    <form id="postForm" onsubmit="handleSubmit(event)">
                        <div class="form-group">
                            <label class="form-label">标题 *</label>
                            <input type="text" class="form-input" id="titleInput" placeholder="请输入帖子标题" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">内容 *</label>
                            <textarea class="form-textarea" id="contentInput" placeholder="请输入帖子内容" rows="10" required></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">标签</label>
                            <input type="text" class="form-input" id="tagsInput" placeholder="请输入标签，用逗号分隔">
                            <small style="color: var(--muted-color);">例如：技术,分享,讨论</small>
                        </div>
                        
                        <div style="display: flex; gap: 1rem;">
                            <button type="submit" class="btn btn-primary">
                                <span>📝</span>
                                <span>发布帖子</span>
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="resetForm()">
                                <span>🔄</span>
                                <span>重置</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- 我的帖子 -->
            <div class="card" style="margin-top: 2rem;">
                <div class="card-header">
                    <h3>我的帖子</h3>
                </div>
                <div class="card-body">
                    <div id="myPosts">
                        <!-- 用户的帖子将动态加载 -->
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
            if (talkSystem.currentUser) {
                showPostPage();
                loadMyPosts();
            } else {
                showAuthPage();
            }
        }

        // 显示认证页面
        function showAuthPage() {
            document.getElementById('authPage').style.display = 'flex';
            document.getElementById('postPage').style.display = 'none';
        }

        // 显示发帖页面
        function showPostPage() {
            document.getElementById('authPage').style.display = 'none';
            document.getElementById('postPage').style.display = 'block';
        }

        // 处理认证
        function handleAuth(event) {
            event.preventDefault();
            
            const password = document.getElementById('passwordInput').value;
            const result = talkSystem.authenticate(password, 'user');
            
            if (result.success) {
                TalkUtils.showMessage(result.message, 'success');
                showPostPage();
                loadMyPosts();
            } else {
                TalkUtils.showMessage(result.message, 'error');
            }
        }

        // 处理发帖
        function handleSubmit(event) {
            event.preventDefault();
            
            const title = document.getElementById('titleInput').value.trim();
            const content = document.getElementById('contentInput').value.trim();
            const tagsInput = document.getElementById('tagsInput').value.trim();
            
            if (!title || !content) {
                TalkUtils.showMessage('请填写标题和内容', 'warning');
                return;
            }
            
            const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
            
            const postData = {
                title,
                content,
                tags
            };
            
            const newPost = talkSystem.createPost(postData);
            
            if (newPost) {
                TalkUtils.showMessage('帖子发布成功！', 'success');
                resetForm();
                loadMyPosts();
            }
        }

        // 重置表单
        function resetForm() {
            document.getElementById('postForm').reset();
        }

        // 加载我的帖子
        function loadMyPosts() {
            const myPostsContainer = document.getElementById('myPosts');
            const myPosts = talkSystem.getPosts().filter(post => post.author === talkSystem.currentUser.username);
            
            if (myPosts.length === 0) {
                myPostsContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📝</div>
                        <div class="empty-text">你还没有发布任何帖子</div>
                    </div>
                `;
                return;
            }
            
            myPostsContainer.innerHTML = myPosts.map(post => `
                <div class="post-item" style="margin-bottom: 1rem;">
                    <div class="post-header">
                        <div class="post-author">
                            <div class="author-avatar">${post.avatar}</div>
                            <div class="author-info">
                                <div class="author-name">${TalkUtils.escapeHtml(post.author)}</div>
                                <div class="post-time">${talkSystem.formatTime(post.time)}</div>
                            </div>
                        </div>
                        <div class="post-actions">
                            <button class="btn btn-warning btn-sm" onclick="editPost(${post.id})">编辑</button>
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

        // 编辑帖子
        function editPost(postId) {
            const post = talkSystem.getPost(postId);
            if (!post) return;
            
            // 填充表单
            document.getElementById('titleInput').value = post.title;
            document.getElementById('contentInput').value = post.content;
            document.getElementById('tagsInput').value = post.tags.join(', ');
            
            // 滚动到表单
            document.getElementById('postForm').scrollIntoView({ behavior: 'smooth' });
            
            // 更改提交按钮为更新
            const submitBtn = document.querySelector('#postForm button[type="submit"]');
            submitBtn.innerHTML = '<span>🔄</span><span>更新帖子</span>';
            submitBtn.onclick = function(e) {
                e.preventDefault();
                updatePost(postId);
            };
        }

        // 更新帖子
        function updatePost(postId) {
            const title = document.getElementById('titleInput').value.trim();
            const content = document.getElementById('contentInput').value.trim();
            const tagsInput = document.getElementById('tagsInput').value.trim();
            
            if (!title || !content) {
                TalkUtils.showMessage('请填写标题和内容', 'warning');
                return;
            }
            
            const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
            
            const updateData = {
                title,
                content,
                tags,
                edited: true,
                editedTime: new Date().toISOString()
            };
            
            const updatedPost = talkSystem.updatePost(postId, updateData);
            
            if (updatedPost) {
                TalkUtils.showMessage('帖子更新成功！', 'success');
                resetForm();
                loadMyPosts();
                
                // 恢复提交按钮
                const submitBtn = document.querySelector('#postForm button[type="submit"]');
                submitBtn.innerHTML = '<span>📝</span><span>发布帖子</span>';
                submitBtn.onclick = null;
            }
        }

        // 删除帖子
        function deletePost(postId) {
            if (!TalkUtils.confirmAction('确定要删除这个帖子吗？')) {
                return;
            }
            
            const deletedPost = talkSystem.deletePost(postId);
            
            if (deletedPost) {
                TalkUtils.showMessage('帖子删除成功！', 'success');
                loadMyPosts();
            }
        }

        // 退出登录
        function logout() {
            talkSystem.logout('user');
            TalkUtils.showMessage('已退出登录', 'info');
            showAuthPage();
        }
    </script>
</body>
</html>
