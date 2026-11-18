# Component Specifications: Replica PDF Suite

Design tokens referenced below map directly to `replica/design/tokens.json` and `tokens.css`.
All interactive elements must support keyboard navigation (Tab, Enter, Space, Escape) and ARIA attributes.

---

### Button
- **variants**: `primary` (solid accent), `secondary` (surface + border), `ghost` (transparent), `danger` (solid danger)
- **sizes**: `sm` (32px height, 12px px), `md` (40px height, 16px px), `lg` (48px height, 24px px)
- **states**: `default`, `hover`, `active`, `focus-visible` (2px solid ring, `color.accent`, 2px offset), `disabled` (opacity 0.5, pointer-events none), `loading` (spinner icon, text dimmed)
- **tokens**: 
  - primary: `bg-accent`, `text-on-accent`, `hover:bg-accent-hover`, `radius-md`, `font-sm/600`
  - secondary: `bg-surface`, `border-border`, `text-text`, `hover:bg-surface-hover`, `radius-md`
  - danger: `bg-danger`, `text-on-danger`, `hover:opacity-90`, `radius-md`
- **a11y**: Native `<button type="button">`, `aria-busy="true"` on loading, screen reader text preserved during spin.
- **used on**: S01, S02, S03, S04, S05, S06, S07, S08, S11, S12

---

### TopNavigation
- **variants**: `desktop-fixed`, `mobile-collapsible`
- **sizes**: 64px fixed height, 1280px max-width container
- **states**: `default`, `mega-menu-open`, `mobile-drawer-open`, `scrolled-shadow`
- **tokens**: `bg-bg`, `border-b border-border`, `text-text`, `font-sm/500`, `shadow-card` on scroll
- **a11y**: `<header role="banner">`, `<nav aria-label="Main">`, `aria-expanded` on mega-menu and mobile burger, `Escape` key closes dropdowns.
- **used on**: All screens (S01–S14)

---

### ToolCard
- **variants**: `standard` (homepage grid), `compact` (mega-menu dropdown)
- **sizes**: auto width, min-height 140px, padding 24px
- **states**: `default`, `hover` (elevated -4px, `shadow-card-hover`), `focus-visible` (accent ring)
- **tokens**: `bg-bg`, `border-border`, `hover:border-accent`, `radius-lg`, `shadow-card`, title `text-text font-lg/600`, desc `text-muted font-sm/400`
- **a11y**: Semantic `<a>` card link with `aria-label="{Tool Name} - {Tool Description}"`. Focus ring encloses entire card.
- **used on**: S01

---

### FileDropzone
- **variants**: `hero` (initial tool view, min-height 380px), `compact` (workflows/split view, min-height 160px)
- **sizes**: 100% width, min-height 380px
- **states**: `idle`, `drag-over` (dashed border `accent`, background tint `surface-hover`, scale 1.01), `uploading` (disabled dropzone, progress overlay), `rejected` (red border, shake animation)
- **tokens**: `bg-surface`, `border-2 border-dashed border-border-input`, `radius-lg`, icon `text-muted`, cta `bg-accent text-on-accent`
- **a11y**: Native hidden `<input type="file" multiple accept=".pdf,...">`, drop area has `role="button"`, `tabIndex={0}`, triggers file picker on Enter or Space.
- **used on**: S02, S08, S09

---

### FileThumbnailCard
- **variants**: `document` (full file preview with badge), `page-slice` (individual page tile in organizer)
- **sizes**: 160px × 220px fixed aspect ratio
- **states**: `default`, `dragging` (opacity 0.4, cursor grabbing), `selected` (2px border `accent`, checkmark badge), `hover` (action toolbar reveals: rotate, delete, zoom), `error` (red outline)
- **tokens**: `bg-bg`, `border-border`, `radius-md`, `shadow-card`, badge `bg-surface text-muted font-xs/500`
- **a11y**: Reorderable list item with `role="listitem"`, keyboard arrow keys to reorder with ARIA live announcement: "Moved file X to position Y".
- **used on**: S03, S04, S05

---

### ToolbarActionGroup
- **variants**: `floating-sticky` (bottom-right of staging screen), `docked-top` (canvas controls)
- **sizes**: auto width, 48px height, 12px gap
- **states**: `default`, `disabled` (when 0 files staged), `processing`
- **tokens**: `bg-bg`, `border-border`, `shadow-pop`, `radius-full`
- **a11y**: `<div role="toolbar" aria-label="Staging Actions">`, focus flows smoothly across tool buttons.
- **used on**: S03, S04, S05

---

### OptionSelectorCard
- **variants**: `radio-card` (compression presets: Extreme, Recommended, Low), `toggle-pill`
- **sizes**: 100% width, padding 16px
- **states**: `default`, `selected` (border `accent`, background `surface-hover`), `hover`, `focus-visible`
- **tokens**: `bg-bg`, `border-border`, `radius-md`, selected `border-accent ring-1 ring-accent`, title `text-text font-sm/600`, subtitle `text-muted font-xs/400`
- **a11y**: Standard `<input type="radio">` with visually hidden input, `<label>` wrapper, keyboard ArrowUp/ArrowDown selection.
- **used on**: S03

---

### WatermarkConfigurator
- **variants**: `text-watermark`, `image-watermark`
- **sizes**: 320px width drawer
- **states**: `default`, `active-field`, `validation-error`
- **tokens**: inputs `border-border-input focus:border-accent`, 3x3 anchor grid buttons `radius-sm border-border selected:bg-accent selected:text-on-accent`
- **a11y**: Fieldset with `<legend>`, grid buttons have `aria-label="Align top left, center, etc."`.
- **used on**: S03

---

### ProgressBar
- **variants**: `linear` (top bar or card banner), `circular` (modal spinner)
- **sizes**: linear height 6px or 12px; circular 64px diameter
- **states**: `indeterminate` (pulsing sweep), `determinate` (0% to 100%), `completed` (turns `success`), `failed` (turns `danger`)
- **tokens**: track `bg-border`, fill `bg-accent`, success `bg-success`, text `font-xs/500 text-muted`
- **a11y**: `<div role="progressbar" aria-valuenow="{n}" aria-valuemin="0" aria-valuemax="100">`, live text announcement every 20%.
- **used on**: S06

---

### DownloadHero
- **variants**: `single-file` (direct PDF download), `multi-file` (ZIP archive bundle)
- **sizes**: 100% max width 640px, centered card
- **states**: `ready`, `auto-downloading` (progress ring counting down 3s), `expired` (dimmed out with reload button)
- **tokens**: `bg-bg`, `border-border`, `radius-lg`, `shadow-card`, primary button `bg-accent text-on-accent font-lg/600 h-14`
- **a11y**: Auto-download announced via `aria-live="polite"` ("Your download will begin automatically"). Manual download button has high tab priority.
- **used on**: S07

---

### CloudActionButtons
- **variants**: `google-drive`, `dropbox`
- **sizes**: 40px height, icon + label
- **states**: `idle`, `connecting` (mini spinner), `saved` (check icon), `error`
- **tokens**: `bg-surface`, `border-border`, `hover:bg-surface-hover`, `text-text font-sm/500`
- **a11y**: Button has explicit `aria-label="Save processed file to Google Drive"`.
- **used on**: S02, S07

---

### ShareQRModal
- **variants**: `dialog`
- **sizes**: 420px max width centered modal
- **states**: `open`, `link-copied` (green check toast)
- **tokens**: backdrop `bg-black/50`, modal `bg-bg`, `radius-lg`, `shadow-pop`, QR container `p-4 bg-white border border-border radius-md`
- **a11y**: `role="dialog"`, `aria-modal="true"`, focus trapped within modal, `Escape` key closes, focus restored to trigger on dismiss.
- **used on**: S07

---

### PurgeButton ("Delete it now")
- **variants**: `danger-ghost`
- **sizes**: 36px height, trash icon + "Delete it now"
- **states**: `default`, `hover` (`bg-danger/10 text-danger`), `confirming` (pops "Are you sure? This cannot be undone"), `purged` (disabled, "File permanently deleted")
- **tokens**: `text-danger`, `border border-danger/30`, `hover:bg-danger hover:text-on-danger`, `radius-md font-sm/500`
- **a11y**: Requires two-step confirmation or explicit dialog for screen readers: `aria-describedby="purge-warning"`.
- **used on**: S07

---

### PricingTierCard
- **variants**: `basic` (free), `premium` (highlighted recommended), `business` (team)
- **sizes**: 360px width card in 3-column grid
- **states**: `default`, `highlighted` (2px border `accent`, -8px translateY, badge "Popular"), `active-user-plan`
- **tokens**: `bg-bg`, `border-border`, highlighted `border-accent shadow-pop`, price `font-display/800 text-text`, badge `bg-accent text-on-accent`
- **a11y**: Semantic `<section>` with `aria-labelledby="{tier-name}"`, features list is an accessible `<ul>`.
- **used on**: S11

---

### ToastNotification
- **variants**: `success` (green), `error` (red), `info` (blue), `warning` (amber)
- **sizes**: 360px floating toast, bottom-right anchor
- **states**: `entering` (slide up 150ms), `visible`, `exiting` (fade out)
- **tokens**: `bg-bg`, `shadow-pop`, `radius-md`, border colored by role, text `text-text font-sm/500`
- **a11y**: `role="status"` for info/success, `role="alert"` for error; auto-dismisses after 4000ms with pause on hover.
- **used on**: All screens
