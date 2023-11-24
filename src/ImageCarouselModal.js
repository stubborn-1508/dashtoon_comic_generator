import React from 'react';
import Modal from 'react-modal';
import { Carousel } from 'react-responsive-carousel';

const ImageCarouselModal = ({ isOpen, onClose, images, selectedIndex,setCarouselIndex }) => {
  if (!images || images.length === 0) {
    return null; // Render nothing if images are not available
  }
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Image Carousel" className="modal-content" overlayClassName="modal-overlay">
      <button onClick={onClose} className='close-carousel'>Close Carousel</button>
      <Carousel showArrows={true} selectedItem={selectedIndex} onChange={(index) => setCarouselIndex(index)}>
        {images.map((image, index) => (
          <div key={index} className="img-container">
            <img src={image} alt={`Generated Image ${index + 1}`} />
          </div>
        ))}
      </Carousel>
    </Modal>
  );
};

export default ImageCarouselModal;
