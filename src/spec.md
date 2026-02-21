# Specification

## Summary
**Goal:** Add a Poumai Poems cultural literary section with public viewing and admin management capabilities.

**Planned changes:**
- Create a Poumai Poems page displaying poems in a grid layout with category/theme filtering
- Each poem card shows title, author, poem text (with line break formatting), date written, category, and optional English translation with cultural context
- Implement backend Motoko data models and CRUD operations for poems with role-based access control
- Add admin interface with dialog form for adding, editing, and deleting poems (admin-only)
- Create React Query hooks for all poem operations (fetch, create, update, delete)
- Add "Poumai Poems" navigation link to the main menu and configure route

**User-visible outcome:** Users can browse and filter Poumai poems by category, reading the original text with optional English translations and cultural context. Admin users can add, edit, and delete poems through a dedicated management interface.
