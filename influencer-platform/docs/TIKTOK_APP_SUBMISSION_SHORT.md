# TikTok App Submission - Short Version for Form

## Product and Scope Explanation

Our Influencer Management Platform connects brands with TikTok creators for sponsored campaigns. We use TikTok's APIs to verify creator accounts, track content performance, and ensure fair compensation based on real metrics.

### How Each Product Works:

**Research API:**
We fetch view counts and engagement metrics for TikTok videos that creators submit as campaign deliverables. When a creator posts sponsored content and provides the video URL, we periodically query the Research API to track views. This data determines creator payments (CPM model) and provides ROI metrics to brands. We only access videos explicitly submitted by creators for campaigns.

**Login Kit (user.info.basic, user.info.profile):**
Creators authenticate their TikTok accounts during profile setup. This verifies account ownership, imports their username and follower count, and displays a verification badge to brands. The OAuth flow ensures creators explicitly consent to sharing their profile data.

**Video List (video.list):**
Allows creators to browse and select their existing TikTok videos for campaign submissions. This streamlines the content submission process and ensures creators can easily showcase their best work.

**Web SDK:**
Embeds TikTok videos directly in our campaign galleries and dashboards. Brands can preview submitted content without leaving our platform, improving user experience and engagement.

### Data Usage:
- **Collection:** Only data explicitly authorized by users through OAuth consent
- **Storage:** Encrypted, secure storage with regular audits
- **Purpose:** Campaign performance tracking, payment calculation, and analytics
- **Privacy:** Full GDPR/CCPA compliance, users can delete data anytime
- **Security:** No client-side token exposure, rate limiting implemented

### User Benefits:
- **Creators:** Fair pay based on real views, portfolio building, performance transparency
- **Brands:** Verified metrics, ROI tracking, authentic creator partnerships
- **Platform Value:** Promotes authentic content, prevents fraud, ensures FTC compliance

### Implementation:
1. Creator connects TikTok account (OAuth)
2. Submits video URLs for campaigns
3. We fetch metrics via API (respecting rate limits)
4. Display analytics in dashboards
5. Calculate payments based on verified views

We strictly follow TikTok's Terms of Service, implement proper error handling, and maintain transparent data practices. Our goal is to create sustainable, fair partnerships between brands and creators using accurate TikTok data.

**Technical Contact:** dev@influencerplatform.com
**Privacy Contact:** privacy@influencerplatform.com