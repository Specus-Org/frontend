'use client';

import { CountryFlag } from '@/components/aml/country-flag';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function BangladeshPage() {
  return (
    <div className="px-4 py-16 text-center sm:px-6 sm:py-24 md:px-8 md:py-16">
      <span className="inline-flex flex-row gap-1.5 py-2 px-3.5 justify-center border rounded-full mb-6">
        <CountryFlag countryCode="bd" alt="Bangladesh Country Flag" />
        Bangladesh
      </span>
      <h1 className="text-foreground font-rethink mb-3 text-2xl font-semibold sm:text-3xl md:text-4xl lg:text-5xl">
        Macro Procurement Insights
      </h1>
      <p className="text-foreground mx-auto max-w-5xl text-base font-normal sm:text-lg md:text-xl lg:text-2xl">
        Explore a macro view of procurement performance—spending trends, tender activity, supplier
        participation, and market signals in one unified dashboard.
      </p>

      <Tabs defaultValue="semua">
        <TabsList className="mb-6 h-auto w-full justify-start gap-0 overflow-x-auto rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="semua"
            className="text-muted-foreground data-[state=active]:border-brand data-[state=active]:text-foreground rounded-none border-b-2 border-transparent px-4 py-2.5 font-medium shadow-none data-[state=active]:shadow-none"
          >
            Summary
          </TabsTrigger>
          <TabsTrigger
            value="kesempatan-pasar"
            className="text-muted-foreground data-[state=active]:border-brand data-[state=active]:text-foreground rounded-none border-b-2 border-transparent px-4 py-2.5 font-medium shadow-none data-[state=active]:shadow-none"
          >
            Critical Analysis
          </TabsTrigger>
          <TabsTrigger
            value="kompetisi"
            className="text-muted-foreground data-[state=active]:border-brand data-[state=active]:text-foreground rounded-none border-b-2 border-transparent px-4 py-2.5 font-medium shadow-none data-[state=active]:shadow-none"
          >
            Hierarchy Tree
          </TabsTrigger>
          <TabsTrigger
            value="efisiensi-internal"
            className="text-muted-foreground data-[state=active]:border-brand data-[state=active]:text-foreground rounded-none border-b-2 border-transparent px-4 py-2.5 font-medium shadow-none data-[state=active]:shadow-none"
          >
            Profiles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="semua" className="mt-0 space-y-6">
          <p>Test</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BangladeshPage;
