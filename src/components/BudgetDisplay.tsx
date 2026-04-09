type Props = {
  spent: number | null;
  limit: number;
};

export default function BudgetDisplay({ spent, limit }: Props) {
  if (spent === null) {
    return <div style={{ fontSize: "0.72rem", color: "#9ca3af" }}>AI budget: –</div>;
  }

  const pct = Math.min((spent / limit) * 100, 100);
  const color = pct > 80 ? "#991b1b" : pct > 40 ? "#92400e" : "#166534";

  return (
    <div style={{ fontSize: "0.72rem", color: "#555", minWidth: 120 }}>
      <div style={{ fontWeight: 600, color }}>
        AI budget: ${spent.toFixed(4)} / ${limit.toFixed(0)}
      </div>
      <div style={{ background: "#e5e7eb", borderRadius: 4, height: 3, marginTop: 2 }}>
        <div
          style={{
            background: color,
            borderRadius: 4,
            height: 3,
            width: `${pct}%`,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
