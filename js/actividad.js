const activityForm = document.getElementById("activity-form");
const activityBox = document.getElementById("val-box");
const activityTitle = document.getElementById("val-title");
const activityList = document.getElementById("val-list");

const validMediaType = (file) => {
  const [family] = file.type.split("/");
  return family === "image" || family === "video";
};

const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (error) {
    return false;
  }
};

const hasValidSchedule = () => {
  const rows = document.querySelectorAll(".schedule-row");
  let anyValid = false;

  rows.forEach((row) => {
    const day = row.querySelector(".dia").value;
    const start = row.querySelector(".hora-inicio").value;
    const end = row.querySelector(".hora-fin").value;

    if (day && start && end && start < end) {
      anyValid = true;
    }
  });

  return anyValid;
};

const showActivityErrors = (errors) => {
  activityList.textContent = "";
  errors.forEach((error) => {
    const li = document.createElement("li");
    li.textContent = error;
    activityList.appendChild(li);
  });

  activityTitle.textContent = "Se encontraron errores";
  activityBox.style.backgroundColor = "#ffe6e6";
  activityBox.style.borderLeftColor = "#b30000";
  activityBox.hidden = false;
};

const showActivitySuccess = () => {
  activityList.textContent = "";
  const li = document.createElement("li");
  li.textContent = "Formulario valido (prototipo sin envio a servidor).";
  activityList.appendChild(li);

  activityTitle.textContent = "Validacion correcta";
  activityBox.style.backgroundColor = "#e9ffe9";
  activityBox.style.borderLeftColor = "#1d7d1d";
  activityBox.hidden = false;
};

document.getElementById("activity-submit").addEventListener("click", () => {
  const errors = [];

  const memberName = activityForm["nombre-miembro"].value.trim();
  const activityType = activityForm["tipo-actividad"].value;
  const activityName = activityForm["nombre-actividad"].value.trim();
  const files = activityForm["archivos"].files;
  const link = activityForm["enlace"].value.trim();

  if (memberName.length < 4) {
    errors.push("Nombre del miembro invalido.");
  }
  if (!activityType) {
    errors.push("Debe seleccionar el tipo de actividad.");
  }
  if (activityName.length < 3) {
    errors.push("Nombre de actividad invalido.");
  }
  if (!hasValidSchedule()) {
    errors.push("Debe ingresar al menos un horario completo y valido (hora inicio menor a hora fin).");
  }
  if (files.length < 1) {
    errors.push("Debe adjuntar al menos un archivo (foto o video).");
  }

  for (const file of files) {
    if (!validMediaType(file)) {
      errors.push("Todos los archivos deben ser imagen o video.");
      break;
    }
  }

  if (!isValidUrl(link)) {
    errors.push("Debe ingresar un enlace valido (http o https).");
  }

  if (errors.length > 0) {
    showActivityErrors(errors);
  } else {
    showActivitySuccess();
  }
});