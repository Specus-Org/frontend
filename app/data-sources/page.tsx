import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  Search,
  TrendingUp,
  ExternalLink,
  Shield,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { SiteHeader } from '@/components/side-header';

export default function DataSourcesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-linear-to-b from-primary/5 via-background to-background py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
                Powered by Trusted Global Data Sources
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Procure Lens integrates authoritative databases to deliver comprehensive, reliable
                procurement intelligence
              </p>
            </div>
          </div>
        </section>

        {/* Main Data Sources */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="space-y-12 max-w-5xl mx-auto">
              {/* Keyping */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Globe className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl mb-2">Keyping</CardTitle>
                        <CardDescription className="text-base">
                          Public procurement intelligence through collaborative knowledge graph
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    Keyping decodes public procurement data to provide access to citizens,
                    journalists, researchers, and government leaders. It simplifies the analysis of
                    national and transnational information, making it easier to identify potential
                    irregularities. It utilizes a collaborative web knowledge graph.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Coverage
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Public procurement data globally
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Transnational contract information
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Irregularity detection patterns
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Collaborative knowledge graph
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Database className="h-4 w-4 text-primary" />
                        Use Cases
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Procurement transparency analysis
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Contract pattern identification
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Investigative journalism
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Government oversight
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" asChild>
                      <a href="https://keyping.org" target="_blank" rel="noopener noreferrer">
                        Visit Keyping
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Lexicon */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Search className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl mb-2">Lexicon</CardTitle>
                        <CardDescription className="text-base">
                          Fraud and corruption detection through procurement intelligence
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    Lexicon provides comprehensive procurement intelligence that helps procurement
                    officials quickly identify vendors, contractors, or companies with a history of
                    fraud and corruption. Their advanced search capabilities reveal hidden risks and
                    procurement-related red flags across global markets.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Coverage
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Global procurement fraud databases
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Vendor relationship networks
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Contract fraud history
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Corruption indicators
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Database className="h-4 w-4 text-primary" />
                        Use Cases
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Vendor background verification
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Procurement fraud detection
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Contract risk assessment
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Supplier integrity checks
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" asChild>
                      <a
                        href="https://beneficialowner.lexicon.id"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit Lexicon
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* E-PMS */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <TrendingUp className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl mb-2">E-PMS</CardTitle>
                        <CardDescription className="text-base">
                          Interactive procurement risk visualization and trend analysis
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    Our integrated E-PMS dashboards transform raw compliance data into actionable
                    insights. Visualize procurement trends, risk patterns, and compliance metrics
                    through interactive, customizable analytics.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Features
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Real-time data visualization
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Custom report builder
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Risk heat mapping
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Trend forecasting
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Database className="h-4 w-4 text-primary" />
                        Insights
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Procurement spending patterns
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Risk concentration analysis
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Compliance metrics tracking
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          Geographic risk mapping
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" asChild>
                      <a
                        href="https://app.powerbi.com/view?r=eyJrIjoiZTFkNTRkYjAtODc4YS00NDhhLTkyZTEtMzhhMzIxMGVmYzQwIiwidCI6ImNmNTEzOWVlLTM5ZmItNGMwMS05NDkzLTJhYjVjYjZiMjY1MiIsImMiOjEwfQ%3D%3D"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Sample Dashboard
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Integration Benefits */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Integrated Intelligence</h2>
              <p className="text-lg text-muted-foreground">
                The power of Procure Lens comes from seamlessly combining these authoritative
                sources
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-4xl font-bold text-primary">360°</div>
                  <h3 className="font-semibold">Complete View</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive risk assessment from multiple authoritative sources
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-4xl font-bold text-primary">{'<5s'}</div>
                  <h3 className="font-semibold">Instant Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Rapid screening across all databases with immediate insights
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-4xl font-bold text-primary">24/7</div>
                  <h3 className="font-semibold">Continuous Monitoring</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time updates and alerts when new risks are identified
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
