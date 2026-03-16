'use client';

import { CountryFlag } from '@/components/aml/country-flag';
import {
  DoughnutChartSection,
  LineChartSection,
  PieChartSection,
  VisualChartSection,
} from '@/components/charts';
import HorizontalDivider from '@/components/horizontal-divider';
import { StatCard } from '@/components/insight/stat-card';
import { ProfileAccordion } from '@/components/profiles';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatMoney, shortenNumber } from '@/lib/helper';

const procuringEntityData = [
  { method: 'Credit Card', status: 'Paid', amount: 250.0 },
  { method: 'PayPal', status: 'Pending', amount: 150.0 },
  { method: 'Bank Transfer', status: 'Unpaid', amount: 350.0 },
  { method: 'Credit Card', status: 'Paid', amount: 450.0 },
  { method: 'PayPal', status: 'Paid', amount: 550.0 },
  { method: 'Bank Transfer', status: 'Pending', amount: 200.0 },
  { method: 'Credit Card', status: 'Unpaid', amount: 300.0 },
  { method: 'Credit Card', status: 'Unpaid', amount: 300.0 },
  { method: 'Credit Card', status: 'Unpaid', amount: 300.0 },
  { method: 'Credit Card', status: 'Unpaid', amount: 300.0 },
];

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

// Vertical bar chart — -100 fills
const durationChartData = [
  { key: 'goods', value: 89_200_000_000_000, percentage: 35, barColor: '#dbeafe' },
  { key: 'works', value: 112_500_000_000_000, percentage: 44, barColor: '#ede9fe' },
  { key: 'services', value: 38_700_000_000_000, percentage: 15, barColor: '#fce7f3' },
  { key: 'consultancy', value: 15_600_000_000_000, percentage: 6, barColor: '#fef3c7' },
];

// Vertical bar chart — indigo-100 fill
const statusChartData = [
  { key: '2019', value: 32_400_000_000_000, percentage: 13, barColor: '#e0e7ff' },
  { key: '2020', value: 41_800_000_000_000, percentage: 16, barColor: '#e0e7ff' },
  { key: '2021', value: 48_200_000_000_000, percentage: 19, barColor: '#e0e7ff' },
  { key: '2022', value: 52_600_000_000_000, percentage: 21, barColor: '#e0e7ff' },
  { key: '2023', value: 56_000_000_000_000, percentage: 22, barColor: '#e0e7ff' },
  { key: '2024', value: 25_000_000_000_000, percentage: 9, barColor: '#e0e7ff' },
];

// Pie chart — bright -400 fills
const pieTypeOfWorkData = [
  { key: 'goods', value: 89_200_000_000_000, percentage: 35, barColor: '#60a5fa' },
  { key: 'works', value: 112_500_000_000_000, percentage: 44, barColor: '#a78bfa' },
  { key: 'services', value: 38_700_000_000_000, percentage: 15, barColor: '#f472b6' },
  { key: 'consultancy', value: 15_600_000_000_000, percentage: 6, barColor: '#fbbf24' },
];

// Line chart — monthly contract value trend, indigo-400
const monthlyContractData = [
  { key: 'Jan', value: 18_500_000_000_000, percentage: 7, barColor: '#818cf8' },
  { key: 'Feb', value: 21_200_000_000_000, percentage: 8, barColor: '#818cf8' },
  { key: 'Mar', value: 19_800_000_000_000, percentage: 8, barColor: '#818cf8' },
  { key: 'Apr', value: 24_100_000_000_000, percentage: 9, barColor: '#818cf8' },
  { key: 'May', value: 22_700_000_000_000, percentage: 9, barColor: '#818cf8' },
  { key: 'Jun', value: 26_300_000_000_000, percentage: 10, barColor: '#818cf8' },
  { key: 'Jul', value: 28_900_000_000_000, percentage: 11, barColor: '#818cf8' },
  { key: 'Aug', value: 31_400_000_000_000, percentage: 12, barColor: '#818cf8' },
  { key: 'Sep', value: 27_600_000_000_000, percentage: 11, barColor: '#818cf8' },
  { key: 'Oct', value: 29_800_000_000_000, percentage: 12, barColor: '#818cf8' },
  { key: 'Nov', value: 23_500_000_000_000, percentage: 9, barColor: '#818cf8' },
  { key: 'Dec', value: 20_200_000_000_000, percentage: 8, barColor: '#818cf8' },
];

// Doughnut chart — -100 fill + -400 stroke at 1px
const procurementMethodData = [
  {
    key: 'Open Tender',
    value: 148_000_000_000_000,
    percentage: 58,
    barColor: '#dbeafe',
    strokeColor: '#60a5fa',
  },
  {
    key: 'Limited Tender',
    value: 61_000_000_000_000,
    percentage: 24,
    barColor: '#ede9fe',
    strokeColor: '#a78bfa',
  },
  {
    key: 'Direct Purchase',
    value: 31_000_000_000_000,
    percentage: 12,
    barColor: '#fce7f3',
    strokeColor: '#f472b6',
  },
  {
    key: 'Request for Quotation',
    value: 16_000_000_000_000,
    percentage: 6,
    barColor: '#fef3c7',
    strokeColor: '#fbbf24',
  },
];

function BangladeshPage() {
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
              loading={false}
              data={durationChartData}
            />

            <VisualChartSection
              title="Total Contract Value by Year"
              subtitle="Procurement spending changes over time."
              loading={false}
              data={statusChartData}
            />
          </div>

          <LineChartSection
            title="Monthly Contract Value Trend"
            subtitle="How procurement spending shifted across each month of the year."
            loading={false}
            data={monthlyContractData}
            valueFormatter={formatMoney}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-4">
            <PieChartSection
              title="Total Contract Value by Type of Work"
              subtitle="Spending is distributed across different types of work."
              loading={false}
              data={pieTypeOfWorkData}
            />

            <DoughnutChartSection
              title="Total Contract Value by Procurement Method"
              subtitle="Contracts are awarded using several procurement methods."
              loading={false}
              data={procurementMethodData}
              centerLabel={'256T\nTotal Value'}
            />
          </div>
        </TabsContent>
        <TabsContent value="kesempatan-pasar" className="mt-0 space-y-6">
          <p>Test</p>
        </TabsContent>
        <TabsContent value="kompetisi" className="mt-0 space-y-6">
          <p>Test</p>
        </TabsContent>
        <TabsContent value="efisiensi-internal" className="mt-0 space-y-6">
          <ProfileAccordion
            items={[
              {
                value: 'procuring-entity',
                image: null,
                title: 'Procuring Entity Profiles',
                subtitle: 'A complete overview of all registered procuring entities.',
                content: <DataTable columns={procuringEntityColumns} data={procuringEntityData} />,
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
