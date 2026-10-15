export interface CarouselOptions {
  interval?: number
  hoverDelay?: number
  onChange?: (idx: number, prevIdx: number) => void
}

export function setupCarousel(
  root: HTMLElement | string,
  options?: CarouselOptions,
): void {
  if (typeof root === "string") {
    const el = document.querySelector<HTMLElement>(root)
    if (!el)
      return
    root = el
  }

  const items = Array.from(
    root.querySelectorAll<HTMLElement>("[data-carousel-item]"),
  ).map(el => ({
    el,
    index: Number(el.dataset.carouselIndex),
  }))
  const clickCtrls = Array.from(
    root.querySelectorAll<HTMLElement>("[data-carousel-click]"),
  ).map(el => ({
    el,
    index: Number(el.dataset.carouselIndex),
  }))
  const hoverCtrls = Array.from(
    root.querySelectorAll<HTMLElement>("[data-carousel-hover]"),
  ).map(el => ({
    el,
    index: Number(el.dataset.carouselIndex),
  }))

  if (items.length === 0)
    return

  const total = Math.max(...items.map(i => i.index)) + 1

  let current = items.find(i => i.el.dataset.active !== undefined)?.index ?? 0
  if (current < 0 || current >= total)
    current = 0

  const interval = options?.interval ?? 5000
  const hoverDelay = options?.hoverDelay ?? 300

  const wrap = (idx: number) =>
    ((idx % total) + total) % total

  let timer: number | null = null
  let pausedByHover = false

  function setActive(rawIdx: number) {
    const idx = wrap(rawIdx)
    if (idx === current)
      return
    const prev = current
    for (const { el, index } of items) {
      if (index === prev)
        el.removeAttribute("data-active")
      if (index === idx)
        el.setAttribute("data-active", "")
    }
    current = idx
    options?.onChange?.(idx, prev)
    if (!pausedByHover)
      startAutoplay()
  }

  function startAutoplay() {
    if (timer !== null)
      clearInterval(timer)
    timer = window.setInterval(setActive, interval, current + 1)
  }

  function stopAutoplay() {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  clickCtrls.forEach(({ el, index }) => {
    el.addEventListener("click", () => setActive(index))
  })

  hoverCtrls.forEach(({ el, index }) => {
    let hoverTimer: number | null = null
    el.addEventListener("mouseover", () => {
      if (hoverTimer !== null)
        clearTimeout(hoverTimer)
      hoverTimer = window.setTimeout(() => {
        hoverTimer = null
        setActive(index)
      }, hoverDelay)
    })
    el.addEventListener("mouseout", () => {
      if (hoverTimer !== null) {
        clearTimeout(hoverTimer)
        hoverTimer = null
      }
    })
  })

  root.addEventListener("mouseover", (e) => {
    const target = e.target as Element | null
    if (!target?.closest("[data-carousel-pause]"))
      return
    if (pausedByHover)
      return
    pausedByHover = true
    stopAutoplay()
  })

  root.addEventListener("mouseout", (e) => {
    const target = e.target as Element | null
    if (!target?.closest("[data-carousel-pause]"))
      return
    const related = e.relatedTarget as Element | null
    if (related?.closest("[data-carousel-pause]"))
      return
    if (!pausedByHover)
      return
    pausedByHover = false
    startAutoplay()
  })

  startAutoplay()
}
