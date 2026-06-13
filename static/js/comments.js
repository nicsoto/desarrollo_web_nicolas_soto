const createCell = (value) => {
  const cell = document.createElement("td");
  cell.textContent = value;
  return cell;
};

const renderCommentRows = (body, comments) => {
  body.textContent = "";

  if (comments.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 3;
    cell.textContent = "No hay comentarios para esta actividad.";
    row.appendChild(cell);
    body.appendChild(row);
    return;
  }

  comments.forEach((comment) => {
    const row = document.createElement("tr");
    row.appendChild(createCell(comment.fecha));
    row.appendChild(createCell(comment.nombre));
    row.appendChild(createCell(comment.texto));
    body.appendChild(row);
  });
};

const setMessage = (box, messages, isSuccess = false) => {
  const list = box.querySelector("ul");
  list.textContent = "";

  messages.forEach((message) => {
    const item = document.createElement("li");
    item.textContent = message;
    list.appendChild(item);
  });

  box.classList.toggle("success", isSuccess);
  box.hidden = false;
};

const hideMessage = (box) => {
  box.hidden = true;
  box.classList.remove("success");
};

const validateCommentForm = (form) => {
  const errors = [];
  const name = form.elements.nombre.value.trim();
  const text = form.elements.texto.value.trim();

  if (name.length < 3 || name.length > 80) {
    errors.push("Nombre debe tener entre 3 y 80 caracteres.");
  }
  if (text.length < 5) {
    errors.push("Comentario debe tener al menos 5 caracteres.");
  }
  if (text.length > 300) {
    errors.push("Comentario no puede superar los 300 caracteres.");
  }

  return { errors, name, text };
};

const loadComments = async (url, body, messageBox) => {
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      setMessage(messageBox, [data.error || "No se pudieron cargar los comentarios."]);
      renderCommentRows(body, []);
      return;
    }

    renderCommentRows(body, data.comentarios || []);
  } catch (error) {
    setMessage(messageBox, ["No se pudieron cargar los comentarios."]);
    renderCommentRows(body, []);
  }
};

document.querySelectorAll(".comments-panel").forEach((panel) => {
  const url = panel.dataset.commentsUrl;
  const form = panel.querySelector(".comment-form");
  const body = panel.querySelector(".comments-body");
  const messageBox = panel.querySelector(".comment-message");

  loadComments(url, body, messageBox);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideMessage(messageBox);

    const { errors, name, text } = validateCommentForm(form);
    if (errors.length > 0) {
      setMessage(messageBox, errors);
      return;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nombre: name, texto: text })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(messageBox, data.errors || [data.error || "No se pudo agregar el comentario."]);
        return;
      }

      form.reset();
      setMessage(messageBox, ["Comentario agregado correctamente."], true);
      await loadComments(url, body, messageBox);
    } catch (error) {
      setMessage(messageBox, ["No se pudo agregar el comentario."]);
    }
  });
});
