import { IconButton } from '@mui/material';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import * as React from 'react';
import { IconClose } from '../../icon/IconClose';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  minWidth: 300,
  maxWidth: '90%',
  minHeight: 200,
  maxHeight: '90vh',
  width: 'auto',
  height: 'auto',
  // height: '80%',
  // bgcolor: 'background.paper',
  // boxShadow: 24,

};

interface ModalImagesProps {
  open: boolean;
  handleClose: () => void;
  children: React.ReactNode;
}

export default function ModalImages({ open, handleClose, children }: ModalImagesProps) {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="parent-modal-title"
      aria-describedby="parent-modal-description"
    >
      <>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'fixed',
            top: 10,
            right: 10,
            zIndex: 50,
          }}
        >
          <div className="w-10 h-10 rounded-full bg-black flex justify-center items-center">
            <IconClose width="24" height="24" color="#fff" />
          </div>
        </IconButton>
        <Box sx={{ ...style }}>

          {children}
          
        </Box>
      </>
    </Modal>
  );
}
