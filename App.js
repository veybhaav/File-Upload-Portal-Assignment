import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

function App() {
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:5000/api/files");
            setFiles(res.data);
        } catch (err) {
            console.error("Error fetching files:", err);
        }
    };

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setError("");
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post("http://127.0.0.1:5000/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                }
            });

            setUploadProgress(0);
            fetchFiles();
        } catch (err) {
            setError(err.response?.data?.error || "Upload failed");
            setUploadProgress(0);
        }
    };

    const deleteFile = async (filename) => {
        try {
            await axios.delete(`http://127.0.0.1:5000/api/files/${filename}`);
            fetchFiles();
        } catch (err) {
            console.error("Error deleting file:", err);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: false });

    return (
        <div className="container">
            <h2>File Upload Portal</h2>

            <div {...getRootProps()} className="dropzone">
                <input {...getInputProps()} />
                <p>Drag & drop a file here, or click to select one</p>
            </div>

            {uploadProgress > 0 && (
                <div className="progress-bar">
                    <div style={{ width: `${uploadProgress}%` }}>{uploadProgress}%</div>
                </div>
            )}

            {error && <p className="error">{error}</p>}

            <h3>Uploaded Files</h3>
            <ul>
                {files.map((file) => (
                    <li key={file.name}>
                        <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                        <button onClick={() => deleteFile(file.name)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
