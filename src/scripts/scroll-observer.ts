export function setupScrollClass() {
  const sections = document.querySelectorAll("[data-section]")
  if (!sections.length)
    return

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target
            .querySelectorAll("[data-scroll]")
            .forEach(el => el.classList.add("scrolled"))
          io.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.5 },
  )

  for (const s of sections) io.observe(s)
}
