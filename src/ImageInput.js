import React from 'react';


const ImageInput = ({ index, prompt, onChange,onGenerate }) => {
  return (
    <div className="input-container">
      <input
        type="text"
        value={prompt}
        onChange={(e) => onChange(index, e.target.value)}
      />
      <button id={`generateButton${index}`} onClick={() => onGenerate(index, prompt)} className='generate-button'>
        Generate Image
      </button>
    </div>
  );
};

export default ImageInput;
