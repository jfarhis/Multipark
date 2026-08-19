export default function Loading() {
  return <div className="mx-auto grid min-h-screen max-w-[1480px] gap-4 p-6"><div className="skeleton h-10 w-64 rounded-xl" /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="skeleton h-32 rounded-2xl" />)}</div><div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]"><div className="skeleton h-80 rounded-2xl" /><div className="skeleton h-80 rounded-2xl" /></div></div>;
}
