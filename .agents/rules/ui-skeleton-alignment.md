# UI & Skeleton Alignment Standards

This project requires strict, pixel-perfect 1:1 alignment between loading skeleton placeholders and real screen content across the entire application.

## Core Principles

1. **Pure Skeleton Placeholders**:
   - Skeletons must remain pure placeholder shapes (`variant="text"`, `"circle"`, `"rounded"`).
   - Never replace skeleton placeholders with real icons, real text, or real buttons in skeleton presets.

2. **Zero Layout Shift (1:1 Dimensional Match)**:
   - Every skeleton element and its real screen counterpart must share identical:
     - Outer container padding (`paddingTop`, `paddingBottom`, `paddingHorizontal`).
     - Element margins (`marginBottom`, `marginTop`).
     - Row heights (e.g., locked `height: 56` for option rows).
     - Component dimensions (e.g., `height: 48` for primary buttons, `height: 22` / `borderRadius: 11` for status pills).

3. **Android Typography & Spacing Precision**:
   - Always apply `includeFontPadding: false` to all `Text` components to eliminate Android's default font engine padding that causes text to sit lower or take extra vertical height.
   - Always set explicit `lineHeight` matching the skeleton text bar heights (e.g., `lineHeight: 18` for `fontSize: 16` / 16px skeleton; `lineHeight: 14` for `fontSize: 12` / 12px skeleton).
   - Apply `numberOfLines={1}` to row titles and subtitles to prevent multi-line text wrapping from inflating row heights and creating vertical space discrepancies.

4. **Compact Spatial Hierarchy**:
   - Keep vertical margins compact (e.g., `marginBottom: 2` between title and subtitle; `marginBottom: 6` to `8` between profile rows).
   - Eliminate unnecessary empty space or excessive `minHeight` values (favor fixed or tightly padded heights like `height: 56` with `paddingVertical: 8` for list items).
