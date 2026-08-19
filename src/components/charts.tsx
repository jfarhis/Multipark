"use client";

import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import { Doughnut, Line, Radar } from "react-chartjs-2";
import { compactMoney } from "@/lib/calculations";

ChartJS.register(ArcElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, RadialLinearScale, Tooltip);

const palette = ["#4d7cfe", "#38bdf8", "#8b7cf6", "#94a3c8"];
const grid = { color: "rgba(84, 105, 165, .2)", drawTicks: false };
const ticks = { color: "#6b7594", font: { size: 9 }, padding: 9 };
const tooltip = { displayColors: false, backgroundColor: "#1a2340", titleColor: "#8a93b2", bodyColor: "#fff", padding: 10, cornerRadius: 8 };

export function DistributionLineChart({ values = [], labels = [], cumulative }: { values?: number[]; labels?: string[]; cumulative?: number[] }) {
  const hasCumulative = Boolean(cumulative?.length);
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: "Distribuido en el periodo",
            data: values,
            borderColor: "#4d7cfe",
            borderWidth: 2,
            pointRadius: values.map((_, index) => index === values.length - 1 ? 3 : 0),
            pointBackgroundColor: "#4d7cfe",
            pointBorderColor: "#10162a",
            pointBorderWidth: 3,
            tension: 0.42,
            fill: true,
            backgroundColor: (context) => {
              const { ctx, chartArea } = context.chart;
              if (!chartArea) return "rgba(77,124,254,.12)";
              const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              gradient.addColorStop(0, "rgba(77,124,254,.25)");
              gradient.addColorStop(1, "rgba(77,124,254,0)");
              return gradient;
            },
          },
          ...(hasCumulative ? [{
            label: "Acumulado",
            data: cumulative!,
            borderColor: "#38bdf8",
            borderWidth: 1.5,
            borderDash: [5, 4],
            pointRadius: 0,
            tension: 0.3,
            fill: false,
          }] : []),
        ],
      }}
      options={{ responsive: true, maintainAspectRatio: false, animation: { duration: 700 }, plugins: { legend: { display: hasCumulative, position: "top", align: "end", labels: { color: "#8a93b2", boxWidth: 8, boxHeight: 8, usePointStyle: true, font: { size: 9 } } }, tooltip: { ...tooltip, callbacks: { label: (context) => `${context.dataset.label}: ${compactMoney.format(context.parsed.y ?? 0)}` } } }, scales: { x: { border: { display: false }, grid: { display: false }, ticks }, y: { border: { display: false }, grid, ticks: { ...ticks, callback: (value) => compactMoney.format(Number(value)) } } } }}
    />
  );
}

export function ProjectRadarChart({ projects }: { projects: { label: string; construction: number; occupancy: number; irr: number }[] }) {
  const shown = projects.slice(0, 4);
  return (
    <Radar
      data={{
        labels: ["Avance de obra %", "Ocupación %", "TIR proyectada %"],
        datasets: shown.map((project, index) => ({
          label: project.label,
          data: [project.construction, project.occupancy, project.irr],
          borderColor: palette[index % palette.length],
          backgroundColor: `${palette[index % palette.length]}26`,
          borderWidth: 1.5,
          pointRadius: 2.5,
          pointBackgroundColor: palette[index % palette.length],
        })),
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { color: "#8a93b2", boxWidth: 8, boxHeight: 8, usePointStyle: true, font: { size: 9 }, padding: 14 } },
          tooltip: { ...tooltip, displayColors: true, callbacks: { label: (context) => `${context.dataset.label}: ${context.parsed.r}%` } },
        },
        scales: {
          r: {
            suggestedMin: 0,
            suggestedMax: 100,
            angleLines: { color: "rgba(84, 105, 165, .25)" },
            grid: { color: "rgba(84, 105, 165, .2)" },
            pointLabels: { color: "#8a93b2", font: { size: 9 } },
            ticks: { display: false },
          },
        },
      }}
    />
  );
}

export function PortfolioActivityDonut({ items }: { items: { label: string; amount: number }[] }) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[180px_1fr]">
      <div className="relative mx-auto h-[176px] w-[176px]">
        <Doughnut data={{ labels: items.map((item) => item.label), datasets: [{ data: items.map((item) => item.amount), backgroundColor: palette, borderColor: "#10162a", borderWidth: 5, borderRadius: 7, hoverOffset: 2 }] }} options={{ cutout: "72%", maintainAspectRatio: false, rotation: -100, circumference: 350, plugins: { legend: { display: false }, tooltip: { ...tooltip, callbacks: { label: (context) => compactMoney.format(context.parsed) } } } }} />
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div><p className="tabular text-[18px] font-semibold">{compactMoney.format(total)}</p><p className="mt-1 text-[8px] uppercase tracking-[.12em] text-[#6b7594]">Presupuesto total</p></div>
        </div>
      </div>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={item.label} className="flex items-center justify-between gap-3 border-b border-[#232b45] py-2.5 text-[9px] last:border-0">
            <span className="flex min-w-0 items-center gap-2 text-[#8a93b2]"><span className="size-2 shrink-0 rounded-sm" style={{ background: palette[index % palette.length] }} /><span className="truncate">{item.label}</span></span>
            <span className="tabular shrink-0 text-[#d5dcee]">{compactMoney.format(item.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BudgetDonutChart({ items }: { items: { label: string; amount: number }[] }) {
  return (
    <div className="grid items-center gap-5 sm:grid-cols-[160px_1fr]">
      <div className="relative h-[160px]"><Doughnut data={{ labels: items.map((item) => item.label), datasets: [{ data: items.map((item) => item.amount), backgroundColor: palette, borderColor: "#10162a", borderWidth: 4, hoverOffset: 4 }] }} options={{ cutout: "72%", maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip } }} /><div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-[18px] font-semibold">100%</p><p className="text-[8px] text-[#6b7594]">Asignado</p></div></div></div>
      <div className="space-y-3">{items.map((item, index) => <div key={item.label} className="flex items-center justify-between gap-3 text-[9px]"><span className="flex items-center gap-2 text-[#8a93b2]"><span className="size-2 rounded-full" style={{ background: palette[index % palette.length] }} />{item.label}</span><span className="tabular font-medium">{compactMoney.format(item.amount)}</span></div>)}</div>
    </div>
  );
}
