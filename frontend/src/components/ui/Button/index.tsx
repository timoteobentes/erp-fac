import { Button } from "@mui/material";



export const ButtonContained = () => {
  return (
    <Button
      fullWidth
      variant="contained"
      size="medium"
      sx={{
        backgroundColor: '#6B00A1',
        borderRadius: '8px',
        // padding: '12px 24px',
        fontSize: '1rem',
        fontWeight: 600,
        textTransform: 'none',
        boxShadow: 'none',
        '&:hover': {
          backgroundColor: '#9842F6',
          boxShadow: 'none'
        },
        '&:active': {
          boxShadow: 'none'
        },
      }}
    >
      Entrar
    </Button>
  )
}