import React from 'react';
import ImageInput from './ImageInput';

const ImageGallery = ({ images, onImageClick }) => {
    if (!images || images.length === 0) {
        return null; // Render nothing if images are not available
      }
  return (
    <>
       <div className="image-container">
        {images.map((image, index) => (
            <div
              className="image-item"
              key={index}
              onClick={() => onImageClick(index)}
            >
              {image ? (
                <>
                  <img src={image} alt={`Generated Image ${index + 1}`} />
                  <div className="tooltip">Image {index + 1}</div>
                </>
              ) : (
                'No image generated'
              )}
            </div>
          ))}
        </div>
    </>
  );
};

export default ImageGallery;
