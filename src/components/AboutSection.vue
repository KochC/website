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
          <div class="about-card" v-spotlight>
            <h3 class="eyebrow-label about-card-heading">{{ t('about.skills_title') }}</h3>
            <div class="skills-grid">
              <span v-for="skill in t('skills')" :key="skill" class="skill-tag">{{ skill }}</span>
            </div>
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
  border-left: 3px solid var(--color-border);
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
}

.about-card-heading {
  margin-bottom: 16px;
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
  padding: 4px 14px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .about-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
