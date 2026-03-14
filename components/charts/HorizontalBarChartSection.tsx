'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { DataPoint } from './VisualChartSection';

interface HorizontalBarChartSectionProps {
  title: string;
  subtitle: string;
  data: DataPoint[];
  loading?: boolean;
  className?: string;
  valueFormatter?: (value: number, item: DataPoint) => string;
}

export function HorizontalBarChartSection({
  title,
  subtitle,
  data,
  loading,
  className = '',
  valueFormatter = (value) => value.toLocaleString(),
}: HorizontalBarChartSectionProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data.length || loading) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth;
    const margin = { top: 10, right: 60, bottom: 10 };
    const barHeight = 32;
    const barSpacing = 8;
    const height = data.length * (barHeight + barSpacing) + margin.top + margin.bottom;
    const width = containerWidth;
    const innerWidth = width - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(0,${margin.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.key))
      .range([0, innerHeight])
      .padding(0.2);

    // Grid lines
    const gridLines = g.append('g').attr('class', 'grid-lines');

    gridLines
      .selectAll('line')
      .data(xScale.ticks(5))
      .enter()
      .append('line')
      .attr('x1', (d) => xScale(d))
      .attr('x2', (d) => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#01012E14');

    // Tooltip div
    const tooltip = d3.select(tooltipRef.current);

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d) => yScale(d.key) || 0)
      .attr('width', (d) => xScale(d.value))
      .attr('height', yScale.bandwidth())
      .attr('fill', (d) => d.barColor)
      .attr('rx', 4)
      .attr('ry', 4)
      .style('cursor', 'pointer')
      .on('mouseover', function (_event: MouseEvent, d: DataPoint) {
        d3.select(this).attr('opacity', 0.8);
        tooltip
          .style('opacity', 1)
          .html(`<div class="font-medium">${d.key}</div><div>${valueFormatter(d.value, d)}</div>`);
      })
      .on('mousemove', function (event: MouseEvent) {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
          tooltip
            .style('left', `${event.clientX - containerRect.left + 10}px`)
            .style('top', `${event.clientY - containerRect.top - 10}px`);
        }
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 1);
        tooltip.style('opacity', 0);
      });

    const minBarWidthForKeyLabel = 80;

    g.selectAll('.key-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'key-label')
      .attr('x', 8)
      .attr('y', (d) => (yScale(d.key) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'start')
      .attr('fill', '#1C2024')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .style('cursor', 'pointer')
      .text((d) => {
        const barWidth = xScale(d.value);
        if (barWidth < minBarWidthForKeyLabel) return '';
        const maxLength = Math.floor(barWidth / 7);
        return d.key.length > maxLength ? d.key.substring(0, maxLength) + '...' : d.key;
      })
      .on('mouseover', function (_event: MouseEvent, d: DataPoint) {
        const barWidth = xScale(d.value);
        const maxLength = Math.floor(barWidth / 7);
        if (d.key.length > maxLength) {
          tooltip.style('opacity', 1).html(`<div class="font-medium">${d.key}</div>`);
        }
      })
      .on('mousemove', function (event: MouseEvent) {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
          tooltip
            .style('left', `${event.clientX - containerRect.left + 10}px`)
            .style('top', `${event.clientY - containerRect.top - 10}px`);
        }
      })
      .on('mouseout', function () {
        tooltip.style('opacity', 0);
      });

    // Value labels - outside the bar (to the right)
    g.selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', (d) => xScale(d.value) + 8)
      .attr('y', (d) => (yScale(d.key) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'start')
      .attr('fill', '#1C2024')
      .attr('font-size', '12px')
      .attr('font-weight', '400')
      .text((d) => valueFormatter(d.value, d));
  }, [data, loading, valueFormatter]);

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="space-y-1">
          <div className="bg-muted h-5 w-3/4 animate-pulse rounded" />
          <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
        </div>
        <div className="bg-muted h-40 w-full animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`} ref={containerRef}>
      <div className="space-y-1">
        <h3 className="text-foreground text-sm font-medium">{title}</h3>
        <p className="text-muted-foreground text-xs">{subtitle}</p>
      </div>
      <div className="relative">
        <svg ref={svgRef} className="w-full" />
        <div
          ref={tooltipRef}
          className="bg-popover text-popover-foreground pointer-events-none absolute z-10 rounded-md border px-3 py-2 text-sm opacity-0 shadow-md transition-opacity"
          style={{ transform: 'translateY(-100%)' }}
        />
      </div>
    </div>
  );
}
