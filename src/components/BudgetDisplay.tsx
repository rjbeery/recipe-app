type Props = {
  spent: number;
  limit: number;
};

export default function BudgetDisplay({ spent, limit }: Props) {
  const pct = Math.min((spent / limit) * 100, 100);
  const color = pct > 80 ? "#991b1b" : pct > 40 ? "#92400e" : "#166534";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "0.5rem 0.75rem",
        fontSize: "0.75rem",
        color: "#555",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        minWidth: 140,
      }}
    >
      <div style={{ fontWeight: 600, color, marginBottom: 4 }}>
        AI budget: ${spent.toFixed(4)} / ${limit.toFixed(0)}
      </div>
      <div style={{ background: "#e5e7eb", borderRadius: 4, height: 4 }}>
        <div
          style={{
            background: color,
            borderRadius: 4,
            height: 4,
            width: `${pct}%`,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
