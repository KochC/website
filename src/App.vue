<script setup>
import { useI18n } from './composables/useI18n.js'
import { useTheme } from './composables/useTheme.js'
import HeroSection from './components/HeroSection.vue'
import AboutSection from './components/AboutSection.vue'
import ExperienceSection from './components/ExperienceSection.vue'
import PublicationsSection from './components/PublicationsSection.vue'
import AwardsSection from './components/AwardsSection.vue'
import CertificationsSection from './components/CertificationsSection.vue'
import ImpressumSection from './components/ImpressumSection.vue'

const { t, locale, setLocale } = useI18n()
const { theme, toggleTheme } = useTheme()

function toggleLocale() {
  setLocale(locale.value === 'de' ? 'en' : 'de')
}
</script>

<template>
  <div class="app">
    <nav class="nav">
      <div class="nav-inner container">
        <a href="#" class="nav-logo">kc</a>
        <div class="nav-right">
          <div class="nav-links">
            <a href="#about">{{ t('nav.about') }}</a>
            <a href="#experience">{{ t('nav.experience') }}</a>
            <a href="#publications">{{ t('nav.publications') }}</a>
            <a href="#impressum">{{ t('nav.impressum') }}</a>
          </div>
          <button class="lang-toggle" @click="toggleLocale" :title="locale === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln'">
            {{ locale === 'de' ? 'EN' : 'DE' }}
          </button>
          <button
            class="theme-toggle"
            @click="toggleTheme"
            :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
            :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <svg v-if="theme === 'dark'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <main>
      <HeroSection />
      <AboutSection />
      <ExperienceSection />
      <PublicationsSection />
      <AwardsSection />
      <CertificationsSection />
      <ImpressumSection />
    </main>
  </div>
</template>

<style>
@import './assets/main.css';
</style>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--color-nav-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  transition: background-color var(--transition), border-color var(--transition);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.nav-logo {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--color-text);
  text-decoration: none;
  letter-spacing: -0.02em;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lang-toggle {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  border: 1.5px solid var(--color-border-btn);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition);
  letter-spacing: 0.04em;
}

.lang-toggle:hover {
  border-color: var(--color-text);
  color: var(--color-text);
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-pill);
  border: 1.5px solid var(--color-border-btn);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition);
}

.theme-toggle:hover {
  border-color: var(--color-text);
  color: var(--color-text);
}

.nav-links a {
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: color var(--transition);
}

.nav-links a:hover {
  color: var(--color-text);
}

@media (max-width: 640px) {
  .nav-links {
    gap: 12px;
  }
  .nav-links a {
    font-size: 0.8rem;
  }
  .nav-right {
    gap: 8px;
  }
}
</style>
