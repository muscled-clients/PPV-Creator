-- Create table for multiple content links per application
CREATE TABLE IF NOT EXISTS public.application_content_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.campaign_applications(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
  content_url TEXT NOT NULL,
  is_selected BOOLEAN DEFAULT false,
  selection_status VARCHAR(20) DEFAULT 'pending' CHECK (selection_status IN ('pending', 'selected', 'not_selected')),
  views_tracked INTEGER DEFAULT 0,
  last_view_check TIMESTAMP WITH TIME ZONE,
  selection_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_application_content_links_application_id ON public.application_content_links(application_id);
CREATE INDEX idx_application_content_links_selected ON public.application_content_links(application_id, is_selected) WHERE is_selected = true;
CREATE INDEX idx_application_content_links_status ON public.application_content_links(application_id, selection_status);

-- Add RLS policies
ALTER TABLE public.application_content_links ENABLE ROW LEVEL SECURITY;

-- Policy for influencers to insert their own links
CREATE POLICY "Influencers can insert their own content links"
  ON public.application_content_links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaign_applications ca
      WHERE ca.id = application_id
      AND ca.influencer_id = auth.uid()
    )
  );

-- Policy for influencers to view their own links
CREATE POLICY "Influencers can view their own content links"
  ON public.application_content_links
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_applications ca
      WHERE ca.id = application_id
      AND ca.influencer_id = auth.uid()
    )
  );

-- Policy for brands to view and update links for their campaigns
CREATE POLICY "Brands can manage content links for their campaigns"
  ON public.application_content_links
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_applications ca
      JOIN public.campaigns c ON c.id = ca.campaign_id
      WHERE ca.id = application_id
      AND c.brand_id = auth.uid()
    )
  );

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_application_content_links_updated_at
  BEFORE UPDATE ON public.application_content_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing data from campaign_applications to new structure
-- This preserves backward compatibility
INSERT INTO public.application_content_links (application_id, platform, content_url, is_selected, selection_status)
SELECT 
  id as application_id,
  'instagram' as platform,
  instagram_content_url as content_url,
  CASE WHEN status = 'approved' THEN true ELSE false END as is_selected,
  CASE 
    WHEN status = 'approved' THEN 'selected'
    WHEN status = 'rejected' THEN 'not_selected'
    ELSE 'pending'
  END as selection_status
FROM public.campaign_applications
WHERE instagram_content_url IS NOT NULL AND instagram_content_url != ''
UNION ALL
SELECT 
  id as application_id,
  'tiktok' as platform,
  tiktok_content_url as content_url,
  CASE WHEN status = 'approved' THEN true ELSE false END as is_selected,
  CASE 
    WHEN status = 'approved' THEN 'selected'
    WHEN status = 'rejected' THEN 'not_selected'
    ELSE 'pending'
  END as selection_status
FROM public.campaign_applications
WHERE tiktok_content_url IS NOT NULL AND tiktok_content_url != ''
ON CONFLICT DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE public.application_content_links IS 'Stores multiple content links per application with individual selection status';
COMMENT ON COLUMN public.application_content_links.is_selected IS 'Whether the brand has selected this link for view tracking and payment';
COMMENT ON COLUMN public.application_content_links.selection_status IS 'Status of link selection: pending, selected, or not_selected';
COMMENT ON COLUMN public.application_content_links.selection_date IS 'Timestamp when brand made the selection decision';