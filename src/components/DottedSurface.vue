<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvasEl = ref(null)

let ctx = null
let rafId = null
let resizeObserver = null
let themeObserver = null
let width = 0
let height = 0
let dpr = 1

const SPACING = 26

function getDotColor() {
  const isDark = document.documentElement.classList.contains('dark')
  return isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(2, 6, 23, 1)'
}

function resize() {
  const canvas = canvasEl.value
  if (!canvas) return
  const parent = canvas.parentElement
  width = parent.clientWidth
  height = parent.clientHeight
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = width * dpr
  canvas.height = height * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function drawFrame(time) {
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)

  const color = getDotColor()
  const t = time / 1000
  const cols = Math.ceil(width / SPACING) + 1
  const rows = Math.ceil(height / SPACING) + 1

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * SPACING
      const y = row * SPACING
      const wave = Math.sin(x * 0.018 + t * 0.7) * Math.cos(y * 0.024 + t * 0.5)
      const offsetY = wave * 9
      const intensity = (wave + 1) / 2 // 0..1
      const radius = 0.7 + intensity * 1.1
      const alpha = 0.08 + intensity * 0.22

      ctx.beginPath()
      ctx.globalAlpha = alpha
      ctx.fillStyle = color
      ctx.arc(x, y + offsetY, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1
}

function animate(time) {
  drawFrame(time)
  rafId = requestAnimationFrame(animate)
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

onMounted(() => {
  const canvas = canvasEl.value
  if (!canvas) return
  ctx = canvas.getContext('2d')

  resize()

  resizeObserver = new ResizeObserver(() => {
    resize()
    if (prefersReducedMotion()) drawFrame(0)
  })
  resizeObserver.observe(canvas.parentElement)

  themeObserver = new MutationObserver(() => {
    if (prefersReducedMotion()) drawFrame(0)
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  if (prefersReducedMotion()) {
    drawFrame(0)
  } else {
    rafId = requestAnimationFrame(animate)
  }
})

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
  if (resizeObserver) resizeObserver.disconnect()
  if (themeObserver) themeObserver.disconnect()
})
</script>

<template>
  <canvas ref="canvasEl" class="dotted-surface" aria-hidden="true"></canvas>
</template>

<style scoped>
.dotted-surface {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}
</style>
