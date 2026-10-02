"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { SVGRenderer } from "three/addons/renderers/SVGRenderer.js";

type Period = "week" | "month";
type Topic = { id: string; label: string; week: number; month: number };
type Column = { x: number; width: number; heights: number[] };
type Hovered = { day: number; x: number; y: number; period: Period; selectedIds: string; instant: boolean; leaving: boolean };
type ChartScene = {
  frame: Column[];
  initialized: boolean;
  transitioning: boolean;
  animationFrame: number | null;
  paint: (frame: Column[]) => void;
  setHover: (day: number | null, period: Period, instant?: boolean) => void;
  hitTest: (x: number, y: number, period: Period) => number | null;
  tooltipPosition: (day: number, period: Period) => { x: number; y: number };
};

const topicOrder = ["features", "integrations", "imports", "access", "billing"];
const weekAnchors = [0, 5, 10, 15, 20, 25, 29];
const weekLabels = Array.from({ length: 7 }, (_, day) => `${day + 24} sep`);
const monthLabels = Array.from({ length: 30 }, (_, day) => `${day + 1} sep`);
const colors: Record<string, string> = {
  billing: "#8254f7", access: "#08b9bc", imports: "#eb278a",
  integrations: "#ed5962", features: "#277cf0",
};
const tooltipColors: Record<string, string> = {
  ...colors, billing: "#9e7dff", access: "#58ccd2", imports: "#ee3193",
};
const weekWeights: Record<string, number[]> = {
  billing: [0.10, 0.13, 0.16, 0.22, 0.18, 0.13, 0.08],
  access: [0.09, 0.13, 0.17, 0.21, 0.19, 0.13, 0.08],
  imports: [0.10, 0.13, 0.17, 0.20, 0.18, 0.14, 0.08],
  integrations: [0.10, 0.14, 0.16, 0.21, 0.18, 0.13, 0.08],
  features: [0.09, 0.14, 0.16, 0.22, 0.18, 0.13, 0.08],
};
const monthWeights: Record<string, number[]> = Object.fromEntries(topicOrder.map((id, topicIndex) => {
  const values = Array.from({ length: 30 }, (_, day) => {
    const weekday = (day + 2) % 7;
    const weekend = weekday === 0 || weekday === 6 ? 0.78 : 1;
    return weekend * (1 + 0.17 * Math.sin(day * 0.57 + topicIndex * 0.65) + 0.1 * Math.cos(day * 1.64 + topicIndex * 0.8));
  });
  const sum = values.reduce((total, value) => total + value, 0);
  return [id, values.map((value) => value / sum)];
}));

function weight(id: string, period: Period, day: number) {
  return (period === "week" ? weekWeights : monthWeights)[id][day];
}
function columnX(day: number, period: Period) {
  const width = period === "week" ? 0.48 : 0.09;
  const count = period === "week" ? 7 : 30;
  const outer = 3.2 - width / Math.SQRT2;
  return -outer + 2 * outer * day / (count - 1);
}
function makeMaterials(color: string) {
  const base = new THREE.Color(color);
  const top = base.clone().lerp(new THREE.Color("#ffffff"), 0.19);
  const light = base.clone().lerp(new THREE.Color("#ffffff"), 0.04);
  const dark = base.clone().multiplyScalar(0.7);
  return [dark, light, top, base, light, dark].map((face) => new THREE.MeshBasicMaterial({ color: face, transparent: true }));
}
function columnsFor(period: Period, topics: Topic[]): Column[] {
  const count = period === "week" ? 7 : 30;
  const daily = Array.from({ length: count }, (_, day) => topicOrder.map((id) => {
    const topic = topics.find((item) => item.id === id);
    return topic ? topic[period] * weight(id, period, day) : 0;
  }));
  const maximum = Math.max(1, ...daily.map((values) => values.reduce((sum, value) => sum + value, 0)));
  const maxHeight = period === "week" ? 3.15 : 3.45;
  const heights = daily.map((values) => {
    const total = values.reduce((sum, value) => sum + value, 0);
    const height = total ? 0.32 + (maxHeight - 0.32) * total / maximum : 0;
    const portions = values.map(Math.sqrt);
    const portionTotal = portions.reduce((sum, value) => sum + value, 0);
    return portions.map((portion) => portionTotal ? height * portion / portionTotal : 0);
  });
  return Array.from({ length: 30 }, (_, day) => {
    if (period === "month") return { x: columnX(day, period), width: 0.09, heights: heights[day] };
    const weekIndex = weekAnchors.indexOf(day);
    return {
      x: columnX(weekIndex < 0 ? Math.round(day * 6 / 29) : weekIndex, "week"),
      width: weekIndex < 0 ? 0.09 : 0.48,
      heights: weekIndex < 0 ? topicOrder.map(() => 0) : heights[weekIndex],
    };
  });
}
function easeColor(progress: number) {
  let low = 0;
  let high = 1;
  let t = progress;
  for (let iteration = 0; iteration < 7; iteration += 1) {
    t = (low + high) / 2;
    const inverse = 1 - t;
    const x = 3 * inverse * inverse * t * 0.25 + 3 * inverse * t * t * 0.25 + t * t * t;
    if (x < progress) low = t;
    else high = t;
  }
  const inverse = 1 - t;
  return 3 * inverse * inverse * t * 0.1 + 3 * inverse * t * t + t * t * t;
}

function interpolate(from: Column[], to: Column[], progress: number): Column[] {
  return to.map((target, day) => ({
    x: from[day].x + (target.x - from[day].x) * progress,
    width: from[day].width + (target.width - from[day].width) * progress,
    heights: target.heights.map((height, index) => from[day].heights[index] + (height - from[day].heights[index]) * progress),
  }));
}

export function ActivityChart({ period, topics, displayedTotal }: { period: Period; topics: Topic[]; displayedTotal: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ChartScene | null>(null);
  const hoveredDayRef = useRef<number | null>(null);
  const tooltipTimerRef = useRef<number | null>(null);
  const tooltipLeaveTimerRef = useRef<number | null>(null);
  const tooltipSessionRef = useRef(false);
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const selectedIds = topics.map((topic) => topic.id).join(",");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-3.2, 3.2, 2.97, -1.03, 0.1, 50);
    camera.position.set(0, 6.2, 10.5);
    camera.lookAt(0, 1.05, 0);
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const materials: THREE.MeshBasicMaterial[][] = [];
    const blocks = Array.from({ length: 30 }, () => topicOrder.map((id) => {
      const faces = makeMaterials(colors[id]);
      materials.push(faces);
      const block = new THREE.Mesh(geometry, faces);
      block.rotation.y = Math.PI / 4;
      block.visible = false;
      scene.add(block);
      return block;
    }));
    const baseFaceColors = materials.map((faces) => faces.map((face) => face.color.clone()));
    const vividFaceColors = baseFaceColors.map((faces) => faces.map((color) => color.clone().offsetHSL(0, 0.13, 0.025)));
    const grayscaleFaceColors = baseFaceColors.map((faces) => faces.map((color) => {
      const hsl = { h: 0, s: 0, l: 0 };
      color.getHSL(hsl);
      return new THREE.Color().setHSL(0, 0, hsl.l);
    }));
    const contacts = Array.from({ length: 7 }, (_, day) => {
      const contact = new THREE.Mesh(
        new THREE.CircleGeometry(0.32, 32),
        new THREE.MeshBasicMaterial({ color: 0xd5d9e5, transparent: true, opacity: 0.11, side: THREE.DoubleSide }),
      );
      contact.rotation.x = -Math.PI / 2;
      contact.position.set(columnX(day, "week"), -0.025, 0);
      scene.add(contact);
      return contact;
    });
    let webgl: THREE.WebGLRenderer | null = null;
    let svg: SVGRenderer | null = null;
    const canvas = document.createElement("canvas");
    let context: WebGL2RenderingContext | null = null;
    try { context = canvas.getContext("webgl2"); } catch { context = null; }
    if (context) {
      try {
        webgl = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true });
        webgl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        webgl.setClearColor(0xffffff, 0);
        webgl.outputColorSpace = THREE.SRGBColorSpace;
        root.replaceChildren(webgl.domElement);
      } catch { webgl = null; }
    }
    if (!webgl) {
      svg = new SVGRenderer();
      svg.setQuality("high");
      svg.setClearColor(new THREE.Color("#ffffff"), 0);
      root.replaceChildren(svg.domElement);
    }
    let renderedWidth = 0;
    let renderedHeight = 0;
    function render() {
      const width = root!.clientWidth;
      const height = root!.clientHeight;
      if (!width || !height) return;
      if (width !== renderedWidth || height !== renderedHeight) {
        renderedWidth = width;
        renderedHeight = height;
        if (webgl) webgl.setSize(width, height, false);
        else svg?.setSize(width, height);
      }
      if (webgl) {
        webgl.render(scene, camera);
      } else if (svg) {
        svg.render(scene, camera);
      }
    }
    let highlightLevels = Array.from({ length: 30 }, () => 0);
    let hoverAmount = 0;
    let hoverFrame: number | null = null;
    function setHover(day: number | null, period: Period, instant = false) {
      if (hoverFrame !== null) cancelAnimationFrame(hoverFrame);
      const nextIndex = period === "week" && day !== null ? weekAnchors[day] : day;
      const targetLevels = Array.from({ length: 30 }, (_, index) => index === nextIndex ? 1 : 0);
      const targetAmount = nextIndex === null ? 0 : 1;
      if (instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        highlightLevels = targetLevels;
        hoverAmount = targetAmount;
        chart.paint(chart.frame);
        hoverFrame = null;
        return;
      }
      const fromLevels = [...highlightLevels];
      const fromAmount = hoverAmount;
      const started = performance.now();
      function tick(now: number) {
        const progress = Math.min((now - started) / 180, 1);
        const eased = easeColor(progress);
        highlightLevels = fromLevels.map((from, index) => from + (targetLevels[index] - from) * eased);
        hoverAmount = fromAmount + (targetAmount - fromAmount) * eased;
        chart.paint(chart.frame);
        hoverFrame = progress < 1 ? requestAnimationFrame(tick) : null;
      }
      hoverFrame = requestAnimationFrame(tick);
    }
    const desaturatedColor = new THREE.Color();
    const accentColor = new THREE.Color();
    const chart: ChartScene = {
      frame: columnsFor("week", []), initialized: false, transitioning: false, animationFrame: null,
      paint(frame) {
        chart.frame = frame;
        frame.forEach((column, day) => {
          let bottom = 0;
          column.heights.forEach((height, index) => {
            const block = blocks[day][index];
            block.visible = height > 0.001;
            block.scale.set(column.width, Math.max(height, 0.0001), column.width);
            block.position.set(column.x, bottom + height / 2, 0);
            bottom += height;
          });
        });
        const weekness = Math.max(0, Math.min(1, (frame[0].width - 0.09) / 0.39));
        camera.top = 2.97 - 0.2 * weekness;
        camera.bottom = -1.03 - 0.2 * weekness;
        camera.updateProjectionMatrix();
        contacts.forEach((contact) => {
          (contact.material as THREE.MeshBasicMaterial).opacity = 0.11 * weekness;
          contact.visible = weekness > 0.01;
        });
        materials.forEach((faces, blockIndex) => {
          const day = Math.floor(blockIndex / topicOrder.length);
          faces.forEach((face, faceIndex) => {
            const base = baseFaceColors[blockIndex][faceIndex];
            desaturatedColor.copy(base).lerp(grayscaleFaceColors[blockIndex][faceIndex], hoverAmount);
            accentColor.copy(base).lerp(vividFaceColors[blockIndex][faceIndex], hoverAmount);
            face.color.copy(desaturatedColor).lerp(accentColor, highlightLevels[day]);
          });
        });
        render();
      },
      setHover,
      hitTest(clientX, clientY, period) {
        if (chart.transitioning) return null;
        const rect = root!.getBoundingClientRect();
        if (clientY < rect.top || clientY > rect.bottom) return null;
        const count = period === "week" ? 7 : 30;
        const centers = Array.from({ length: count }, (_, day) => {
          const point = new THREE.Vector3(columnX(day, period), 0, 0).project(camera);
          return rect.left + (point.x + 1) * rect.width / 2;
        });
        const halfWidth = (centers[1] - centers[0]) / 2;
        const day = centers.findIndex((center) => Math.abs(clientX - center) <= halfWidth);
        const index = period === "week" ? weekAnchors[day] : day;
        return day >= 0 && chart.frame[index].heights.some((height) => height > 0.001) ? day : null;
      },
      tooltipPosition(day, period) {
        const index = period === "week" ? weekAnchors[day] : day;
        const totalHeight = chart.frame[index].heights.reduce((sum, height) => sum + height, 0);
        const point = new THREE.Vector3(columnX(day, period), totalHeight, 0).project(camera);
        const visible = chart.frame[index].heights.filter((height) => height > 0.001).length;
        const tooltipHeight = 34 + visible * 20;
        const rect = root!.getBoundingClientRect();
        const barX = rect.left + (point.x + 1) * rect.width / 2;
        const barTop = rect.top + (1 - point.y) * rect.height / 2;
        const x = Math.max(rect.left + 78, Math.min(rect.right - 78, barX));
        const y = Math.max(8, barTop - tooltipHeight - 20);
        return { x: Math.max(78, Math.min(window.innerWidth - 78, x)), y };
      },
    };
    sceneRef.current = chart;
    const observer = new ResizeObserver(render);
    observer.observe(root);
    render();
    return () => {
      observer.disconnect();
      if (chart.animationFrame !== null) cancelAnimationFrame(chart.animationFrame);
      if (hoverFrame !== null) cancelAnimationFrame(hoverFrame);
      if (tooltipTimerRef.current !== null) window.clearTimeout(tooltipTimerRef.current);
      if (tooltipLeaveTimerRef.current !== null) window.clearTimeout(tooltipLeaveTimerRef.current);
      geometry.dispose();

      materials.forEach((faces) => faces.forEach((face) => face.dispose()));
      contacts.forEach((contact) => { contact.geometry.dispose(); (contact.material as THREE.Material).dispose(); });
      webgl?.dispose();
      webgl?.forceContextLoss();
      root.replaceChildren();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = sceneRef.current;
    if (!chart) return;
    if (chart.animationFrame !== null) cancelAnimationFrame(chart.animationFrame);
    if (tooltipTimerRef.current !== null) {
      window.clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
    if (tooltipLeaveTimerRef.current !== null) {
      window.clearTimeout(tooltipLeaveTimerRef.current);
      tooltipLeaveTimerRef.current = null;
    }
    tooltipSessionRef.current = false;
    setHovered(null);
    if (hoveredDayRef.current !== null) {
      hoveredDayRef.current = null;
      chart.setHover(null, period, true);
    }
    const next = columnsFor(period, topics);
    if (!chart.initialized || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      chart.paint(next);
      chart.initialized = true;
      chart.transitioning = false;
      return;
    }
    const from = chart.frame.map((column) => ({ ...column, heights: [...column.heights] }));
    const started = performance.now();
    chart.transitioning = true;
    function tick(now: number) {
      if (!chart) return;
      const progress = Math.min((now - started) / 280, 1);
      const eased = progress * progress * (3 - 2 * progress);
      chart.paint(interpolate(from, next, eased));
      chart.transitioning = progress < 1;
      chart.animationFrame = progress < 1 ? requestAnimationFrame(tick) : null;
    }
    chart.animationFrame = requestAnimationFrame(tick);
    return () => { if (chart.animationFrame !== null) cancelAnimationFrame(chart.animationFrame); };
  }, [period, selectedIds, topics]);

  function showDay(day: number | null, instant = false) {
    const chart = sceneRef.current;
    if (!chart || hoveredDayRef.current === day) return;
    hoveredDayRef.current = day;
    chart.setHover(day, period, instant);
    if (tooltipTimerRef.current !== null) {
      window.clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
    if (tooltipLeaveTimerRef.current !== null) {
      window.clearTimeout(tooltipLeaveTimerRef.current);
      tooltipLeaveTimerRef.current = null;
    }
    if (day === null) {
      tooltipSessionRef.current = false;
      setHovered((current) => current ? { ...current, leaving: true } : null);
      tooltipLeaveTimerRef.current = window.setTimeout(() => {
        tooltipLeaveTimerRef.current = null;
        setHovered((current) => current?.leaving ? null : current);
      }, 100);
      return;
    }
    if (instant || tooltipSessionRef.current) {
      tooltipSessionRef.current = true;
      setHovered({ day, period, selectedIds, instant, leaving: false, ...chart.tooltipPosition(day, period) });
      return;
    }
    setHovered((current) => current?.leaving ? current : null);
    tooltipTimerRef.current = window.setTimeout(() => {
      tooltipTimerRef.current = null;
      if (hoveredDayRef.current !== day) return;
      tooltipSessionRef.current = true;
      setHovered({ day, period, selectedIds, instant: false, leaving: false, ...chart.tooltipPosition(day, period) });
    }, 40);
  }
  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    showDay(sceneRef.current?.hitTest(event.clientX, event.clientY, period) ?? null);
  }
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!topics.length || sceneRef.current?.transitioning) return;
    if (event.key === "Escape") { showDay(null, true); return; }
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const count = period === "week" ? 7 : 30;
    showDay(hoveredDayRef.current === null ? (direction === 1 ? 0 : count - 1) : (hoveredDayRef.current + direction + count) % count, true);
  }
  const rawTotal = topics.reduce((sum, topic) => sum + topic[period], 0);
  const activeHovered = hovered?.period === period && hovered.selectedIds === selectedIds ? hovered : null;
  const categories = activeHovered === null ? [] : topics.map((topic) => ({
    id: topic.id, label: topic.label,
    count: rawTotal ? Math.round(topic[period] * weight(topic.id, period, activeHovered.day) / rawTotal * displayedTotal) : 0,
  }));
  const dayCount = categories.reduce((sum, category) => sum + category.count, 0);

  return (
    <div className="activity-chart" role="group" tabIndex={0}
      aria-label={`${period === "week" ? "Seven" : "Thirty"} daily columns comparing conversation volume. Use the arrow keys to inspect each column.`}
      onPointerMove={handlePointerMove} onPointerLeave={() => showDay(null)}
      onKeyDown={handleKeyDown} onBlur={() => showDay(null)}>
      <div className="chart-render-root" ref={rootRef} aria-hidden="true" />
      {activeHovered !== null && typeof document !== "undefined" && createPortal(
        <div className={`chart-tooltip${activeHovered.leaving ? " is-leaving" : ""}`} role="tooltip" data-instant={activeHovered.instant ? "true" : undefined} style={{ left: activeHovered.x, top: activeHovered.y }}>
          <div className="chart-tooltip-summary">
            <span>{period === "week" ? weekLabels[activeHovered.day] : monthLabels[activeHovered.day]}</span>
            <strong>{dayCount.toLocaleString("en-US")}</strong>
          </div>
          <div className="chart-tooltip-categories">
            {categories.map((category) => (
              <div className="chart-tooltip-category" key={category.id}>
                <span className="chart-tooltip-dot" style={{ backgroundColor: tooltipColors[category.id] }} />
                <span className="chart-tooltip-name">{category.label}</span>
                <span className="chart-tooltip-count">{category.count.toLocaleString("en-US")}</span>
              </div>
            ))}
          </div>
        </div>, document.body
      )}
    </div>
  );
}
