'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { DataPoint } from './VisualChartSection';

interface LineChartProps {
  data: DataPoint[];
  valueFormatter?: (value: number) => string;
}

export default function LineChart({
  data,
  valueFormatter = (v) => v.toLocaleString(),
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const drawChart = useCallback(() => {
    if (!svgRef.current || !containerRef.current || !data.length) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth;
    const isMobile = containerWidth < 480;
    const isTablet = containerWidth < 768;
    const height = isMobile ? 180 : isTablet ? 200 : 220;

    const margin = {
      top: isMobile ? 20 : 24,
      right: isMobile ? 16 : 20,
      bottom: isMobile ? 32 : 40,
      left: isMobile ? 52 : 60,
    };
    const width = containerWidth;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scalePoint()
      .domain(data.map((d) => d.key))
      .range([0, innerWidth])
      .padding(0.5);

    const maxValue = d3.max(data, (d) => d.value) ?? 0;
    const minValue = d3.min(data, (d) => d.value) ?? 0;
    const valuePadding = (maxValue - minValue) * 0.15 || maxValue * 0.15;

    const yScale = d3
      .scaleLinear()
      .domain([Math.max(0, minValue - valuePadding), maxValue + valuePadding])
      .range([innerHeight, 0])
      .nice();

    const lineColor = data[0]?.barColor ?? '#818cf8';

    // Grid lines
    const gridTicks = yScale.ticks(isMobile ? 3 : 4);
    g.selectAll('.grid-line')
      .data(gridTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1);

    // Smooth curve generator (CatmullRom gives the natural wavy feel)
    const curveFactory = d3.curveCatmullRom.alpha(0.5);

    const lineGenerator = d3
      .line<DataPoint>()
      .x((d) => xScale(d.key) ?? 0)
      .y((d) => yScale(d.value))
      .curve(curveFactory);

    // Line path with stroke-dasharray draw animation
    const path = g
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', isMobile ? 2 : 2.5)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('d', lineGenerator);

    const totalLength = (path.node() as SVGPathElement)?.getTotalLength() ?? 0;
    path
      .attr('stroke-dasharray', totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1000)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // Dots
    const dotRadius = isMobile ? 4 : 5;
    const dotRadiusHover = isMobile ? 6 : 7;
    const tooltip = d3.select(tooltipRef.current);

    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.key) ?? 0)
      .attr('cy', (d) => yScale(d.value))
      .attr('r', 0)
      .attr('fill', lineColor)
      .style('cursor', 'pointer')
      .on('mouseover', function (_event: MouseEvent, d: DataPoint) {
        d3.select(this).transition().duration(150).attr('r', dotRadiusHover);
        tooltip
          .style('opacity', 1)
          .html(
            `<div class="font-medium">${d.key}</div><div>${valueFormatter(d.value)}</div>`
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
        d3.select(this).transition().duration(150).attr('r', dotRadius);
        tooltip.style('opacity', 0);
      })
      .transition()
      .duration(400)
      .delay((_, i) => i * 70 + 600)
      .ease(d3.easeCubicOut)
      .attr('r', dotRadius);

    // X-axis labels
    const xFontSize = isMobile ? '10px' : '12px';
    g.selectAll('.x-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'x-label')
      .attr('x', (d) => xScale(d.key) ?? 0)
      .attr('y', innerHeight + (isMobile ? 18 : 24))
      .attr('text-anchor', 'middle')
      .attr('fill', '#62748E')
      .attr('font-size', xFontSize)
      .text((d) => d.key);

    // Y-axis labels
    const yFontSize = isMobile ? '10px' : '11px';
    g.selectAll('.y-label')
      .data(gridTicks)
      .enter()
      .append('text')
      .attr('class', 'y-label')
      .attr('x', -8)
      .attr('y', (d) => yScale(d))
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', '#62748E')
      .attr('font-size', yFontSize)
      .text((d) => valueFormatter(d));
  }, [data, valueFormatter]);

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
