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
  <section id="impressum" class="section impressum-section">
    <div class="container">
      <h2 class="section-title">{{ t('impressum.title') }}</h2>
      <div class="impressum-grid">
        <div class="impressum-card">
          <h3>{{ t('impressum.info_title') }}</h3>
          <p>Christopher Koch<br />Frankfurter Landstr. 243<br />Darmstadt</p>
        </div>

        <div class="impressum-card">
          <h3>{{ t('impressum.contact') }}</h3>
          <p>
            <span class="obf" aria-label="Telefonnummer">{{ t('impressum.phone_rev') }}</span><br />
            E-Mail: <span class="obf">sedoc.hcok@sirhc</span>
          </p>
          <p class="contact-hint">
            <a href="#" @click.prevent="openMail" class="email-link">{{ t('impressum.contact_hint') }}</a>
          </p>
        </div>

        <div class="impressum-card">
          <h3>{{ t('impressum.liability_content_title') }}</h3>
          <p>{{ t('impressum.liability_content_1') }}</p>
          <p>{{ t('impressum.liability_content_2') }}</p>
        </div>

        <div class="impressum-card">
          <h3>{{ t('impressum.liability_links_title') }}</h3>
          <p>{{ t('impressum.liability_links_1') }}</p>
          <p>{{ t('impressum.liability_links_2') }}</p>
        </div>

        <div class="impressum-card">
          <h3>{{ t('impressum.copyright_title') }}</h3>
          <p>{{ t('impressum.copyright_1') }}</p>
          <p>{{ t('impressum.copyright_2') }}</p>
        </div>
      </div>

      <p class="copyright">&copy; koch.codes 2026</p>
    </div>
  </section>
</template>

<style scoped>
.impressum-section {
  background: var(--color-text);
}

.impressum-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.impressum-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius);
  padding: 28px 32px;
}

.impressum-card h3 {
  font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
}

.impressum-card p {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.85rem;
  line-height: 1.7;
  margin-bottom: 10px;
  color: #94a3b8;
}

.impressum-card p:last-child {
  margin-bottom: 0;
}

.obf {
  unicode-bidi: bidi-override;
  direction: rtl;
  user-select: none;
  -webkit-user-select: none;
}

.contact-hint {
  margin-top: 8px;
  font-size: 0.8rem;
}

.email-link {
  color: #94a3b8;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: #475569;
  transition: color var(--transition);
}

.email-link:hover {
  color: #cbd5e1;
  text-decoration-color: #94a3b8;
}

.copyright {
  text-align: center;
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,0.08);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.8rem;
  color: #64748b;
  max-width: 720px;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 640px) {
  .impressum-card {
    padding: 20px;
  }
}
</style>
