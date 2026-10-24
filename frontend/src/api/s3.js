// Загрузка файла в S3 по presigned-URL: (1) получаем подписанный URL у бэкенда,
// (2) кладём файл напрямую в хранилище PUT-запросом. Возвращает публичный URL.
// folder задаёт подпапку в бакете (например, "photos" или "documents").
export async function uploadFileToS3(file, folder = "uploads") {
    const contentType = file.type || "application/octet-stream";
    const query = new URLSearchParams({filename: file.name, content_type: contentType, folder});

    const res = await fetch(`/api/s3/presigned-url?${query.toString()}`);
    if (!res.ok) throw new Error("Не удалось получить presigned URL");

    const {upload_url, public_url} = await res.json();

    const uploadRes = await fetch(upload_url, {
        method: "PUT",
        headers: {"Content-Type": contentType},
        body: file,
    });
    if (!uploadRes.ok) throw new Error("Не удалось загрузить файл в S3");

    return public_url;
}
