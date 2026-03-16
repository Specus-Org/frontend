'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';

export interface NetworkLink {
  source: string;
  target: string;
  /** Short title rendered as a floating badge on the connection arc */
  title?: string;
  /** Longer description shown in the hover tooltip */
  label?: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  value: number;
  percentage: number;
  color: string;
  children?: NetworkNode[];
  /**
   * Peer/cross-connections between the immediate children of this node.
   * source and target must be IDs that appear in `children`.
   */
  childLinks?: NetworkLink[];
}

// ─── internal simulation types ───────────────────────────────────────────────

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  value: number;
  percentage: number;
  color: string;
  radius: number;
  isRoot: boolean;
  hasChildren: boolean;
}

type LinkKind = 'hierarchy' | 'peer';

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
  kind: LinkKind;
  title?: string;
  label?: string;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Quadratic bezier that curves perpendicularly away from the straight line */
function curvedPath(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  curvature = 0.32,
): string {
  const dx = tx - sx;
  const dy = ty - sy;
  const dr = Math.sqrt(dx * dx + dy * dy) || 1;
  const mx = (sx + tx) / 2;
  const my = (sy + ty) / 2;
  const offset = dr * curvature;
  // perpendicular unit vector, offset outward
  const nx = (-dy / dr) * offset;
  const ny = (dx / dr) * offset;
  return `M ${sx},${sy} Q ${mx + nx},${my + ny} ${tx},${ty}`;
}

/**
 * Returns the point at t=0.5 on the same quadratic bezier used by curvedPath.
 * Formula: P(0.5) = (mx + 0.5*nx, my + 0.5*ny)
 */
function curveMidpoint(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  curvature = 0.32,
): [number, number] {
  const dx = tx - sx;
  const dy = ty - sy;
  const dr = Math.sqrt(dx * dx + dy * dy) || 1;
  const mx = (sx + tx) / 2;
  const my = (sy + ty) / 2;
  const offset = dr * curvature;
  const nx = (-dy / dr) * offset;
  const ny = (dx / dr) * offset;
  return [mx + 0.5 * nx, my + 0.5 * ny];
}

// ─── component ───────────────────────────────────────────────────────────────

interface DrillDownNetworkProps {
  data: NetworkNode;
  valueFormatter?: (value: number) => string;
}

export default function DrillDownNetwork({
  data,
  valueFormatter = (v) => v.toLocaleString(),
}: DrillDownNetworkProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);

  const [path, setPath] = useState<NetworkNode[]>([data]);

  useEffect(() => {
    setPath([data]);
  }, [data]);

  const currentNode = path[path.length - 1];

  const drawChart = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;
    simulationRef.current?.stop();

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = containerRef.current.clientWidth;
    const isMobile = width < 480;
    const height = isMobile ? 320 : 460;

    svg.attr('width', width).attr('height', height);

    const cx = width / 2;
    const cy = height / 2;
    const children = currentNode.children ?? [];
    const rawPeerLinks = currentNode.childLinks ?? [];

    // ── node sizing ──
    const rootRadius = isMobile ? 32 : 44;
    const maxPct = d3.max(children, (c) => c.percentage) ?? 100;
    const rScale = d3
      .scaleSqrt()
      .domain([0, maxPct])
      .range([isMobile ? 15 : 19, isMobile ? 27 : 37]);

    const rootSimNode: SimNode = {
      id: currentNode.id,
      label: currentNode.label,
      value: currentNode.value,
      percentage: currentNode.percentage,
      color: currentNode.color,
      radius: rootRadius,
      isRoot: true,
      hasChildren: children.length > 0,
      fx: cx,
      fy: cy,
    };

    const childSimNodes: SimNode[] = children.map((c) => ({
      id: c.id,
      label: c.label,
      value: c.value,
      percentage: c.percentage,
      color: c.color,
      radius: rScale(c.percentage),
      isRoot: false,
      hasChildren: !!(c.children?.length),
    }));

    const nodes: SimNode[] = [rootSimNode, ...childSimNodes];

    // hierarchy links (root → every child)
    const hierLinks: SimLink[] = childSimNodes.map((c) => ({
      source: currentNode.id,
      target: c.id,
      kind: 'hierarchy' as const,
    }));

    // peer / cross-links (child ↔ child)
    const peerLinks: SimLink[] = rawPeerLinks.map((l) => ({
      source: l.source,
      target: l.target,
      kind: 'peer' as const,
      title: l.title,
      label: l.label,
    }));

    const allLinks: SimLink[] = [...hierLinks, ...peerLinks];

    // ── SVG defs ──────────────────────────────────────────────────────────────
    const defs = svg.append('defs');

    // glow for root node
    const glowFilter = defs
      .append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    glowFilter
      .append('feGaussianBlur')
      .attr('in', 'SourceGraphic')
      .attr('stdDeviation', '5')
      .attr('result', 'blur');
    const glowMerge = glowFilter.append('feMerge');
    glowMerge.append('feMergeNode').attr('in', 'blur');
    glowMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // ── force simulation ──────────────────────────────────────────────────────
    const simulation = d3
      .forceSimulation<SimNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<SimNode, SimLink>(allLinks)
          .id((d) => d.id)
          // peer links pull siblings closer, hierarchy links spread outward
          .distance((l) => (l.kind === 'hierarchy' ? (isMobile ? 95 : 140) : (isMobile ? 55 : 80)))
          .strength((l) => (l.kind === 'hierarchy' ? 1 : 0.35)),
      )
      .force('charge', d3.forceManyBody<SimNode>().strength(-520))
      .force(
        'collision',
        d3
          .forceCollide<SimNode>()
          .radius((d) => d.radius + 24)
          .strength(1),
      )
      .force('x', d3.forceX(cx).strength(0.05))
      .force('y', d3.forceY(cy).strength(0.05));

    simulationRef.current = simulation;

    // ── link group ────────────────────────────────────────────────────────────
    const linkGroup = svg.append('g').attr('class', 'links');

    // hierarchy lines (straight, gray, dashed)
    linkGroup
      .selectAll<SVGLineElement, SimLink>('line.hier')
      .data(hierLinks)
      .enter()
      .append('line')
      .attr('class', 'hier')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '5,4')
      .attr('opacity', 0);

    // peer curves (curved, amber/orange)
    linkGroup
      .selectAll<SVGPathElement, SimLink>('path.peer')
      .data(peerLinks)
      .enter()
      .append('path')
      .attr('class', 'peer')
      .attr('fill', 'none')
      .attr('stroke', '#f97316')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.5)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0);

    // invisible wide hit-area paths for easier hover on thin curves
    const tooltip = d3.select(tooltipRef.current);

    linkGroup
      .selectAll<SVGPathElement, SimLink>('path.peer-hit')
      .data(peerLinks)
      .enter()
      .append('path')
      .attr('class', 'peer-hit')
      .attr('fill', 'none')
      .attr('stroke', 'transparent')
      .attr('stroke-width', 16)
      .style('cursor', 'crosshair')
      .on('mouseover', function (_e, d) {
        svg
          .selectAll<SVGPathElement, SimLink>('path.peer')
          .filter((l) => l === d)
          .attr('stroke-opacity', 0.95)
          .attr('stroke-width', 2.5);
        if (d.title || d.label) {
          tooltip
            .style('opacity', 1)
            .html(
              [
                `<div style="color:#f97316;font-size:11px;font-weight:700;margin-bottom:3px">⇄ Shared Connection</div>`,
                d.title
                  ? `<div style="font-size:12px;font-weight:600;margin-bottom:2px">${d.title}</div>`
                  : '',
                d.label
                  ? `<div style="font-size:11px;opacity:0.7">${d.label}</div>`
                  : '',
              ].join(''),
            );
        }
      })
      .on('mousemove', function (event: MouseEvent) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          tooltip
            .style('left', `${event.clientX - rect.left + 14}px`)
            .style('top', `${event.clientY - rect.top - 14}px`);
        }
      })
      .on('mouseout', function (_e, d) {
        svg
          .selectAll<SVGPathElement, SimLink>('path.peer')
          .filter((l) => l === d)
          .attr('stroke-opacity', 0.5)
          .attr('stroke-width', 2);
        tooltip.style('opacity', 0);
      });

    // ── peer link title badges ─────────────────────────────────────────────────
    // Rendered above the link group so they sit on top of the arc lines
    const titledPeerLinks = peerLinks.filter((l) => !!l.title);

    const titleBadgeGroup = svg.append('g').attr('class', 'peer-titles').attr('pointer-events', 'none');

    titleBadgeGroup
      .selectAll<SVGTextElement, SimLink>('text.peer-title')
      .data(titledPeerLinks)
      .enter()
      .append('text')
      .attr('class', 'peer-title')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', isMobile ? '8px' : '9px')
      .attr('font-weight', '600')
      .attr('fill', '#ea580c')
      // white halo created via paint-order so stroke paints beneath fill
      .attr('stroke', 'white')
      .attr('stroke-width', '3')
      .attr('stroke-linejoin', 'round')
      .attr('paint-order', 'stroke')
      .attr('opacity', 0)
      .text((d) => d.title ?? '');

    // ── node groups ───────────────────────────────────────────────────────────
    const nodeGroup = svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, SimNode>('g.node')
      .data(nodes, (d) => d.id)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('opacity', 0)
      .style('cursor', (d) => (!d.isRoot && d.hasChildren ? 'pointer' : 'default'));

    // main circle
    nodeGroup
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => d.color)
      .attr('stroke', (d) => {
        if (d.isRoot) return '#475569';
        if (d.hasChildren) return d3.color(d.color)?.darker(0.7)?.toString() ?? '#94a3b8';
        return 'none';
      })
      .attr('stroke-width', (d) => (d.isRoot ? 2.5 : d.hasChildren ? 1.5 : 0))
      .attr('filter', (d) => (d.isRoot ? 'url(#glow)' : 'none'));

    // dashed drill-down ring
    nodeGroup
      .filter((d) => !d.isRoot && d.hasChildren)
      .append('circle')
      .attr('r', (d) => d.radius + 6)
      .attr('fill', 'none')
      .attr('stroke', (d) => d3.color(d.color)?.darker(0.5)?.toString() ?? d.color)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.55);

    // root labels (two lines)
    const rootG = nodeGroup.filter((d) => d.isRoot);
    rootG
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -7)
      .attr('fill', '#1e293b')
      .attr('font-size', isMobile ? '11px' : '13px')
      .attr('font-weight', '700')
      .attr('pointer-events', 'none')
      .text((d) => d.label);
    rootG
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 9)
      .attr('fill', '#64748b')
      .attr('font-size', isMobile ? '9px' : '10px')
      .attr('pointer-events', 'none')
      .text((d) => `${d.percentage}%`);

    // child: percentage inside
    nodeGroup
      .filter((d) => !d.isRoot)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#1e293b')
      .attr('font-size', (d) => `${Math.max(8, Math.floor(d.radius * 0.42))}px`)
      .attr('font-weight', '700')
      .attr('pointer-events', 'none')
      .text((d) => `${d.percentage}%`);

    // child: word-wrapped label below circle
    nodeGroup
      .filter((d) => !d.isRoot)
      .each(function (d) {
        const g = d3.select(this);
        const yBase = d.radius + (isMobile ? 13 : 16);
        const maxChars = isMobile ? 9 : 12;
        const words = d.label.split(' ');
        const lines: string[] = [];
        let cur = '';
        for (const w of words) {
          const trial = cur ? `${cur} ${w}` : w;
          if (trial.length > maxChars && cur) {
            lines.push(cur);
            cur = w;
          } else {
            cur = trial;
          }
        }
        if (cur) lines.push(cur);
        const lh = isMobile ? 11 : 13;
        lines.forEach((line, i) => {
          g.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', yBase + i * lh)
            .attr('fill', '#475569')
            .attr('font-size', isMobile ? '9px' : '11px')
            .attr('pointer-events', 'none')
            .text(line);
        });
      });

    // node hover / click
    nodeGroup
      .on('mouseover', function (_e, d) {
        if (d.isRoot) return;
        d3.select(this).select<SVGCircleElement>('circle').transition().duration(150).attr('r', d.radius + 4);
        tooltip.style('opacity', 1).html(
          [
            `<div style="font-weight:600">${d.label}</div>`,
            `<div style="font-size:11px;opacity:0.65;margin-top:2px">${d.percentage}% &middot; ${valueFormatter(d.value)}</div>`,
            d.hasChildren
              ? `<div style="font-size:11px;color:#3b82f6;margin-top:6px">&#8595; Click to drill down</div>`
              : '',
          ].join(''),
        );
      })
      .on('mousemove', function (event: MouseEvent) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          tooltip
            .style('left', `${event.clientX - rect.left + 14}px`)
            .style('top', `${event.clientY - rect.top - 14}px`);
        }
      })
      .on('mouseout', function (_e, d) {
        if (d.isRoot) return;
        d3.select(this).select<SVGCircleElement>('circle').transition().duration(150).attr('r', d.radius);
        tooltip.style('opacity', 0);
      })
      .on('click', (_e, d) => {
        if (!d.isRoot && d.hasChildren) {
          const child = currentNode.children?.find((c) => c.id === d.id);
          if (child) {
            tooltip.style('opacity', 0);
            setPath((prev) => [...prev, child]);
          }
        }
      });

    // ── entrance animations ───────────────────────────────────────────────────
    svg
      .select('g.nodes')
      .selectAll<SVGGElement, SimNode>('g.node')
      .transition()
      .duration(420)
      .delay((_, i) => i * 55)
      .attr('opacity', 1);

    svg
      .select('g.links')
      .selectAll<SVGLineElement, SimLink>('line.hier')
      .transition()
      .duration(420)
      .delay(160)
      .attr('opacity', 1);

    svg
      .select('g.links')
      .selectAll<SVGPathElement, SimLink>('path.peer')
      .transition()
      .duration(600)
      .delay(350)
      .attr('opacity', 1);

    svg
      .select('g.peer-titles')
      .selectAll<SVGTextElement, SimLink>('text.peer-title')
      .transition()
      .duration(500)
      .delay(550)
      .attr('opacity', 1);

    // ── tick ──────────────────────────────────────────────────────────────────
    simulation.on('tick', () => {
      // clamp within bounds
      nodes.forEach((n) => {
        if (!n.isRoot) {
          n.x = Math.max(n.radius + 10, Math.min(width - n.radius - 10, n.x ?? cx));
          n.y = Math.max(n.radius + 10, Math.min(height - n.radius - 20, n.y ?? cy));
        }
      });

      // update hierarchy lines
      svg
        .select('g.links')
        .selectAll<SVGLineElement, SimLink>('line.hier')
        .attr('x1', (d) => (d.source as SimNode).x ?? 0)
        .attr('y1', (d) => (d.source as SimNode).y ?? 0)
        .attr('x2', (d) => (d.target as SimNode).x ?? 0)
        .attr('y2', (d) => (d.target as SimNode).y ?? 0);

      // update peer curves + hit areas
      const peerD = (d: SimLink) => {
        const s = d.source as SimNode;
        const t = d.target as SimNode;
        return curvedPath(s.x ?? 0, s.y ?? 0, t.x ?? 0, t.y ?? 0);
      };
      svg.select('g.links').selectAll<SVGPathElement, SimLink>('path.peer').attr('d', peerD);
      svg.select('g.links').selectAll<SVGPathElement, SimLink>('path.peer-hit').attr('d', peerD);

      // reposition title badges to the arc midpoint
      svg
        .select('g.peer-titles')
        .selectAll<SVGTextElement, SimLink>('text.peer-title')
        .attr('x', (d) => {
          const s = d.source as SimNode;
          const t = d.target as SimNode;
          return curveMidpoint(s.x ?? 0, s.y ?? 0, t.x ?? 0, t.y ?? 0)[0];
        })
        .attr('y', (d) => {
          const s = d.source as SimNode;
          const t = d.target as SimNode;
          return curveMidpoint(s.x ?? 0, s.y ?? 0, t.x ?? 0, t.y ?? 0)[1];
        });

      // update nodes
      svg
        .select('g.nodes')
        .selectAll<SVGGElement, SimNode>('g.node')
        .attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => simulation.stop();
  }, [currentNode, valueFormatter]);

  useEffect(() => {
    const cleanup = drawChart();
    const onResize = () => drawChart();
    window.addEventListener('resize', onResize);
    return () => {
      cleanup?.();
      window.removeEventListener('resize', onResize);
    };
  }, [drawChart]);

  const isLeaf = !currentNode.children || currentNode.children.length === 0;
  const hasPeerLinks = (currentNode.childLinks?.length ?? 0) > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1 mb-4 min-h-[24px]">
        {path.map((node, i) => (
          <span key={node.id} className="flex items-center gap-1">
            {i > 0 && <span className="text-muted-foreground text-xs select-none">›</span>}
            <button
              onClick={() => i < path.length - 1 && setPath(path.slice(0, i + 1))}
              className={
                i === path.length - 1
                  ? 'text-sm font-semibold text-foreground cursor-default'
                  : 'text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer underline-offset-2 hover:underline'
              }
              disabled={i === path.length - 1}
            >
              {node.label}
            </button>
          </span>
        ))}
        {path.length > 1 && (
          <button
            onClick={() => setPath([data])}
            className="ml-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ↩ Reset
          </button>
        )}
      </nav>

      {/* Chart or leaf state */}
      {isLeaf ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2">
          <span className="text-2xl">◎</span>
          <span>No sub-categories at this level.</span>
          <button
            onClick={() => setPath([data])}
            className="mt-1 text-xs text-blue-500 hover:text-blue-600 transition-colors"
          >
            ↩ Go back to root
          </button>
        </div>
      ) : (
        <svg ref={svgRef} className="overflow-visible" />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="bg-popover text-popover-foreground pointer-events-none absolute z-10 rounded-lg border px-3 py-2 text-sm opacity-0 shadow-lg transition-opacity"
        style={{ transform: 'translateY(-100%)' }}
      />

      {/* Legend */}
      {!isLeaf && (
        <div className="flex flex-wrap items-center gap-5 mt-3 text-xs text-muted-foreground select-none">
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 14 14">
              <circle cx="7" cy="7" r="5" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2.5,2" />
              <circle cx="7" cy="7" r="3.5" fill="#cbd5e1" />
            </svg>
            Drillable node
          </span>
          {hasPeerLinks && (
            <span className="flex items-center gap-1.5">
              <svg width="24" height="12" viewBox="0 0 24 12">
                <path d="M 1,6 Q 12,0 23,6" fill="none" stroke="#f97316" strokeWidth="2" strokeOpacity="0.7" strokeLinecap="round" />
              </svg>
              Cross-agency connection
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 14 14">
              <circle cx="7" cy="7" r="4.5" fill="#cbd5e1" />
            </svg>
            Leaf node
          </span>
        </div>
      )}
    </div>
  );
}
