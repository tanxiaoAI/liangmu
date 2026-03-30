# 良木家具 AI 自媒体内容生成平台

## 项目简介
本项目是专为良木家具打造的 AI 自媒体内容生成平台，旨在帮助营销团队批量生成选题、封面、标题、脚本和视频，提升内容制作效率。

## 功能模块
1.  **批量选题生成**：基于关键词和风格生成选题。
2.  **封面图生成**：上传参考图或选择风格生成封面。
3.  **标题生成**：基于选题生成吸引人的标题。
4.  **脚本生成**：自动编写分镜脚本和口播文案。
5.  **视频制作**：一键合成短视频。
6.  **素材管理**：管理生成的素材和成品。
7.  **客户互动**：留资管理和自动回复配置。

## 技术栈
-   **前端**：React, TypeScript, TailwindCSS, Vite, Zustand
-   **后端**：Node.js, Express
-   **数据库**：Supabase (PostgreSQL)
-   **AI 集成**：Mock Data (可替换为 OpenAI/Stable Diffusion API)

## 快速开始

### 1. 环境准备
-   Node.js (v18+)
-   npm 或 pnpm

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
在项目根目录创建 `.env` 文件（已自动生成），配置 Supabase 相关信息：
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
PORT=3001
```

### 4. 启动项目
```bash
npm run dev
```
-   前端地址：http://localhost:5173
-   后端地址：http://localhost:3001

## 目录结构
-   `src/`: 前端源代码
    -   `pages/`: 页面组件
    -   `components/`: 通用组件
    -   `store/`: 状态管理
    -   `lib/`: 工具库
-   `api/`: 后端源代码
    -   `routes/`: API 路由
-   `supabase/`: 数据库迁移文件

## 注意事项
-   当前 AI 生成功能使用 Mock 数据演示。
-   请确保 Supabase 数据库已正确初始化（migrations 已应用）。
