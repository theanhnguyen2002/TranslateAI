
import React from 'react';
import { IconStop } from '../../icon/IconStop';
import { IconMic } from '../../icon/IconMic';

interface MicButtonProps {
  isListening: boolean;
  onClick: () => void;
}

const MicButton: React.FC<MicButtonProps> = ({ isListening, onClick }) => {
  return (
    <button
      className={`p-2 rounded-full shadow-md transition-all duration-150 ${
        isListening ? 'bg-red-500' : 'bg-blue-500'
      }`}
      onClick={onClick}
      aria-label={isListening ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
    >
      {isListening ? (
        <IconStop width="24px" height="24px" color="#ffffff" />
      ) : (
        <IconMic width="24px" height="24px" color="#ffffff" />
      )}
    </button>
  );
};

export default MicButton;
