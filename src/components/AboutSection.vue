<script setup>
import { useI18n } from '../composables/useI18n.js'

const { t } = useI18n()
</script>

<template>
  <section id="about" class="section">
    <div class="container">
      <h2 class="section-title">{{ t('about.title') }}</h2>
      <div class="about-grid">
        <div class="about-text">
          <p>{{ t('about.p1') }}</p>
          <p>{{ t('about.p2') }}</p>
          <p class="about-focus">{{ t('about.p3') }}</p>
        </div>
        <div class="about-sidebar">
          <div class="about-card">
            <h3>{{ t('about.skills_title') }}</h3>
            <div class="skills-grid">
              <span v-for="skill in t('skills')" :key="skill" class="skill-tag">{{ skill }}</span>
            </div>
          </div>
          <div class="about-card">
            <h3>{{ t('about.languages_title') }}</h3>
            <ul class="lang-list">
              <li v-for="lang in t('languages')" :key="lang.name">
                <strong>{{ lang.name }}</strong>
                <span>{{ lang.level }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 48px;
  align-items: start;
}

.about-text p {
  color: var(--color-text-secondary);
  margin-bottom: 16px;
  font-size: 0.95rem;
  line-height: 1.75;
}

.about-focus {
  font-weight: 500;
  color: var(--color-text) !important;
  border-left: 3px solid transparent;
  border-image: linear-gradient(180deg, var(--color-gradient-1), var(--color-gradient-2));
  border-image-slice: 1;
  padding-left: 16px;
}

.about-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.about-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.about-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-gradient-1), var(--color-gradient-2), var(--color-gradient-3));
  background-size: 200% 200%;
  animation: gradient-shift 4s ease infinite;
}

.about-card h3 {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 16px;
  background: linear-gradient(135deg, var(--color-gradient-1), var(--color-gradient-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-accent-light));
  color: var(--color-primary-dark);
}

.lang-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lang-list li {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.lang-list strong {
  font-weight: 600;
}

.lang-list span {
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .about-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
