import React from 'react';
import ImageGallery from './ImageGallery';

const RightColumn = ({ images, onImageClick, onDownloadZip, onDownloadPdf }) => {
  return (
    <div className="right-column">
      <h2>Generated Comic</h2>
      <ImageGallery images={images} onImageClick={onImageClick} />
      <div className='download-buttons'>
      <button onClick={onDownloadZip} className='download-button'>Download images as Zip</button>
      <button onClick={onDownloadPdf} className='download-button'>Download images as PDF</button>
      </div>
    </div>
  );
};

export default RightColumn;
