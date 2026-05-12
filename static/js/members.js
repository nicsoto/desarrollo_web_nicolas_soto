document.querySelectorAll(".clickable-row").forEach((row) => {
  row.addEventListener("click", (event) => {
    if (event.target.tagName.toLowerCase() !== "a") {
      window.location.href = row.dataset.href;
    }
  });
});
