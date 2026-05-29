import { ref, inject, provide, readonly } from 'vue'

const LOCALE_KEY = 'kochcodes-locale'

const locale = ref(localStorage.getItem(LOCALE_KEY) || 'de')

function setLocale(l) {
  locale.value = l
  localStorage.setItem(LOCALE_KEY, l)
}

const de = {
  nav: {
    about: 'Über mich',
    experience: 'Erfahrung',
    publications: 'Publikationen',
    impressum: 'Impressum',
  },
  hero: {
    claim_line1: 'Vertrauen durch Engineering',
    claim_line2: 'von Firmware bis zu autonomer KI',
    title: 'Lead Engineer @ M-Trust™ · Agentic AI Researcher',
    tagline: 'Embedded Systems & Agentic AI — Zuverlässigkeit, Sicherheit und Intelligenz für vernetzte Systeme',
    linkedin: 'LinkedIn',
    email: 'E-Mail',
    scroll: 'Nach unten scrollen',
  },
  about: {
    title: 'Über mich',
    p1: 'Technologieführer mit Expertise in Embedded Systems, Cloud-Architektur, KI-Engineering und digitaler Transformation. Ich arbeite über den gesamten Technologiestack — von Low-Level-Firmware und Hardware-Prototyping über Cloud-Plattformen wie AWS, Azure und Palantir Foundry bis hin zu KI-gestützten Systemen und sicherer Architektur.',
    p2: 'Ich leite und orchestriere ein großes Team von KI-Agenten in verschiedenen technischen Bereichen und nutze sie, um Entwicklung, Forschung, Automatisierung, Dokumentation und Problemlösung zu beschleunigen. Darüber hinaus arbeite ich als unabhängiger Forscher im Bereich Agentic AI und erforsche Multi-Agenten-Systeme, autonome Workflows und KI-gesteuertes Engineering.',
    p3: 'Mein Fokus liegt auf dem Bau zuverlässiger, skalierbarer und wartbarer Systeme — von eingebetteten Geräten bis hin zu Cloud-Infrastruktur und autonomer Intelligenz — insbesondere in regulierten Technologieumgebungen.',
    skills_title: 'Skills & Kompetenzen',
    languages_title: 'Sprachen',
  },
  skills: [
    'Embedded Systems', 'Firmware (C/C++)', 'Hardware Design',
    'AI / Agentic AI', 'AWS', 'Azure', 'Palantir Foundry',
    'System Architecture', 'Cloud Platform Engineering',
    'Cryptography & Security', 'SDK Integration', 'Prototyping',
    'Team Leadership', 'Negotiation', 'Delegation',
  ],
  languages: [
    { name: 'Deutsch', level: 'Muttersprache' },
    { name: 'Englisch', level: 'Fließend (C1)' },
    { name: 'Französisch', level: 'Grundkenntnisse' },
  ],
  experience: {
    title: 'Berufserfahrung',
    roles: [
      {
        company: 'Merck Group',
        location: 'Darmstadt',
        positions: [
          {
            title: 'Lead Engineer | M-Trust™ | Science & Technology',
            period: 'Dez. 2023 – heute',
            description: 'End-to-End-Entwicklung eingebetteter Systeme, Hardware/Software-Prototyping, sichere Systemarchitektur mit Kryptografie und digitalen Signaturen. Beschleunigung von Prototyp-zu-Pro-Produkt-Übergängen in regulierten Industrien.',
          },
          {
            title: 'Senior Data Engineer | Palantir Foundry Architect',
            period: 'Jan. 2022 – Dez. 2023',
            description: 'Technische Leitung der Plattformentwicklung, enge Zusammenarbeit mit dem Engineering-Team, Entwicklung kundenspezifischer Tools und Integrationen für Datenpipelines, Analytics und Visualisierung.',
          },
          {
            title: 'Leader of the Makerspace | Innovation Center',
            period: 'Nov. 2020 – Jan. 2022',
            description: 'Leitung des Makerspace im Merck Innovation Center. Beratung von Multi-Millionen-Dollar-Innovationsprojekten in Informatik und Engineering, Bau von Prototypen für zukünftige Technologien.',
          },
          {
            title: 'Innovation Manager | Innovation Center',
            period: 'März 2019 – Nov. 2020',
            description: 'Leitung und Unterstützung mehrerer Innovationsprojekte in den Bereichen Informatik und Engineering, Entwicklung und Bau erster Prototypen.',
          },
          {
            title: 'Consulting Expert Electronics & Digitalisation',
            period: 'Sep. 2018 – Feb. 2019',
            description: 'Beratung für die vielversprechendsten Ideen zur Entwicklung zukünftiger Leittechnologien im Merck Innovation Center.',
          },
        ],
      },
      {
        company: 'Wingcopter',
        location: 'Frankfurt',
        positions: [
          {
            title: 'Chief Systems Engineer',
            period: 'Dez. 2017 – Juli 2018',
            description: 'Entwicklung von Hardware und Software für unbemannte Luftfahrzeuge.',
          },
          {
            title: 'R&D Engineer',
            period: 'Aug. 2017 – Dez. 2017',
            description: 'Forschung und Entwicklung im Bereich Luftfahrzeugtechnik.',
          },
        ],
      },
      {
        company: 'Bosch',
        location: 'Reutlingen / Renningen',
        positions: [
          {
            title: 'Masterand | Automotive Electronics InnoLab',
            period: 'März 2017 – Aug. 2017',
            description: 'Forschung und Entwicklung: Kollisionsvermeidung für autonome fliegende Robotersysteme.',
          },
          {
            title: 'Bachelorand | Forschung & Vorausentwicklung',
            period: 'Okt. 2014 – März 2015',
            description: 'Entwicklung und Implementierung einer generischen Lichtanimations-Beschreibungssprache und der zugehörigen Hardware für mobile Roboter.',
          },
          {
            title: 'Studentenpraktikum | Forschung & Vorausentwicklung',
            period: 'Aug. 2013 – Jan. 2014',
            description: 'Programmierung der Bewegung und des Verhaltens mobiler Roboter für Mensch-Maschine-Interaktionsstudien.',
          },
        ],
      },
      {
        company: 'koch.codes',
        location: 'Stuttgart',
        positions: [
          {
            title: 'Founder',
            period: 'Juli 2011 – Aug. 2017',
            description: 'Eigenes Web-Business während des Studiums mit Übernahme aller notwendigen Funktionen.',
          },
        ],
      },
      {
        company: 'Hochschule Albstadt-Sigmaringen',
        location: 'Albstadt',
        positions: [
          {
            title: 'R&D Assistant',
            period: 'Okt. 2016 – Feb. 2017',
            description: 'Algorithmenentwicklung zum effizienten Lernen technischer Prozesse mit künstlichen neuronalen Netzen und automatischer Generierung von SystemC-Modulen.',
          },
          {
            title: 'R&D Student',
            period: 'April 2016 – Sep. 2016',
            description: 'Vorbereitung von Testobjekten für die Digitalforensik-Prüfungen des Bundeskriminalamts.',
          },
        ],
      },
    ],
  },
  publications: {
    title: 'Publikationen',
    subtitle: 'Aktuelle Forschung im Bereich Agentic AI, Cybersicherheit und KI-gestütztes Engineering',
    link_label: 'PDF ansehen →',
  },
  awards: {
    title: 'Auszeichnungen',
  },
  certifications: {
    title: 'Zertifikate',
  },
  impressum: {
    title: 'Impressum',
    info_title: 'Angaben gemäß § 5 TMG',
    contact: 'Kontakt',
    phone: 'Telefon: +49 172 891 5161',
    liability_content_title: 'Haftung für Inhalte',
    liability_content_1: 'Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.',
    liability_content_2: 'Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.',
    liability_links_title: 'Haftung für Links',
    liability_links_1: 'Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.',
    liability_links_2: 'Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.',
    copyright_title: 'Urheberrecht',
    copyright_1: 'Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.',
    copyright_2: 'Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.',
  },
}

const en = {
  nav: {
    about: 'About',
    experience: 'Experience',
    publications: 'Publications',
    impressum: 'Legal Notice',
  },
  hero: {
    claim_line1: 'Engineering trust',
    claim_line2: 'from firmware to autonomous AI',
    title: 'Lead Engineer @ M-Trust™ · Agentic AI Researcher',
    tagline: 'Embedded Systems & Agentic AI — building reliable, secure, and intelligent systems for a connected world',
    linkedin: 'LinkedIn',
    email: 'Email',
    scroll: 'Scroll down',
  },
  about: {
    title: 'About Me',
    p1: 'Technology leader with expertise in embedded systems, cloud architecture, AI engineering, and digital transformation. I work across the full technology stack — from low-level firmware and hardware prototyping to cloud platforms including AWS, Azure, and Palantir Foundry, through to AI-powered systems and secure architecture.',
    p2: 'I lead and orchestrate a large team of AI agents across various technical domains, using them to accelerate development, research, automation, documentation, and problem-solving. Additionally, I work as an independent researcher in the field of Agentic AI, exploring multi-agent systems, autonomous workflows, and AI-driven engineering.',
    p3: 'My focus is on building reliable, scalable, and maintainable systems — from embedded devices to cloud infrastructure and autonomous intelligence — especially in regulated technology environments.',
    skills_title: 'Skills & Competencies',
    languages_title: 'Languages',
  },
  skills: [
    'Embedded Systems', 'Firmware (C/C++)', 'Hardware Design',
    'AI / Agentic AI', 'AWS', 'Azure', 'Palantir Foundry',
    'System Architecture', 'Cloud Platform Engineering',
    'Cryptography & Security', 'SDK Integration', 'Prototyping',
    'Team Leadership', 'Negotiation', 'Delegation',
  ],
  languages: [
    { name: 'German', level: 'Native' },
    { name: 'English', level: 'Fluent (C1)' },
    { name: 'French', level: 'Elementary' },
  ],
  experience: {
    title: 'Experience',
    roles: [
      {
        company: 'Merck Group',
        location: 'Darmstadt',
        positions: [
          {
            title: 'Lead Engineer | M-Trust™ | Science & Technology',
            period: 'Dec 2023 – Present',
            description: 'End-to-end embedded systems development, hardware/software prototyping, secure system architecture with cryptography and digital signatures. Accelerating prototype-to-product transitions in regulated industries.',
          },
          {
            title: 'Senior Data Engineer | Palantir Foundry Architect',
            period: 'Jan 2022 – Dec 2023',
            description: 'Technical lead for platform development, close collaboration with the engineering team, development of custom tools and integrations for data pipelines, analytics, and visualization.',
          },
          {
            title: 'Leader of the Makerspace | Innovation Center',
            period: 'Nov 2020 – Jan 2022',
            description: 'Led the Makerspace at the Merck Innovation Center. Consulted on multi-million-dollar innovation projects in informatics and engineering, building prototypes for future technologies.',
          },
          {
            title: 'Innovation Manager | Innovation Center',
            period: 'Mar 2019 – Nov 2020',
            description: 'Led and supported multiple innovation projects in computer science and engineering, developing and building first prototypes.',
          },
          {
            title: 'Consulting Expert Electronics & Digitalisation',
            period: 'Sep 2018 – Feb 2019',
            description: 'Consulted on the most promising ideas for developing future leading technologies at the Merck Innovation Center.',
          },
        ],
      },
      {
        company: 'Wingcopter',
        location: 'Frankfurt',
        positions: [
          {
            title: 'Chief Systems Engineer',
            period: 'Dec 2017 – Jul 2018',
            description: 'Hardware and software development for unmanned aerial vehicles.',
          },
          {
            title: 'R&D Engineer',
            period: 'Aug 2017 – Dec 2017',
            description: 'Research and development in aerospace engineering.',
          },
        ],
      },
      {
        company: 'Bosch',
        location: 'Reutlingen / Renningen',
        positions: [
          {
            title: 'Master Thesis | Automotive Electronics InnoLab',
            period: 'Mar 2017 – Aug 2017',
            description: 'Research and development: collision avoidance for autonomous flying robotic systems.',
          },
          {
            title: 'Bachelor Thesis | Advanced Development',
            period: 'Oct 2014 – Mar 2015',
            description: 'Development and implementation of a generic light-animation description language and corresponding hardware for mobile robots.',
          },
          {
            title: 'Student Intern | Advanced Development',
            period: 'Aug 2013 – Jan 2014',
            description: 'Programming movement and behavior of mobile robots for human-machine interaction studies.',
          },
        ],
      },
      {
        company: 'koch.codes',
        location: 'Stuttgart',
        positions: [
          {
            title: 'Founder',
            period: 'Jul 2011 – Aug 2017',
            description: 'Ran my own web business during university, handling all necessary functions.',
          },
        ],
      },
      {
        company: 'Albstadt-Sigmaringen University',
        location: 'Albstadt',
        positions: [
          {
            title: 'R&D Assistant',
            period: 'Oct 2016 – Feb 2017',
            description: 'Algorithm development for efficiently learning technical processes using artificial neural networks and automatic generation of SystemC modules.',
          },
          {
            title: 'R&D Student',
            period: 'Apr 2016 – Sep 2016',
            description: 'Preparation of test objects for digital forensics examinations of the Federal Criminal Police Office.',
          },
        ],
      },
    ],
  },
  publications: {
    title: 'Publications',
    subtitle: 'Current research in Agentic AI, cybersecurity, and AI-augmented engineering',
    link_label: 'View PDF →',
  },
  awards: {
    title: 'Awards',
  },
  certifications: {
    title: 'Certifications',
  },
  impressum: {
    title: 'Legal Notice',
    info_title: 'Information according to § 5 TMG',
    contact: 'Contact',
    phone: 'Phone: +49 172 891 5161',
    liability_content_title: 'Liability for Content',
    liability_content_1: 'As a service provider, we are responsible for our own content on these pages in accordance with general laws, pursuant to § 7 para.1 TMG. However, pursuant to §§ 8 to 10 TMG, we are not obligated as a service provider to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.',
    liability_content_2: 'Obligations to remove or block the use of information under general laws remain unaffected. However, liability in this regard is only possible from the point in time at which a specific legal violation becomes known. If we become aware of any such legal violations, we will remove the relevant content immediately.',
    liability_links_title: 'Liability for Links',
    liability_links_1: 'Our offer contains links to external third-party websites over whose content we have no influence. Therefore, we cannot assume any liability for this external content. The respective provider or operator of the linked pages is always responsible for their content. The linked pages were checked for possible legal violations at the time of linking. Illegal content was not discernible at the time of linking.',
    liability_links_2: 'However, permanent monitoring of the linked pages is unreasonable without concrete evidence of a legal violation. If we become aware of legal violations, we will remove such links immediately.',
    copyright_title: 'Copyright',
    copyright_1: 'The content and works created by the site operators on these pages are subject to German copyright law. Duplication, processing, distribution, and any form of commercialization of such material beyond the scope of copyright law shall require the prior written consent of the respective author or creator. Downloads and copies of this page are only permitted for private, non-commercial use.',
    copyright_2: 'Insofar as the content on this page was not created by the operator, the copyrights of third parties are respected. In particular, third-party content is identified as such. Should you nevertheless become aware of a copyright infringement, please notify us accordingly. Upon becoming aware of legal violations, we will remove such content immediately.',
  },
}

const messages = { de, en }

function t(key) {
  const keys = key.split('.')
  let value = messages[locale.value]
  for (const k of keys) {
    if (value === undefined || value === null) return key
    value = value[k]
  }
  return value ?? key
}

export function useI18n() {
  return {
    locale: readonly(locale),
    setLocale,
    t,
  }
}
