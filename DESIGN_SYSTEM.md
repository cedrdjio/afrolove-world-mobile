# AFRILOVE WORLD — Design System

> Premium international dating platform — visual language inspired by **Bumble, Raya, Airbnb & Apple**.
> Goal: a refined, luxury, minimalist, mobile-first interface that *feels* like a multi‑million‑dollar product.

This design system is **purely visual**. It re-skins the existing Flutter application
(ex‑GoMeet) **without changing a single feature, API, backend call, business rule or
navigation route**. Everything is driven from centralized design tokens in
`lib/core/ui.dart`, so the new identity propagates across all 137 screens/widgets
automatically.

---

## 1. Brand

| | |
|---|---|
| **Name** | AFRILOVE WORLD |
| **Personality** | Premium · Warm · Cultured · Elegant · Trustworthy |
| **Tagline feel** | International love, rooted in heritage |
| **Font** | **Gotham** (brand) → fallback **Inter** → currently bundled **Satoshi** (geometric, premium). See §3. |

---

## 2. Color palette

The palette is warm, editorial and luxurious — espresso + camel gold on ivory.

### Core tokens

| Token | Hex | Usage |
|---|---|---|
| **Primary** (Espresso) | `#2C1B14` | Primary buttons, headings, key text, photo overlays |
| **Secondary** (Camel Gold) | `#D4A373` | Accents, focus states, premium/gold, highlights, links |
| **Background** | `#F8F4EE` | App scaffold background (warm ivory) |
| **Card / Surface** | `#FFFFFF` | Cards, sheets, inputs, elevated surfaces |
| **Border** | `#ECE5DD` | Hairline borders, dividers, input outlines |

### Extended scale

| Token | Hex | Usage |
|---|---|---|
| Primary 800 | `#3A271D` | Hover / pressed primary |
| Secondary Deep | `#B07D4F` | Gold pressed, gradient end |
| Gold Light | `#E9C893` | Gold gradient start, premium shine |
| Text Primary | `#2C1B14` | Body text on light |
| Text Secondary | `#6B5D54` | Secondary text, captions |
| Text Muted | `#9A8E84` | Placeholders, disabled, hints |
| Success | `#2E9E6B` | Confirmations, online dot |
| Error | `#D0584E` | Errors, destructive |
| Warning | `#E0A042` | Warnings |

### Dark mode

| Token | Hex |
|---|---|
| Background (dark) | `#16100C` |
| Surface / Card (dark) | `#221A15` |
| Border (dark) | `#3A2E26` |
| Text (dark) | `#F8F4EE` |
| Text secondary (dark) | `#D9CFC6` |
| Primary action (dark) | `#D4A373` (gold for contrast) |

### Gradients
- **Overlay** (photos): `transparent → #2C1B14 @80% → #2C1B14` (top→bottom).
- **Gold / Premium**: `#E9C893 → #D4A373 → #B07D4F`.
- **Brand**: `#3A271D → #2C1B14`.

---

## 3. Typography

Type scale built for editorial hierarchy and generous breathing room.

- **Brand font:** Gotham. **Fallback:** Inter. **Currently rendered with:** Satoshi
  (bundled `.otf`). Gotham/Inter are commercial/managed assets — drop the font files in
  `assets/fonts/` and update the `fonts:` block + `FontFamilyy` constants to switch;
  every screen updates automatically.

| Style | Size / Weight | Tracking | Use |
|---|---|---|---|
| Display | 56 / Bold | -0.5 | Hero / splash numerals |
| Heading 1 | 34 / Bold | -0.4 | Screen titles |
| Heading 2 | 28 / Bold | -0.3 | Section titles |
| Heading 3 | 22 / Bold | -0.2 | Card titles |
| Body L | 17 / Medium | 0 | Lead paragraphs |
| Body M | 15 / Medium | 0 | Default body |
| Body S | 13 / Medium | 0.1 | Secondary text |
| Title / Label | 13 / Medium | 0.2 | Form labels, list titles |
| Caption | 11 / Regular | 0.3 | Meta, timestamps |
| Overline | 11 / Bold | 1.2 (UPPERCASE) | Eyebrows, premium tags |
| Button | 16 / Bold | 0.3 | Buttons |

---

## 4. Spacing & layout

8‑pt soft grid. Tokens in `AppSpacing`:

`xxs 4 · xs 8 · sm 12 · md 16 · lg 20 · xl 24 · xxl 32 · xxxl 40`

- Screen horizontal padding: **20**.
- Section gap: **24–32**.
- Generous white space is a feature, not a bug.

---

## 5. Radius

Tokens in `AppRadius`:

| Token | Value | Use |
|---|---|---|
| sm | 12 | Chips, small controls |
| md | 16 | Buttons, inputs |
| lg | 20 | Inner containers |
| **xl** | **24** | **Cards, sheets, modals (brand default)** |
| pill | 999 | Avatars pills, toggles, tags |

---

## 6. Elevation / shadows

Soft, brand-tinted, low-opacity (`AppShadows`):

- **soft** — `#2C1B14 @ 6%`, blur 16, y+6 → cards.
- **card** — `#2C1B14 @ 8%`, blur 24, y+10 → floating cards, sheets.
- **elevated** — `#2C1B14 @ 12%`, blur 32, y+16 → modals, FAB.

No hard black shadows. Luxury = subtle depth.

---

## 7. Components

All reusable widgets live in `lib/presentation/widgets/` and consume the tokens above.

### Buttons
- **Primary** (`MainButton`): full-width, espresso bg, white label, radius 16, height 52, soft shadow. Loading state = staggered dots.
- **Gold / Premium**: gold gradient bg (for Premium Gold CTAs).
- **Secondary / Outline** (`OutlinedButton` theme): transparent, 1px border `#ECE5DD`, espresso label.
- **Social** (`LoginWithButton`): white card, 1px border, brand icon left.

### Cards
- Surface `#FFFFFF`, radius **24**, border `#ECE5DD` (1px), shadow `soft`, padding 16–20.

### Inputs (`TextFieldPro`)
- Filled `#FFFFFF`, radius 16, 1px `#ECE5DD` border, focus border `#D4A373`, muted placeholder, left-aligned, comfortable 16px padding.

### Icons
- Existing SVG set, tinted via `colorFilter` to `Theme.indicatorColor` (espresso light / ivory dark).
- Accent icons (premium, likes) tinted secondary gold.

### App bar (`appbarr`)
- Transparent, brand mark left, Heading-3 title, no elevation.

---

## 8. Implementation map

| Layer | File | Change |
|---|---|---|
| Tokens & theme | `lib/core/ui.dart` | New palette, type scale, radius/spacing/shadow/gradient helpers, light + dark themes |
| Buttons | `lib/presentation/widgets/main_button.dart`, `fillbutton.dart` | Radius 16, height 52, brand styling, optional gold gradient |
| Inputs | `lib/presentation/widgets/textfield.dart` | Radius 16, gold focus, muted hints |
| App bar | `lib/presentation/widgets/appbarr.dart` | Brand mark + spacing |
| Brand mark | `assets/Image/appLogo.svg` | AfriLove monogram |
| Accent screens | premium / wallet / coin / payment | Replace legacy purple gradients with brand gold |

Because `AppColors.appColor` (used 257×) now resolves to the AfriLove espresso and the
theme drives typography, radius and component styling, **every screen** — Splash,
Onboarding, Login, Register, Home, Discover, Matches, Messages, Chat, Profile, Premium
Gold, Notifications, Settings — adopts the new identity with **zero functional change**.
