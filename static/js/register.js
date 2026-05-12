const form = document.getElementById("register-form");
const valBox = document.getElementById("val-box");
const valTitle = document.getElementById("val-title");
const valList = document.getElementById("val-list");
const regionSelect = document.getElementById("region");
const comunaSelect = document.getElementById("comuna");
const typeSelect = document.getElementById("tipo_miembro");
const specificInput = document.getElementById("dato_especifico");

const placeholders = {
  pregrado: "Ej: Ano de ingreso",
  postgrado: "Ej: Programa de magister/doctorado",
  funcionario: "Ej: Cargo en el DCC",
  academico: "Ej: Area de investigacion"
};

const showErrors = (errors) => {
  valList.textContent = "";
  errors.forEach((error) => {
    const item = document.createElement("li");
    item.textContent = error;
    valList.appendChild(item);
  });

  valTitle.textContent = "Se encontraron errores";
  valBox.hidden = false;
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^[0-9+\s-]{8,15}$/.test(phone);

const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (error) {
    return false;
  }
};

const validMediaType = (file) => {
  const family = file.type.split("/")[0];
  return family === "image" || family === "video";
};

const filterComunas = () => {
  const regionId = regionSelect.value;

  Array.from(comunaSelect.options).forEach((option) => {
    const visible = !option.dataset.region || option.dataset.region === regionId;
    option.hidden = !visible;
  });

  comunaSelect.value = "";
};

const activityHasData = (block) => {
  const fields = block.querySelectorAll("input, select, textarea");
  return Array.from(fields).some((field) => {
    if (field.type === "file") {
      return field.files.length > 0;
    }
    return field.value.trim() !== "";
  });
};

const validateActivity = (block, number, errors) => {
  const required = block.dataset.required === "true" || activityHasData(block);
  if (!required) {
    return;
  }

  const type = block.querySelector(".tipo-actividad").value;
  const name = block.querySelector(".nombre-actividad").value.trim();
  const day = block.querySelector(".dia").value;
  const start = block.querySelector(".hora-inicio").value;
  const duration = block.querySelector(".duracion").value;
  const link = block.querySelector(".enlace").value.trim();
  const files = block.querySelector(".fotos").files;

  if (!type) {
    errors.push(`Debe seleccionar tipo en actividad ${number}.`);
  }
  if (name.length < 3 || name.length > 45) {
    errors.push(`Nombre invalido en actividad ${number}.`);
  }
  if (!day || !start || !duration) {
    errors.push(`Debe completar horario en actividad ${number}.`);
  }
  if (!isValidUrl(link)) {
    errors.push(`Debe ingresar enlace valido en actividad ${number}.`);
  }
  if (files.length < 1) {
    errors.push(`Debe adjuntar al menos un archivo en actividad ${number}.`);
  }

  for (const file of files) {
    if (!validMediaType(file)) {
      errors.push(`Los archivos de actividad ${number} deben ser imagen o video.`);
      break;
    }
  }
};

typeSelect.addEventListener("change", () => {
  specificInput.placeholder = placeholders[typeSelect.value] || "Se ajusta automaticamente segun el tipo";
});

regionSelect.addEventListener("change", filterComunas);
filterComunas();

form.addEventListener("submit", (event) => {
  const errors = [];

  if (form.nombre.value.trim().length < 4) {
    errors.push("Nombre completo debe tener al menos 4 caracteres.");
  }
  if (!form.tipo_miembro.value) {
    errors.push("Debe seleccionar un tipo de miembro.");
  }
  if (!validateEmail(form.email.value.trim())) {
    errors.push("Correo invalido.");
  }
  if (!validatePhone(form.telefono.value.trim())) {
    errors.push("Telefono invalido.");
  }
  if (!form.region.value || !form.comuna_id.value) {
    errors.push("Debe seleccionar region y comuna.");
  }
  if (form.unidad.value.trim().length < 3) {
    errors.push("Carrera / Programa / Unidad es obligatorio.");
  }
  if (form.dato_especifico.value.trim().length < 2) {
    errors.push("Debe completar el dato segun tipo de miembro.");
  }

  document.querySelectorAll(".activity-block").forEach((block, index) => {
    validateActivity(block, index + 1, errors);
  });

  if (errors.length > 0) {
    event.preventDefault();
    showErrors(errors);
  } else if (!confirm("¿Confirma el registro?")) {
    event.preventDefault();
  }
});
