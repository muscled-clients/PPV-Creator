-- Add TikTok metadata support to application_content_links table
-- This migration adds fields to store additional TikTok video data

-- Add new columns for enhanced TikTok data tracking
ALTER TABLE application_content_links 
ADD COLUMN IF NOT EXISTS last_view_check TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS platform_video_id TEXT,
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'error')),
ADD COLUMN IF NOT EXISTS sync_error TEXT,
ADD COLUMN IF NOT EXISTS last_successful_sync TIMESTAMP WITH TIME ZONE;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_application_content_links_last_view_check 
ON application_content_links(last_view_check);

CREATE INDEX IF NOT EXISTS idx_application_content_links_sync_status 
ON application_content_links(sync_status);

CREATE INDEX IF NOT EXISTS idx_application_content_links_platform_selected 
ON application_content_links(platform, is_selected);

-- Add comments for documentation
COMMENT ON COLUMN application_content_links.last_view_check IS 'Timestamp of last view count sync with platform API';
COMMENT ON COLUMN application_content_links.metadata IS 'JSON object storing additional platform-specific data (likes, comments, shares, etc.)';
COMMENT ON COLUMN application_content_links.platform_video_id IS 'Platform-specific video ID extracted from URL';
COMMENT ON COLUMN application_content_links.sync_status IS 'Status of the last sync attempt with platform API';
COMMENT ON COLUMN application_content_links.sync_error IS 'Error message from last failed sync attempt';
COMMENT ON COLUMN application_content_links.last_successful_sync IS 'Timestamp of last successful sync with platform API';

-- Function to extract TikTok video ID from URL
CREATE OR REPLACE FUNCTION extract_tiktok_video_id(url TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Standard TikTok URL pattern: https://www.tiktok.com/@username/video/1234567890
  IF url ~ 'tiktok\.com.*\/video\/(\d+)' THEN
    RETURN (regexp_match(url, '\/video\/(\d+)'))[1];
  END IF;
  
  -- Short TikTok URL pattern: https://vm.tiktok.com/ABC123/
  IF url ~ 'vm\.tiktok\.com\/([A-Za-z0-9]+)' THEN
    RETURN (regexp_match(url, 'vm\.tiktok\.com\/([A-Za-z0-9]+)'))[1];
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing TikTok links to populate platform_video_id
UPDATE application_content_links 
SET platform_video_id = extract_tiktok_video_id(content_url)
WHERE platform = 'tiktok' AND platform_video_id IS NULL;

-- Function to get TikTok links that need syncing
CREATE OR REPLACE FUNCTION get_tiktok_links_for_sync(
  max_links INTEGER DEFAULT 20,
  max_age_hours INTEGER DEFAULT 1
)
RETURNS TABLE (
  id UUID,
  application_id UUID,
  content_url TEXT,
  platform_video_id TEXT,
  views_tracked INTEGER,
  last_view_check TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    acl.id,
    acl.application_id,
    acl.content_url,
    acl.platform_video_id,
    acl.views_tracked,
    acl.last_view_check
  FROM application_content_links acl
  WHERE acl.platform = 'tiktok'
    AND acl.is_selected = true
    AND (
      acl.last_view_check IS NULL 
      OR acl.last_view_check < NOW() - INTERVAL '1 hour' * max_age_hours
    )
    AND acl.sync_status != 'syncing' -- Don't sync if already in progress
  ORDER BY 
    CASE WHEN acl.last_view_check IS NULL THEN 0 ELSE 1 END, -- Prioritize never-synced links
    acl.last_view_check ASC
  LIMIT max_links;
END;
$$ LANGUAGE plpgsql;

-- Function to update sync status
CREATE OR REPLACE FUNCTION update_sync_status(
  link_id UUID,
  new_status TEXT,
  error_message TEXT DEFAULT NULL,
  new_views INTEGER DEFAULT NULL,
  new_metadata JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE application_content_links
  SET 
    sync_status = new_status,
    sync_error = CASE WHEN new_status = 'error' THEN error_message ELSE NULL END,
    last_successful_sync = CASE WHEN new_status = 'success' THEN NOW() ELSE last_successful_sync END,
    last_view_check = CASE WHEN new_status IN ('success', 'error') THEN NOW() ELSE last_view_check END,
    views_tracked = CASE WHEN new_views IS NOT NULL THEN new_views ELSE views_tracked END,
    metadata = CASE WHEN new_metadata IS NOT NULL THEN new_metadata ELSE metadata END,
    updated_at = NOW()
  WHERE id = link_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create a view for TikTok analytics dashboard
CREATE OR REPLACE VIEW tiktok_analytics AS
SELECT 
  ca.id as application_id,
  ca.campaign_id,
  c.title as campaign_title,
  up.full_name as influencer_name,
  acl.id as link_id,
  acl.content_url,
  acl.platform_video_id,
  acl.views_tracked,
  acl.last_view_check,
  acl.last_successful_sync,
  acl.sync_status,
  acl.metadata,
  -- Extract metadata fields for easier querying
  CAST(acl.metadata->>'like_count' AS INTEGER) as like_count,
  CAST(acl.metadata->>'comment_count' AS INTEGER) as comment_count,
  CAST(acl.metadata->>'share_count' AS INTEGER) as share_count,
  acl.metadata->>'title' as video_title,
  acl.metadata->>'author' as video_author,
  acl.created_at as link_created_at,
  acl.updated_at as link_updated_at
FROM application_content_links acl
JOIN campaign_applications ca ON acl.application_id = ca.id
JOIN campaigns c ON ca.campaign_id = c.id
JOIN user_profiles up ON ca.influencer_id = up.id
WHERE acl.platform = 'tiktok' AND acl.is_selected = true;

-- Add RLS policy to allow reading sync data for authorized users
CREATE POLICY "Users can view TikTok sync data for their content" ON application_content_links
FOR SELECT USING (
  platform = 'tiktok' AND (
    -- Users can see their own content links
    application_id IN (
      SELECT id FROM campaign_applications 
      WHERE influencer_id = auth.uid()
    ) OR
    -- Brand users can see links for their campaigns
    application_id IN (
      SELECT ca.id FROM campaign_applications ca
      JOIN campaigns c ON ca.campaign_id = c.id
      WHERE c.brand_id = auth.uid()
    ) OR
    -- Admin users can see everything
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);