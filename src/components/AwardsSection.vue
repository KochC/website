<script setup>
import { useI18n } from '../composables/useI18n.js'

const { t } = useI18n()

const awards = [
  { name: 'Merck Award', year: '2023' },
  { name: 'Chemical & Pharmaceutical Development Silent Hero Award', year: '2020' },
  { name: 'code-2-cloud Hackathon Winner (Accenture, AWS & Merck)', year: '2019' },
  { name: 'ESA Space Solutions Prize', year: '2018' },
  { name: 'ESA Overall Winner — Space For Inspiration Conference', year: '2018' },
  { name: 'Sustainable Exploration Masters Winner (Airbus, Air Liquide & Merck)', year: '2018' },
  { name: 'Hack a Bot Challenge Winner (Microsoft & Merck)', year: '2018' },
  { name: 'Hack a Bot Overall Winner (Microsoft & Merck)', year: '2018' },
]
</script>

<template>
  <section id="awards" class="section">
    <div class="container">
      <h2 class="section-title">{{ t('awards.title') }}</h2>
      <div class="awards-grid">
        <div v-for="award in awards" :key="award.name" class="award-card">
          <div class="award-year">{{ award.year }}</div>
          <p class="award-name">{{ award.name }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.awards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.award-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: box-shadow var(--transition), transform var(--transition);
}

.award-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.award-year {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 2px 10px;
  border-radius: 4px;
  align-self: flex-start;
}

.award-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.4;
}
</style>
