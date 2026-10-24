import {useEffect, useRef, useState} from "react";
import {useAuth} from "../../../context/useAuth.jsx";
import {useChat} from "../../../hooks/useChat.js";
import {uploadFileToS3} from "../../../api/s3.js";
import {
    attachButtonStyle,
    chatContainerStyle,
    chatHeaderStyle,
    chatInputStyle,
    chatInputWrapStyle,
    connectedDotStyle,
    disconnectedDotStyle,
    fileAttachmentStyle,
    filePreviewStyle,
    messagesAreaStyle,
    otherBubbleStyle,
    otherMessageStyle,
    ownBubbleStyle,
    ownMessageStyle,
    sendButtonStyle,
    senderNameStyle,
    timeStyle,
} from "./styles.js";

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);

function isImage(fileName) {
    if (!fileName) return false;
    const ext = fileName.split(".").pop().toLowerCase();
    return IMAGE_EXTS.has(ext);
}

export default function Chat({roomId, title = "Чат", className = ""}) {
    const {user} = useAuth();
    const {messages, send, connected} = useChat(roomId);
    const [input, setInput] = useState("");
    const [pendingFile, setPendingFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const bottomRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) setPendingFile(file);
        e.target.value = "";
    };

    const clearPendingFile = () => setPendingFile(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text && !pendingFile) return;

        if (pendingFile) {
            setUploading(true);
            try {
                const publicUrl = await uploadFileToS3(pendingFile, "chat");
                send(text, publicUrl, pendingFile.name);
                setPendingFile(null);
                setInput("");
            } catch (err) {
                console.error(err);
                alert("Ошибка загрузки файла: " + err.message);
            } finally {
                setUploading(false);
            }
        } else {
            send(text);
            setInput("");
        }
    };

    const canSend = connected && !uploading && (input.trim() || pendingFile);

    return (
        <div className={`${chatContainerStyle} ${className}`}>
            <div className={chatHeaderStyle}>
                <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
                <span className={connected ? connectedDotStyle : disconnectedDotStyle}>
                    {connected ? "● онлайн" : "○ не подключён"}
                </span>
            </div>

            <div className={messagesAreaStyle}>
                {messages.length === 0 && (
                    <p className="text-gray-400 text-xs text-center pt-6">Нет сообщений</p>
                )}
                {messages.map((msg) => {
                    const isOwn = msg.sender_id === user?.id;
                    return (
                        <div key={msg.id} className={isOwn ? ownMessageStyle : otherMessageStyle}>
                            <span className={senderNameStyle}>{msg.sender_name}</span>
                            {msg.content && (
                                <div className={isOwn ? ownBubbleStyle : otherBubbleStyle}>
                                    {msg.content}
                                </div>
                            )}
                            {msg.file_url && (
                                isImage(msg.file_name) ? (
                                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer"
                                       className="mt-1 block max-w-[85%]">
                                        <img
                                            src={msg.file_url}
                                            alt={msg.file_name}
                                            className="max-h-48 rounded-lg border border-gray-200 object-cover"
                                        />
                                    </a>
                                ) : (
                                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer"
                                       className={fileAttachmentStyle}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0"
                                             fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                  d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 002.112 2.13"/>
                                        </svg>
                                        <span>{msg.file_name || "Файл"}</span>
                                    </a>
                                )
                            )}
                            <span className={timeStyle}>
                                {new Date(msg.created_at).toLocaleTimeString("ru-RU", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                    );
                })}
                <div ref={bottomRef}/>
            </div>

            {pendingFile && (
                <div className="px-3 pb-1 flex items-center gap-2">
                    <span className={filePreviewStyle}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500 shrink-0"
                             fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 002.112 2.13"/>
                        </svg>
                        <span className="truncate max-w-[200px]">{pendingFile.name}</span>
                    </span>
                    <button type="button" onClick={clearPendingFile}
                            className="text-gray-400 hover:text-red-500 text-xs transition-colors">
                        ✕
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className={chatInputWrapStyle}>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={!connected || uploading}
                />
                <button
                    type="button"
                    className={attachButtonStyle}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!connected || uploading}
                    title="Прикрепить файл"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                         viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 002.112 2.13"/>
                    </svg>
                </button>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={uploading ? "Загрузка файла..." : connected ? "Сообщение..." : "Подключение..."}
                    className={chatInputStyle}
                    disabled={!connected || uploading}
                />
                <button type="submit" className={sendButtonStyle} disabled={!canSend}>
                    {uploading ? "..." : "Отправить"}
                </button>
            </form>
        </div>
    );
}
