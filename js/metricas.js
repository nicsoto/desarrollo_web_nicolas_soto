const chartMembers = document.getElementById("chart-miembros");
const chartActivities = document.getElementById("chart-actividades");

const countBy = (arr, key) => {
  const result = {};
  arr.forEach((item) => {
    const value = item[key];
    result[value] = (result[value] || 0) + 1;
  });
  return result;
};

const renderBarChart = (container, dataMap) => {
  container.textContent = "";
  const entries = Object.entries(dataMap);
  const maxValue = Math.max(...entries.map((entry) => entry[1]), 1);

  entries.forEach(([label, value]) => {
    const wrap = document.createElement("div");
    wrap.className = "bar-wrap";

    const labelEl = document.createElement("span");
    labelEl.textContent = label;

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.width = `${(value / maxValue) * 100}%`;

    const valueEl = document.createElement("span");
    valueEl.textContent = String(value);

    wrap.appendChild(labelEl);
    wrap.appendChild(bar);
    wrap.appendChild(valueEl);
    container.appendChild(wrap);
  });
};

const membersByType = countBy(membersData, "tipo");
const activitiesByType = countBy(activitiesData, "tipo");

renderBarChart(chartMembers, membersByType);
renderBarChart(chartActivities, activitiesByType);