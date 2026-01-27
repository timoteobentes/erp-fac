/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Modal } from "@mui/material";
import { Close } from "@mui/icons-material";

interface ModalCustomProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: any;
  footer?: any;
}

export const ModalCustom = ({
  open,
  onClose,
  title,
  content,
  footer
}: ModalCustomProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="terms-modal-title"
      aria-describedby="terms-modal-description"
    >
      <Box 
        sx={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 600, md: 700 },
          maxWidth: '90vw',
          maxHeight: '80vh'
        }}
        className="bg-white shadow-2xl rounded-[4px] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-[#3C0573] text-white">
          <h2 
            id="terms-modal-title" 
            className="text-xl font-light"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-purple-600 rounded-sm transition-colors cursor-pointer"
          >
            <Close />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          <p 
            id="terms-modal-description" 
            className="text-gray-700 leading-relaxed"
          >
            {content}
          </p>
        </div>

        {footer && (
          <>{footer}</>
          // <div className="p-4 flex justify-start gap-2">
          //   {contentFooter && contentFooter.map((conten: any) => (
          //     <Button 
          //       onClick={conten.onClose}
          //       className="px-4 py-2 bg-primary"
          //       variant="contained"
          //       size="medium"
          //     >
          //       {conten.text}
          //     </Button>
          //   ))}
          // </div>
        )}
      </Box>
    </Modal>
  )
}