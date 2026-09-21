export function Disclaimer({ pinned = false }: { pinned?: boolean }) {
  return (
    <p className={`disclaimer${pinned ? " disclaimer-pinned" : ""}`}>
      This explains what your report says. It is not a diagnosis — decisions belong with a clinician.
    </p>
  );
}

export function BrandLockup() {
  return (
    <div className="brand-lockup">
      <div className="brand-mark" />
      <span className="brand-name">Lab Explainer</span>
    </div>
  );
}
