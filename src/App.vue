<script setup>
import { useI18n } from './composables/useI18n.js'
import HeroSection from './components/HeroSection.vue'
import AboutSection from './components/AboutSection.vue'
import ExperienceSection from './components/ExperienceSection.vue'
import PublicationsSection from './components/PublicationsSection.vue'
import AwardsSection from './components/AwardsSection.vue'
import CertificationsSection from './components/CertificationsSection.vue'
import ImpressumSection from './components/ImpressumSection.vue'

const { t, locale, setLocale } = useI18n()

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
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
}

.nav-logo {
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--color-primary);
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
  gap: 20px;
}

.lang-toggle {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1.5px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition);
  letter-spacing: 0.04em;
}

.lang-toggle:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.nav-links a {
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: color var(--transition);
}

.nav-links a:hover {
  color: var(--color-primary);
}

@media (max-width: 640px) {
  .nav-links {
    gap: 12px;
  }
  .nav-links a {
    font-size: 0.8rem;
  }
  .nav-right {
    gap: 10px;
  }
}
</style>
