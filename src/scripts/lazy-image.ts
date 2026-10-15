export function loadLazyImages(): void {
  for (const img of document.querySelectorAll<HTMLImageElement>("[data-lazy-image]")) {
    const src = img.dataset.lazyImage
    if (src)
      img.src = src
  }
}
