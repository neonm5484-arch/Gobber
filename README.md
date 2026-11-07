# Gobber

Gobber is an original, browser-based quiz game prototype. It is inspired by the broad idea of quick, playful quiz games, but uses its own name, interface, questions, modes, and collectible items.

## Run it

1. Download or clone this repository, or open the `feature/gobber-quiz-game` branch on GitHub.
2. Open `index.html` in a recent browser. No build tools or packages are needed.
3. Choose **Modes** to play, **Packs** to spend coins on collectibles, and **Profile** to see your progress.

The prototype saves progress in your browser's local storage. It does not have real accounts, a server, multiplayer, or cross-device syncing. Clearing browser data resets the saved progress.

## Included in this prototype

- Five playable quiz modes with different descriptions and rewards.
- Five-question rounds, correctness feedback, end-of-round results, and coin rewards.
- Five collectible pack rarity tiers: Uncommon, Rare, Epic, Legendary, and Secret.
- Original collectibles and an animated pack reward reveal.
- A profile, local inventory, and a demo admin screen for editing sample account coins, status, and role.
- A small starter question set that can be expanded.

## Demo admin warning

The sample admin PIN is `NeonMan`, as requested. This is only a front-end demonstration: the PIN and all user data are in publicly visible browser code and can be changed by anyone using developer tools. **Do not use this admin screen or PIN for a real public game.** Before allowing real users, replace the local demo with a server, real authentication, server-side role checks, input validation, and an audit log. The sample accounts in the admin panel are not real users.

## Current limitations / next steps

- Real sign-up/sign-in and persistent server-side profiles.
- Secure administrator permissions and moderation actions.
- Multiplayer rooms, real teams, and live host controls.
- More question categories, a quiz-set editor, and a leaderboard.
- Automated tests and deployment configuration.
