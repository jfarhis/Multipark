"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

const grid = { color: "rgba(94, 94, 137, .18)", drawTicks: false };
const ticks = { color: "#77779b", font: { size: 9 }, padding: 10 };

export function DistributionLineChart({ values = [112, 146, 139, 184, 211, 238, 274] }: { values?: number[] }) {
  return (
    <Line
      data={{
        labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
        datasets: [{ data: values, borderColor: "#4fd1e8", borderWidth: 2.2, pointRadius: values.map((_, index) => index === values.length - 2 ? 4 : 0), pointBackgroundColor: "#4fd1e8", pointBorderColor: "#1a1a3a", pointBorderWidth: 3, tension: 0.42, fill: true, backgroundColor: (context) => { const chart = context.chart; const { ctx, chartArea } = chart; if (!chartArea) return "rgba(79,209,232,.16)"; const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom); gradient.addColorStop(0, "rgba(79,209,232,.28)"); gradient.addColorStop(1, "rgba(79,209,232,0)"); return gradient; } }],
      }}
      options={{ responsive: true, maintainAspectRatio: false, animation: { duration: 900 }, plugins: { legend: { display: false }, tooltip: { displayColors: false, backgroundColor: "#2a2a5b", titleColor: "#aaaac7", bodyColor: "#fff", padding: 10, cornerRadius: 9, callbacks: { label: (context) => `$${context.parsed.y}k distributed` } } }, scales: { x: { border: { display: false }, grid: { display: false }, ticks }, y: { border: { display: false }, grid, ticks: { ...ticks, callback: (value) => `$${value}k` } } } }}
    />
  );
}

export function OccupancyBarChart({ values }: { values: number[] }) {
  return (
    <Bar
      data={{ labels: ["Aurora", "Marina", "Casa Verde", "Norte"], datasets: [{ data: values, backgroundColor: values.map((_, index) => index === 2 ? "#00cec9" : "rgba(108,92,231,.65)"), borderRadius: 7, borderSkipped: false, barThickness: 22 }] }}
      options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { displayColors: false, backgroundColor: "#2a2a5b", callbacks: { label: (context) => `${context.parsed.y}% occupied` } } }, scales: { x: { border: { display: false }, grid: { display: false }, ticks }, y: { min: 0, max: 100, border: { display: false }, grid, ticks: { ...ticks, callback: (value) => `${value}%` } } } }}
    />
  );
}

export function BudgetDonutChart({ items }: { items: { label: string; amount: number }[] }) {
  return (
    <div className="grid items-center gap-5 sm:grid-cols-[160px_1fr]">
      <div className="relative h-[160px]"><Doughnut data={{ labels: items.map((item) => item.label), datasets: [{ data: items.map((item) => item.amount), backgroundColor: ["#6c5ce7", "#00cec9", "#4fd1e8", "#343467"], borderWidth: 0, hoverOffset: 4 }] }} options={{ cutout: "72%", maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: "#2a2a5b", displayColors: false } } }} /><div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-[18px] font-semibold">100%</p><p className="text-[9px] text-[#8585a7]">Allocated</p></div></div></div>
      <div className="space-y-3">{items.map((item, index) => <div key={item.label} className="flex items-center justify-between gap-3 text-[11px]"><span className="flex items-center gap-2 text-[#9696b4]"><span className="size-2 rounded-full" style={{ background: ["#6c5ce7", "#00cec9", "#4fd1e8", "#343467"][index] }} />{item.label}</span><span className="tabular font-medium">${(item.amount / 1_000_000).toFixed(1)}M</span></div>)}</div>
    </div>
  );
}
