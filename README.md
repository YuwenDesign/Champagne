# Champagne Photo Atlas

A quiet vintage static website for displaying photography from a Champagne
journey.

## Current concept

- Kraft-paper map as the homepage.
- Clickable locations: Reims, Epernay, Ay, Troyes.
- Location click reveals that stop's photography.
- Large gallery view with hand-drawn glass "cheers" interaction.
- CD cover preview with style variants.

## Replacing placeholders with real photos

1. Create `images/`.
2. Add your photos, for example `images/reims-cathedral.jpg`.
3. In `styles.css`, replace a placeholder class such as `.reims-one` with:

```css
.reims-one {
  background-image: url("images/reims-cathedral.jpg");
}
```

4. In `script.js`, update the `photos` array with the real title, location,
   caption, and class name.

## Deployment

This is a zero-dependency static site. It can be deployed with GitHub Pages,
Cloudflare Pages, Vercel, or Netlify.
