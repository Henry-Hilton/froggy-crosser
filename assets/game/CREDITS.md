# Asset credits

- Frogs: supplied `frog_spritesheets.zip`. Directional idle and hop frames, portraits, icon and splash. Creator/license information was not present in the ZIP; the original guide and sheets are preserved in `assets/packs/frogs/`.
- World and vehicles: supplied `CP_V1.1.0_nyknck.zip`, credited to nyknck by the archive name. Original sheets are preserved in `assets/packs/crossing/`. The ZIP did not contain license text.
- Runtime regions: exact crops from these sheets, enlarged with nearest-neighbor sampling. `assets/packs/regions.json` records atlas coordinates. The timber platform uses the wooden cargo region. The menu scene composes the supplied terrain, vehicle, shop and tree sprites. The optional bonus uses the supplied gift sprite.
- Rankings use supplied green, blue and brown frog portraits with native UI rank numbers. No earlier custom SVG illustrations are used.

- UI: Kenney Pixel UI Pack by Kenney Vleugels, with help from Lynn Evers (CC0). Supplied panels, buttons, pressed states and directional arrows are used throughout the menu and game. Original assets and License.txt are in assets/packs/kenney-ui; scripts/extract-ui.py reproduces the runtime tiles.

- Font: VT323 by Peter Hull, distributed through Google Fonts under the SIL Open Font License. Bundled locally in assets/fonts with OFL.txt. Source: https://github.com/google/fonts/tree/main/ofl/vt323

- Hamburger and right-arrow icons: supplied Noun Project images by Mikkel Mikkelsen. Cropped to icon bounds for header and Play buttons; attribution retained here.
