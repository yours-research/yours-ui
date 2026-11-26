# Contributing to `@yours/ui`

Thanks for contributing to Yours Research's open MIT design system!

## Local Setup

```bash
npm install
npm run generate:icons
npm run typecheck
npm run build
npm test
```

## Adding or Editing Aperture Icons

1. Place normalized `24x24` stroke SVGs under `src/icons/<name>.svg` following the specification in `icons.yaml` (`stroke-width="1.75"`, round caps/joins, 45° chamfer DNA).
2. Run `npm run generate:icons` to regenerate `src/icons/iconData.ts`.
3. Export a named `<Name>Icon` wrapper from `src/icons/ApertureIcon.tsx` and `src/icons/index.ts`.
4. Ensure zero `dangerouslySetInnerHTML` and keep all component CSS cleanly inside `src/styles/`.
