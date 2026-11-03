import { formatDay, formatNumber } from "@/lib/admin/format";

// Plain SVG bars for the last days: no chart library, readable by screen readers through the table below.
export function DailyChart({ data }: { data: { day: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((item) => item.count));
  const width = 100;
  const height = 48;
  const gap = 1.5;
  const barWidth = data.length ? (width - gap * (data.length - 1)) / data.length : width;
  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">دادهٔ نموداری وجود ندارد.</p>;
  }

  return (
    <figure>
      <svg
        viewBox={`0 0 ${width} ${height + 2}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`تعداد درخواست‌ها در ${formatNumber(data.length)} روز گذشته: جمعاً ${formatNumber(total)}`}
        className="h-36 w-full"
      >
        <line x1="0" x2={width} y1={height} y2={height} stroke="var(--brand-border)" strokeWidth="0.4" />
        {data.map((item, index) => {
          const barHeight = (item.count / max) * (height - 4);
          const isLast = index === data.length - 1;
          return (
            <rect
              key={item.day}
              x={index * (barWidth + gap)}
              y={height - barHeight}
              width={barWidth}
              height={Math.max(barHeight, item.count > 0 ? 0.8 : 0)}
              rx="0.8"
              fill={isLast ? "var(--brand-accent)" : "var(--brand-primary)"}
              opacity={isLast ? 1 : 0.85}
            >
              <title>{`${formatDay(item.day)}: ${formatNumber(item.count)}`}</title>
            </rect>
          );
        })}
      </svg>
      <figcaption className="mt-2 flex justify-between text-[0.7rem] text-muted">
        <span>{formatDay(data[0].day)}</span>
        <span>امروز</span>
      </figcaption>
    </figure>
  );
}
