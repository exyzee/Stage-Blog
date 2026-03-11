-- Run this ENTIRE script in Supabase SQL Editor

-- Step 1: Create the posts table (if not exists)
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  week TEXT,
  date DATE,
  status TEXT DEFAULT 'draft',
  title TEXT,
  excerpt TEXT,
  sections JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Public can read published posts" ON posts;
DROP POLICY IF EXISTS "Allow all operations" ON posts;

-- Step 4: Create policies
CREATE POLICY "Public can read published posts" ON posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Allow all operations" ON posts
  FOR ALL USING (true);

-- Step 5: Insert your blog posts

-- Week 1-2: Remote Start
INSERT INTO posts (id, week, date, status, title, excerpt, sections) VALUES (
  'post_week1_2',
  'Week 1–2',
  '2026-02-23',
  'published',
  'Remote Start: Getting My Bearings from 8,000 Miles Away',
  'My first two weeks at Playground have been entirely remote — onboarding from home while preparing for my move to Atlanta. Here''s how it went.',
  '{
    "activities": "<p>So I officially started at Playground on February 9th, but here''s the thing — I''m doing it all remotely for now. I don''t fly out to Atlanta until the end of the month, so these first two weeks have been a lot of async communication, getting access to tools, and trying to understand how things work here.</p><p>Most of my time went into <strong>learning the product inside out</strong>. Playground is an AI image generation platform, and there''s a lot to unpack — the creator tools, the community features, how templates work, the whole ecosystem. I''ve been clicking around like a new user would, taking notes on what makes sense and what doesn''t.</p><p>I also started looking into some <strong>new feature concepts</strong> they''re exploring — specifically tools like background removal and image format conversion. Nothing too deep yet, mostly just understanding the scope and what''s already been discussed.</p>",
    "deadlines": "<p>Honestly, there weren''t hard deadlines these two weeks — it was more about getting oriented. The main goal was to:</p><p><strong>✓ Get all my accounts and tools set up</strong> (Figma, Slack, Notion, etc.)<br><strong>✓ Read through existing product docs</strong><br><strong>✓ Familiarize myself with the design system</strong></p><p>All done, though I definitely feel like I''ve only scratched the surface. The design system is pretty comprehensive and I''m still wrapping my head around all the components.</p><p><strong>Next up:</strong> I land in Atlanta on Feb 28 and start in the office on March 2nd. The real work begins then — I''ll be diving into the feature design work properly.</p>",
    "learning": "<p>The biggest learning curve has been understanding how an AI product company thinks about features. It''s different from what I expected — there''s so much consideration around <strong>what creators actually need</strong> vs. what''s technically cool to build.</p><p>I''ve also been learning how to work async effectively. When you''re 8,000 miles away and timezones barely overlap, you have to be really intentional about communication. I''ve been writing longer Slack messages with more context, recording Loom videos for complex stuff, and being very explicit about questions instead of assuming I can just \"ask later.\"</p><p>Small thing but — I learned that Playground has a pretty active creator community. That''s going to be relevant for my work since my internship focuses on creator-related experiences.</p>",
    "environment": "<p>Hard to talk about \"environment\" when I''m working from my bedroom lol. But the team has been super welcoming even remotely. I''ve had video calls with my mentor and a few other designers, and everyone seems genuinely excited to have me join.</p><p>I''ve mostly been interacting with the product and design folks so far. The vibe is pretty chill — people share memes in Slack, there are casual watercooler channels, and nobody seems stressed about response times which is nice.</p><p>Can''t wait to actually meet everyone in person though. There''s only so much you can pick up over video calls.</p>",
    "strengths": "• Picking up new tools quickly\n• Self-directed learning\n• Written communication (been getting good feedback on my async updates)",
    "growth": "• Speaking up in meetings (I''ve been pretty quiet on calls)\n• Asking for feedback proactively\n• Understanding the business side of product decisions",
    "growthPlan": "I''m planning to be more vocal once I''m in the office. Easier to jump into conversations when you''re actually in the room. Also going to start asking more \"why\" questions about product decisions — I want to understand the reasoning, not just the what.",
    "positive": "<p>Okay real talk — I was nervous about starting remotely. Like, what if I miss important context? What if I can''t build relationships with the team? But it''s actually been fine. Better than fine.</p><p>The highlight was definitely my first call with the CEO. Not gonna lie, I was intimidated, but he was super approachable and genuinely interested in my background and what I want to learn. He mentioned he''s excited to have fresh eyes on the product. That felt good.</p><p>Two weeks down. Atlanta in a few days. Let''s go 🚀</p>"
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  week = EXCLUDED.week,
  date = EXCLUDED.date,
  status = EXCLUDED.status,
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  sections = EXCLUDED.sections;

-- Week 3-4: First Weeks in Atlanta
INSERT INTO posts (id, week, date, status, title, excerpt, sections) VALUES (
  'post_week3_4',
  'Week 3–4',
  '2026-03-09',
  'published',
  'Boots on the Ground: First Weeks in Atlanta',
  'I made it to Atlanta, joined the team in person, and immediately got pulled into some exciting feature work. Also, I''ve been in leadership meetings? Wild.',
  '{
    "activities": "<p>Landed in Atlanta on February 28th, took a day to recover from jet lag, and showed up at the office on Monday March 2nd. It''s been a whirlwind since then.</p><p>The big focus has been on <strong>new creator tools</strong> — specifically the background remover and image converter I mentioned last time. These went from \"concepts we''re exploring\" to \"okay let''s actually figure out how to build this.\" I''ve been:</p><ul><li>Talking directly with the CEO and COO about product direction</li><li>Coming up with implementation plans for how these features should work</li><li>Wireframing user flows</li><li>Designing the actual UI within Playground''s design system</li><li>Working with developers to make sure my designs are actually buildable</li></ul><p>On top of that, I got pulled into the <strong>Alice project</strong>. Alice is an AI assistant Playground is launching, and I''m helping design the landing page for it. It''s exciting but also a lot — going from \"here''s the concept\" to \"we need designs\" happened fast.</p><p>Oh, and I''ve started <strong>monitoring template metrics</strong> and helping out with creator program operations. Less glamorous but honestly pretty interesting to see what content actually performs well.</p>",
    "deadlines": "<p>Things are moving faster now. The background remover wireframes were due mid-week and I hit that deadline. The Alice landing page is still in progress — we''re iterating based on feedback.</p><p><strong>What''s on track:</strong></p><ul><li>✓ BG remover wireframes done</li><li>✓ Image converter initial flows mapped out</li><li>→ Alice landing page (in review, some revisions needed)</li></ul><p><strong>Coming up:</strong> Finalizing Alice designs this week, then moving the creator tools into higher fidelity. Also need to do some user testing on the flows I''ve designed — that''s new territory for me here.</p>",
    "learning": "<p>So many things. First off, <strong>I''ve been in leadership meetings</strong>. Like, actual strategy discussions with the CEO and COO. I mostly listen and take notes, but it''s been eye-opening to see how decisions get made at that level. They think about things I wouldn''t have considered — market timing, competitive positioning, resource allocation.</p><p>On the design side, I''m learning how to work within an existing design system while still pushing for what I think is right. There''s a balance between \"follow the system\" and \"the system doesn''t cover this use case\" — figuring out when to extend vs. when to adapt.</p><p>Also learning a ton about <strong>cross-functional collaboration</strong>. Designers here don''t just hand off mockups — we''re involved in implementation, QA, even launch decisions. It''s way more integrated than I expected.</p>",
    "environment": "<p>The office is great. Open floor plan, good snacks, and I can literally walk over to someone''s desk to ask a question instead of scheduling a call. Sounds basic but after two weeks of remote work it feels like a superpower.</p><p>My mentor has been amazing — they check in daily without being overbearing and give really constructive feedback. I shadowed them in a stakeholder meeting and learned a lot about how to present design rationale.</p><p>The team is small and tight-knit. Everyone knows everyone. There''s this thing where people eat lunch together most days, and the conversations range from deep product debates to completely random tangents. Good energy.</p><p>Atlanta itself is new to me. Still figuring out the city, finding good coffee spots, getting used to the weather. It''s an adjustment but I''m enjoying it.</p>",
    "strengths": "• Visual design — my mockups are getting good feedback\n• Taking initiative (I''ve been proposing ideas, not just waiting for tasks)\n• Adapting quickly to the in-person workflow",
    "growth": "• Presenting to stakeholders (still get nervous)\n• Estimating timelines accurately (I underestimated the Alice page work)\n• Pushing back constructively when I disagree with feedback",
    "growthPlan": "For presenting, I''m going to start doing more casual share-outs with the team before big stakeholder meetings. Practice in lower-stakes settings. For estimation, I''m going to start adding buffer time and tracking how long things actually take vs. how long I thought they would.",
    "positive": "<p>Honestly? This has been one of the best fortnights of my life. The imposter syndrome is still there — I''m sitting in meetings with the CEO thinking \"why am I here\" — but I''m starting to trust that they brought me on for a reason.</p><p>Best moment: I proposed an idea for the image converter flow that wasn''t in the original brief, and it got picked up. Like, it''s going to be in the product. Something I thought of. That''s wild.</p><p>Also, I designed my first thing that might actually ship. The Alice landing page isn''t final yet, but seeing my work potentially go live to real users is a different feeling. Scary but exciting.</p><p>Week 4 done. Starting to feel like I actually work here. 💪</p>"
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  week = EXCLUDED.week,
  date = EXCLUDED.date,
  status = EXCLUDED.status,
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  sections = EXCLUDED.sections;

-- Week 5-6: Draft for upcoming
INSERT INTO posts (id, week, date, status, title, excerpt, sections) VALUES (
  'post_week5_6',
  'Week 5–6',
  '2026-03-23',
  'draft',
  '',
  '',
  '{
    "activities": "",
    "deadlines": "",
    "learning": "",
    "environment": "",
    "strengths": "",
    "growth": "",
    "growthPlan": "",
    "positive": ""
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  week = EXCLUDED.week,
  date = EXCLUDED.date,
  status = EXCLUDED.status,
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  sections = EXCLUDED.sections;

-- Done! You should see "Success. No rows returned" which is normal for INSERT statements.
