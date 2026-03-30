-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'content_operator' CHECK (role IN ('content_operator', 'marketing_manager', 'designer')),
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 创建内容项目表
CREATE TABLE IF NOT EXISTS content_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
  style_preference VARCHAR(50) DEFAULT 'modern',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_content_projects_user_id ON content_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_content_projects_status ON content_projects(status);

-- 创建选题表
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES content_projects(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  category VARCHAR(100),
  engagement_score INTEGER DEFAULT 0,
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_topics_project_id ON topics(project_id);
CREATE INDEX IF NOT EXISTS idx_topics_engagement_score ON topics(engagement_score DESC);

-- 创建封面图片表
CREATE TABLE IF NOT EXISTS cover_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES content_projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(500),
  ai_score INTEGER DEFAULT 0,
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_cover_images_project_id ON cover_images(project_id);
CREATE INDEX IF NOT EXISTS idx_cover_images_ai_score ON cover_images(ai_score DESC);

-- 创建客户留资表
CREATE TABLE IF NOT EXISTS customer_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  customer_name VARCHAR(100),
  contact_info VARCHAR(255),
  source_platform VARCHAR(100),
  interest_level VARCHAR(50) DEFAULT 'warm' CHECK (interest_level IN ('cold', 'warm', 'hot')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_customer_leads_user_id ON customer_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_leads_created_at ON customer_leads(created_at DESC);

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_leads ENABLE ROW LEVEL SECURITY;

-- 创建简单的 RLS 策略 (允许所有已认证用户访问 - 开发阶段方便调试)
CREATE POLICY "Enable all access for authenticated users" ON users FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON content_projects FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON topics FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON cover_images FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON customer_leads FOR ALL TO authenticated USING (true);
