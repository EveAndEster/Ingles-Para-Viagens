# Inglês Para Viagens — Project Structure

This is your site split into separate files, matching how real web projects
are organized. Everything still works exactly the same in a browser — open
`index.html` and click around like before.

## Folder layout

```
Ingles_Para_Viagens/
├── index.html        ← the page structure (tabs, text, content)
├── css/
│   └── styles.css    ← all the visual design (colors, fonts, layout)
├── js/
│   └── script.js      ← the interactive behavior (tab switching, "listen" buttons)
└── audio/
    ├── aud1.mp3       ← your voice recordings (41 files)
    ├── aud2.mp3
    └── ...
```

## Why split it up like this?

- **Easier to find things.** Want to change a color? Open `styles.css`.
  Want to add a new lesson question? Open `index.html`. You're not
  scrolling through one giant file anymore.
- **Easier for AI tools to edit safely.** When Aider or Claude Code only
  needs to touch `styles.css`, it won't accidentally rewrite your content,
  and vice versa. Smaller, focused files = smaller, safer edits.
- **This is exactly how a real website project looks**, even before you
  move to Next.js. Getting comfortable with this shape now makes the
  eventual Next.js structure much less unfamiliar.

## What's next (when you're ready for Next.js)

A Next.js version of this same project will look similar, but reorganized
a bit further:

```
ingles-para-viagens/
├── app/
│   ├── page.tsx              ← the Início (home) tab
│   ├── modulo-1/page.tsx     ← Módulo 1 as its own page
│   ├── metodologia/page.tsx
│   ├── sobre/page.tsx
│   └── contato/page.tsx
├── components/
│   ├── NavBar.tsx             ← the shared top navigation
│   └── AudioButton.tsx        ← a reusable "listen" button
├── public/
│   └── audio/                 ← same mp3 files, same idea
├── styles/
│   └── globals.css            ← same design tokens (violet, Fraunces, etc.)
└── package.json
```

The big shift: instead of one `index.html` with tabs toggled by JavaScript,
each tab becomes its own real page (`/modulo-1`, `/sobre`, etc.), and
repeated pieces like the nav bar become reusable components used everywhere.
That's the natural next step once you're ready to add login and the AI tutor.
