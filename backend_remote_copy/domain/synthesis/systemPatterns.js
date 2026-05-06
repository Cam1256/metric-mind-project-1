function buildSystemPatterns(drivers = []) {
  if (!drivers.length) return [];

  const patterns = [];

  // 🔥 ordenar por fuerza
  const sorted = [...drivers].sort((a, b) => b.strength - a.strength);

  // 🔥 cadena principal (top 3)
  if (sorted.length >= 3) {
    patterns.push({
      type: "primary_chain",
      description: "Primary propagation of variability",
      chain: [
        sorted[0].variable,
        sorted[1].variable,
        sorted[2].variable,
        "Output"
      ]
    });
  }

  // 🔥 cluster por tipo
  const groups = {};

  sorted.forEach(d => {
    const key = d.variable.split(".")[1] || "other";
    if (!groups[key]) groups[key] = [];
    groups[key].push(d.variable);
  });

  Object.keys(groups).forEach(group => {
    if (groups[group].length >= 2) {
      patterns.push({
        type: "cluster",
        category: group,
        variables: groups[group]
      });
    }
  });

  return patterns;
}

module.exports = { buildSystemPatterns };