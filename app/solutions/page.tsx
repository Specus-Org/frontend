import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Shield,
  AlertTriangle,
  Search,
  TrendingUp,
  FileCheck,
  Globe,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { SiteHeader } from '@/components/side-header';

const solutions = [
  {
    icon: Shield,
    title: 'Sanctions Screening',
    description: 'Comprehensive screening against global sanctions lists',
    features: [
      'Real-time OFAC, UN, EU sanctions checking',
      'Automated alert generation',
      'Historical screening records',
      'Continuous monitoring',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'AML Compliance',
    description: 'Advanced anti-money laundering detection',
    features: [
      'PEP (Politically Exposed Persons) identification',
      'Adverse media screening',
      'Transaction pattern analysis',
      'Risk scoring algorithms',
    ],
  },
  {
    icon: Search,
    title: 'Procurement Intelligence',
    description: 'Advanced vendor and contract intelligence',
    features: [
      'Vendor relationship mapping',
      'Contract performance tracking',
      'Procurement pattern analysis',
      'Risk indicator identification',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Risk Analytics',
    description: 'Data-driven procurement insights',
    features: [
      'Interactive E-PMS dashboards',
      'Trend analysis and forecasting',
      'Risk heat mapping',
      'Custom reporting capabilities',
    ],
  },
  {
    icon: FileCheck,
    title: 'Compliance Reporting',
    description: 'Audit-ready documentation',
    features: [
      'Automated report generation',
      'Regulatory compliance templates',
      'Audit trail maintenance',
      'Export to multiple formats',
    ],
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description: 'Worldwide procurement intelligence',
    features: [
      '200+ country coverage',
      'Multi-language support',
      'Local regulatory compliance',
      'International data sources',
    ],
  },
];

export default function SolutionsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-linear-to-b from-primary/5 via-background to-background py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
                Comprehensive Solutions for Procurement Excellence
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                End-to-end compliance intelligence tailored to your organization`s procurement needs
              </p>
            </div>
          </div>
        </section>

        {/* Solutions Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {solutions.map((solution) => (
                <Card
                  key={solution.title}
                  className="border-2 hover:border-primary/50 transition-all"
                >
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-4">
                      <solution.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{solution.title}</CardTitle>
                    <CardDescription className="text-base">{solution.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {solution.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">How Procure Lens Works</h2>
              <p className="text-lg text-muted-foreground">
                Simple, powerful, and automated procurement intelligence in three steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                    1
                  </div>
                  <h3 className="text-xl font-semibold">Upload or Search</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Enter vendor details or upload procurement lists for batch screening
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                    2
                  </div>
                  <h3 className="text-xl font-semibold">Automated Screening</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our platform checks multiple databases instantly for comprehensive risk
                    assessment
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                    3
                  </div>
                  <h3 className="text-xl font-semibold">Actionable Intelligence</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Review detailed reports with risk scores and make informed procurement decisions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Industries */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Industries We Serve</h2>
              <p className="text-lg text-muted-foreground">
                Trusted by organizations across sectors for procurement compliance
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                'Financial Services',
                'Government & Public Sector',
                'Healthcare',
                'Energy & Utilities',
                'Manufacturing',
                'Technology',
                'Retail & E-commerce',
                'Transportation',
              ].map((industry) => (
                <Card key={industry} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <p className="font-medium">{industry}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Started?</h2>
              <p className="text-lg text-muted-foreground">
                Experience the power of comprehensive procurement intelligence
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Schedule Demo
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
