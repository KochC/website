<script setup>
import { useI18n } from '../composables/useI18n.js'

const { t } = useI18n()

const certifications = [
  { name: 'Architecting on AWS', issuer: 'Amazon Web Services', year: '2022' },
  { name: 'Taking the Lead', issuer: 'Janus GmbH & Co. KG', year: '2021' },
  { name: 'Rhetorik: Mit guten Argumenten überzeugen', issuer: 'Project Management Institute', year: '2021' },
  { name: 'Inspirational Leadership Skills', issuer: 'Chris Croft & Udemy', year: '2020' },
  { name: 'Leadership Fundamentals', issuer: 'LinkedIn', year: '2020' },
  { name: 'Professional Scrum Master I', issuer: 'Scrum.org' },
  { name: 'SAFe Agile', issuer: 'Scaled Agile' },
  { name: 'Computer Science Principles', issuer: 'Harvard University' },
  { name: 'Kenntnisnachweis § 21a LuftVO (Flugmodelle)', issuer: 'Bundesrepublik Deutschland', year: '2017' },
]
</script>

<template>
  <section id="certifications" class="section">
    <div class="container">
      <h2 class="section-title">{{ t('certifications.title') }}</h2>
      <div class="certs-grid">
        <div v-for="cert in certifications" :key="cert.name" class="cert-card">
          <div class="cert-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="6"/>
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
          </div>
          <div class="cert-body">
            <h3 class="cert-name">{{ cert.name }}</h3>
            <p class="cert-issuer">{{ cert.issuer }}</p>
          </div>
          <span v-if="cert.year" class="cert-year">{{ cert.year }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.certs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}

.cert-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 18px 20px;
  transition: box-shadow var(--transition);
}

.cert-card:hover {
  box-shadow: var(--shadow);
}

.cert-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.cert-body {
  flex: 1;
  min-width: 0;
}

.cert-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.3;
}

.cert-issuer {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.cert-year {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .certs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
