<script setup>
import { useI18n } from '../composables/useI18n.js'

const { t } = useI18n()
</script>

<template>
  <section id="experience" class="section">
    <div class="container">
      <h2 class="section-title">{{ t('experience.title') }}</h2>
      <div class="timeline">
        <div v-for="company in t('experience.roles')" :key="company.company" class="timeline-company">
          <div class="timeline-marker">
            <div class="timeline-dot"></div>
            <div class="timeline-line"></div>
          </div>
          <div class="timeline-content">
            <div class="company-header">
              <h3 class="company-name">{{ company.company }}</h3>
              <span class="company-location">{{ company.location }}</span>
            </div>
            <div v-for="role in company.positions" :key="role.title" class="role-card">
              <div class="role-header">
                <h4 class="role-title">{{ role.title }}</h4>
                <span class="role-period">{{ role.period }}</span>
              </div>
              <p class="role-desc">{{ role.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-company {
  display: flex;
  gap: 24px;
  position: relative;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 20px;
  padding-top: 6px;
}

.timeline-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-gradient-1), var(--color-gradient-2));
  border: 3px solid var(--color-primary-light);
  flex-shrink: 0;
  z-index: 1;
  box-shadow: 0 0 12px rgba(37,99,235,0.3);
}

.timeline-line {
  width: 2px;
  flex: 1;
  background: linear-gradient(180deg, var(--color-gradient-1), var(--color-gradient-2), var(--color-gradient-3), transparent);
  margin-top: 4px;
}

.timeline-company:last-child .timeline-line {
  display: none;
}

.timeline-content {
  flex: 1;
  padding-bottom: 40px;
}

.company-header {
  margin-bottom: 16px;
}

.company-name {
  font-size: 1.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-gradient-1), var(--color-gradient-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.company-location {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-left: 8px;
}

.role-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 20px;
  margin-bottom: 12px;
  transition: box-shadow var(--transition), transform var(--transition);
  position: relative;
  overflow: hidden;
}

.role-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--color-gradient-1), transparent);
  opacity: 0;
  transition: opacity var(--transition);
}

.role-card:hover::before {
  opacity: 1;
}

.role-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateX(4px);
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}

.role-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
}

.role-period {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.role-desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

@media (max-width: 640px) {
  .role-header {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
