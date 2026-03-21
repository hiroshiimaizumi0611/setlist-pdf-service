## Stitch Export

Project ID: `16774743705046066908`

This directory stores the hosted Stitch exports downloaded on 2026-03-21.

- `screens/`: exported HTML for each screen
- `images/`: exported PNG previews for each screen
- `design-system/`: project theme metadata and notes

Note about `Design System`:
The Stitch API exposed the design system as an asset instance (`sourceAsset`) rather than a normal screen resource, so it could not be downloaded through `get_screen`. The files in `design-system/` capture the project-level theme metadata that Stitch did expose.
