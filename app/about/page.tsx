import { SiteHeader } from '@/components/side-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Eye, Award, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-linear-to-b from-primary/5 via-background to-background py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
                Building Trust in Global Procurement
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Procure Lens was founded on the belief that every organization deserves access to
                comprehensive, reliable compliance intelligence to make informed procurement
                decisions.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-4">
                    <Target className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                  <CardDescription className="text-base leading-relaxed pt-2">
                    To empower organizations worldwide with the intelligence and tools they need to
                    conduct secure, compliant procurement while mitigating financial crime risks. We
                    believe transparency in beneficial ownership and sanctions screening should be
                    accessible to all.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-4">
                    <Eye className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">Our Vision</CardTitle>
                  <CardDescription className="text-base leading-relaxed pt-2">
                    A world where every procurement decision is backed by comprehensive
                    intelligence, creating a transparent ecosystem that deters fraud, corruption,
                    and financial crime. We envision procurement as a force for ethical business
                    practices globally.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Story</h2>

              <div className="prose prose-lg max-w-none space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  Procure Lens was born from firsthand experience with the challenges organizations
                  face in conducting thorough risk assessments on procurement partners. Our founding
                  team witnessed how manual screening processes and fragmented data sources left
                  organizations vulnerable to compliance violations and financial crime.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  We recognized that while authoritative data sources like sanctions lists,
                  procurement fraud databases, and risk intelligence existed, they were scattered
                  across multiple platforms, making comprehensive screening time-consuming and
                  error-prone. Organizations needed a unified platform that could aggregate these
                  critical data sources and deliver actionable procurement intelligence.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  Today, Procure Lens integrates trusted sources including Keyping for public
                  procurement data analysis, Lexicon for procurement fraud intelligence, and
                  advanced analytics through E-PMS to provide procurement teams with instant,
                  comprehensive risk assessments. We`re proud to serve organizations committed to
                  ethical procurement and compliance excellence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Our Core Values</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Award className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Integrity</CardTitle>
                  <CardDescription>
                    We uphold the highest standards of accuracy and transparency in all our data and
                    operations
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Collaboration</CardTitle>
                  <CardDescription>
                    We partner with leading data providers to deliver comprehensive intelligence
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Target className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Innovation</CardTitle>
                  <CardDescription>
                    We continuously evolve our platform to meet emerging compliance challenges
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Eye className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Vigilance</CardTitle>
                  <CardDescription>
                    We maintain constant monitoring to protect organizations from evolving threats
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
