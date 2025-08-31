import {useState, useContext} from "react";
import {UserContext} from "../../../context/user-context.jsx";

export default function UploadPhoto({orderId}) {
    const [token] = useContext(UserContext);
    const [files, setFiles] = useState([]);

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

        const uploaded = [];

        for (const file of files) {
            const query = new URLSearchParams({
                filename: file.name,
                content_type: file.type
            });

            const res = await fetch(`/api/s3/presigned-url?${query.toString()}`);
            const {upload_url, public_url} = await res.json();

            // загрузка в S3 по presigned URL
            await fetch(upload_url, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type
                },
                body: file
            });

            uploaded.push(public_url);
        }

        const dataToSend = {};
        dataToSend.photos_urls = uploaded;

        const saveRes = await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(dataToSend)
        });

        if (saveRes.ok) {
            alert("Фото успешно загружены");
            setFiles([]);
        } else {
            alert("Ошибка при сохранении фото на сервере");
        }
    };

    return (
        <div className="mt-3">
            <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file"
                       className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or
                            drag and drop</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX.
                            800x400px)</p>
                    </div>
                    <input id="dropzone-file" type="file" multiple className="hidden" onChange={handleFileChange}/>
                </label>
            </div>
            <button
                onClick={uploadFiles}
                className="px-3 py-1 mt-2 mb-8 flex flex-col w-full items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Загрузить фото
            </button>
        </div>
    );
}
