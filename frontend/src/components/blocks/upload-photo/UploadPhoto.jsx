import {useState, useContext} from "react";
import {UserContext} from "../../../context/user-context.jsx";

export default function UploadPhoto({onUploadSuccess}) {
    const [token] = useContext(UserContext);
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];

    const handleFileChange = (e) => {
        const selectedFiles = [...e.target.files];
        const validFiles = selectedFiles.filter(file => {
            const ext = file.name.split(".").pop().toLowerCase();
            return allowedExtensions.includes(ext);
        });

        if (validFiles.length !== selectedFiles.length) {
            alert("Некоторые файлы не являются изображениями и не будут загружены.");
        }

        setFiles(validFiles);
    };

    const uploadFiles = async () => {
        if (files.length === 0) {
            alert("Выберите хотя бы одно изображение.");
            return;
        }

        setIsUploading(true);
        const uploaded = [];

        try {
            for (const file of files) {
                const query = new URLSearchParams({
                    filename: file.name,
                    content_type: file.type
                });

                const res = await fetch(`/api/s3/presigned-url?${query.toString()}`);
                if (!res.ok) throw new Error("Не удалось получить presigned URL");

                const {upload_url, public_url} = await res.json();

                // загрузка в S3 по presigned URL
                const uploadRes = await fetch(upload_url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': file.type
                    },
                    body: file
                });

                if (!uploadRes.ok) throw new Error("Не удалось загрузить файл в S3");

                uploaded.push({url: public_url});
            }

            // Вызываем колбэк с новыми фотографиями
            if (onUploadSuccess) {
                onUploadSuccess(uploaded);
            }

            alert("Фото успешно загружены");
            setFiles([]);

        } catch (error) {
            console.error("Ошибка загрузки:", error);
            alert("Ошибка при загрузке фото: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="mt-6 p-4 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-3">Добавить фотографии</h3>

            <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file"
                       className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-2 text-gray-500" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="text-sm text-gray-500">
                            <span className="font-semibold">Нажмите для загрузки</span> или перетащите файлы
                        </p>
                        <p className="text-xs text-gray-500">SVG, PNG, JPG, GIF, WEBP</p>
                    </div>
                    <input
                        id="dropzone-file"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                </label>
            </div>

            {files.length > 0 && (
                <div className="mt-3">
                    <p className="text-sm text-gray-600">
                        Выбрано файлов: {files.length}
                    </p>
                </div>
            )}

            <button
                onClick={uploadFiles}
                disabled={isUploading || files.length === 0}
                className="px-4 py-2 mt-3 w-full bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
                {isUploading ? 'Загрузка...' : `Загрузить ${files.length} фото`}
            </button>
        </div>
    );
}
