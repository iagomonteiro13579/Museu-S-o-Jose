'use client';

import { T } from '@/components/Language';
import { useState } from 'react';
import '../globals.css';
import Footer from '@/components/Footer';

export default function Home() {
  const [modalContent, setModalContent] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const openModal = (content: string) => {
    setModalContent(content);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <div className="w-full overflow-hidden">
      {/* CABEÇALHO COM IMAGEM DE FUNDO + NAVEGAÇÃO */}
      <header
        className="relative h-[500px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/imgs/bg1.png')" }}
      >
        <div className="absolute inset-0 bg-black/65 z-0" />

        {/* TÍTULO CENTRAL NO CABEÇALHO */}
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <div className="mt-30 bg-black/30 backdrop-blur-md border border-black/30 rounded-2xl shadow-2xl p-6 sm:p-10 max-w-2xl mx-auto text-left pointer-events-auto">
          <h1 className="text-4xl font-bold">
            <T text={'Museu de São José'} />
          </h1>
          <p className="text-lg mt-4 max-w-xl">
            <T
              text={
                'Descubra a história e a cultura da nossa região em um ambiente acolhedor e educativo.'
              }
            />{' '}
          </p>
        </div>
      </header>

      {/* SEÇÕES */}
      <main className="w-full bg-background px-4 py-12 flex flex-col gap-12 items-center">
        {/* HORÁRIOS */}
        <section className="max-w-4xl w-full bg-white p-6 rounded-xl text-black">
          <h2 className="text-2xl font-bold mb-4 text-center">
            <T text={'Horários'} />
          </h2>
          <p className="text-lg text-center">
            <T
              text={
                'O Museu de São José está aberto ao público de terça a domingo, das 8:00h às 18:00h. Planeje sua visita e aproveite para explorar as exposições permanentes e temporárias que revelam a rica história e cultura da nossa região.'
              }
            />{' '}
          </p>
        </section>

        {/* LOCALIZAÇÃO COM MAPA */}
        <section className="max-w-4xl w-full bg-white p-6 rounded-xl flex flex-col md:flex-row items-center gap-6">
          {/* Mapa à esquerda (em telas médias para cima) */}
          <iframe
            src="https://www.google.com/maps?q=-27.615690941617682,-48.62695004662651&z=16&output=embed"
            width="100%"
            height="300"
            className="md:w-1/2 rounded-lg border-0"
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localização do Museu de São José"
          />

          {/* Texto à direita */}
          <div className="w-full md:w-1/2 text-black text-center md:text-left">
            <h2 className="text-2xl font-bold mb-4">
              <T text={'Localização'} />
            </h2>
            <p className="text-lg">
              <T
                text={
                  'Estamos localizados no coração de São José, R. Gaspar Neves, 3175 - Centro, próximo à Praça Central. O acesso é fácil tanto para pedestres quanto para quem vem de carro, com estacionamento disponível nas proximidades. A localização privilegiada oferece uma experiência cultural imersiva em um dos pontos mais charmosos da cidade, o centro histórico de São José.'
                }
              />{' '}
            </p>
          </div>
        </section>

        {/* AGENDAMENTO */}
        <section className="max-w-4xl w-full bg-white p-6 rounded-xl text-black">
          <h2 className="text-2xl font-bold mb-4 text-center">
            <T text={'Agende sua visita'} />{' '}
          </h2>
          <p className="text-lg text-center">
            <T
              text={
                'Para garantir uma experiência tranquila e personalizada, recomendamos o agendamento prévio da sua visita, especialmente para grupos e escolas. Entre em contato pelo telefone (48) 3247-0059.'
              }
            />{' '}
          </p>
        </section>
      </main>

      {/* RODAPÉ */}
      <Footer />

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-lg mx-auto">
            <p className="text-lg font-semibold text-black">{modalContent}</p>
            <button
              type="button"
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300"
              onClick={closeModal}
            >
              <T text={'Fechar'} />{' '}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
