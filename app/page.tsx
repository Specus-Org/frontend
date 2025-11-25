import { SiteHeader } from '@/components/side-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Shield,
  Search,
  Database,
  TrendingUp,
  AlertTriangle,
  FileCheck,
  ArrowRight,
  Lock,
  Zap,
  Globe,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-4 py-24 md:py-32 lg:py-40">
            <div className="mx-auto max-w-4xl space-y-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                Procurement intelligence that prevents risks before they happen
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl">
                Real-time sanctions screening, AML compliance, and procurement fraud detection
                powered by global data sources.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="text-base font-medium h-12 px-8">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base font-medium h-12 px-8 bg-transparent"
                >
                  View Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 md:py-32 border-t">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 max-w-3xl">
              Everything you need for procurement compliance
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              <div className="space-y-3">
                <Shield className="h-10 w-10" />
                <h3 className="text-xl font-semibold">Sanctions Screening</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Real-time screening against global sanctions lists including OFAC, UN, EU, and
                  more
                </p>
              </div>

              <div className="space-y-3">
                <AlertTriangle className="h-10 w-10" />
                <h3 className="text-xl font-semibold">AML Compliance</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Advanced anti-money laundering checks to identify high-risk entities and
                  transactions
                </p>
              </div>

              <div className="space-y-3">
                <Search className="h-10 w-10" />
                <h3 className="text-xl font-semibold">Procurement Intelligence</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Deep insights into vendor relationships, contract patterns, and procurement risk
                  indicators
                </p>
              </div>

              <div className="space-y-3">
                <Database className="h-10 w-10" />
                <h3 className="text-xl font-semibold">Fraud Detection</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Identify entities with history of fraud and corruption using comprehensive
                  databases
                </p>
              </div>

              <div className="space-y-3">
                <TrendingUp className="h-10 w-10" />
                <h3 className="text-xl font-semibold">Risk Analytics</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Visualize procurement trends and risk patterns with interactive E-PMS dashboards
                </p>
              </div>

              <div className="space-y-3">
                <FileCheck className="h-10 w-10" />
                <h3 className="text-xl font-semibold">Vendor Risk Profiles</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Comprehensive vendor assessments with historical performance data and risk scoring
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Sources Section */}
        <section className="py-20 md:py-32 border-t">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered by authoritative data</h2>
            <p className="text-xl text-muted-foreground mb-16 max-w-2xl">
              We integrate with leading global databases to provide comprehensive procurement
              intelligence
            </p>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl">
              <Card className="border-2">
                <CardHeader className="space-y-4">
                  <Globe className="h-12 w-12" />
                  <div>
                    <CardTitle className="text-2xl mb-2">Keyping</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Decodes public procurement data through a collaborative web knowledge graph
                      for citizens, journalists, and researchers
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-2">
                <CardHeader className="space-y-4">
                  <Search className="h-12 w-12" />
                  <div>
                    <CardTitle className="text-2xl mb-2">Lexicon</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Procurement fraud detection and vendor risk intelligence database
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-2">
                <CardHeader className="space-y-4">
                  <TrendingUp className="h-12 w-12" />
                  <div>
                    <CardTitle className="text-2xl mb-2">E-PMS</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Interactive dashboards for procurement risk visualization and trends
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </div>

            <div className="mt-12">
              <Link href="/data-sources">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base font-medium bg-transparent"
                >
                  Learn more about our data sources
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 md:py-32 border-t">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div className="space-y-12">
                <div className="space-y-4">
                  <Zap className="h-10 w-10" />
                  <h3 className="text-2xl font-semibold">Instant risk assessment</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Screen vendors in seconds with automated checks across multiple databases
                  </p>
                </div>

                <div className="space-y-4">
                  <Lock className="h-10 w-10" />
                  <h3 className="text-2xl font-semibold">Regulatory compliance</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Meet AML, KYC, and sanctions compliance requirements with confidence
                  </p>
                </div>

                <div className="space-y-4">
                  <FileCheck className="h-10 w-10" />
                  <h3 className="text-2xl font-semibold">Audit-ready documentation</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Generate comprehensive reports for audits and regulatory reviews
                  </p>
                </div>
              </div>

              <div className="lg:pl-12">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="text-6xl font-bold">95%</div>
                    <p className="text-xl">
                      Risk reduction reported by organizations using Procure Lens
                    </p>
                  </div>
                  <div className="space-y-2 pt-8 border-t">
                    <div className="text-3xl font-bold">&lt; 2 seconds</div>
                    <p className="text-lg text-muted-foreground">Average vendor screening time</p>
                  </div>
                  <div className="space-y-2 pt-8 border-t">
                    <div className="text-3xl font-bold">24/7</div>
                    <p className="text-lg text-muted-foreground">Real-time monitoring and alerts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 border-t">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">
                Start protecting your procurement process today
              </h2>
              <p className="text-xl text-muted-foreground">
                Join organizations worldwide using Procure Lens for smarter, safer procurement
                decisions
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="text-base font-medium h-12 px-8">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base font-medium h-12 px-8 bg-transparent"
                >
                  Contact Sales
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
