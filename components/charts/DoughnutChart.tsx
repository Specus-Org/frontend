'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { DataPoint } from './VisualChartSection';

interface DoughnutChartProps {
  data: DataPoint[];
  centerLabel?: string;
}

export default function DoughnutChart({ data, centerLabel }: DoughnutChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const drawChart = useCallback(() => {
    if (!svgRef.current || !containerRef.current || !data.length) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth;
    const isMobile = containerWidth < 480;
    const size = isMobile ? Math.min(containerWidth, 220) : Math.min(containerWidth, 280);
    const outerRadius = size / 2;
    const innerRadius = outerRadius * 0.6;

    const width = containerWidth;
    const legendItemHeight = 24;
    const legendGap = 8;
    const legendTopPadding = 16;
    const legendHeight = data.length * legendItemHeight + (data.length - 1) * legendGap + legendTopPadding;
    const height = size + legendHeight;

    d3.select(svgRef.current).attr('width', width).attr('height', height);

    const svg = d3.select(svgRef.current);

    const chartGroup = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${outerRadius})`);

    const pie = d3
      .pie<DataPoint>()
      .value((d) => d.percentage)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<DataPoint>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const arcHover = d3
      .arc<d3.PieArcDatum<DataPoint>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius + 8);

    const pieData = pie(data);
    const tooltip = d3.select(tooltipRef.current);

    const slices = chartGroup
      .selectAll('.arc')
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', 'arc');

    slices
      .append('path')
      .attr('fill', (d) => d.data.barColor)
      .attr('stroke', (d) => d.data.strokeColor ?? 'white')
      .attr('stroke-width', (d) => (d.data.strokeColor ? 1 : 2))
      .style('cursor', 'pointer')
      .on('mouseover', function (_event: MouseEvent, d: d3.PieArcDatum<DataPoint>) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', (datum) => arcHover(datum as d3.PieArcDatum<DataPoint>) || '');
        tooltip
          .style('opacity', 1)
          .html(
            `<div class="font-medium">${d.data.key}</div><div>${d.data.percentage}%</div>`
          );
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
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', (datum) => arc(datum as d3.PieArcDatum<DataPoint>) || '');
        tooltip.style('opacity', 0);
      })
      .transition()
      .duration(750)
      .delay((_, i) => i * 80)
      .ease(d3.easeCubicOut)
      .attrTween('d', function (d) {
        const interpolate = d3.interpolate({ startAngle: d.startAngle, endAngle: d.startAngle }, d);
        return (t) => arc(interpolate(t)) || '';
      });

    // Center label
    if (centerLabel) {
      const lines = centerLabel.split('\n');
      const lineHeight = 18;
      const totalTextHeight = lines.length * lineHeight;

      lines.forEach((line, i) => {
        const isFirst = i === 0;
        chartGroup
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('y', -totalTextHeight / 2 + i * lineHeight + (isFirst ? 6 : 14))
          .attr('font-size', isFirst ? (isMobile ? '13px' : '14px') : isMobile ? '11px' : '12px')
          .attr('font-weight', isFirst ? '700' : '400')
          .attr('fill', isFirst ? '#020618' : '#62748E')
          .text(line);
      });
    }

    // Legend
    const legendGroup = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${size + legendTopPadding})`);

    const legendItemWidth = isMobile ? 140 : 180;
    const legendCols = Math.max(1, Math.floor(width / legendItemWidth));
    const totalRows = Math.ceil(data.length / legendCols);
    const legendTotalWidth = Math.min(legendCols, data.length) * legendItemWidth;
    const legendStartX = -legendTotalWidth / 2;

    data.forEach((d, i) => {
      const col = i % legendCols;
      const row = Math.floor(i / legendCols);
      const x = legendStartX + col * legendItemWidth;
      const y = row * (legendItemHeight + legendGap);

      const item = legendGroup.append('g').attr('transform', `translate(${x}, ${y})`);

      item
        .append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('fill', d.barColor)
        .attr('stroke', d.strokeColor ?? 'none')
        .attr('stroke-width', d.strokeColor ? 1 : 0)
        .attr('y', 0);

      item
        .append('text')
        .attr('x', 18)
        .attr('y', 10)
        .attr('font-size', isMobile ? '11px' : '12px')
        .attr('fill', '#62748E')
        .text(`${d.key} (${d.percentage}%)`);
    });

    // Adjust SVG height to actual legend content
    const actualLegendHeight =
      totalRows * legendItemHeight + (totalRows - 1) * legendGap + legendTopPadding;
    d3.select(svgRef.current).attr('height', size + actualLegendHeight);
  }, [data, centerLabel]);

  useEffect(() => {
    drawChart();
    const handleResize = () => drawChart();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawChart]);

  return (
    <div ref={containerRef} className="relative flex w-full flex-col items-center">
      <svg ref={svgRef} className="overflow-visible" />
      <div
        ref={tooltipRef}
        className="bg-popover text-popover-foreground pointer-events-none absolute z-10 rounded-md border px-3 py-2 text-sm opacity-0 shadow-md transition-opacity"
        style={{ transform: 'translateY(-100%)' }}
      />
    </div>
  );
}
