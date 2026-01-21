interface CardProps {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Card({ title, children, footer }: CardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {title ? <h2 className="text-lg font-semibold text-slate-900">{title}</h2> : null}
      <div className="mt-3 space-y-3 text-sm text-slate-700">{children}</div>
      {footer ? <div className="mt-4 border-t border-slate-100 pt-3 text-sm">{footer}</div> : null}
    </div>
  );
}
