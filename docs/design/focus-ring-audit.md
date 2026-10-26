# Focus-ring audit — October 2026

## Baseline

The shared ring is one rule in [globals.css](../../src/app/globals.css):

```css
:where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 4px;
}
```

`--primary` is `#624291`, which measures **7.12:1** against the page background (`#f8f5ee`) — comfortably above the 3:1 non-text contrast requirement. Since the focus colour no longer starts at half strength, the ring also appears at full strength on the first frame.

**161 usages** of `focus-visible:outline-primary` across **62 files** re-declare this rule. The declarations are redundant with the base rule (elements that omit the colour or the width still inherit it), but they agree with it, so they are not deviations.

## Deviations

### 1. Text fields that suppress the outline and replace it with a near-invisible glow

**20 `outline-none` occurrences across 18 files**, most of them on form fields carrying a class string such as:

```
outline-none … focus:border-primary focus:ring-2 focus:ring-primary/10
```

`outline-none` does not merely set `outline-style: none`; it sets `--tw-outline-style: none`, and the width utilities read that variable:

```css
.outline-none            { --tw-outline-style: none; outline-style: none }
.focus-visible\:outline-2:focus-visible { outline-style: var(--tw-outline-style); outline-width: 2px }
```

So an element that keeps `outline-none` **cannot show an outline even when its class list also names the shared ring**. Verified in the browser: a control with `outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary` reports `:focus-visible` true and `outline: none 0px`.

What replaces the ring:

| Replacement | Files | Contrast against the page |
|---|---|---|
| `focus:ring-primary/10` | login, forgot-password, update-password, profile, businesses/new, organizations/new, opportunities/new, search | **1.16:1** |
| `focus:ring-ring/15` | businesses/[slug]/edit, events/[slug]/edit | 1.26:1 |
| `focus:ring-ring/20` | deadline-picker, event-date-time-picker | 1.37:1 |
| `focus:ring-destructive/10` + destructive border | moderation note field | ≈1.2:1 |
| `box-shadow: 0 0 0 3px primary/12%` | `.search:focus` in `network-surfaces.module.css` (profile, settings) | ≈1.2:1 |

None of those glows are perceivable as a focus indicator. The cue a keyboard user actually gets is the **1px border changing from `#91877a` to `#624291`** — 2.2:1 between the two states, 7.12:1 against the page, but only one pixel wide. WCAG 2.4.11 asks for the equivalent of a 2px perimeter.

Three components list the shared ring *and* `outline-none` — `member-role-select`, `deadline-picker`, `event-date-time-picker` (its first field) — so they read as compliant in a text search but render no outline.

Eight of these files are covered by [listing-form.module.css](../../src/components/forms/listing-form.module.css), whose unlayered `.page :is(input, select, textarea):focus-visible` rule restores a 2px primary outline at 2px offset. That rule wins over the layered `outline-none` utility, so the create/edit listing forms *do* show a ring; the login, password, profile, search and moderation fields have no such rule and do not.

### 2. `src/components/ui/button.tsx` — shadcn ring, 50% strength — **removed**

The scaffolded `Button` primitive carried `outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50`. That ring was **2.33:1** against the page — below the 3:1 requirement — and 3px wide.

It was imported nowhere (`<Button` appeared only in its own file), so the defect was latent rather than live. Rather than maintain a second, conflicting button style next to the inline class strings the app actually uses, the file was deleted. Reintroducing it would mean porting the shared rule: `focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`, with no `outline-none`.

### 3. Offset drift

Every one of these is the correct colour (primary) at 2px — only the distance varies.

| Offset | Where | Count | Assessment |
|---|---|---|---|
| 4px | shared default | 128 TSX usages | baseline |
| 2px | checkboxes, calendar panel, listing-form inputs, moderation summary, privacy summary | 29 TSX usages + 2 module rules | reasonable for small/contained controls |
| 3px | public-navigation, living-network, catalog, homepage-navigator search, community-navigator launcher/drawer | 1 TSX + 6 module rules | cosmetic drift |
| 5px | landing-page links, public-navigation | 2 module rules | deliberate hero emphasis |
| 6px | scroll-category-introduction | 1 module rule | cosmetic drift |
| −2px (inset) | inbox rows, directory rows, notification bell, event/opportunity lists, `network-surfaces` | 6 TSX + 1 module rule | justified: an outer ring would be clipped by the scroll container |

### 4. Colour drift

`first-visit-language-gate.module.css` hardcoded `outline: 2px solid #6e3fa0` instead of `var(--primary)`. The two purples differ by 1.06:1 — invisible today, but the ring would not follow a palette change. The language-entrance ring now uses `var(--primary)`; the file's other `#6e3fa0` values are accent text and underline colours, not focus indicators, and were left alone.

### 5. Deliberate, and correct

- `focus-visible:outline-destructive` on the moderation summary, moderation delete and the delete-opportunity/delete-event buttons. `#b42318` measures **6.04:1** against the page, so the semantic red is as visible as the primary ring.
- `.guide h3:focus { outline: 0 }` in `homepage-navigator.module.css`: the heading is `tabIndex={-1}` and focused programmatically for screen-reader context, so suppressing the ring is right.
- `focus:` (rather than `focus-visible:`) on text fields is intentional — a text field should show its state on mouse click too.

## Suggested order of work

1. Give the uncovered fields a real ring: drop `outline-none` and use the pattern the listing forms already achieve — `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary` inside bordered inputs, keeping the border change for pointer users.
2. Remove `outline-none` from the three picker components so their existing ring classes start working.
3. ~~Align or delete `ui/button.tsx` before anything imports it.~~ Deleted; nothing imported it.
4. ~~Replace `#6e3fa0` with `var(--primary)`.~~ Done for the language-entrance focus ring.
5. Standardise offsets: 4px by default, 2px inside bordered containers, −2px only where a container clips.

## Method and limits

Findings come from a search of `src` for focus utilities, the compiled CSS in the production build (to confirm which rules exist and in which cascade layer), and one browser measurement of the `outline-none` interaction on a public route. Authenticated surfaces — profile, settings, moderation, the listing create/edit forms — were reasoned from their stylesheets and the compiled rules; they were not rendered, because this workspace has no session.
