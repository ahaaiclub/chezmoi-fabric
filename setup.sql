-- Chez Moi 老土布布料库 - Supabase 数据库初始化
-- 请在 Supabase Dashboard > SQL Editor 中执行此脚本

-- 1. 创建 fabrics 表
CREATE TABLE IF NOT EXISTS fabrics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  origin TEXT,
  origin_story TEXT,
  material TEXT,
  pattern TEXT,
  dyeing TEXT,
  width TEXT,
  thickness TEXT,
  colors TEXT[],
  images TEXT[],
  story TEXT,
  uses TEXT[],
  care TEXT,
  status TEXT DEFAULT '有货',
  placeholder_gradient TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 启用 RLS 并设置策略
ALTER TABLE fabrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON fabrics FOR SELECT USING (true);
CREATE POLICY "Admin insert" ON fabrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update" ON fabrics FOR UPDATE USING (true);
CREATE POLICY "Admin delete" ON fabrics FOR DELETE USING (true);

-- 3. 创建 updated_at 自动更新触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fabrics_updated_at
  BEFORE UPDATE ON fabrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 4. 创建图片存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('fabric-images', 'fabric-images', true)
ON CONFLICT (id) DO NOTHING;

-- 5. 存储桶访问策略
CREATE POLICY "Public read images" ON storage.objects
  FOR SELECT USING (bucket_id = 'fabric-images');

CREATE POLICY "Allow upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'fabric-images');

CREATE POLICY "Allow update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'fabric-images');

CREATE POLICY "Allow delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'fabric-images');
