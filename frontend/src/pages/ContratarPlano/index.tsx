import { Card, CardContent } from "@mui/material";
import { Check, Close } from "@mui/icons-material";

const FEATURES = [
  'Atendimento online (WhatsApp)',
  'Segunda a Sexta 8h às 18h',
  'Sábado 8h às 12h',
  'Fechamento Fiscal',
  'Departamento Pessoal',
  'Pró-labore',
  'Imposto de Renda para Sócios',
  'Emissor Ilimitado (NF-e/NFC-e)',
  'Gestão (Estoque, Financeiro, Venda)',
  'Funcionários',
  'Regime Tributário',
];

const PLANS = [
  {
    id: 'mei',
    name: 'Plano MEI',
    subtitle: 'Micro Empreendedor Individual',
    price: 'R$ 107/mês',
    priceColor: '#22C55E',
    items: [true, true, false, true, true, true, true, true, false, 'Até 01', 'SIMEI'],
  },
  {
    id: 'controle',
    name: 'Plano Controle',
    subtitle: '',
    price: 'R$ 237/mês',
    priceColor: '#22C55E',
    items: [true, true, true, true, true, true, true, false, false, 'Até 02', 'Simples Nacional'],
  },
  {
    id: 'essencial',
    name: 'Plano Essencial',
    subtitle: 'Mais escolhido',
    price: 'R$ 337/mês',
    priceColor: '#7C3AED',
    items: [true, true, true, true, true, true, true, true, true, 'Até 05', 'Simples Nacional'],
  },
  {
    id: 'anual',
    name: 'Plano Anual',
    subtitle: 'R$ 3.639,60/ano',
    price: 'R$ 303,30/mês',
    priceColor: '#22C55E',
    items: [true, true, true, true, true, true, true, true, true, 'Até 05', 'Simples Nacional'],
  },
];

const ContratarPlano = () => {
  return (
    <div className='min-h-screen flex-1 hidden lg:flex flex-col items-center justify-center py-16 px-8 bg-gradient-to-t from-[#1a17e2] to-[#6B00A1] relative'>
      <div className='text-center w-full mb-8'>
        <h1 className='text-white text-4xl font-bold'>Planos e Preços</h1>
        <h4 className='text-white text-xl font-light mt-2'>
          Confira as vantagens de ser cliente Faço a Conta
        </h4>
      </div>

      <Card className='flex p-4 w-5/6'>
        <CardContent className='w-1/4 text-[#3C0473] text-center'>
          <h3 className='text-2xl font-bold mb-12'>Recursos</h3>
          <ul className='text-left font-semibold space-y-2'>
            {FEATURES.map((f) => (
              <li key={f} className='py-1'>{f}</li>
            ))}
          </ul>
        </CardContent>

        {PLANS.map((plan) => (
          <Card key={plan.id} className='p-2 flex-1'>
            <div className='text-center mb-2'>
              <h1 className='text-2xl font-bold text-[#3C0473]'>{plan.name}</h1>
              {plan.subtitle && (
                <span className='text-[#9842F6] font-light text-xs'>{plan.subtitle}</span>
              )}
            </div>
            <div
              className='text-white font-bold text-xl text-center py-2 rounded'
              style={{ backgroundColor: plan.priceColor }}
            >
              {plan.price}
            </div>
            <ul className='text-center mt-2 space-y-2'>
              {plan.items.map((item, idx) => (
                <li key={idx} className='py-1'>
                  {item === true ? (
                    <Check className='text-[#22C55E]' />
                  ) : item === false ? (
                    <Close className='text-[#EF4444]' />
                  ) : (
                    <span className='text-[#3C0473] font-medium text-sm'>{item}</span>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </Card>
    </div>
  );
};

export default ContratarPlano;
