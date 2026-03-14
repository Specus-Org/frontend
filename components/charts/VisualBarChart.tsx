'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { DataPoint } from './VisualChartSection';
import { formatMoney } from '@/lib/helper';
import { capitalizeFirstLetter } from '@/lib/strings';

interface VisualBarChartParam {
  data: DataPoint[];
  labelSpacingType: 'normal' | 'fixed';
}

export default function VisualBarChart({ data, labelSpacingType }: VisualBarChartParam) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const drawChart = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth;
    const width = containerWidth;

    const isMobile = containerWidth < 480;
    const isTablet = containerWidth < 768;
    const height = isMobile ? 160 : isTablet ? 180 : 200;

    const margin = {
      top: isMobile ? 25 : 30,
      bottom: isMobile ? 30 : 40,
    };
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(0,${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.key))
      .range([0, width])
      .padding(isMobile ? 0.2 : 0.3);

    const lineGap = isMobile ? 25 : 35;

    const max =
      data.length > 0
        ? data.reduce((a, b) => (a.percentage > b.percentage ? a : b))
        : { percentage: 100 };

    const yScale = d3.scaleLinear().domain([0, max.percentage]).range([innerHeight, 0]);

    const gridPoints = yScale.ticks(Math.max(2, Math.floor(innerHeight / lineGap)));

    g.selectAll('.grid-line')
      .data(gridPoints)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1);

    const cornerRadius = isMobile ? 5 : 8;
    const tooltip = d3.select(tooltipRef.current);

    const bars = g
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.key) || 0)
      .attr('y', innerHeight)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('fill', (d) => d.barColor)
      .attr('rx', cornerRadius)
      .attr('ry', cornerRadius)
      .style('cursor', 'pointer')
      .on('mouseover', function (_event: MouseEvent, d: DataPoint) {
        d3.select(this).transition().duration(150).attr('opacity', 0.7);
        tooltip
          .style('opacity', 1)
          .html(
            `<div class="font-medium">${capitalizeFirstLetter(d.key)}</div><div>${formatMoney(d.value)}</div>`
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
        d3.select(this).transition().duration(150).attr('opacity', 1);
        tooltip.style('opacity', 0);
      });

    bars
      .transition()
      .duration(750)
      .delay((_, i) => i * 100)
      .ease(d3.easeCubicOut)
      .attr('y', (d) => yScale(d.percentage))
      .attr('height', (d) => innerHeight - yScale(d.percentage));

    const valueFontSize = isMobile ? '11px' : '13px';
    const yearFontSize = isMobile ? '11px' : '14px';

    // Value labels - always outside (above) the bar
    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', (d) => (xScale(d.key) || 0) + xScale.bandwidth() / 2)
      .attr('y', innerHeight)
      .attr('text-anchor', 'middle')
      .attr('font-size', valueFontSize)
      .attr('font-weight', '600')
      .attr('opacity', 0)
      .text((d) => formatMoney(d.value))
      .transition()
      .duration(750)
      .delay((_, i) => i * 100)
      .ease(d3.easeCubicOut)
      .attr('y', (d) => yScale(d.percentage) - (isMobile ? 6 : 10))
      .attr('fill', '#020618')
      .attr('opacity', 1);

    if (labelSpacingType == 'normal') {
      g.selectAll('.year-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'year-label')
        .attr('x', (d) => {
          return (xScale(d.key) || 0) + xScale.bandwidth() / 2;
        })
        .attr('y', innerHeight + (isMobile ? 18 : 24))
        .attr('text-anchor', 'middle')
        .attr('fill', '#62748E')
        .attr('font-size', yearFontSize)
        .text((d) => capitalizeFirstLetter(d.key));
    } else if (labelSpacingType == 'fixed') {
      const labelGap = 16;
      const labelWidth = isMobile ? 45 : 95;
      const totalLabelsWidth = data.length * labelWidth + (data.length - 1) * labelGap;
      const labelsStartX = (width - totalLabelsWidth) / 2 + labelWidth / 2;

      g.selectAll('.year-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'year-label')
        .attr('x', (_, i) => labelsStartX + i * (labelWidth + labelGap))
        .attr('y', innerHeight + (isMobile ? 18 : 24))
        .attr('text-anchor', 'middle')
        .attr('fill', '#62748E')
        .attr('font-size', yearFontSize)
        .text((d) => capitalizeFirstLetter(d.key));
    }
  }, [data, labelSpacingType]);

  useEffect(() => {
    drawChart();
    const handleResize = () => drawChart();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawChart]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} className="overflow-visible" />
      <div
        ref={tooltipRef}
        className="bg-popover text-popover-foreground pointer-events-none absolute z-10 rounded-md border px-3 py-2 text-sm opacity-0 shadow-md transition-opacity"
        style={{ transform: 'translateY(-100%)' }}
      />
    </div>
  );
}
