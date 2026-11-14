* # **Gunagrahan App (ગુણગ્રહણ એપ) — Ultimate Master Product, UI/UX & Next.js \+ Supabase Specification**

* # **1\. Executive Summary & Core Vision**

* **Project Name:** ગુણગ્રહણ એપ (Gunagrahan Web Application)  
* **Primary Event Context:** 5-Day Ramatotsav Project (24th to 29th; Final reporting & Bapa's letter compilation on 30th–31st) and permanent reusable platform for future Bal Parayan and Youth events.  
* **Target Audience:** 20–25+ Karyakars (Registered \+ Unregistered Volunteers) working together on-ground during intense Seva schedules.  
* **Spiritual & Functional Goal:** Cultivate intense unity (Samp) and mutual affection (Suhradbhav) by shifting focus from faults (Avagun) to virtues (Gun) — becoming "ગુણના ભિખારી" (seekers of virtues).  
* **Collective Milestone Target:** 200+ written virtues across the 5-day period (tracked across 4 checkpoints: 50, 100, 150, 200), to be compiled into a sacred offering letter to Param Pujya Mahant Swami Maharaj alongside event photographs, and used to present a Smrutibhet (token of appreciation) from P.P. Swami and Amrutraj Swami to the top writers.  
* **The Core Gamification Rule ("Writer-First" Leaderboard):** The leaderboard strictly ranks who has **WRITTEN** the most virtues about others (`author_id`), NEVER who has received the most virtues (`recipient_id`). Writing 5 virtues for each of 20 karyakars \= 100 points on the writer leaderboard.

---

# **2\. Strict Coding Agent Directives & Tech Stack Lock**

* **Zero Improvisation Rule:** Follow every class name, state variable, SQL table definition, and UX flow specified in this document without adding unrequested pages or altering the schema.  
* **Framework:** Next.js 14+ (App Router, standard `src/` directory, JavaScript `.js/.jsx`).  
* **Database & Realtime Engine:** Supabase (`@supabase/supabase-js`) using direct client queries and PostgreSQL Realtime WebSockets (`postgres_changes`). Zero custom Next.js `/api` routes are needed.  
* **Styling:** Tailwind CSS (3.4+) with dynamic theme classes based on `process.env.NEXT_PUBLIC_APP_WING`.  
* **Animations & Celebrations:** `framer-motion` (for modals, drawers, and list transitions) \+ `canvas-confetti` (for virtue submission and milestone celebrations).  
* **Speech & Sharing APIs:** Native Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition` with `lang = 'gu-IN'`) for 4-second Gujarati voice dictation, and WhatsApp `https://wa.me/?text=` deep-linking for 1-tap virtue sharing.  
* **Icons:** `lucide-react`.

---

# **3\. Core UX Principles & The 8 High-Impact Enhancements**

## **Minimalist Anti-Bloat Guardrails**

1. **The 4-to-12 Second Rule:** From unlocking a phone and tapping the web link to submitting a Gujarati virtue (via typing or voice mic), the entire flow takes 4 to 12 seconds.  
2. **Explicit Exclusions:** NO passwords, NO OTPs, NO profile photo uploads, NO image attachments in posts, and NO multi-page navigation mazes.

## **The 8 Ultimate UI/UX Enhancements Integrated into the Plan**

3. **"કોનો ગુણ બાકી?" (Smart Unrecognized Karyakar Nudge):** Inside the `+ Add ગુણ` drawer, right above the dropdown, displays 3 quick-select chips of karyakars who have received the fewest virtues or whom the logged-in user hasn't written about yet (`💡 સૂચન: ઋષિભાઈ • પ્રતીકભાઈ • દર્શનભાઈ`).  
4. **1-Tap Gujarati Sentence Starters (Anti-Writer's Block):** Tappable starter templates above the textarea (`"આજે સેવા દરમિયાન મેં જોયું કે..."`, `"રાત્રે મોડા સુધી થાક્યા વગર..."`, `"નાનામાં નાની સેવામાં પણ..."`) that append directly into the input box.  
5. **"ગુણ-દૃષ્ટિ" Writer Milestone Badges (Gamification Levels):** Dynamic prestige titles next to every writer's name on the Header and Leaderboard based on their personal written count:  
   * `1–9 ગુણ`: **🌱 ગુણ શોધક** (Seeker)  
   * `10–24 ગુણ`: **✨ ગુણ ગ્રાહક** (Appreciator)  
   * `25–49 ગુણ`: **💎 ગુણના ભિખારી** (Devotee of Virtues)  
   * `50+ ગુણ`: **👑 સંપ શિલ્પી** (Architect of Unity)  
6. **Personal "Coverage Ring" (20/20 Karyakar Checklist):** A progress pill inside the Hero Card (`🎯 તમે 25 માંથી 14 કાર્યકરોના ગુણ લખ્યા છે`). Tapping it opens the `+ Add ગુણ` drawer pre-filtered to the remaining karyakars the user hasn't written about yet.  
7. **1-Tap WhatsApp "ગુણ Card" Share:** A `📲 Share` button next to the `🙏 રાજીપો` button on every virtue card that launches WhatsApp with a formatted Gujarati appreciation message and a link back to the app.  
8. **Gujarati Voice-to-Text Mic Button (**`🎤 બોલીને લખો`): Native `gu-IN` speech-to-text button inside the corner of the virtue textarea so tired volunteers can speak a virtue in 4 seconds hands-free.  
9. **"સંપ વૃક્ષ" (Collective Milestone Checkpoints at 50, 100, 150, 200):** Segmented progress bar with 4 visual checkpoints (`50 • 100 • 150 • 200`) and a golden celebratory banner whenever the team crosses a milestone.  
10. **"બાપાનો પત્ર" Sacred Print Template & Top Writer Certificate (**`/report`): Traditional ornamental A4 print layout addressed to Param Pujya Mahant Swami Maharaj, featuring a formal Gujarati cover letter, Top Writers Podium for the Smrutibhet presentation before P.P. Swami & Amrutraj Swami, and all virtues neatly organized.

---

# **4\. Environment Variables & Dual-Wing Theme Engine (Bal vs Balika)**

## **.env.local Configuration**

* `NEXT_PUBLIC_SUPABASE_URL`\=your\_supabase\_project\_url  
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`\=your\_supabase\_anon\_key  
* `NEXT_PUBLIC_APP_WING`\=bal (Allowed values: bal or balika)  
* `NEXT_PUBLIC_TARGET_GUNAS`\=200

## **Dual-Wing Design Tokens (src/config/theme.js)**

* 

| Token / Key | Bal Mandal (wing \=== 'bal') — Royal Blue | Balika Mandal (wing \=== 'balika') — Rose Pink |
| :---- | :---- | :---- |
| **appBg** | `bg-[#F8FAFC] text-[#0F172A]` | `bg-[#FFFBFB] text-[#1E1B18]` |
| **headerBg** | `bg-white/85 backdrop-blur-md border-b border-slate-200/80` | `bg-white/85 backdrop-blur-md border-b border-rose-100` |
| **primaryGradient** | `bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25` | `bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/25` |
| **primaryAccentText** | `text-blue-600` | `text-rose-600` |
| **primarySoftBg** | `bg-blue-50 text-blue-700 border-blue-200` | `bg-rose-50 text-rose-700 border-rose-200` |
| **avatarBadge** | `bg-blue-100 text-blue-700 border border-blue-200` | `bg-rose-100 text-rose-700 border border-rose-200` |
| **cardBorder** | `border-slate-200/80` | `border-rose-100` |
| **quoteBorder** | `border-l-4 border-blue-500` | `border-l-4 border-rose-500` |
| **progressBarFill** | `bg-gradient-to-r from-blue-500 to-indigo-600` | `bg-gradient-to-r from-rose-500 to-pink-600` |
| **ringFocus** | `focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600` | `focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600` |

---

# **5\. Supabase PostgreSQL Schema, RLS & Realtime Setup (supabase/schema.sql)**

Run this exact SQL script in the Supabase SQL Editor:

* 

```sql
create extension if not exists "uuid-ossp";

-- 1. KARYAKARS TABLE (Master Volunteer List)
create table public.karyakars (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  wing text not null default 'bal' check (wing in ('bal', 'balika')),
  is_pre_registered boolean not null default true,
  created_at timestamptz not null default now(),
  unique(name, wing)
);

-- 2. GUNAS TABLE (Virtue Entries)
create table public.gunas (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references public.karyakars(id) on delete cascade,
  author_name text not null,
  recipient_id uuid not null references public.karyakars(id) on delete cascade,
  recipient_name text not null,
  content text not null check (char_length(trim(content)) >= 3),
  wing text not null default 'bal' check (wing in ('bal', 'balika')),
  rajipo_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- 3. INDEXES FOR <50ms QUERIES
create index idx_karyakars_wing on public.karyakars(wing);
create index idx_gunas_wing_created on public.gunas(wing, created_at desc);
create index idx_gunas_author on public.gunas(author_id);
create index idx_gunas_recipient on public.gunas(recipient_id);

-- 4. ATOMIC RPC FUNCTION FOR 1-TAP RAJIPO APPRECIATION
create or replace function increment_rajipo(row_id uuid)
returns void as $$
begin
  update public.gunas
  set rajipo_count = rajipo_count + 1
  where id = row_id;
end;
$$ language plpgsql;

-- 5. ROW LEVEL SECURITY (Open Passwordless Access for Internal Karyakar App)
alter table public.karyakars enable row level security;
alter table public.gunas enable row level security;

create policy "Allow public read karyakars" on public.karyakars for select using (true);
create policy "Allow public insert karyakars" on public.karyakars for insert with check (true);
create policy "Allow public read gunas" on public.gunas for select using (true);
create policy "Allow public insert gunas" on public.gunas for insert with check (true);
create policy "Allow public update rajipo_count" on public.gunas for update using (true);

-- 6. ENABLE REALTIME WEBSOCKETS
alter publication supabase_realtime add table public.gunas;
alter publication supabase_realtime add table public.karyakars;

-- 7. INITIAL SEED DATA (Core Karyakars)
insert into public.karyakars (name, wing, is_pre_registered) values
  ('સિદ્ધરાજભાઈ (Siddhraj)', 'bal', true),
  ('ભાવિકભાઈ (Bhavik)', 'bal', true),
  ('ધર્મેશભાઈ (Dharmeshbhai)', 'bal', true),
  ('કીર્તનભાઈ (Kirtanbhai)', 'bal', true),
  ('ઋષિભાઈ (Rushibhai)', 'bal', true),
  ('પ્રતીકભાઈ (Pratikbhai)', 'bal', true)
on conflict (name, wing) do nothing;
```

---

# **6\. Exact File & Folder Structure**

* `supabase/schema.sql` — Full SQL script, RPC, RLS & seed data  
* `src/lib/supabaseClient.js` — Singleton Supabase client initialization  
* `src/lib/utils.js` — Grapheme extractor, relative timestamp formatter, writer badge calculator, and WhatsApp share URL builder  
* `src/config/theme.js` — Bal (Blue) vs Balika (Pink) exact class mappings  
* `src/config/seedKaryakars.js` — Fallback seed array of Karyakar names & Gujarati sentence starters  
* `src/app/globals.css` — Tailwind imports \+ Gujarati line-height rules \+ `@media print` A4 styles  
* `src/app/layout.jsx` — Loads `Noto_Sans_Gujarati` & `Plus_Jakarta_Sans` fonts  
* `src/app/page.jsx` — Master Single-Page Controller \+ Realtime WebSocket Listener \+ Coverage & Nudge Calculations  
* `src/app/report/page.jsx` — Sacred Printable A4 Report for Bapa's Letter & Swami Smrutibhet Presentation  
* `src/components/LoginGateModal.jsx` — Fullscreen First-Time Name Selector / Unregistered Name Creator  
* `src/components/StickyHeader.jsx` — Top Bar \+ Writer Badge \+ User Initial Circle \+ Logout Popover  
* `src/components/HeroActionCard.jsx` — `+ Add ગુણ` CTA \+ `Total Written ગુણ` Counter \+ 4-Checkpoint `સંપ વૃક્ષ` Bar \+ Personal Coverage Ring  
* `src/components/WriterLeaderboard.jsx` — Top 3 Podium \+ Writer Milestone Badges \+ Horizontal Bars \+ Expandable All Ranks  
* `src/components/PublicGunaFeed.jsx` — Filter Pills \+ Karyakar Search \+ Virtue Cards Feed  
* `src/components/GunaCard.jsx` — Individual Virtue Card with `🙏 રાજીપો` \+ `📲 WhatsApp Share`  
* `src/components/AddGunaDrawer.jsx` — Slide-Up Bottom Sheet with Smart Nudge Chips, Searchable Dropdown, Sentence Starters, and `🎤 બોલીને લખો` Gujarati Voice Dictation

---

# **7\. Helper Utilities (src/lib/utils.js)**

Must export four exact functions:

* **1\. getFirstGrapheme(name):**  
  * Uses `Intl.Segmenter('gu', { granularity: 'grapheme' })` (with fallback to `Array.from(name.trim())[0]`) so Gujarati conjunct/matra characters like "સિ" (in સિદ્ધરાજ) or "ભ" (in ભાવિક) or "ઋ" render as a single intact Gujarati character inside the circular avatar without splitting Unicode combining marks.  
* **2\. formatRelativeTime(dateString):**  
* \< 60 seconds: returns "હમણાં જ (Just now)"  
  * \< 60 minutes: returns "\${mins} મિનિટ પહેલાં"  
  * \< 24 hours: returns "\${hours} કલાક પહેલાં"  
  * Otherwise: formats as "DD MMM, hh:mm A".  
* **3\. getWriterBadge(count):**  
  * Returns `{ icon, title, colorClass }` based on virtues written:  
    * `count >= 50`: `{ icon: '👑', title: 'સંપ શિલ્પી', colorClass: 'bg-amber-100 text-amber-800 border-amber-300' }`  
    * `count >= 25`: `{ icon: '💎', title: 'ગુણના ભિખારી', colorClass: 'bg-purple-100 text-purple-800 border-purple-300' }`  
    * `count >= 10`: `{ icon: '✨', title: 'ગુણ ગ્રાહક', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' }`  
    * `count >= 1`: `{ icon: '🌱', title: 'ગુણ શોધક', colorClass: 'bg-sky-100 text-sky-800 border-sky-300' }`  
    * `count === 0`: `{ icon: '🌸', title: 'નવા લેખક', colorClass: 'bg-slate-100 text-slate-600 border-slate-200' }`  
* **4\. buildWhatsAppShareUrl(guna, appUrl):**  
  * Constructs a formatted Gujarati message:  
    * `🌟 *${guna.recipient_name}નો ગુણ*\n\n"${guna.content}"\n\n✍️ *લખનાર:* ${guna.author_name}\n🔗 *રમતોત્સવ ગુણગ્રહણ એપ પર ગુણ વાંચો અને લખો:* ${appUrl}`  
  * Returns `https://wa.me/?text=${encodeURIComponent(text)}`.

---

# **8\. Component-by-Component Engineering Specifications**

## **Component 1: src/app/page.jsx (Master Controller, Realtime Engine & Smart Analytics)**

* **State Hooks:**  
  * `currentUser`: `{ id, name } | null` — Hydrated from `localStorage.getItem('gunagrahan_user_v1')`.  
  * `karyakars`: Array of `{ id, name, wing }` sorted alphabetically via `localeCompare('gu')`.  
  * `gunas`: Array of `{ id, author_id, author_name, recipient_id, recipient_name, content, rajipo_count, created_at }` sorted by `created_at` descending.  
  * `isLoading`: `boolean`.  
  * `isAddModalOpen`: `boolean`.  
  * `preselectedRecipientId`: `string | null` (allows tapping a Smart Nudge chip or Coverage Ring to open the modal with a specific karyakar pre-selected or filtered).  
  * `onlyUnwrittenFilter`: `boolean` (activated when user taps the Coverage Ring pill).  
  * `showFloatingFAB`: `boolean` (`true` when `window.scrollY > 280`).  
* **Computed Derived Values (useMemo):**  
  * `totalWrittenCount`: `gunas.length`  
  * `myWrittenCount`: `gunas.filter(g => g.author_id === currentUser?.id).length`  
  * `myWriterBadge`: `getWriterBadge(myWrittenCount)`  
  * `writerLeaderboard`:  
    * **STRICT RULE:** Group `gunas` strictly by `author_id` (the writer), NEVER by `recipient_id`.  
    * Map each unique `author_id` to `{ authorId, authorName, count, badge: getWriterBadge(count) }`.  
    * Sort descending by `count` (`b.count - a.count`).  
  * `myCoverageStats` (Personal Coverage Ring):  
    * `otherKaryakars = karyakars.filter(k => k.id !== currentUser?.id)`  
    * `writtenRecipientIds = new Set(gunas.filter(g => g.author_id === currentUser?.id).map(g => g.recipient_id))`  
    * Returns `{ coveredCount: writtenRecipientIds.size, totalOthers: otherKaryakars.length, unwrittenKaryakars: otherKaryakars.filter(k => !writtenRecipientIds.has(k.id)) }`.  
  * `smartNudgeKaryakars` ("કોનો ગુણ બાકી?" Top 3 Suggestions):  
  * Computes how many times each `otherKaryakar` has been written about across the entire team (`recipientCounts`), prioritizing those whom `currentUser` hasn't written about yet AND who have the lowest total received count. Returns top 3 karyakars.  
* **Supabase Realtime Channel (useEffect):**  
  * Subscribes to `supabase.channel('gunagrahan-live')` listening to `INSERT` and `UPDATE` on `public.gunas` and `INSERT` on `public.karyakars` filtered by `wing=eq.${wing}`.

## **Component 2: src/components/LoginGateModal.jsx (Zero-Friction Onboarding)**

* **When Rendered:** Whenever `currentUser === null` after hydration.  
* **Visuals & Layout:**  
  * Spiritual Top Badge: `"✨ ગુણના ભિખારી બનીએ • રમતોત્સવ"`.  
  * Heading: `"ગુણગ્રહણ એપ"` \+ Subheading: `"તમારું નામ પસંદ કરો અને કાર્યકરોના ગુણ લખવાની શરૂઆત કરો."`  
* Search Input (`placeholder="તમારું નામ શોધો અથવા લખો..."`).  
  * Scrollable Karyakar List (`max-h-52 overflow-y-auto`).  
  * **Unregistered Karyakar Creation Button:** If `searchQuery.trim().length >= 2` and no exact match exists, renders button `+ "${searchQuery.trim()}" નવું નામ ઉમેરીને લોગિન કરો` which inserts into `public.karyakars`, saves to `localStorage`, and logs in immediately.

## **Component 3: src/components/StickyHeader.jsx (Top Bar, Writer Badge & Avatar Menu)**

* **Left Brand Block:** Sparkles icon \+ `"ગુણગ્રહણ એપ"` \+ subtitle `"રમતોત્સવ ગુણ મહોત્સવ"`.  
* **Right User Cluster:**  
  * Displays user's current **Writer Milestone Pill Badge** (`myWriterBadge.icon + " " + myWriterBadge.title`, e.g., `💎 ગુણના ભિખારી`) on screens `>= 360px`.  
  * Circular User Avatar (`w-9 h-9 rounded-full`) showing `getFirstGrapheme(currentUser.name)` (e.g., `"સિ"` or `"S"`).  
  * **Click Popover Menu:**  
    * Full Name \+ Current Writer Badge Title \+ `"તમે લખેલા ગુણ: ${myWrittenCount}"`.  
    * Coverage summary: `"🎯 ${coveredCount}/${totalOthers} કાર્યકરોના ગુણ લખ્યા"`.  
    * Link to `/report`: `"📄 બાપાના પત્ર માટે રિપોર્ટ (PDF)"`.  
    * Logout button: `"લોગઆઉટ (નામ બદલો)"`.

## **Component 4: src/components/HeroActionCard.jsx (+ Add ગુણ CTA \+ સંપ વૃક્ષ Checkpoints \+ Coverage Ring)**

* **1\. Primary CTA Button (**`+ Add ગુણ`):  
  * Full-width `h-14 rounded-2xl` gradient button with `PlusCircle` icon: `"+ Add ગુણ (નવો ગુણ લખો)"`.  
* **2\. Total Written ગુણ & 4-Checkpoint સંપ વૃક્ષ Progress Bar:**  
  * Displays `Total Written ગુણ: ${totalWrittenCount} / 200 લક્ષ્યાંક`.  
  * **Segmented 4-Milestone Bar (50 • 100 • 150 • 200):**  
    * Visual checkpoint markers at `25% (50)`, `50% (100)`, `75% (150)`, and `100% (200)`.  
    * Active celebration banner whenever `totalWrittenCount >= 50`:  
      * `>= 200`: `"🏆 અદ્ભુત! ૨૦૦+ ગુણનો મહા-લક્ષ્યાંક પૂર્ણ! બાપા રાજીપો વરસાવશે!"`  
      * `>= 150`: `"🌟 ૧૫૦ ગુણનો પડાવ પાર! લક્ષ્યાંકથી માત્ર થોડા જ દૂર!"`  
      * `>= 100`: `"🎉 અભિનંદન! આપણે ૧૦૦ ગુણનો પડાવ પાર કર્યો!"`  
      * `>= 50`: `"🌱 વાહ! ૫૦ ગુણનું સંપ વૃક્ષ ખીલી ઉઠ્યું છે!"`  
  * **3\. Personal "Coverage Ring" Interactive Pill (Enhancement \#4):**  
  * Positioned at the bottom of the Hero Card (`mt-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-all`).  
  * Left side: Mini circular SVG progress ring \+ text `"🎯 તમે ${totalOthers} માંથી ${coveredCount} કાર્યકરોના ગુણ લખ્યા છે"`.  
  * Right side badge: If `unwrittenKaryakars.length > 0`, displays `"બાકીના ${unwrittenKaryakars.length} જુઓ →"` which opens `AddGunaDrawer` filtered to unwritten karyakars\! If all are covered, displays `"✅ બધા કાર્યકરો કવર થઈ ગયા!"`.

## **Component 5: src/components/WriterLeaderboard.jsx (Writer-First Leaderboard \+ Milestone Badges)**

* **Strict Calculation:** Ranks strictly by `author_id` count.  
* **Row Anatomy:**  
  * Rank Medal (🥇, 🥈, 🥉, \#4, \#5...).  
  * Writer Name \+ `"તમે"` tag if logged-in user \+ **Writer Milestone Badge** (`👑 સંપ શિલ્પી`, `💎 ગુણના ભિખારી`, `✨ ગુણ ગ્રાહક`, or `🌱 ગુણ શોધક`).  
  * Right-aligned count: `"${item.count} ગુણ"`.  
  * Animated horizontal bar (`Rank #1` uses gold gradient `from-amber-400 to-orange-500`; others use `theme.progressBarFill`).  
* **Expand / Collapse Button:** Toggles between Top 5 and All Ranks (`"બધા કાર્યકરોનો ક્રમ જુઓ ▼"`).  
* **Personal Rank & Next Badge Motivation Footer:** Shows current rank AND how many more virtues are needed to unlock the next Writer Badge (e.g., `"🌟 તમારો ક્રમ #2 છે. '💎 ગુણના ભિખારી' બનવા બીજા 3 ગુણ લખો!"`).

---

## **Component 6: src/components/PublicGunaFeed.jsx & GunaCard.jsx (Live Feed \+ WhatsApp Share \+ Rajipo)**

* **Filter Pills:**  
  * `બધા ગુણો (${gunas.length})`  
  * `મેં લખેલા (${myWrittenCount})`  
  * `મારા વિશે (${forMeCount})`  
  * Searchable Karyakar dropdown filter (`"🔍 કાર્યકર પ્રમાણે ગુણ શોધો..."`).  
* **Virtue Card (GunaCard.jsx):**  
  * **1\. Top Row:** Recipient Pill (`"🌟 ${guna.recipient_name} નો ગુણ"`) \+ Relative Timestamp (`formatRelativeTime(guna.created_at)`).  
  * **2\. Middle Content:** Gujarati virtue text with left accent quote border (`border-l-4`), comfortable `15px` font size and `leading-relaxed` (`1.75`) line-height.  
  * **3\. Bottom Action Row:**  
  * Left: Writer attribution (`"✍️ લખનાર: ${guna.author_name}"`).  
    * Right Action Cluster (2 Minimal Buttons):  
      * **📲 Share Button (Enhancement \#5):** Opens `buildWhatsAppShareUrl(guna, window.location.origin)` in a new tab/WhatsApp app so inspiring virtues can be shared directly to the Karyakar WhatsApp group.  
      * **🙏 રાજીપો (\${guna.rajipo\_count}) Button:** Calls `supabase.rpc('increment_rajipo', { row_id: guna.id })` and saves liked status in `localStorage`.

---

## **Component 7: src/components/AddGunaDrawer.jsx (Smart Nudge \+ Sentence Starters \+ Gujarati Voice Mic)**

* **1\. "કોનો ગુણ બાકી?" Smart Unrecognized Karyakar Nudge (Enhancement \#1):**  
  * Displayed right at the top of the drawer:  
  * Label: `"💡 સૂચન — આ કાર્યકરોનો ગુણ લખવાનો બાકી છે:"`  
  * Renders up to 3 tappable pill chips from `smartNudgeKaryakars`. Tapping any chip immediately selects that karyakar in the dropdown below\!  
* **2\. Searchable Karyakar Selector (કોનો ગુણ લખવો છે? \*):**  
  * Excludes `currentUser.id`.  
  * Includes a toggle chip `"માત્ર બાકી રહેલા કાર્યકરો (${unwrittenCount})"` so the writer can easily filter the dropdown to people they haven't written about yet.  
  * Includes inline **Unregistered Karyakar Creation** (`+ "${recipientSearch}" નવું નામ લિસ્ટમાં ઉમેરો અને સિલેક્ટ કરો`).  
* **3\. Quick Topic Tags & 1-Tap Sentence Starters (Enhancement \#2):**  
  * **Virtue Quality Chips:** `['સેવાભાવ', 'સંપ', 'રાત્રે ઉજાગરા', 'નિષ્ઠા', 'સહનશીલતા', 'આજ્ઞા પાલન', 'અથાક પરિશ્રમ']`.  
* **1-Tap Gujarati Sentence Starters:**  
  * `"આજે સેવા દરમિયાન મેં જોયું કે "`  
    * `"રાત્રે મોડા સુધી થાક્યા વગર "`  
    * `"નાનામાં નાની સેવામાં પણ "`  
    * `"સૌની સાથે સંપ અને પ્રેમથી "`  
    * Tapping a starter inserts/appends the phrase into the textarea and focuses the cursor at the end.  
* **4\. Virtue Textarea with Gujarati Voice-to-Text Mic (**`🎤 બોલીને લખો` — Enhancement \#6):  
  * Header row above textarea includes a prominent pill button:  
    * Idle state: `"🎤 બોલીને લખો (Gujarati Mic)"` (`bg-slate-100 text-slate-700 hover:bg-slate-200`).  
    * Recording state: `"🔴 સાંભળી રહ્યું છે... બોલો"` (`bg-red-50 text-red-600 border border-red-200 animate-pulse`).  
  * Uses `window.SpeechRecognition || window.webkitSpeechRecognition` with `recognition.lang = 'gu-IN'`, `recognition.interimResults = false`. Appends spoken Gujarati transcript directly into `content` state\! Gracefully hides or alerts if browser does not support Web Speech API.  
* **5\. Submit Button (✓ ગુણ ઉમેરો (Submit ગુણ)):**  
  * Inserts into `public.gunas`, triggers `canvas-confetti`, shows celebratory Gujarati toast, and closes drawer.

---

## **Component 8: src/app/report/page.jsx ("બાપાનો પત્ર" Sacred Print View & Swami Reporting)**

* **Interactive Controls Bar (print:hidden):**  
  * Back to Dashboard button (`← ડેશબોર્ડ પર પાછા જાઓ`).  
  * Grouping Mode Selector:  
    * `"બાપાનો પત્ર + કાર્યકર પ્રમાણે (Sacred Letter + Grouped by Karyakar)"` (Default)  
    * `"ક્રમાનુસાર (Chronological Feed)"`  
    * `"લેખક પ્રમાણે (Grouped by Writer)"`  
  * **🖨️ Print / Save PDF** button (`window.print()`) \+ **📥 Export CSV** button.  
* **Sacred Print Layout (Visible on Screen & A4 Print):**  
  * **Ornamental Double Border Container:** Styled with a traditional golden/saffron print border (`border-4 border-double border-amber-700/80 p-8 bg-white`).  
  * **Sacred Invocation Header:**  
    * `"॥ શ્રી સ્વામિનારાયણો વિજયતેતરામ્ ॥"`  
    * `"પરમ પૂજ્ય મહંત સ્વામી મહારાજના ચરણોમાં ગુણગ્રહણ અર્ઘ્ય"`  
    * `"રમતોત્સવ ૨૦૨૬ — ગુણગ્રહણ મહોત્સવ અહેવાલ"`  
  * **Formal Gujarati Offering Letter Block (Editable on screen before printing):**  
    * Pre-filled sacred letter paragraph addressed to Param Pujya Mahant Swami Maharaj stating: *"પરમ પૂજ્ય બાપા, આપની રુચિ મુજબ રમતોત્સવની સેવા દરમિયાન અમો સર્વે કાર્યકરોએ એકબીજાના અવગુણ જોવાને બદલે માત્ર ગુણ જ જોવાનો સંકલ્પ કર્યો હતો. આ ૫ દિવસ દરમિયાન કુલ \[X\] કાર્યકરો દ્વારા \[Y\] જેટલા ગુણોનું લેખન થયું છે, જે આપના ચરણોમાં ભક્તિભાવપૂર્વક અર્પણ કરીએ છીએ. આપના રાજીપા અને આશીર્વાદની પ્રાર્થના."*  
  * **Smrutibhet Top Writers Honor Table (For P.P. Swami & Amrutraj Swami Presentation):**  
    * Highlights the Top 5 Gun Writers with their Rank, Name, Milestone Title (`👑 સંપ શિલ્પી`), Covered Karyakars count, and Total Written Gunas count.  
  * **Complete Virtue Compilation:**  
    * Neatly formatted cards/rows with `break-inside-avoid` so no virtue card splits across A4 page breaks.

---

# **9\. Rapid Execution Checklist (Before 20th–23rd Deadline)**

**Step 1 (Supabase Setup — 15 Mins):** Create a new Supabase project, open SQL Editor, paste and run `supabase/schema.sql`, and copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.  
**Step 2 (Next.js Scaffold — 15 Mins):** Run `npx create-next-app@latest gunagrahan-app` and `npm install @supabase/supabase-js lucide-react framer-motion canvas-confetti`.  
**Step 3 (Build & Seed Karyakars — 2 Hours):** Drop in the 8 components from Section 6 and add Pratikbhai's full Karyakar list to `seedKaryakars`.  
**Step 4 (Vercel Deployment — 15 Mins):** Push to GitHub and deploy to Vercel (`NEXT_PUBLIC_APP_WING=bal`). Optionally deploy a second Vercel instance (`NEXT_PUBLIC_APP_WING=balika`) if the Balika clone is needed.