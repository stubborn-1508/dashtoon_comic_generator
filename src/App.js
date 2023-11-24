import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { css } from '@emotion/react';
import { ClipLoader } from 'react-spinners';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { Document, Page, pdfjs } from 'react-pdf';
import jsPDF from 'jspdf';
import InputColumn from './InputColumn';
import RightColumn from './RightColumn';
import ImageCarouselModal from './ImageCarouselModal';
import './App.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

Modal.setAppElement('#root');


const override = css`
  display: block;
  margin: 0 auto;
`;

async function query(data) {
  try {
    const response = await fetch(
      'https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud',
      {
        headers: {
          Accept: 'image/png',
          Authorization:
            'Bearer VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const result = await response.blob();
    return result;
  } catch (error) {
    throw new Error(`Error fetching image: ${error.message}`);
  }
}


//Just a sample api to fetch images for development
// async function query() {
//   try {
//     const response = await fetch('https://picsum.photos/500', {
//       method: 'GET',
//     });

//     if (!response.ok) {
//       throw new Error(`Error: ${response.statusText}`);
//     }

//     const imageUrl = await response.blob();
//     return imageUrl;
//   } catch (error) {
//     throw new Error(`Error fetching image: ${error.message}`);
//   }
// }

const generateZip = async (files) => {
  const zip = new JSZip();

  files.forEach((file, index) => {
    if (file) {
      const filename = `GeneratedImage_${index + 1}.png`;
      zip.file(filename, file.blob);
    }
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return zipBlob;
};

const generatePdf = async (images) => {
  const pdf = new jsPDF(); // Use jsPDF
  const pdfBlobPromises = [];

  images.forEach((image, index) => {
    if (image) {
      pdf.addImage(image, 'PNG', 10, 10, 190, 150); // Adjust the dimensions as needed
      pdf.addPage();
    }
  });

  pdf.deletePage(pdf.internal.getNumberOfPages()); // Remove the last blank page
  const pdfBlob = pdf.output('blob');
  return pdfBlob;
};

const App = () => {
  const [prompts, setPrompts] = useState(Array(10).fill(''));
  const [images, setImages] = useState(Array(10).fill(null));
  const [carouselIndex, setCarouselIndex] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const storedPrompts = localStorage.getItem('inputPrompts');
    const storedImages = localStorage.getItem('generatedImages');
  
    if (storedPrompts) {
      setPrompts(JSON.parse(storedPrompts));
    }
  
    if (storedImages) {
      setImages(JSON.parse(storedImages));
    }
  
  }, []); 
  
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (modalIsOpen) {
        if (e.key === 'ArrowLeft' && carouselIndex > 0) {
          setCarouselIndex(carouselIndex - 1);
        } else if (e.key === 'ArrowRight' && carouselIndex < images.length - 1) {
          setCarouselIndex(carouselIndex + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [carouselIndex, images, modalIsOpen]);

  const handlePromptChange = (index, value) => {
    const newPrompts = [...prompts];
    newPrompts[index] = value;
    setPrompts(newPrompts);

    // Save input prompts to local storage
    localStorage.setItem('inputPrompts', JSON.stringify(newPrompts));
  };

  const handleGenerateImage = async (index, prompt) => {
    const button = document.getElementById(`generateButton${index}`);
    let timeoutId; // Declare timeoutId variable

    // Validate if the prompt is empty
    if (!prompt.trim()) {
      alert('Please enter a non-empty prompt.');
      return;
    }

    console.log(`Generating image for prompt: ${prompt}`);
     // Show loading spinner
    button.innerHTML = '<span>Loading...</span><ClipLoader css={override} size={15} />';

    try {
      const imagePromise = query({ inputs: prompt });

      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Image generation timed out.'));
        }, 120000); // 120 seconds timeout
      });

      // Wait for both the image and the timeout, but handle the timeout separately
      const imageBlob = await Promise.race([imagePromise, timeoutPromise]);
      const imageUrl = URL.createObjectURL(imageBlob);
      console.log(`Generated image for prompt "${prompt}": ${imageUrl}`);
      setImages((prevImages) => {
        const newImages = [...prevImages];
        newImages[index] = imageUrl;
        localStorage.setItem('generatedImages', JSON.stringify(newImages));
        return newImages;
      });
    } catch (error) {
      console.error(`Error generating image for prompt "${prompt}": ${error.message}`);
      alert(`Error: ${error.message}`);
    } finally {
      // Cancel the timeout since the image has been generated or an error occurred
      clearTimeout(timeoutId);
      button.innerHTML = 'Generate Image';
    }
  };

  const handleGenerateAllImages = async () => {
    for (let i = 0; i < prompts.length; i++) {
      await handleGenerateImage(i, prompts[i]);
    }
  };

  const handleImageClick = (index) => {
    setCarouselIndex(index);
    setModalIsOpen(true);
  };

  const handleCloseCarousel = () => {
    setCarouselIndex(null);
    setModalIsOpen(false);
  };

  const handleDownloadZip = async () => {
    const zipBlob = await generateZip(images);
    saveAs(zipBlob, 'GeneratedImages.zip');
  };

  const handleDownloadPdf = async () => {
    const pdfBlob = await generatePdf(images);
    saveAs(pdfBlob, 'GeneratedImages.pdf');
  };

  return (
    <div className="container">
      <InputColumn
        prompts={prompts}
        onChange={handlePromptChange}
        onGenerate={handleGenerateImage}
        onGenerateAll={handleGenerateAllImages}
      />
      <RightColumn images={images} onImageClick={handleImageClick} onDownloadZip={handleDownloadZip} onDownloadPdf={handleDownloadPdf} />
      <ImageCarouselModal
        isOpen={modalIsOpen}
        onClose={handleCloseCarousel}
        images={images}
        selectedIndex={carouselIndex}
        selectCarouselIndex={setCarouselIndex}
      />
    </div>
  );
};

export default App;
