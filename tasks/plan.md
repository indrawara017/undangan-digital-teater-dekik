# Implementation Plan: Merchandise gallery and detail pages

## Overview

Replace the public product modal with shareable product detail pages, and give administrators a full-page editor that supports an ordered image gallery.

## Architecture decisions

- `image_urls` is a JSONB array; `image_url` remains the primary image for existing records and compatibility.
- Public detail routes use the existing product slug and server-side Supabase query.
- Admin editing uses dedicated routes, keeping the list focused on browsing and actions.

## Task list

1. Add the gallery data contract and database migration.
2. Build public catalogue links and a product detail page with gallery and ordering controls.
3. Replace the admin modal workflow with a full-page image-gallery editor.
4. Run focused tests, lint, and production build.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Existing products have one image | Normalize `image_url` into a one-item gallery. |
| A legacy slug is duplicated | Detail lookup selects one record and the editor maintains the existing slug behavior. |
