# 系统不可用问题排查与修复方案

通过对当前环境的诊断，发现**支付前端服务 (Payment Web App)** 存在**重复运行**的情况（Terminal 6 和 Terminal 9 都在运行），这导致了端口冲突 (5173/5174) 和服务状态异常。截图中的"服务不可用"页面极可能是由于端口冲突导致请求被错误处理，或者是浏览器访问了残留的僵尸进程。

代码库中未搜索到"服务不可用"的硬编码字符串，进一步证实这是由服务进程异常或环境问题引发的系统级错误，而非业务代码逻辑错误。

## 修复计划

### 1. 环境清理 (Environment Cleanup)
- **停止冗余服务**：停止所有正在运行的支付前端和后端终端（Terminal 6, 7, 9），彻底释放端口 5173, 5174 和 8001。
- **端口检查**：确保没有僵尸进程占用这些关键端口。

### 2. 服务重启 (Service Restart)
我们将按标准顺序重启服务，确保端口绑定正确：
1.  **启动后端 (Backend)**：在 `支付/apps/server` 启动 FastAPI 服务 (Port 8001)。
2.  **启动前端 (Frontend)**：在 `支付/apps/web` 启动 Vite 开发服务器 (Port 5173)。

### 3. 代码微调与验证 (Verification)
- 为了确保前端加载的是最新代码，我将在 `MockAlipayPage.tsx` 中添加一行日志 `console.log('MockAlipayPage mounted', Date.now())`。
- 重启后，您只需刷新 `http://localhost:5173/mock-alipay...` 页面即可恢复访问。

### 4. 交付
- 确认后端 API `/api/v1/orgs/...` 响应正常。
- 确认前端 `/mock-alipay` 页面正常渲染支付收银台 UI。
