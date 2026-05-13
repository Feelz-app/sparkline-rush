# Secret Skins and Chests

The secret and exclusive chest skins live in:

`src/data/secretSkins.ts`

Trail and obstacle prize graphics live in:

`src/data/rewardCosmetics.ts`

These are original chest-only prizes. Avoid adding names, outfits, colors, or descriptions that copy a known copyrighted character, brand, celebrity, or trademarked design.

## Creator preview gallery

Open this local file to review every chest skin as an image:

`docs/secret-skin-gallery.html`

Individual SVG previews are generated into:

`docs/secret-skin-previews/`

When you edit, add, or delete a skin in `src/data/secretSkins.ts`, run:

`npm run skin:previews`

That refreshes the gallery, the individual SVG previews, and the preview manifest. The gallery includes normal secret skins and exclusive 20-chest skins.

## How the vault works

- Every earned/opened chest increases `chestsOpened`.
- Every 3rd chest can unlock one player line/trail graphic.
- Every 4th chest can unlock one dodge-box obstacle graphic.
- Every 5th chest awards one special ability token and one normal secret skin.
- Every 20th chest becomes an exclusive vault chest instead of a normal secret skin.
- Hidden skins stay out of Ball Lab until the player unlocks them.

## Special abilities

- Phase Cloak: invisible for 12 seconds.
- Mega Magnet: magnet for 10 seconds.
- Heart Burst: adds one stacked heart, up to 5 hearts total.
- Time Brake: slows blocks for 12 seconds.
- Spark Surge: 2x score/sparks for 10 seconds.
