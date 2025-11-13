# 为什么 vrite-io[bot] 推送不触发 GitHub Actions？

## 问题原因

GitHub Actions 有一个安全机制：**使用 `GITHUB_TOKEN` 或机器人账号的推送不会触发新的 workflow 运行**。

这是为了防止无限循环（例如：workflow A 推送代码 → 触发 workflow B → workflow B 推送代码 → 触发 workflow A...）

### 受影响的推送来源：
- ❌ `github-actions[bot]` 
- ❌ `vrite-io[bot]`
- ❌ 其他使用 `GITHUB_TOKEN` 的机器人
- ✅ 人工推送（使用 Personal Access Token）

## 解决方案对比

### 方案 1：手动触发（最简单）✅ 推荐用于测试

**优点：**
- 立即可用，无需配置
- 完全控制何时同步

**缺点：**
- 需要手动操作

**使用方法：**
1. 访问：https://github.com/lidianzhong/astro-blog/actions/workflows/sync-from-edit.yml
2. 点击 "Run workflow"
3. 选择 `edit` 分支
4. 点击 "Run workflow" 按钮

已在 workflow 中添加：
```yaml
on:
  workflow_dispatch:  # ✅ 已添加
```

---

### 方案 2：定时同步（自动化）✅ 推荐用于生产

**优点：**
- 全自动，无需人工干预
- 不受机器人推送限制
- 可以设置合适的同步频率

**缺点：**
- 有延迟（最多延迟一个调度周期）
- 即使没有变化也会运行

**当前配置：**
```yaml
schedule:
  - cron: '0 * * * *'  # ✅ 每小时检查一次
```

**可选的 cron 时间：**
- `'*/15 * * * *'` - 每 15 分钟
- `'0 * * * *'` - 每小时
- `'0 */2 * * *'` - 每 2 小时
- `'0 0 * * *'` - 每天午夜

---

### 方案 3：Repository Dispatch（最灵活）

**优点：**
- 可以通过 API 触发
- 实时同步
- 适合集成到其他服务

**缺点：**
- 需要配置 webhook 或 API 调用
- vrite.io 需要支持此功能

**使用方法：**

1. 已在 workflow 中添加：
```yaml
repository_dispatch:
  types: [vrite-edit-sync]  # ✅ 已添加
```

2. 通过 API 触发（需要 PAT）：
```bash
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_PAT_TOKEN" \
  https://api.github.com/repos/lidianzhong/astro-blog/dispatches \
  -d '{"event_type":"vrite-edit-sync"}'
```

3. 如果 vrite.io 支持 webhook，配置发送到：
   - URL: `https://api.github.com/repos/lidianzhong/astro-blog/dispatches`
   - Method: POST
   - Headers: `Authorization: Bearer YOUR_PAT_TOKEN`
   - Body: `{"event_type":"vrite-edit-sync"}`

---

### 方案 4：在 vrite.io 中配置 PAT（彻底解决）

**优点：**
- 推送会立即触发 workflow
- 无需其他配置
- 最接近正常的 git 工作流

**缺点：**
- 需要在 vrite.io 中配置
- vrite.io 需要支持自定义 Git 认证

**配置步骤：**

1. 创建 Personal Access Token：
   - 访问：https://github.com/settings/tokens/new
   - Name: `vrite-io-sync`
   - Expiration: 根据需要选择
   - 权限：勾选 `repo` (完整仓库访问)
   - 点击 "Generate token"
   - **复制 token**（只显示一次）

2. 在 vrite.io 中配置：
   - 找到 Git 设置或仓库配置
   - 配置使用 Personal Access Token 而不是 OAuth App
   - 使用格式：`https://YOUR_TOKEN@github.com/lidianzhong/astro-blog.git`

这样 vrite.io 的推送就会以您的身份进行，可以触发 workflow。

---

## 当前配置状态

`sync-from-edit.yml` 现在支持以下触发方式：

```yaml
on:
  push:              # ⚠️ 不会被 bot 触发
  workflow_dispatch: # ✅ 手动触发（立即可用）
  schedule:          # ✅ 定时触发（每小时）
  repository_dispatch: # ✅ API 触发（需要配置）
```

## 推荐配置

### 短期方案（立即可用）：
1. ✅ 使用 **手动触发** (`workflow_dispatch`)
2. ✅ 启用 **定时同步** (每小时，已配置)

### 长期方案：
1. 在 vrite.io 中配置使用 Personal Access Token
2. 这样 bot 推送就会立即触发同步

## 验证

提交这些修改后：

```bash
git add .
git commit -m "feat: add multiple trigger methods for sync-from-edit workflow"
git push origin dev
```

然后可以立即测试手动触发：
1. 访问：https://github.com/lidianzhong/astro-blog/actions
2. 选择 "Sync from Edit Branch"
3. 点击 "Run workflow"

或者等待下一个整点（定时任务会自动运行）。
