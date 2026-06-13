const colors = ["#0b3d91", "#e76f51", "#2a9d8f", "#f4a261", "#6a4c93", "#5c6f68"];

const setupCanvas = (canvas) => {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = rect.width || canvas.width;
  const height = rect.height || canvas.height;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  const context = canvas.getContext("2d");
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);
  context.font = "13px sans-serif";
  context.lineWidth = 1;

  return { context, width, height };
};

const showMessage = (messages) => {
  const box = document.getElementById("stats-message");
  const list = box.querySelector("ul");
  list.textContent = "";

  messages.forEach((message) => {
    const item = document.createElement("li");
    item.textContent = message;
    list.appendChild(item);
  });

  box.hidden = false;
};

const drawNoData = (canvas, message) => {
  const { context, width, height } = setupCanvas(canvas);
  context.fillStyle = "#555";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(message, width / 2, height / 2);
};

const drawAxes = (context, left, top, width, height) => {
  context.strokeStyle = "#555";
  context.beginPath();
  context.moveTo(left, top);
  context.lineTo(left, top + height);
  context.lineTo(left + width, top + height);
  context.stroke();
};

const drawLineChart = (canvas, items) => {
  if (items.length === 0) {
    drawNoData(canvas, "No hay miembros registrados.");
    return;
  }

  const { context, width, height } = setupCanvas(canvas);
  const margin = { top: 24, right: 24, bottom: 58, left: 56 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const maxValue = Math.max(...items.map((item) => item.total), 1);
  const xFor = (index) => {
    if (items.length === 1) {
      return margin.left + plotWidth / 2;
    }
    return margin.left + (index / (items.length - 1)) * plotWidth;
  };
  const yFor = (value) => margin.top + plotHeight - (value / maxValue) * plotHeight;

  drawAxes(context, margin.left, margin.top, plotWidth, plotHeight);

  context.strokeStyle = "#d8dde6";
  context.fillStyle = "#333";
  context.textAlign = "right";
  context.textBaseline = "middle";

  for (let tick = 0; tick <= 5; tick += 1) {
    const value = Math.round((maxValue * tick) / 5);
    const y = yFor(value);
    context.beginPath();
    context.moveTo(margin.left, y);
    context.lineTo(margin.left + plotWidth, y);
    context.stroke();
    context.fillText(String(value), margin.left - 8, y);
  }

  context.strokeStyle = "#0b3d91";
  context.lineWidth = 2;
  context.beginPath();
  items.forEach((item, index) => {
    const x = xFor(index);
    const y = yFor(item.total);
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });
  context.stroke();

  context.fillStyle = "#e76f51";
  items.forEach((item, index) => {
    const x = xFor(index);
    const y = yFor(item.total);
    context.beginPath();
    context.arc(x, y, 4, 0, Math.PI * 2);
    context.fill();
  });

  const labelStep = Math.max(1, Math.ceil(items.length / 7));
  context.fillStyle = "#333";
  context.textAlign = "right";
  context.textBaseline = "top";
  items.forEach((item, index) => {
    if (index % labelStep !== 0 && index !== items.length - 1) {
      return;
    }
    context.save();
    context.translate(xFor(index), margin.top + plotHeight + 12);
    context.rotate(-Math.PI / 6);
    context.fillText(item.dia, 0, 0);
    context.restore();
  });
};

const drawPieChart = (canvas, items) => {
  if (items.length === 0) {
    drawNoData(canvas, "No hay actividades registradas.");
    return;
  }

  const { context, width, height } = setupCanvas(canvas);
  const total = items.reduce((sum, item) => sum + item.total, 0);
  const wide = width >= 640;
  const centerX = wide ? width * 0.34 : width / 2;
  const centerY = wide ? height / 2 : height * 0.35;
  const radius = Math.min(wide ? width * 0.2 : width * 0.28, height * 0.3, 110);
  let startAngle = -Math.PI / 2;

  items.forEach((item, index) => {
    const slice = (item.total / total) * Math.PI * 2;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.arc(centerX, centerY, radius, startAngle, startAngle + slice);
    context.closePath();
    context.fillStyle = colors[index % colors.length];
    context.fill();
    startAngle += slice;
  });

  const legendX = wide ? width * 0.62 : 24;
  let legendY = wide ? height * 0.24 : centerY + radius + 30;

  context.textAlign = "left";
  context.textBaseline = "middle";
  context.font = "13px sans-serif";

  items.forEach((item, index) => {
    const percent = Math.round((item.total / total) * 100);
    context.fillStyle = colors[index % colors.length];
    context.fillRect(legendX, legendY - 7, 14, 14);
    context.fillStyle = "#222";
    context.fillText(`${item.tipo}: ${item.total} (${percent}%)`, legendX + 22, legendY);
    legendY += 24;
  });
};

const drawBarChart = (canvas, items) => {
  if (items.length === 0) {
    drawNoData(canvas, "No hay actividades asociadas a comunas.");
    return;
  }

  const { context, width, height } = setupCanvas(canvas);
  const margin = { top: 24, right: 24, bottom: 76, left: 56 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const maxValue = Math.max(...items.map((item) => item.total), 1);
  const slotWidth = plotWidth / items.length;
  const barWidth = Math.max(5, slotWidth * 0.62);
  const yFor = (value) => margin.top + plotHeight - (value / maxValue) * plotHeight;

  drawAxes(context, margin.left, margin.top, plotWidth, plotHeight);

  context.strokeStyle = "#d8dde6";
  context.fillStyle = "#333";
  context.textAlign = "right";
  context.textBaseline = "middle";

  for (let tick = 0; tick <= 5; tick += 1) {
    const value = Math.round((maxValue * tick) / 5);
    const y = yFor(value);
    context.beginPath();
    context.moveTo(margin.left, y);
    context.lineTo(margin.left + plotWidth, y);
    context.stroke();
    context.fillText(String(value), margin.left - 8, y);
  }

  items.forEach((item, index) => {
    const x = margin.left + index * slotWidth + (slotWidth - barWidth) / 2;
    const y = yFor(item.total);
    const barHeight = margin.top + plotHeight - y;
    context.fillStyle = colors[index % colors.length];
    context.fillRect(x, y, barWidth, barHeight);
  });

  const labelStep = Math.max(1, Math.ceil(items.length / 8));
  context.fillStyle = "#333";
  context.textAlign = "right";
  context.textBaseline = "top";

  items.forEach((item, index) => {
    if (index % labelStep !== 0 && index !== items.length - 1) {
      return;
    }
    const x = margin.left + index * slotWidth + slotWidth / 2;
    context.save();
    context.translate(x, margin.top + plotHeight + 12);
    context.rotate(-Math.PI / 5);
    context.fillText(item.comuna, 0, 0);
    context.restore();
  });
};

const drawAllCharts = (data) => {
  drawLineChart(document.getElementById("members-line-chart"), data.miembros_por_dia || []);
  drawPieChart(document.getElementById("activities-pie-chart"), data.actividades_por_tipo || []);
  drawBarChart(document.getElementById("activities-bar-chart"), data.actividades_por_comuna || []);
};

const loadStats = async () => {
  const root = document.getElementById("stats-root");
  try {
    const response = await fetch(root.dataset.statsUrl);
    const data = await response.json();

    if (!response.ok) {
      showMessage([data.error || "No se pudieron cargar las estadisticas."]);
      return;
    }

    drawAllCharts(data);
    window.addEventListener("resize", () => drawAllCharts(data));
  } catch (error) {
    showMessage(["No se pudieron cargar las estadisticas."]);
  }
};

loadStats();
