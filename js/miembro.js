const memberForm = document.getElementById("member-form");
const typeSelect = document.getElementById("tipo");
const specificInput = document.getElementById("dato-especifico");

const valBox = document.getElementById("val-box");
const valTitle = document.getElementById("val-title");
const valList = document.getElementById("val-list");

const specificPlaceholders = {
  pregrado: "Ej: Ano de ingreso",
  postgrado: "Ej: Programa de magister/doctorado",
  funcionario: "Ej: Cargo en el DCC",
  academico: "Ej: Area de investigacion"
};

const showErrors = (errors) => {
  valList.textContent = "";
  errors.forEach((error) => {
    const li = document.createElement("li");
    li.textContent = error;
    valList.appendChild(li);
  });

  valTitle.textContent = "Se encontraron errores";
  valBox.style.backgroundColor = "#ffe6e6";
  valBox.style.borderLeftColor = "#b30000";
  valBox.hidden = false;
};

const showSuccess = () => {
  valList.textContent = "";
  const li = document.createElement("li");
  li.textContent = "Formulario valido (prototipo sin envio a servidor).";
  valList.appendChild(li);

  valTitle.textContent = "Validacion correcta";
  valBox.style.backgroundColor = "#e9ffe9";
  valBox.style.borderLeftColor = "#1d7d1d";
  valBox.hidden = false;
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^[0-9+\s-]{8,15}$/;
  return re.test(phone);
};

typeSelect.addEventListener("change", () => {
  specificInput.placeholder = specificPlaceholders[typeSelect.value] || "Se ajusta automaticamente segun el tipo";
});

document.getElementById("member-submit").addEventListener("click", () => {
  const errors = [];

  const nombre = memberForm["nombre"].value.trim();
  const tipo = memberForm["tipo"].value;
  const correo = memberForm["correo"].value.trim();
  const telefono = memberForm["telefono"].value.trim();
  const unidad = memberForm["unidad"].value.trim();
  const datoEspecifico = memberForm["dato-especifico"].value.trim();

  if (nombre.length < 4) {
    errors.push("Nombre completo debe tener al menos 4 caracteres.");
  }
  if (!tipo) {
    errors.push("Debe seleccionar un tipo de miembro.");
  }
  if (!validateEmail(correo)) {
    errors.push("Correo invalido.");
  }
  if (!validatePhone(telefono)) {
    errors.push("Telefono invalido (solo numeros y al menos 8 caracteres). ");
  }
  if (unidad.length < 3) {
    errors.push("Carrera / Programa / Unidad es obligatorio.");
  }
  if (datoEspecifico.length < 2) {
    errors.push("Debe completar el dato segun tipo de miembro.");
  }

  if (errors.length > 0) {
    showErrors(errors);
  } else {
    showSuccess();
  }
});