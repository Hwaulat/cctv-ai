<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- App shell: a custom fixed sidebar (`src/components/layout/app-sidebar.tsx`) and header (`app-header.tsx`) are composed in `src/routes/__root.tsx` around `<Outlet />` — do not migrate to the shadcn `<Sidebar />`; the style must keep matching the user's reference images (navy sidebar, light header).
- No authentication: every route is public; do not add auth guards or login screens.
- Demo data lives in `src/lib/data.ts` (no backend connected); pages hold user edits (acknowledge, capacity) in local state only.
