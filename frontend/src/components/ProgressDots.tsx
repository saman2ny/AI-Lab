export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="progress-dots">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`progress-dot${i <= current ? " active" : ""}`} />
      ))}
    </div>
  );
}
