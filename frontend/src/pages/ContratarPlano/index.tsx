import { Card, CardContent } from "@mui/material";
import { Check, Close } from "@mui/icons-material";

const ContratarPlano = () => {
  return (
    <>
      <div className='min-h-screen flex-1 hidden lg:flex flex-col items-center justify-center py-16 px-8 bg-gradient-to-t from-[#1a17e2] to-[#6B00A1] relative'>
        <div className='text-center w-full'>
          <h1 className='text-white text-4xl font-bold'>
            Plano e Preços
          </h1>
          <h4 className='text-white text-xl font-bold'>
            Confira as vantagens de ser Cliente Faço a Conta
          </h4>
        </div>

        <Card className='flex p-4 w-5/6'>
          <CardContent className='w-1/3 text-[#3C0473] text-center'>
            <h3 className='text-2xl font-bold mb-14'>
              Confira os Benefícios
            </h3>
            <ul className='text-left list-disc list-inside font-semibold'>
              <li className='mb-2'>Atendimento online (WhatsApp)</li>
              <li className='mb-2'>Segunda a Sexta 8h às 18h</li>
              <li className='mb-2'>Sábado 8h às 12h</li>
              <li className='mb-2'>Fechamento Fiscal</li>
              <li className='mb-2'>Departamento Pessoal</li>
              <li className='mb-2'>Pro-lábore</li>
              <li className='mb-2'>Emissor Ilimitado (NF-e/NFC-e)</li>
              <li className='mb-2'>Certificado Digital A1</li>
              <li className='mb-2'>Gestão (Estoque, Financeiro, Venda)</li>
              <li className='mb-2'>Funcionários</li>
              <li className='mb-2'>Regime Tributário</li>
            </ul>
          </CardContent>
          <Card className='p-2 w-1/4'>
            <div className='text-center'>
              <h1 className='text-4xl font-bold text-[#3C0473]'>
                Plano MEI
              </h1>
              <span className='text-[#9842F6] font-light text-[0.75rem]'>Micro e pequeno empreendedor</span>
            </div>
            <div className='bg-[#61CD6F] text-white font-bold text-2xl text-center'>
              R$ 97 mês
            </div>
            <div>
              <ul className='text-center'>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Close className='text-[#D0214B] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Close className='text-[#D0214B] mb-2' /></li>
                <li><Close className='text-[#D0214B] mb-2' /></li>
                <li className='text-[#3C0473] mb-2'>Até 01</li>
                <li className='text-[#3C0473] mb-2'>SIMEI</li>
              </ul>
            </div>
          </Card>
          <Card className='p-2 w-1/4'>
            <div className='text-center mb-6'>
              <h1 className='text-4xl font-bold text-[#3C0473]'>
                Plano Controle
              </h1>
            </div>
            <div className='bg-[#61CD6F] text-white font-bold text-2xl text-center'>
              R$ 197 mês
            </div>
            <div>
              <ul className='text-center'>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Close className='text-[#D0214B] mb-2' /></li>
                <li><Close className='text-[#D0214B] mb-2' /></li>
                <li><Close className='text-[#D0214B] mb-2' /></li>
                <li className='text-[#3C0473] mb-2'>Até 02</li>
                <li className='text-[#3C0473] mb-2'>Simples Nacional</li>
              </ul>
            </div>
          </Card>
          <Card className='p-2 w-1/4'>
            <div className='text-center mb-6'>
              <h1 className='text-4xl font-bold text-[#3C0473]'>
                Plano Essencial
              </h1>
            </div>
            <div className='bg-[#9842F6] text-white font-bold text-2xl text-center'>
              R$ 285 mês
            </div>
            <div>
              <ul className='text-center'>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li className='text-[#3C0473] mb-2'>Até 05</li>
                <li className='text-[#3C0473] mb-2'>Simples Nacional</li>
              </ul>
            </div>
          </Card>
          <Card className='p-2 w-1/4'>
            <div className='text-center mb-6'>
              <h1 className='text-4xl font-bold text-[#3C0473]'>
                Plano Anual
              </h1>
            </div>
            <div className='bg-[#61CD6F] text-white font-bold text-2xl text-center'>
              R$ 256 mês
            </div>
            <div>
              <ul className='text-center'>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li><Check className='text-[#61CD6F] mb-2' /></li>
                <li className='text-[#61CD6F] mb-2'>Grátis</li>
                <li className='text-[#3C0473] mb-2'>Até 05</li>
                <li className='text-[#3C0473] mb-2'>Simples Nacional</li>
              </ul>
            </div>
          </Card>
        </Card>
      </div>
    </>
  )
}

export default ContratarPlano;