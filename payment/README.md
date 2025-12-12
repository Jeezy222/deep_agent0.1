# 多租户计费系统原型

本原型包含：
- **后端**：Python FastAPI + SQLAlchemy (SQLite)
- **前端**：React + Tailwind CSS + Vite

## 快速开始

### 1. 启动后端

```bash
cd apps/server
# 安装依赖
py -m pip install -r requirements.txt
# 启动服务 (默认端口 8000)
py main.py
```

后端 API 文档地址：http://localhost:8000/docs

### 2. 启动前端

```bash
cd apps/web
# 安装依赖
npm install
# 启动开发服务器 (默认端口 5173)
npm run dev
```

前端访问地址：http://localhost:5173

## 功能演示

1. 打开前端页面，会自动调用 `/api/v1/init-demo-data` 初始化演示数据（创建组织、用户、默认套餐）。
2. 点击“升级套餐 / 查看方案”按钮，打开 Pricing Modal。
3. 体验月付/年付切换，以及 Standard 套餐的“免费试用”高亮卡片。
4. 点击“升级”按钮，前端会调用后端接口模拟升级，并在 Alert 中提示成功。
5. 关闭 Modal 后，首页的用量进度条和套餐名称会刷新。

## 技术细节

- **多租户模型**：`models.py` 中定义了 `Organization` 和 `OrganizationMember`，所有业务数据（`Subscription`, `UsageRecord`）都关联到 `organization_id`。
- **计费逻辑**：`Subscription` 关联 `Plan`，`UsageRecord` 记录每日用量。
- **API 代理**：前端通过 Vite 代理转发 `/api` 请求到后端，解决跨域问题。
