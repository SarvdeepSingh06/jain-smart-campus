# JAIN Smart Campus — Design Direction

> **Dial**: `ENERGY 1` (Calm utility) / `RHYTHM 2` (Balanced, clean rhythm) / `MOTION 1` (Subtle, purposeful transitions)

## 1. Product Identity & Purpose
JAIN Smart Campus is a focused, premium, minimal campus utility web application. It enables students and campus staff to report lost and found belongings (Lost@JAIN) and campus facility issues (FIX-IT QR) cleanly, quickly, and reliably without friction or clutter.

## 2. Color Palette
- **Primary Background**: `#F7F8F5` (Warm Ivory)
- **Primary Text**: `#252B27` (Deep Charcoal)
- **Primary Accent**: `#315C49` (Forest Green)
- **Secondary Surface**: `#E8EEE8` (Soft Sage)
- **Borders & Dividers**: `#D9DFD8` (Subtle Warm Grey)
- **Muted Text**: `#606963` / `#747D76` (High contrast accessible grey)
- **Dark Mode**:
  - Background: `#111412`
  - Surface: `#181C19`
  - Primary Text: `#E3E7E4`
  - Muted Text: `#97A19A`
  - Accent: `#478066`
  - Borders: `#2D3530`

## 3. Typography
- **Typeface**: `Inter`, system sans-serif fallback
- **Hierarchy**:
  - Hero Heading (`h1`): `2.25rem` / `36px`, weight `600`, tracking `-0.025em`, deep charcoal
  - Section / Card Title (`h2`, `h3`): `1.25rem` to `1.5rem`, weight `600`, tracking `-0.015em`
  - Body & Description: `0.9375rem` / `15px`, weight `400` to `450`, line-height `1.55`
  - Labels & Metadata: `0.8125rem` / `13px`, weight `500`
- **Rules**:
  - No gradient text.
  - No decorative emojis in headings, labels, or buttons.
  - Strong semantic tags (`h1`, `h2`, `label`, `p`).

## 4. Layout & Spacing
- **Container**: Max width `1080px` for desktop hero and dual service cards; max width `640px` for focused single-column reporting forms.
- **Rhythm**: Generous whitespace (`16px`, `24px`, `32px`, `48px`).
- **Responsive**:
  - Desktop: Dual service cards side-by-side.
  - Mobile (360px - 480px): Single stacked column, touch targets minimum `44px`, zero horizontal scroll.
- **Card Styling**:
  - Flat surface with subtle 1px border (`#D9DFD8`).
  - Border radius `10px` to `12px`.
  - Restrained elevation (`0 1px 3px rgba(0, 0, 0, 0.04)` resting, `0 6px 16px rgba(0, 0, 0, 0.08)` hover).

## 5. Interaction & Component Language
- **Transitions**: Single-page smooth view switching (fade-in + subtle translateY 6px), respect `prefers-reduced-motion`.
- **Forms**:
  - Explicit, differentiated fields for Lost vs. Found vs. Maintenance.
  - Built-in photo attachment preview with clear remove action.
  - Transparent data handling: clear privacy notes for lost-contact info and handover locations for found items.
- **Confirmation State**:
  - Dedicated post-submission review state replacing simple toasts.
  - Clear reference ID badge (`LOST-XXXX-YYYY`, `FND-XXXX-YYYY`, `FIX-XXXX-YYYY`).
  - Realistic next-steps guidance tailored to each reporting category.
- **Anti-Slop Guardrails**:
  - No generic marketing fluff ("Supercharge", "Revolutionary", "AI-powered").
  - No purple neon glows, bento grid mosaics, or gratuitous glassmorphism.
  - Clean code without redundant explanatory comments.
