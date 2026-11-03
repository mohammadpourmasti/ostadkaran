import { formatDay, formatMonth, formatNumber } from "@/lib/admin/format";

// Plain SVG bars for a report range (daily, or monthly for long ranges). No chart library.
export function ReportSeriesChart({ data, bucket }: { data: { day: string; count: number }[]; bucket: "day" | "month" }) {
  const label = bucket === "month" ? formatMonth : formatDay;
  const max = Math.max(1, ...data.map((item) => item.count));
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const width = 100;
  const height = 48;
  const gap = data.length > 60 ? 0.6 : 1.5;
  const barWidth = data.length ? (width - gap * (data.length - 1)) / data.length : width;

  if (data.length === 0 || total === 0) {
    return <p className="py-8 text-center text-sm text-muted">در این بازه درخواستی ثبت نشده است.</p>;
  }

  return (
    <figure>
      <svg
        viewBox={`0 0 ${width} ${height + 2}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`تعداد درخواست‌ها به تفکیک ${bucket === "month" ? "ماه" : "روز"}: جمعاً ${formatNumber(total)}`}
        className="h-40 w-full"
      >
        <line x1="0" x2={width} y1={height} y2={height} stroke="var(--brand-border)" strokeWidth="0.4" />
        {data.map((item, index) => {
          const barHeight = (item.count / max) * (height - 4);
          return (
            <rect
              key={item.day}
              x={index * (barWidth + gap)}
              y={height - barHeight}
              width={barWidth}
              height={Math.max(barHeight, item.count > 0 ? 0.8 : 0)}
              rx="0.6"
              fill="var(--brand-primary)"
              opacity={0.88}
            >
              <title>{`${label(item.day)}: ${formatNumber(item.count)}`}</title>
            </rect>
          );
        })}
      </svg>
      <figcaption className="mt-2 flex justify-between text-[0.7rem] text-muted">
        <span>{label(data[0].day)}</span>
        <span>بیشینه در یک {bucket === "month" ? "ماه" : "روز"}: {formatNumber(max)}</span>
        <span>{label(data[data.length - 1].day)}</span>
      </figcaption>
    </figure>
  );
}
