<script setup>
import { useI18n } from '../composables/useI18n.js'

const { t } = useI18n()

const emailUser = 'chris'
const emailDomain = 'koch.codes'

function openMail() {
  window.location.href = 'mailto:' + emailUser + '@' + emailDomain
}
</script>

<template>
  <section id="impressum" class="impressum-section">
    <div class="container">
      <div class="impressum-content">
        <h2 class="section-title">{{ t('impressum.title') }}</h2>

        <h3>{{ t('impressum.info_title') }}</h3>
        <p>Christopher Koch<br />Frankfurter Landstr. 243<br />Darmstadt</p>

        <h3>{{ t('impressum.contact') }}</h3>
        <p>
          <span aria-label="Telefonnummer">{{ t('impressum.phone') }}</span><br />
          E-Mail: <a href="#" @click.prevent="openMail" class="email-link">{{ emailUser }}&#64;{{ emailDomain }}</a>
        </p>

        <h3>{{ t('impressum.liability_content_title') }}</h3>
        <p>{{ t('impressum.liability_content_1') }}</p>
        <p>{{ t('impressum.liability_content_2') }}</p>

        <h3>{{ t('impressum.liability_links_title') }}</h3>
        <p>{{ t('impressum.liability_links_1') }}</p>
        <p>{{ t('impressum.liability_links_2') }}</p>

        <h3>{{ t('impressum.copyright_title') }}</h3>
        <p>{{ t('impressum.copyright_1') }}</p>
        <p>{{ t('impressum.copyright_2') }}</p>

        <p class="copyright">&copy; koch.codes 2026</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.impressum-section {
  background: var(--color-text);
  color: #cbd5e1;
  padding: 80px 0;
}

.impressum-section :deep(.section-title) {
  color: white;
}

.impressum-content {
  max-width: 640px;
  margin: 0 auto;
}

.impressum-content h3 {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  margin-top: 32px;
  margin-bottom: 8px;
}

.impressum-content p {
  font-size: 0.85rem;
  line-height: 1.7;
  margin-bottom: 12px;
  color: #94a3b8;
}

.email-link {
  color: #94a3b8;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: #475569;
}

.email-link:hover {
  color: #cbd5e1;
  text-decoration-color: #94a3b8;
}

.copyright {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid #334155;
  font-size: 0.8rem;
  color: #64748b !important;
}
</style>
