import { SiteHeader } from '@/components/side-header';
import { SiteFooter } from '@/components/site-footer';
import { Globe, Search, TrendingUp, Shield } from 'lucide-react';

const organizations = [
  {
    name: 'Keyping',
    description: 'Decoding public procurement data through collaborative web knowledge graph',
    icon: Globe,
    team: [
      {
        name: 'Dr. Maria Rodriguez',
        role: 'Director of Data Intelligence',
        bio: 'Leading the development of collaborative knowledge graphs for procurement transparency',
      },
      {
        name: 'James Chen',
        role: 'Senior Data Scientist',
        bio: 'Specializes in transnational procurement data analysis and irregularity detection',
      },
      {
        name: 'Sarah Johnson',
        role: 'Research Lead',
        bio: 'Coordinates with journalists and researchers on procurement investigations',
      },
    ],
  },
  {
    name: 'E-PMS',
    description: 'Interactive dashboards for procurement risk visualization',
    icon: TrendingUp,
    team: [
      {
        name: 'Michael Park',
        role: 'Analytics Director',
        bio: 'Expert in procurement risk visualization and business intelligence platforms',
      },
      {
        name: 'Anna Kowalski',
        role: 'Dashboard Architect',
        bio: 'Designs intuitive interfaces for complex procurement analytics',
      },
      {
        name: 'David Okonkwo',
        role: 'Data Engineer',
        bio: 'Builds real-time data pipelines for procurement risk monitoring',
      },
    ],
  },
  {
    name: 'Lexicon',
    description: 'Procurement fraud detection and vendor risk intelligence',
    icon: Search,
    team: [
      {
        name: 'Dr. Emily Watson',
        role: 'Fraud Detection Lead',
        bio: 'PhD in Forensic Analytics, specializes in procurement fraud patterns',
      },
      {
        name: 'Thomas Anderson',
        role: 'Risk Intelligence Manager',
        bio: '15+ years in vendor risk assessment and compliance',
      },
      {
        name: 'Priya Sharma',
        role: 'Intelligence Analyst',
        bio: 'Tracks vendor relationships and corruption indicators globally',
      },
    ],
  },
  {
    name: 'Ojo a Las Sanciones',
    description: 'Sanctions monitoring and compliance intelligence',
    icon: Shield,
    team: [
      {
        name: 'Carlos Mendez',
        role: 'Sanctions Compliance Director',
        bio: 'Expert in international sanctions regimes and enforcement mechanisms',
      },
      {
        name: 'Sofia Ramirez',
        role: 'Compliance Analyst',
        bio: 'Monitors OFAC, UN, EU sanctions lists and regulatory changes',
      },
      {
        name: 'Roberto Silva',
        role: 'AML Specialist',
        bio: 'Focuses on anti-money laundering compliance in procurement',
      },
    ],
  },
];

export default function TeamPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Our Partner Teams</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Procure Lens is powered by expert teams from leading data intelligence organizations
              </p>
            </div>
          </div>
        </section>

        <section className="pb-20 md:pb-32">
          <div className="container mx-auto px-4">
            <div className="space-y-24">
              {organizations.map((org) => (
                <div key={org.name} className="space-y-8">
                  <div className="flex items-start gap-4">
                    <org.icon className="h-12 w-12 mt-1" />
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold">{org.name}</h2>
                      <p className="text-lg text-muted-foreground max-w-2xl">{org.description}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                    {org.team.map((member) => (
                      <div key={member.name} className="space-y-3">
                        <div>
                          <h3 className="text-xl font-semibold">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                        <p className="text-sm leading-relaxed">{member.bio}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
