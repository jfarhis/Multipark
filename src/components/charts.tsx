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
  Tooltip,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { compactMoney } from "@/lib/calculations";

ChartJS.register(ArcElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

const palette = ["#ff7a2f", "#ffd166", "#e8402a", "#ffa27a"];
const grid = { color: "rgba(122, 84, 64, .22)", drawTicks: false };
const ticks = { color: "#96725f", font: { size: 9 }, padding: 9 };
const tooltip = { displayColors: false, backgroundColor: "#2c1613", titleColor: "#b18f7e", bodyColor: "#fff", padding: 10, cornerRadius: 8 };

export function DistributionLineChart({ values = [], labels = [] }: { values?: number[]; labels?: string[] }) {
  return (
    <Line
      data={{
        labels,
        datasets: [{
          data: values,
          borderColor: "#ff6b3d",
          borderWidth: 2,
          pointRadius: values.map((_, index) => index === values.length - 1 ? 3 : 0),
          pointBackgroundColor: "#ff6b3d",
          pointBorderColor: "#1e0f0b",
          pointBorderWidth: 3,
          tension: 0.42,
          fill: true,
          backgroundColor: (context) => {
            const { ctx, chartArea } = context.chart;
            if (!chartArea) return "rgba(255,107,61,.12)";
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, "rgba(255,107,61,.25)");
            gradient.addColorStop(1, "rgba(255,107,61,0)");
            return gradient;
          },
        }],
      }}
      options={{ responsive: true, maintainAspectRatio: false, animation: { duration: 700 }, plugins: { legend: { display: false }, tooltip: { ...tooltip, callbacks: { label: (context) => `${compactMoney.format(context.parsed.y ?? 0)} distribuidos` } } }, scales: { x: { border: { display: false }, grid: { display: false }, ticks }, y: { border: { display: false }, grid, ticks: { ...ticks, callback: (value) => compactMoney.format(Number(value)) } } } }}
    />
  );
}

export function PortfolioActivityDonut({ items }: { items: { label: string; amount: number }[] }) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[180px_1fr]">
      <div className="relative mx-auto h-[176px] w-[176px]">
        <Doughnut data={{ labels: items.map((item) => item.label), datasets: [{ data: items.map((item) => item.amount), backgroundColor: palette, borderColor: "#1e0f0b", borderWidth: 5, borderRadius: 7, hoverOffset: 2 }] }} options={{ cutout: "72%", maintainAspectRatio: false, rotation: -100, circumference: 350, plugins: { legend: { display: false }, tooltip: { ...tooltip, callbacks: { label: (context) => compactMoney.format(context.parsed) } } } }} />
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div><p className="tabular text-[18px] font-semibold">{compactMoney.format(total)}</p><p className="mt-1 text-[8px] uppercase tracking-[.12em] text-[#96725f]">Presupuesto total</p></div>
        </div>
      </div>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={item.label} className="flex items-center justify-between gap-3 border-b border-[#35201a] py-2.5 text-[9px] last:border-0">
            <span className="flex min-w-0 items-center gap-2 text-[#b18f7e]"><span className="size-2 shrink-0 rounded-sm" style={{ background: palette[index % palette.length] }} /><span className="truncate">{item.label}</span></span>
            <span className="tabular shrink-0 text-[#e9d8cc]">{compactMoney.format(item.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BudgetDonutChart({ items }: { items: { label: string; amount: number }[] }) {
  return (
    <div className="grid items-center gap-5 sm:grid-cols-[160px_1fr]">
      <div className="relative h-[160px]"><Doughnut data={{ labels: items.map((item) => item.label), datasets: [{ data: items.map((item) => item.amount), backgroundColor: palette, borderColor: "#1e0f0b", borderWidth: 4, hoverOffset: 4 }] }} options={{ cutout: "72%", maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip } }} /><div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-[18px] font-semibold">100%</p><p className="text-[8px] text-[#96725f]">Asignado</p></div></div></div>
      <div className="space-y-3">{items.map((item, index) => <div key={item.label} className="flex items-center justify-between gap-3 text-[9px]"><span className="flex items-center gap-2 text-[#b18f7e]"><span className="size-2 rounded-full" style={{ background: palette[index % palette.length] }} />{item.label}</span><span className="tabular font-medium">{compactMoney.format(item.amount)}</span></div>)}</div>
    </div>
  );
}
