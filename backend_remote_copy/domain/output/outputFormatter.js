function formatDriversTable(drivers = []) {
  return drivers.map((d, i) => ({
    rank: i + 1,
    variable: d.variable,
    importance: d.severity
  }));
}

function formatMermaid(drivers = []) {
  let graph = "graph TD\n";

  drivers.slice(0, 3).forEach((d, i) => {
    graph += `D${i}[${d.variable}] --> S[Stage2 Performance]\n`;
  });

  return graph;
}

module.exports = { formatDriversTable, formatMermaid };