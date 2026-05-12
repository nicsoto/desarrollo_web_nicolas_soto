from pathlib import Path
from uuid import uuid4

from werkzeug.utils import secure_filename


def save_uploads(files, upload_folder):
    saved = []
    folder = Path(upload_folder)
    folder.mkdir(parents=True, exist_ok=True)

    for file in files:
        original_name = secure_filename(file.filename)
        suffix = Path(original_name).suffix.lower()
        stored_name = f"{uuid4().hex}{suffix}"
        path = folder / stored_name
        file.save(path)
        saved.append(
            {
                "ruta_archivo": f"uploads/{stored_name}",
                "nombre_archivo": original_name,
            }
        )

    return saved

