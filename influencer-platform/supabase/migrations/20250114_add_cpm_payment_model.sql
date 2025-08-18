-- Add CPM (Cost Per Mille/1000 views) payment model support to campaigns
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS payment_model TEXT DEFAULT 'cpm' CHECK (payment_model = 'cpm'),
ADD COLUMN IF NOT EXISTS cpm_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS max_views INTEGER,
ADD COLUMN IF NOT EXISTS total_budget_calculated DECIMAL(10,2);

-- Add view tracking table for CPM campaigns
CREATE TABLE IF NOT EXISTS public.campaign_view_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    influencer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
    views_tracked INTEGER DEFAULT 0,
    last_checked_at TIMESTAMP WITH TIME ZONE,
    payout_calculated DECIMAL(10,2) DEFAULT 0,
    payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'approved', 'paid', 'rejected')),
    instagram_views INTEGER DEFAULT 0,
    tiktok_views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(campaign_id, influencer_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_view_tracking_campaign_id ON public.campaign_view_tracking(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_view_tracking_influencer_id ON public.campaign_view_tracking(influencer_id);
CREATE INDEX IF NOT EXISTS idx_campaign_view_tracking_payout_status ON public.campaign_view_tracking(payout_status);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_campaign_view_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaign_view_tracking_updated_at
    BEFORE UPDATE ON public.campaign_view_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_campaign_view_tracking_updated_at();

-- Add RLS policies for campaign_view_tracking
ALTER TABLE public.campaign_view_tracking ENABLE ROW LEVEL SECURITY;

-- Brands can view tracking for their campaigns
CREATE POLICY "Brands can view their campaign tracking" ON public.campaign_view_tracking
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_view_tracking.campaign_id 
            AND campaigns.brand_id = auth.uid()
        )
    );

-- Influencers can view their own tracking
CREATE POLICY "Influencers can view their own tracking" ON public.campaign_view_tracking
    FOR SELECT
    USING (influencer_id = auth.uid());

-- System can insert tracking records
CREATE POLICY "System can insert tracking" ON public.campaign_view_tracking
    FOR INSERT
    WITH CHECK (true);

-- System can update tracking records
CREATE POLICY "System can update tracking" ON public.campaign_view_tracking
    FOR UPDATE
    USING (true);

-- Add comments for documentation
COMMENT ON COLUMN public.campaigns.payment_model IS 'Payment model: fixed, cpm (cost per 1000 views), or performance';
COMMENT ON COLUMN public.campaigns.cpm_rate IS 'Cost per 1000 views in dollars';
COMMENT ON COLUMN public.campaigns.max_views IS 'Maximum number of views to pay for';
COMMENT ON COLUMN public.campaigns.total_budget_calculated IS 'Auto-calculated total budget based on CPM rate and max views';
COMMENT ON TABLE public.campaign_view_tracking IS 'Tracks views and payouts for CPM-based campaigns';