<script setup>
import { useI18n } from '../composables/useI18n.js'
import { build_version } from './version.js'
import DottedSurface from './DottedSurface.vue'

const { t } = useI18n()

const emailUser = 'chris'
const emailDomain = 'koch.codes'

function openMail() {
  window.location.href = 'mailto:' + emailUser + '@' + emailDomain
}
</script>

<template>
  <section class="hero">
    <div class="hero-bg">
      <DottedSurface />
    </div>
    <div class="hero-content container">
      <div class="hero-badge">Build v{{ build_version }}</div>
      <h1 class="hero-claim">
        <span class="claim-line claim-line-top">{{ t('hero.claim_line1') }}</span>
        <span class="claim-line claim-line-bottom">{{ t('hero.claim_line2') }}</span>
      </h1>
      <div class="hero-byline">
        <p class="hero-name">Christopher Koch</p>
        <span class="hero-dot">&middot;</span>
        <p class="hero-title">{{ t('hero.title') }}</p>
      </div>
      <p class="hero-tagline">{{ t('hero.tagline') }}</p>
      <div class="hero-links">
        <a href="https://www.linkedin.com/in/koch-christopher/" target="_blank" rel="noopener" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          {{ t('hero.linkedin') }}
        </a>
        <a href="https://github.com/KochC" target="_blank" rel="noopener" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          GitHub
        </a>
        <a href="#" @click.prevent="openMail" class="btn btn-ghost">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          {{ t('hero.email') }}
        </a>
      </div>
      <a href="#about" class="scroll-indicator" :aria-label="t('hero.scroll')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
        </svg>
      </a>
    </div>
  </section>
</template>

<style scoped>
.hero {
  min-height: 110vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 120px 0 80px;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 720px;
}

.hero-badge {
  display: inline-flex;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  margin-bottom: 32px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-family: 'Inter', system-ui, sans-serif;
}

.hero-claim {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  margin-bottom: 20px;
}

.claim-line {
  font-family: 'Inter', system-ui, sans-serif;
  letter-spacing: -0.04em;
  line-height: 1.05;
  padding: 2px 0;
  color: var(--color-text);
}

.claim-line-top {
  font-size: 3.5rem;
  font-weight: 600;
}

.claim-line-bottom {
  font-size: 2rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.hero-byline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.hero-name {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-dot {
  color: var(--color-text-muted);
  font-size: 0.7rem;
}

.hero-title {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.hero-tagline {
  font-size: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin-bottom: 44px;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

.hero-links {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: var(--radius-pill);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: all var(--transition);
  font-family: 'Inter', system-ui, sans-serif;
}

.btn-primary {
  background: var(--color-text);
  color: var(--color-bg);
  border: 1.5px solid var(--color-text);
}

.btn-primary:hover {
  opacity: 0.85;
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1.5px solid var(--color-border-btn);
}

.btn-ghost:hover {
  border-color: var(--color-text);
  color: var(--color-text);
}

.scroll-indicator {
  display: block;
  margin: 56px auto 0;
  color: var(--color-text-muted);
  animation: bounce 2s infinite;
  transition: color var(--transition);
}

.scroll-indicator:hover {
  color: var(--color-text);
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

@media (max-width: 640px) {
  .claim-line-top {
    font-size: 2.25rem;
  }
  .claim-line-bottom {
    font-size: 1.3rem;
  }
  .hero-byline {
    flex-direction: column;
    gap: 2px;
  }
  .hero-dot {
    display: none;
  }
  .hero-tagline {
    font-size: 0.9rem;
  }
  .hero-tagline {
    font-size: 0.95rem;
  }
}
</style>
