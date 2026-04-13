const bodyTable = document.getElementById("tabla-miembros");
const typeFilter = document.getElementById("filtro-tipo");
const sortBy = document.getElementById("ordenar-por");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pageInfo = document.getElementById("page-info");

const pageSize = 4;
let page = 1;

const getFilteredAndSorted = () => {
  const selectedType = typeFilter.value;
  const selectedOrder = sortBy.value;

  let filtered = [...membersData];

  if (selectedType !== "todos") {
    filtered = filtered.filter((member) => member.tipo === selectedType);
  }

  filtered.sort((a, b) => a[selectedOrder].localeCompare(b[selectedOrder], "es"));
  return filtered;
};

const renderTable = () => {
  const filtered = getFilteredAndSorted();
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  if (page > totalPages) {
    page = totalPages;
  }

  const start = (page - 1) * pageSize;
  const current = filtered.slice(start, start + pageSize);

  bodyTable.textContent = "";

  current.forEach((member) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${member.nombre}</td>
      <td>${member.tipo}</td>
      <td>${member.correo}</td>
      <td>${member.telefono}</td>
    `;
    bodyTable.appendChild(tr);
  });

  if (current.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = "<td colspan='4'>No hay resultados para el filtro seleccionado.</td>";
    bodyTable.appendChild(tr);
  }

  pageInfo.textContent = `Pagina ${page} de ${totalPages}`;
  prevBtn.disabled = page === 1;
  nextBtn.disabled = page === totalPages;
};

typeFilter.addEventListener("change", () => {
  page = 1;
  renderTable();
});

sortBy.addEventListener("change", () => {
  page = 1;
  renderTable();
});

prevBtn.addEventListener("click", () => {
  if (page > 1) {
    page -= 1;
    renderTable();
  }
});

nextBtn.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(getFilteredAndSorted().length / pageSize));
  if (page < totalPages) {
    page += 1;
    renderTable();
  }
});

renderTable();