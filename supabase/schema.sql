-- ==============================================================================
-- BLUE TOURS ARUGAMBAY - SUPABASE DATABASE & STORAGE SCHEMA
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Create gallery_items table
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('safari', 'lagoon', 'surfing', 'beach', 'wildlife', 'other', 'camp', 'taxi')),
    description TEXT,
    media_type VARCHAR(20) NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    media_url TEXT NOT NULL,
    storage_path TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create index for fast public retrieval ordered by sort_order and created_at
CREATE INDEX IF NOT EXISTS idx_gallery_items_published_created 
ON public.gallery_items (is_published, sort_order ASC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gallery_items_category 
ON public.gallery_items (category);

-- 3. Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_gallery_items_updated_at ON public.gallery_items;
CREATE TRIGGER set_gallery_items_updated_at
    BEFORE UPDATE ON public.gallery_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security Policies
-- Policy 1: Public Read (Any visitor can view published gallery items)
DROP POLICY IF EXISTS "Public can view published gallery items" ON public.gallery_items;
CREATE POLICY "Public can view published gallery items"
ON public.gallery_items
FOR SELECT
USING (is_published = true);

-- Policy 2: Admin Full Access (Authenticated users can select, insert, update, delete)
DROP POLICY IF EXISTS "Authenticated admins have full access" ON public.gallery_items;
CREATE POLICY "Authenticated admins have full access"
ON public.gallery_items
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- STORAGE CONFIGURATION (STORAGE BUCKET & POLICIES)
-- ==============================================================================
-- Note: You can also create the 'gallery' bucket via Supabase Dashboard > Storage > New Bucket (Public: ON)

INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policy 1: Anyone can read public gallery assets
DROP POLICY IF EXISTS "Public can read gallery assets" ON storage.objects;
CREATE POLICY "Public can read gallery assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'gallery');

-- Storage Policy 2: Authenticated admins can upload assets
DROP POLICY IF EXISTS "Admins can upload gallery assets" ON storage.objects;
CREATE POLICY "Admins can upload gallery assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery');

-- Storage Policy 3: Authenticated admins can update assets
DROP POLICY IF EXISTS "Admins can update gallery assets" ON storage.objects;
CREATE POLICY "Admins can update gallery assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'gallery');

-- Storage Policy 4: Authenticated admins can delete assets
DROP POLICY IF EXISTS "Admins can delete gallery assets" ON storage.objects;
CREATE POLICY "Admins can delete gallery assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'gallery');
