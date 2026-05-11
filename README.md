# ICU Med Mastery

Interactive, receptor-level study guide for high-yield ICU medications. Built as a static single-page app — runs entirely in the browser with all progress saved to `localStorage`.

## Drugs covered

- **Vasopressors** — Norepinephrine (Levophed), Vasopressin, Epinephrine, Phenylephrine
- **Inotropes** — Dobutamine, Milrinone
- **Sedation & Induction** — Propofol, Dexmedetomidine (Precedex), Etomidate, Ketamine, Midazolam
- **Paralytics** — Rocuronium, Succinylcholine
- **Antihypertensives** — Nicardipine
- **Immunosuppressants** — Tacrolimus, Mycophenolate Mofetil

For each drug: mechanism of action, receptor-level effects, indications, dosing, side effects, contraindications, ICU pearls, and high-yield nursing/provider knowledge.

## Study modes

| Mode | What it does |
| --- | --- |
| 📖 **Reference** | Browse all meds with full detail. Searchable + filter by class. |
| 🃏 **Flashcards** | Two-sided cards with customizable front/back (name ↔ MOA / receptor / dose / full overview). Confidence rating updates mastery. |
| 🎯 **Quiz** | Auto-generated multiple choice across mechanism, receptors, dosing, contraindications, side effects, and pearls. 10–100 questions, biased toward weak spots. |
| 🧪 **Receptor Drill** | Pure receptor pharmacology — see a profile, identify the drug. |
| ✍️ **Free Recall** | Brain-dump everything you know, then check yourself. Self-graded. |
| 📊 **Progress** | Readiness score, per-drug mastery bars, accuracy stats, weak-spot detection. |

## Progress tracking

- All state persists in `localStorage` under the key `icu_med_mastery_v1`.
- Each drug has a 0–100% mastery score that climbs with correct answers and "easy" flashcard ratings, and drops with wrong answers / "again" ratings.
- Diminishing returns: it's easier to climb from 0 → 50 than from 80 → 100.
- Readiness score = average mastery across all drugs.
- One-click reset on the Progress page.

## Running locally

It's a static site — just open `index.html` in a browser, or:

```bash
npx serve .
```

## Deployment

This repo is wired for Vercel — every push to `main` auto-deploys.

## Disclaimer

Educational reference only. Cross-check all dosing and indications against current institutional protocols and pharmacy resources before any clinical use.
