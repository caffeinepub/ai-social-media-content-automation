# Specification

## Summary
**Goal:** Build StyleFlow AI, a prototype social media content automation system for a clothing brand, with brand profile setup, simulated AI content generation, a scheduling calendar, and an analytics dashboard — all styled with a bold, fashion-forward dark theme.

**Planned changes:**
- Brand profile setup page: input brand name, logo upload, tone/voice, target audience, and a product catalog (name, category, description); persisted in the Motoko backend
- AI content generation page: select a product and target platform (Instagram, Facebook, Twitter/X, TikTok), generate a simulated caption and hashtags using template-based logic driven by brand tone; save generated posts for scheduling
- Content scheduling page with calendar view: assign posts to dates/times per platform; post status cycles through draft → scheduled → published; all data stored in Motoko backend
- Main dashboard as the default landing page: simulated per-platform analytics (total posts, estimated reach, engagement rate, top-performing post), platform filter tabs, and a recent activity feed of the last 5 posts
- Consistent bold fashion-forward UI: dark charcoal base, warm coral/terracotta/amber accents, clean sans-serif typography, sidebar or top navigation on all authenticated pages
- Hero banner image displayed in the dashboard header; platform icons used consistently across scheduling and analytics views

**User-visible outcome:** Users can set up their clothing brand profile, generate platform-specific social media captions and hashtags, schedule posts on a calendar, and view simulated performance analytics — all within a polished, fashion-brand-styled SaaS interface.
