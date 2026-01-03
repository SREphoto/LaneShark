# LaneShark Change Log

## [1.6.1] - 2026-01-01

### Fixes

- **News Ticker**: Removed News Ticker (reverted feature request).
- **Cleanup**: Removed unused component code.

## [1.6.0] - 2026-01-01

### Features & Fixes

- **News Ticker**: Added a desktop-exclusive, scrolling news ticker to the top right header with live links.
- **Stat System Audit**: Fixed a critical bug where the "Level Up" screen was being rendered twice, causing points to be lost or miscalculated. Refactored the save logic to ensure immediate persistence.
- **Stability**: Removed redundant UI rendering calls.

## [1.5.0] - 2026-01-01

### Visuals & Gameplay

- **Bigger Bowler**: Character model scaled up by 50% for better presence.
- **Mobile Visibility**: Moved the pin rack down (Y: 200) so the back row is now fully visible on all screens and not obscured by the top HUD.
- **Difficulty Tuning**: Adjusted physics engine. Pins are heavier (reduced impact transfer) and settle faster, making strikes slightly harder and more rewarding.

## [1.4.0] - 2026-01-01

### Critical Fixes

- **Stat Point Sync**: Fixed a major bug where level-up stat points were not being saved correctly. The player profile inside the save file was stale, overwriting the earned points. This has been resolved by strictly syncing profile data before saving.
- **Environment**: Reverted the experimental "Dual Lane" layout back to the stable "Single Lane" design based on player feedback.
- **Aiming**: Preserved the improved **10-degree aiming arc** for better precision (an improvement from the old 45-degree arc).
- **UI**: Fixed Power Meter visualization overflow.
- **Overlays**: Fixed an issue where "STRIKE" and "SPARE" animations would sometimes persist indefinitely.

### Features

- **Version Tracking**: Added this Change Log to track updates.
- **Gameplay**: "Ghost" lane removed; focus returned to the primary lane.

## [1.3.0] - 2025-12-31

- Added GitHub Pages deployment scripts.
- Initial Environment Overhaul (Later Reverted).

## [1.2.0] - 2025-12-30

- Implemented Shop and Economy system.
- Added new Ball Materials (Urethane, Resin).

## [1.1.0] - 2025-12-25

- Added CPU Opponents.
- Added Scorecard and basic Bowling Logic.
