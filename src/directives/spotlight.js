// Subtle mouse-tracking "spotlight" glow for cards.
// Adds `--spotlight-x` / `--spotlight-y` / `--spotlight-opacity` CSS custom
// properties to the element as the pointer moves over it; the actual glow
// visual is rendered via the `.spotlight-card` CSS in assets/main.css.
export const spotlight = {
  mounted(el) {
    el.classList.add('spotlight-card')

    const handleMove = (event) => {
      const rect = el.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      el.style.setProperty('--spotlight-x', `${x}px`)
      el.style.setProperty('--spotlight-y', `${y}px`)
    }

    const handleEnter = () => {
      el.style.setProperty('--spotlight-opacity', '1')
    }

    const handleLeave = () => {
      el.style.setProperty('--spotlight-opacity', '0')
    }

    el.addEventListener('pointermove', handleMove)
    el.addEventListener('pointerenter', handleEnter)
    el.addEventListener('pointerleave', handleLeave)

    el.__spotlightCleanup = () => {
      el.removeEventListener('pointermove', handleMove)
      el.removeEventListener('pointerenter', handleEnter)
      el.removeEventListener('pointerleave', handleLeave)
    }
  },
  unmounted(el) {
    if (el.__spotlightCleanup) {
      el.__spotlightCleanup()
      delete el.__spotlightCleanup
    }
  },
}
