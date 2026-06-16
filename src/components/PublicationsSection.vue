<script setup>
import { useI18n } from '../composables/useI18n.js'

const { t, locale } = useI18n()

const publications = [
  {
    id: 'arXiv:2606.16649',
    date_de: 'Juni 2026',
    date_en: 'June 2026',
    subjects: 'cs.AI',
    authors: 'Christopher Koch, Joshua A. Wellbrock',
    pages: '10 pages, 15 tables',
    title: 'The Integrator Advantage: Controlled Agentic AI for Small and Medium-Sized Companies',
    abstract_de: 'Agentische KI markiert eine neue Phase der Unternehmensautomatisierung. Im Gegensatz zu traditioneller Automatisierung oder konversationeller KI können agentische Systeme Ziele interpretieren, mehrstufige Aufgaben planen, auf Tools zugreifen, mit Unternehmenssystemen interagieren und Workflows mit unterschiedlichen Autonomiegraden ausführen. Für kleine und mittelständische Unternehmen entsteht dadurch das Potenzial, den Verwaltungsaufwand zu reduzieren, Routineprozesse zu beschleunigen und die Nutzung von Organisationswissen zu verbessern. Dieses Papier argumentiert, dass der kurzfristige Wert von agentischer KI nicht in vollständiger Autonomie oder Personalabbau liegt, sondern in kontrollierter partieller Autonomie für einfache und mittlere komplexe Geschäftsprozesse. Es schlägt ein Integrationsframework vor, das die Eignung von Anwendungsfällen, Autonomiestufen, technische Integration, Governance, Sicherheit, Mitarbeiterqualifizierung und messbare Auswirkungen abdeckt. Das Papier kommt zu dem Schluss, dass agentische KI zu einem Produktivitätshebel werden kann, wenn sie als menschenzentrierte Fähigkeit implementiert wird, bei der Verantwortung und Rechenschaftspflicht bei Menschen verbleiben.',
    abstract_en: 'Agentic AI marks a new phase of enterprise automation. Unlike traditional automation or conversational AI, agentic systems can interpret goals, plan multi step tasks, access tools, interact with enterprise systems, and execute workflows with varying degrees of autonomy. For small and medium sized companies, this creates potential to reduce administrative burden, accelerate routine processes, and improve the use of organizational knowledge. This paper argues that the near term value of Agentic AI does not lie in full autonomy or workforce reduction, but in controlled partial autonomy for simple and medium complexity business processes. It proposes an integration framework covering use case suitability, autonomy levels, technical integration, governance, security, employee enablement, and measurable impact. The paper concludes that Agentic AI can become a productivity lever when implemented as a human centered capability with responsibility and accountability retained by people.',
    url_pdf: 'https://arxiv.org/pdf/2606.16649',
    url_abs: 'https://arxiv.org/abs/2606.16649',
  },
  {
    id: 'arXiv:2605.20456',
    date_de: 'Mai 2026',
    date_en: 'May 2026',
    subjects: 'cs.SE — cs.AI — cs.MA',
    authors: 'Christopher Koch',
    pages: '7 pages, 1 figure',
    title: 'Agentic Agile-V: From Vibe Coding to Verified Engineering in Software and Hardware Development',
    abstract_de: 'Agentische KI-Codierungssysteme können Repositories inspizieren, Implementierungsschritte planen, Dateien bearbeiten, Tools aufrufen, Tests ausführen und Pull-Requests einreichen. Dieser Beitrag argumentiert, dass das zentrale Problem nicht mehr Prompt-Engineering ist, sondern Engineering-Prozesssteuerung. Er führt Agentic Agile-V ein, ein Prozess-Framework, das Agile-V als Lebenszyklus-Rückgrat und eine task-level SCOPE-V-Schleife — Specify, Constrain, Orchestrate, Prove, Evolve, Verify — nutzt, um konversationale Absicht in strukturierte Engineering-Artefakte und Akzeptanznachweise zu überführen.',
    abstract_en: 'Agentic AI coding systems can inspect repositories, plan implementation steps, edit files, call tools, run tests, and submit pull requests. This paper argues that the central problem is no longer prompt engineering; it is engineering process control. It proposes Agentic Agile-V, a process framework that uses Agile-V as the lifecycle backbone and a task-level SCOPE-V loop — Specify, Constrain, Orchestrate, Prove, Evolve, Verify — to convert conversational intent into structured engineering artifacts and acceptance evidence.',
    url_pdf: 'https://arxiv.org/pdf/2605.20456',
    url_abs: 'https://arxiv.org/abs/2605.20456',
  },
  {
    id: 'arXiv:2605.06713',
    date_de: 'Mai 2026',
    date_en: 'May 2026',
    subjects: 'cs.CR — cs.AI — cs.HC',
    authors: 'Christopher Koch',
    pages: '7 pages',
    title: 'Agentic AI and the Industrialization of Cyber Offense: Forecast, Consequences, and Defensive Priorities for Enterprises and the Mittelstand',
    abstract_de: 'Agentische KI-Systeme können planen, Tools aufrufen, Code inspizieren, mit Webanwendungen interagieren und mehrstufige Workflows koordinieren. Diese Arbeit synthetisiert aktuelle öffentliche Beweise von nationalen Cybersicherheitsbehörden, Industrie-Bedrohungsberichten und Forschung zu LLM-Agenten-Fähigkeiten. Sie führt ein Drei-Kanal-Agentic-Cyber-Risk-Modell und ein Angriffskompressionsmodell ein, nutzt den Linux-Kernel-Copy-Fail-Vorfall 2026 als Fallstudie und entwickelt eine Prognose 2026–2028 mit priorisierter Verteidigungs-Roadmap.',
    abstract_en: 'Agentic AI systems can plan, call tools, inspect code, interact with web applications, and coordinate multi-step workflows. This paper synthesizes current public evidence from national cybersecurity agencies, industry threat reports, and research on LLM agents cyber capabilities. It introduces a Three Channel Agentic Cyber Risk Model and an Agentic Attack Compression Model, uses the 2026 Linux kernel Copy Fail incident as a case study, and develops a 2026 to 2028 forecast with a prioritized defense roadmap.',
    url_pdf: 'https://arxiv.org/pdf/2605.06713',
    url_abs: 'https://arxiv.org/abs/2605.06713',
  },
  {
    id: 'arXiv:2604.19818',
    date_de: 'April 2026',
    date_en: 'April 2026',
    subjects: 'cs.SE — cs.HC — cs.MA',
    authors: 'Christopher Koch, Joshua Andreas Wellbrock',
    pages: '8 pages, 1 figure, 4 tables',
    title: 'Beyond Task Success: An Evidence-Synthesis Framework for Evaluating, Governing, and Orchestrating Agentic AI',
    abstract_de: 'Agentische KI-Systeme planen, nutzen Tools, verwalten Zustand und handeln in mehrstufigen Workflows mit externen Effekten. Dieses Papier trägt eine begrenzte Evidenzsynthese über 24 aktuelle Quellen bei. Der Kernbefund ist eine Governance-to-Action-Closure-Lücke: Evaluation sagt uns, ob Ergebnisse gut waren, Governance definiert, was erlaubt sein sollte, aber keines identifiziert, wo Verpflichtungen an konkrete Aktionen binden. Das Papier führt drei verknüpfte Artefakte ein: ein Vier-Schichten-Framework, einen ODTA-Laufzeit-Placement-Test und ein minimales Action-Evidence-Bundle.',
    abstract_en: 'Agentic AI systems plan, use tools, maintain state, and act across multi-step workflows with external effects. The core finding is a governance-to-action closure gap: evaluation tells us whether outcomes were good, governance defines what should be allowed, but neither identifies where obligations bind to concrete actions. The paper introduces three linked artifacts: a four-layer framework spanning evaluation, governance, orchestration, and assurance; an ODTA runtime-placement test; and a minimum action-evidence bundle for state-changing actions.',
    url_pdf: 'https://arxiv.org/pdf/2604.19818',
    url_abs: 'https://arxiv.org/abs/2604.19818',
  },
  {
    id: 'arXiv:2604.05229',
    date_de: 'April 2026',
    date_en: 'April 2026',
    subjects: 'cs.AI — cs.HC — cs.LG — cs.MA',
    authors: 'Christopher Koch',
    pages: '5 pages, 2 tables',
    title: 'From Governance Norms to Enforceable Controls: A Layered Translation Method for Runtime Guardrails in Agentic AI',
    abstract_de: 'Agentische KI-Systeme erzeugen ein Governance-Problem, das sich materiell von Single-Turn-generativer KI unterscheidet: Wichtige Risiken entstehen während der Ausführung. Governance-Standards wie ISO/IEC 42001, ISO/IEC 23894 und der NIST AI Risk Management Framework sind hochrelevant, liefern aber allein keine implementierbaren Laufzeit-Guardrails. Dieses Papier schlägt eine geschichtete Übersetzungsmethode vor, die Standards-abgeleitete Governance-Ziele mit vier Kontrollebenen verbindet: Governance-Ziele, Design-Constraints, Laufzeit-Vermittlung und Assurance-Feedback.',
    abstract_en: 'Agentic AI systems create a governance problem that differs materially from single-turn generative AI: important risks emerge during execution. Governance standards such as ISO/IEC 42001, ISO/IEC 23894, and the NIST AI Risk Management Framework are highly relevant but do not by themselves yield implementable runtime guardrails. This paper proposes a layered translation method that connects standards-derived governance objectives to four control layers: governance objectives, design-time constraints, runtime mediation, and assurance feedback.',
    url_pdf: 'https://arxiv.org/pdf/2604.05229',
    url_abs: 'https://arxiv.org/abs/2604.05229',
  },
  {
    id: 'arXiv:2603.29681',
    date_de: 'März 2026',
    date_en: 'March 2026',
    subjects: 'cs.AI — cs.HC',
    authors: 'Christopher Koch',
    pages: '',
    title: 'Beyond the Steeper Curve: AI-Mediated Metacognitive Decoupling and the Limits of the Dunning-Kruger Metaphor',
    abstract_de: 'Die Behauptung, dass generative KI einfach den Dunning-Kruger-Effekt verstärkt, ist zu grob, um die verfügbare Evidenz zu erfassen. Die klarsten Befunde deuten stattdessen darauf hin, dass der LLM-Einsatz die beobachtbare Ausgabe und kurzfristige Aufgabenleistung verbessern kann, während die metakognitive Genauigkeit abnimmt. Dieses Papier schlägt das Arbeitsmodell der KI-vermittelten metakognitiven Entkopplung vor: eine sich vergrößernde Lücke zwischen produzierter Ausgabe, zugrunde liegendem Verständnis, Kalibrierungsgenauigkeit und selbst eingeschätzter Fähigkeit.',
    abstract_en: 'The common claim that generative AI simply amplifies the Dunning-Kruger effect is too coarse to capture the available evidence. The clearest findings suggest that LLM use can improve observable output and short-term task performance while degrading metacognitive accuracy. This paper proposes the working model of AI-mediated metacognitive decoupling: a widening gap among produced output, underlying understanding, calibration accuracy, and self-assessed ability.',
    url_pdf: 'https://arxiv.org/pdf/2603.29681',
    url_abs: 'https://arxiv.org/abs/2603.29681',
  },
  {
    id: 'arXiv:2602.20684',
    date_de: 'Februar 2026',
    date_en: 'February 2026',
    subjects: 'cs.SE — cs.AI — cs.MA',
    authors: 'Christopher Koch, Joshua Andreas Wellbrock',
    pages: '9 pages, 2 figures',
    title: 'Agile V: A Compliance-Ready Framework for AI-Augmented Engineering — From Concept to Audit-Ready Delivery',
    abstract_de: 'Aktuelle KI-gestützte Engineering-Workflows haben keinen eingebauten Mechanismus zur Aufrechterhaltung von Task-Level-Verifikation und regulatorischer Rückverfolgbarkeit bei maschinengeschwinder Lieferung. Agile V adressiert diese Lücke durch Einbettung unabhängiger Verifikation und Audit-Artifakt-Generierung in jeden Task-Zyklus. Eine Machbarkeitsfallstudie an einem Hardware-in-the-Loop-System (ca. 500 LOC, 8 Anforderungen, 54 Tests) bestätigt alle drei Hypothesen: Audit-Ready-Dokumentation, 100% Requirement-Level-Pass-Rate und nur 6 Prompts pro Zyklus.',
    abstract_en: 'Current AI-assisted engineering workflows lack a built-in mechanism to maintain task-level verification and regulatory traceability at machine-speed delivery. Agile V addresses this gap by embedding independent verification and audit artifact generation into each task cycle. A feasibility case study on a Hardware-in-the-Loop system (~500 LOC, 8 requirements, 54 tests) supports all three hypotheses: audit-ready documentation, 100% requirement-level pass rate, and only 6 prompts per cycle.',
    url_pdf: 'https://arxiv.org/pdf/2602.20684',
    url_abs: 'https://arxiv.org/abs/2602.20684',
  },
]
</script>

<template>
  <section id="publications" class="section">
    <div class="container">
      <h2 class="section-title">{{ t('publications.title') }}</h2>
      <p class="section-subtitle">{{ t('publications.subtitle') }}</p>
      <div class="pub-list">
        <article v-for="pub in publications" :key="pub.id" class="pub-card">
          <div class="pub-head">
            <span class="pub-id">{{ pub.id }}</span>
            <span class="pub-date">{{ locale === 'de' ? pub.date_de : pub.date_en }}</span>
          </div>
          <h3 class="pub-title">{{ pub.title }}</h3>
          <div class="pub-meta">
            <span class="pub-meta-item">Authors: {{ pub.authors }}</span>
            <span class="pub-meta-item">Subjects: {{ pub.subjects }}</span>
            <span v-if="pub.pages" class="pub-meta-item">{{ pub.pages }}</span>
          </div>
          <p class="pub-abstract-label">Abstract</p>
          <p class="pub-abstract">{{ locale === 'de' ? pub.abstract_de : pub.abstract_en }}</p>
          <div class="pub-links">
            <a :href="pub.url_pdf" target="_blank" rel="noopener" class="pub-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              PDF
            </a>
            <a :href="pub.url_abs" target="_blank" rel="noopener" class="pub-link pub-link-abs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              arXiv
            </a>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-subtitle {
  text-align: center;
  color: var(--color-text-secondary);
  font-family: 'Spectral', Georgia, serif;
  font-size: 0.95rem;
  font-style: italic;
  margin-bottom: 40px;
  margin-top: -16px;
}

.pub-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.pub-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 28px 32px;
  transition: box-shadow var(--transition);
}

.pub-card:hover {
  box-shadow: var(--shadow-md);
}

.pub-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.pub-id {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 500;
  color: var(--color-primary);
  letter-spacing: 0.01em;
}

.pub-title {
  font-family: 'Spectral', Georgia, serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.35;
  margin-bottom: 10px;
  letter-spacing: -0.01em;
}

.pub-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 20px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-border-light);
}

.pub-meta-item {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.pub-abstract-label {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}

.pub-abstract {
  font-family: 'Spectral', Georgia, serif;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.75;
  margin-bottom: 16px;
}

.pub-links {
  display: flex;
  gap: 12px;
}

.pub-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
  padding: 6px 14px;
  border-radius: 6px;
  background: var(--color-primary-light);
  transition: all var(--transition);
}

.pub-link:hover {
  background: var(--color-primary);
  color: white;
}

.pub-link-abs {
  background: var(--color-border-light);
  color: var(--color-text-secondary);
}

.pub-link-abs:hover {
  background: var(--color-border);
  color: var(--color-text);
}

@media (max-width: 640px) {
  .pub-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  .pub-meta {
    flex-direction: column;
    gap: 2px;
  }
  .pub-card {
    padding: 20px;
  }
}

@media (max-width: 800px) {
  .pub-list {
    grid-template-columns: 1fr;
  }
}
</style>
