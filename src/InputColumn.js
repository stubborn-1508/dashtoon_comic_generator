import React from 'react';
import ImageInput from './ImageInput';

const InputColumn = ({ prompts, onChange, onGenerate, onGenerateAll }) => {
  return (
    <div className="left-column">
      <h2>Input Prompts</h2>
      {prompts.map((prompt, index) => (
        <ImageInput key={index} index={index} prompt={prompt} onChange={onChange} onGenerate={onGenerate} />
      ))}
      <button onClick={onGenerateAll} className="generate-all">Generate All Images</button>
    </div>
  );
};

export default InputColumn;
