export interface HeroMetric {
  value: string;
  label: string;
  description: string;
}

export interface Principle {
  name: string;
  description: string;
}

export interface Solution {
  title: string;
  description: string;
  bullets: string[];
}

export interface WorkflowStep {
  step: string;
  title: string;
  description: string;
}

export interface RoadmapQuarter {
  quarter: string;
  focus: string;
  milestones: string[];
}

export interface ContactLink {
  label: string;
  href: string;
  external?: boolean;
}

export const landingContent = {
  announcement: 'Trusted procurement intelligence for secure, compliant vendor decisions',
  heroTitle: 'Build ethical procurement with intelligence you can verify',
  heroDescription:
    'Specus helps procurement and compliance teams screen vendors, surface risk signals, and document defensible decisions with sanctions data, AML intelligence, and procurement analytics in one workflow.',
  mission:
    'To empower organizations worldwide with the intelligence and tools they need to conduct secure, compliant procurement while mitigating financial crime risks.',
  vision:
    'A world where every procurement decision is backed by comprehensive intelligence, creating a transparent ecosystem that deters fraud, corruption, and financial crime.',
  slogan:
    "Let's build the future of ethical procurement with trusted sanctions screening, AML compliance, and procurement intelligence in one platform.",
  heroMetrics: [
    {
      value: '3+',
      label: 'Countries covered',
      description:
        'Coverage that supports global supplier due diligence and local compliance needs.',
    },
    {
      value: '3',
      label: 'Integrated data sources',
      description: 'Keyping, Lexicon, and E-PMS connected for multi-source risk assessment.',
    },
    {
      value: '<5s',
      label: 'Screening speed',
      description: 'Fast results that keep procurement reviews moving without losing rigor.',
    },
  ] satisfies HeroMetric[],
  principles: [
    {
      name: 'Integrity',
      description:
        'Maintain the highest standards of accuracy and transparency across data, scoring, and audit trails.',
    },
    {
      name: 'Collaboration',
      description:
        'Partner with trusted data providers so every decision draws from broader, deeper intelligence.',
    },
    {
      name: 'Innovation',
      description:
        'Continuously evolve the platform to meet emerging compliance and financial-crime challenges.',
    },
    {
      name: 'Vigilance',
      description:
        'Monitor vendors continuously so teams can detect change before it becomes operational risk.',
    },
  ] satisfies Principle[],
  solutions: [
    {
      title: 'Sanction Screening',
      description: 'Screen entities against the sanctions sources procurement teams rely on most.',
      bullets: [
        'Real-time OFAC, UN, and EU checks',
        'Automated alerts for status changes',
        'Continuous monitoring after onboarding',
        'Historical records for defensible review trails',
      ],
    },
    {
      title: 'AML Compliance',
      description: 'Strengthen vendor due diligence with AML-focused risk detection.',
      bullets: [
        'PEP identification',
        'Adverse media screening',
        'Transaction pattern analysis',
        'Risk scoring for faster escalation decisions',
      ],
    },
    {
      title: 'Procurement Intelligence',
      description:
        'Bring procurement context into compliance review so decisions reflect operational reality.',
      bullets: [
        'Vendor relationship mapping',
        'Contract performance tracking',
        'Risk indicator identification',
        'Cross-vendor signal analysis',
      ],
    },
    {
      title: 'Risk Analytics',
      description: 'Turn complex screening output into signals leaders can act on quickly.',
      bullets: [
        'Interactive E-PMS dashboards',
        'Trend analysis and forecasting',
        'Risk heat mapping',
        'Custom reporting views',
      ],
    },
    {
      title: 'Compliance Reporting',
      description: 'Document the why behind every approval, escalation, and exception path.',
      bullets: [
        'Automated report generation',
        'Regulatory templates',
        'Audit trail maintenance',
        'Multi-format export',
      ],
    },
    {
      title: 'Global Coverage',
      description: 'Operate across regions with coverage that matches modern supplier networks.',
      bullets: [
        '3+ country coverage',
        'Multi-language support',
        'Local regulatory compliance alignment',
        'International intelligence sources',
      ],
    },
  ] satisfies Solution[],
  workflow: [
    {
      step: '01',
      title: 'Search vendor details',
      description: 'Start with the supplier information you already have, vendor name.',
    },
    {
      step: '02',
      title: 'Run automated multi-source screening',
      description:
        'Specus checks Keyping, Lexicon, and E-PMS instantly to build a 360-degree risk view from multiple authoritative sources.',
    },
    {
      step: '03',
      title: 'Review actionable intelligence',
      description:
        'Teams receive risk scores, heat maps, compliance context, and supporting records to guide procurement decisions confidently.',
    },
  ] satisfies WorkflowStep[],
  roadmap: [
    {
      quarter: 'Q1 2026',
      focus: 'Platform launch and early enterprise traction',
      milestones: [
        'Launch e-Procurement Module (GA)',
        'Onboard 10 new enterprise clients',
        'ProcureLens v2.0 with a new compliance UI',
      ],
    },
    {
      quarter: 'Q2 2026',
      focus: 'Expansion across integrations and go-to-market capacity',
      milestones: [
        'Vendor Marketplace beta launch',
        'SAP and Oracle ERP integrations',
        'Expand the Sales and Engineering team',
      ],
    },
    {
      quarter: 'Q3 2026',
      focus: 'Regional growth and intelligent automation',
      milestones: [
        'AI Spend Assistant early access',
        'Regional expansion into Malaysia and the Philippines',
        'ISO 27001 certification',
      ],
    },
    {
      quarter: 'Q4 2026',
      focus: 'Scale the platform and business for the next stage',
      milestones: [
        'AI Spend Assistant GA release',
        'Series A fundraising close',
        'Hit 2026 ARR milestone',
      ],
    },
  ] satisfies RoadmapQuarter[],
  trustedSources: ['Keyping', 'Lexicon', 'E-PMS'],
  contactLinks: [
    {
      label: 'Contact Specus',
      href: 'mailto:hello@specus.org',
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/company/specus-placeholder',
      external: true,
    },
  ] satisfies ContactLink[],
} as const;
