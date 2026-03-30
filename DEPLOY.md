# 部署指南 (Deployment Guide)

本项目是一个前后端分离的全栈应用 (React + Express)，支持部署到 Vercel 平台。

## 前置准备

1.  注册 [Vercel](https://vercel.com/) 账号。
2.  将本项目代码推送到 GitHub/GitLab/Bitbucket 代码仓库。

## 部署步骤 (Vercel)

### 1. 导入项目
1.  登录 Vercel Dashboard。
2.  点击 **"Add New..."** -> **"Project"**。
3.  选择你的代码仓库并点击 **"Import"**。

### 2. 配置项目
在 "Configure Project" 页面：
*   **Framework Preset**: 选择 `Vite`。
*   **Root Directory**: 保持默认 `./`。
*   **Build Command**: `npm run build` (默认)。
*   **Output Directory**: `dist` (默认)。
*   **Install Command**: `npm install` (默认)。

### 3. 配置环境变量 (Environment Variables)
在 "Environment Variables" 区域添加以下变量：

| 变量名 | 描述 | 示例值 |
| :--- | :--- | :--- |
| `DOUBAO_API_KEY` | 豆包大模型 API Key | `your-api-key-here` |
| `VITE_API_URL` | 前端 API 基础路径 | `/api` (推荐) 或 `https://your-domain.com/api` |

> **注意**：如果不设置 `VITE_API_URL`，前端默认会请求 `http://localhost:3001`，这在生产环境是不行的。你需要修改前端代码中的 API 请求路径，或者统一使用相对路径 `/api/...`。本项目配置了 `vercel.json` rewrite 规则，推荐前端直接请求 `/api/content/...`。

### 4. 点击 Deploy
点击 **"Deploy"** 按钮，等待几分钟。
部署成功后，Vercel 会提供一个访问域名 (例如 `https://your-project.vercel.app`)。

## 适配说明

### 后端适配 (Serverless)
本项目已配置 `api/index.ts` 作为 Vercel Serverless Function 的入口，通过 `vercel.json` 将 `/api/*` 请求转发给 Express 应用处理。
*   `api/server.ts` 已修改为导出 `app` 实例，以兼容 Serverless 环境。

### 前端适配
*   请确保前端代码中 `fetch` 请求的 URL 已改为相对路径（如 `/api/content/generate-topics`），或者使用环境变量 `import.meta.env.VITE_API_URL` 动态拼接。
*   目前代码中硬编码了 `http://localhost:3001`，**部署前请全局替换**为 `/api` 或配置好的生产环境域名。

## 常见问题

*   **API 404**: 检查 `vercel.json` 的 `rewrites` 配置是否生效。
*   **API 500**: 检查 Vercel 后台的环境变量 `DOUBAO_API_KEY` 是否正确设置。
*   **跨域问题 (CORS)**: Vercel 同域部署通常不需要 CORS，但如果前后端分离部署，请在 `api/server.ts` 中配置允许的 Origin。
