import React, { useRef, useState } from "react";
import { Upload, Loader } from "lucide-react";
import "./ImageUpload.css";

const ImageUpload = ({ onImageSelect, initialImage = null }) => {
  const [preview, setPreview] = useState(initialImage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();

  const validateImage = (file) => {
    // Size limit: 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("Image size should be less than 5MB");
    }

    // Valid types
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      throw new Error("Please upload a JPG, PNG or GIF image");
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    setError(null);

    if (file) {
      try {
        validateImage(file);
        setIsLoading(true);

        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
          onImageSelect(file);
          setIsLoading(false);
        };
        reader.onerror = () => {
          setError("Error reading file");
          setIsLoading(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageSelect({ target: { files: [file] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveImage = () => {
    setPreview(null);
    fileInputRef.current.value = "";
    onImageSelect(null);
  };

  return (
    <div className="image-upload-wrapper">
      <div
        className={`image-upload-container ${error ? "error" : ""}`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="image-upload-input"
        />

        {isLoading ? (
          <div className="loading-state">
            <Loader className="loading-icon" />
            <span>Processing image...</span>
          </div>
        ) : preview ? (
          <>
            <img src={preview} alt="Preview" className="image-preview" />
            <button
              className="remove-image-button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
            >
              Remove Image
            </button>
          </>
        ) : (
          <div className="image-upload-placeholder">
            <Upload size={32} className="image-upload-icon" />
            <span className="image-upload-text">
              Click or drag image to upload
            </span>
            <span className="image-upload-text">
              JPG, PNG or GIF (max. 5MB)
            </span>
          </div>
        )}
      </div>
      {error && <p className="upload-error">{error}</p>}
    </div>
  );
};

export default ImageUpload;
