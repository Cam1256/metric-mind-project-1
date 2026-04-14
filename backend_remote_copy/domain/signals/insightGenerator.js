function generateBusinessInsight(analysis) {
  const { warnings, insights } = analysis;

  let message = "";

  // ---- Insights ----
  insights.forEach(i => {
    if (i.code === "BOTTLENECK_DETECTED") {
      message += `⚠️ ${i.message} This is likely limiting overall system performance.\n`;
    }
  });

  // ---- Warnings ----
  warnings.forEach(w => {
    if (w.code === "STAGE2_DEVIATION") {
      message += `Stage 2 is operating outside expected parameters and should be prioritized.\n`;
    }

    if (w.code === "STAGE1_DEVIATION") {
      message += `Stage 1 shows moderate deviation, but is not the primary constraint.\n`;
    }
  });

  return message.trim();
}

function generateAggregateInsight(summary) {
  const { totalRows, bottleneckCount, rates } = summary;

  const stage2Rate = rates.stage2 || 0;
  const stage1Rate = rates.stage1 || 0;

  let message = "";

  if (stage2Rate > 0.6) {
    message += `Stage 2 is consistently acting as the primary bottleneck, constraining overall system throughput in approximately ${(stage2Rate * 100).toFixed(1)}% of observed operations.\n\n`;
  }

  if (stage1Rate > 0.1) {
    message += `While Stage 1 also shows recurring deviations, it is not the dominant constraint in the system.\n\n`;
  }

  message += `From an operational perspective, efforts should be prioritized on stabilizing Stage 2, as improvements here are likely to yield the highest impact on overall efficiency and output.`;

  return message.trim();
}

module.exports = { generateBusinessInsight, generateAggregateInsight };