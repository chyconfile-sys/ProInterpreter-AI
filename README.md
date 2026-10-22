# ProInterpreter AI — starter app

A responsive Chinese–English professional interpreter practice app. This starter is a static web app designed to be easy to upload to GitHub and publish with GitHub Pages.

## What works in this version

- Industry dashboard covering medical, mechanical engineering, business/trade, legal, construction, mining, manufacturing, logistics, HR, electrical engineering, automotive, and IT.
- Searchable vocabulary with Simplified Chinese, Pinyin, English meaning, definitions, example sentences, industry and level filters.
- Interpretation practice in Chinese → English and English → Chinese with reference answers.
- Workplace scenario cards.
- Vocabulary quizzes with feedback and a score.
- Personal glossary saved in the browser using localStorage.
- Export saved glossary as CSV.
- Responsive layout for desktop and mobile.

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser. No build step is required.
3. For a local development server, use VS Code Live Server or run `python -m http.server 8000` in this folder, then open `http://localhost:8000`.

## Publish using GitHub Pages

1. Create a GitHub repository and upload `index.html`, `styles.css`, `app.js`, and `README.md` to the repository root.
2. Open the repository's **Settings → Pages**.
3. Under build and deployment, select **Deploy from a branch**.
4. Choose the `main` branch and `/ (root)`, then save.
5. Wait for GitHub Pages to publish the site. The repository's Pages section will show the live URL.

## Important limitations

This is a functional frontend MVP, not yet a full AI-backed SaaS. AI coaching, speech recognition, text-to-speech, user accounts, cross-device synchronization, and a cloud database are not connected. The app makes no external API calls and does not require API keys. Saved terms and quiz progress stay in the current browser; they do not sync to another device. Add a secure backend before introducing AI keys or storing sensitive user information.

The included terminology and scenarios are illustrative learning examples, not a professionally validated dictionary. Verify medical, legal, engineering, and safety terminology with qualified professionals before using it in live assignments. Do not enter identifiable patient, client, or employer-confidential information.

## Suggested next development phase

- Add a backend and authentication (for example, Supabase) with user-scoped row-level security.
- Add a server-side AI endpoint and structured prompts for contextual terminology explanations and interpretation feedback.
- Add speech services for Chinese and English, with a text-only fallback.
- Expand the glossary through expert-reviewed content and an admin review workflow.
- Add automated tests and deployment checks.
