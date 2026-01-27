import React, { useRef } from 'react';
import { Button, IconButton, Typography, Box } from '@mui/material';
import { CloudUpload, Delete, InsertDriveFile, Image } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface FileItem {
  id?: number; // Para arquivos já salvos
  url?: string;
  name: string;
  file?: File; // Para novos arquivos
}

interface FileUploaderProps {
  files: FileItem[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  accept?: string;
  label?: string;
  multiple?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  files, onAdd, onRemove, accept = "*/*", label = "Upload", multiple = true 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onAdd(Array.from(event.target.files));
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset para permitir re-upload do mesmo arquivo
    }
  };

  return (
    <Box className="border border-dashed border-[#9842F6] rounded-lg p-4 bg-[#F3E5F5] hover:bg-[#E1BEE7] transition-colors">
      <div className="flex flex-col items-center justify-center gap-2 mb-4">
        <CloudUpload sx={{ fontSize: 40, color: '#9842F6' }} />
        <Typography variant="body2" className="text-gray-600 font-semibold">
          Arraste arquivos ou clique para selecionar
        </Typography>
        <Button
          component="label"
          variant="contained"
          color="secondary"
          size="small"
          startIcon={<CloudUpload />}
        >
          {label}
          <VisuallyHiddenInput 
            ref={fileInputRef}
            type="file" 
            accept={accept} 
            multiple={multiple} 
            onChange={handleFileChange} 
          />
        </Button>
      </div>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 gap-2 mt-4 max-h-40 overflow-y-auto custom-scrollbar">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white rounded shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 overflow-hidden">
                {file.url?.match(/\.(jpeg|jpg|gif|png)$/i) || file.file?.type.startsWith('image/') 
                  ? <Image className="text-blue-500" /> 
                  : <InsertDriveFile className="text-gray-500" />
                }
                <a 
                  href={file.url || '#'} 
                  target="_blank" 
                  rel="noreferrer"
                  className={`text-sm truncate ${file.url ? 'text-blue-600 hover:underline cursor-pointer' : 'text-gray-700'}`}
                >
                  {file.name}
                </a>
                {!file.id && <span className="text-xs bg-green-100 text-green-700 px-1 rounded">Novo</span>}
              </div>
              <IconButton size="small" color="error" onClick={() => onRemove(index)}>
                <Delete fontSize="small" />
              </IconButton>
            </div>
          ))}
        </div>
      )}
    </Box>
  );
};