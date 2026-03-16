'use client';

import { useEffect, useState } from 'react';
import { CountryFlag } from '@/components/aml/country-flag';
import {
  DoughnutChartSection,
  DrillDownNetworkSection,
  LineChartSection,
  NetworkNode,
  PieChartSection,
  VisualChartSection,
  type DataPoint,
} from '@/components/charts';
import HorizontalDivider from '@/components/horizontal-divider';
import { StatCard } from '@/components/insight/stat-card';
import { ProfileAccordion } from '@/components/profiles';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatMoney, shortenNumber } from '@/lib/helper';

// ─── column definitions stay here (contain render functions, not serialisable) ─
type ProcuringEntityRow = { method: string; status: string; amount: number };

const procuringEntityColumns = [
  { key: 'method' as const, header: 'Method' },
  { key: 'status' as const, header: 'Status' },
  {
    key: 'amount' as const,
    header: 'Amount',
    align: 'right' as const,
    render: (value: unknown) => `$${(value as number).toFixed(2)}`,
  },
];

// ─── fetched data shape ────────────────────────────────────────────────────────
interface BangladeshData {
  typeOfWork: DataPoint[];
  byYear: DataPoint[];
  pieTypeOfWork: DataPoint[];
  monthlyTrend: DataPoint[];
  procurementMethod: DataPoint[];
  procuringEntity: ProcuringEntityRow[];
  networkHierarchy: NetworkNode;
}

const BASE = '/data/bangladesh';

async function fetchBangladeshData(): Promise<BangladeshData> {
  const [
    typeOfWork,
    byYear,
    pieTypeOfWork,
    monthlyTrend,
    procurementMethod,
    procuringEntity,
    networkHierarchy,
  ] = await Promise.all([
    fetch(`${BASE}/chart-type-of-work.json`).then((r) => r.json()),
    fetch(`${BASE}/chart-by-year.json`).then((r) => r.json()),
    fetch(`${BASE}/chart-pie-type-of-work.json`).then((r) => r.json()),
    fetch(`${BASE}/chart-monthly-trend.json`).then((r) => r.json()),
    fetch(`${BASE}/chart-procurement-method.json`).then((r) => r.json()),
    fetch(`${BASE}/table-procuring-entity.json`).then((r) => r.json()),
    fetch(`${BASE}/network-hierarchy.json`).then((r) => r.json()),
  ]);

  return {
    typeOfWork,
    byYear,
    pieTypeOfWork,
    monthlyTrend,
    procurementMethod,
    procuringEntity,
    networkHierarchy,
  };
}

// ─── page ──────────────────────────────────────────────────────────────────────
function BangladeshPage() {
  const [data, setData] = useState<BangladeshData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBangladeshData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-4 py-16 text-center sm:px-6 sm:py-24 md:px-8 md:py-16 max-w-5xl mx-auto">
      <span className="inline-flex flex-row gap-1.5 py-2 px-3.5 justify-center border rounded-full mb-6">
        <CountryFlag countryCode="bd" alt="Bangladesh Country Flag" />
        Bangladesh
      </span>
      <h1 className="text-foreground font-rethink mb-3 text-2xl font-semibold sm:text-3xl md:text-4xl lg:text-5xl">
        Macro Procurement Insights
      </h1>
      <p className="text-foreground mx-auto text-base font-normal sm:text-lg md:text-xl lg:text-2xl mb-10">
        Explore a macro view of procurement performance—spending trends, tender activity, supplier
        participation, and market signals in one unified dashboard.
      </p>

      <Tabs defaultValue="semua">
        <TabsList className="mb-6 w-full justify-start gap-0 overflow-hidden rounded-lg bg-secondary p-1">
          <TabsTrigger value="semua" className="h-auto cursor-pointer my-2 shadow-none">
            Summary
          </TabsTrigger>
          <TabsTrigger value="kesempatan-pasar" className="h-auto cursor-pointer my-2 shadow-none">
            Critical Analysis
          </TabsTrigger>
          <TabsTrigger value="kompetisi" className="h-auto cursor-pointer my-2 shadow-none">
            Hierarchy Tree
          </TabsTrigger>
          <TabsTrigger
            value="efisiensi-internal"
            className="h-auto cursor-pointer my-2 shadow-none"
          >
            Profiles
          </TabsTrigger>
        </TabsList>

        {/* ── Summary ─────────────────────────────────────────────────────── */}
        <TabsContent value="semua" className="mt-0 space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end border-muted border rounded-xl">
            <StatCard
              label={'Total Number of Contracts'}
              value={shortenNumber(237286)}
              loading={false}
            />
            <HorizontalDivider />
            <StatCard
              label={'Total Awarded Contract Value'}
              value={formatMoney(256_000_000_000_000)}
              loading={false}
            />
            <HorizontalDivider />
            <StatCard label={'Average Tender Period'} value={14.54} loading={false} />
            <HorizontalDivider />
            <StatCard label={'Average Contract Period'} value={233.0} loading={false} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-4">
            <VisualChartSection
              title="Total Contract Value by Type of Work"
              subtitle="Spending is distributed across different types of work."
              loading={loading}
              data={data?.typeOfWork ?? []}
            />
            <VisualChartSection
              title="Total Contract Value by Year"
              subtitle="Procurement spending changes over time."
              loading={loading}
              data={data?.byYear ?? []}
            />
          </div>

          <LineChartSection
            title="Monthly Contract Value Trend"
            subtitle="How procurement spending shifted across each month of the year."
            loading={loading}
            data={data?.monthlyTrend ?? []}
            valueFormatter={formatMoney}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-4">
            <PieChartSection
              title="Total Contract Value by Type of Work"
              subtitle="Spending is distributed across different types of work."
              loading={loading}
              data={data?.pieTypeOfWork ?? []}
            />
            <DoughnutChartSection
              title="Total Contract Value by Procurement Method"
              subtitle="Contracts are awarded using several procurement methods."
              loading={loading}
              data={data?.procurementMethod ?? []}
              centerLabel={'256T\nTotal Value'}
            />
          </div>
        </TabsContent>

        {/* ── Critical Analysis ────────────────────────────────────────────── */}
        <TabsContent value="kesempatan-pasar" className="mt-0 space-y-6">
          <p>Test</p>
        </TabsContent>

        {/* ── Hierarchy Tree ───────────────────────────────────────────────── */}
        <TabsContent value="kompetisi" className="mt-0 space-y-6">
          {data?.networkHierarchy ? (
            <DrillDownNetworkSection
              title="Procurement Hierarchy Network"
              subtitle="Explore how contract value is distributed across government agencies and their top contractors. Orange curves reveal companies operating across multiple agencies. Click any dashed-ring node to drill down."
              loading={false}
              data={data.networkHierarchy}
              valueFormatter={formatMoney}
            />
          ) : (
            <DrillDownNetworkSection
              title="Procurement Hierarchy Network"
              subtitle="Loading network data…"
              loading={true}
              data={{ id: 'root', label: 'Bangladesh', value: 0, percentage: 100, color: '#e0e7ff' }}
            />
          )}
        </TabsContent>

        {/* ── Profiles ─────────────────────────────────────────────────────── */}
        <TabsContent value="efisiensi-internal" className="mt-0 space-y-6">
          <ProfileAccordion
            items={[
              {
                value: 'procuring-entity',
                image: null,
                title: 'Procuring Entity Profiles',
                subtitle: 'A complete overview of all registered procuring entities.',
                content: (
                  <DataTable
                    columns={procuringEntityColumns}
                    data={data?.procuringEntity ?? []}
                  />
                ),
              },
              {
                value: 'contractor',
                image: null,
                title: 'Contractor Profiles',
                subtitle: 'A complete overview of all registered contractors.',
                content: <p className="text-muted-foreground">Contractor data will appear here.</p>,
              },
              {
                value: 'district',
                image: null,
                title: 'District Profiles',
                subtitle: 'A complete overview of all registered districts.',
                content: <p className="text-muted-foreground">District data will appear here.</p>,
              },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BangladeshPage;
