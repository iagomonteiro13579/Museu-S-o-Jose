import { T } from '@/components/Language';
import React from 'react';

export default function IntroAcervo() {
  return (
    <section
      className="w-full flex justify-center items-center py-16 px-4"
      style={{ backgroundColor: '#F2F2F2' }}
    >
      <div className="w-full max-w-none bg-white/90 rounded-3xl shadow-2xl p-6 md:p-12 flex flex-col md:flex-row items-center md:items-stretch gap-8 md:gap-12 transition-all duration-300">
        {/* Objeto 3D à esquerda no desktop, em cima no mobile */}
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <iframe
            loading="lazy"
            src="https://00thiago.github.io/onlineMaca3D/"
            title="Exemplo de Objeto 3D"
            className="w-full h-64 md:h-[400px] rounded-xl border shadow-lg"
            allow="autoplay; fullscreen; xr-spatial-tracking"
            xr-spatial-tracking="true"
            web-share="true"
          />
        </div>
        {/* Texto à direita no desktop, embaixo no mobile */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start text-center md:text-left space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-primary font-worksans drop-shadow mb-2">
            <T text={'Explore o Acervo 3D do Museu'} />{' '}
          </h2>
          <p className="text-lg md:text-xl text-primary font-worksans">
            <T
              text={
                'Descubra uma nova forma de interagir com a história! Nossa página de Acervos reúne'
              }
            />{' '}
            <span className="font-semibold text-primary">
              <T text={'objetos 3D interativos'} />{' '}
            </span>
            <T
              text={
                ', informações detalhadas sobre artefatos históricos e curiosidades do patrimônio de São José.'
              }
            />{' '}
          </p>
          <ul className="text-base md:text-lg text-primary font-worksans list-disc list-inside space-y-1">
            <li>
              <T
                text={
                  'Visualize modelos 3D de peças do museu em qualquer dispositivo'
                }
              />{' '}
            </li>
            <li>
              <T
                text={'Leia sobre a origem, uso e importância de cada artefato'}
              />
            </li>
            <li>
              <T text={'Descubra curiosidades e fatos históricos exclusivos'} />
            </li>
            <li>
              <T
                text={'Experimente a tecnologia e mergulhe na cultura local'}
              />
            </li>
          </ul>
          <a
            href="http://extensaoads.sj.ifsc.edu.br:3001"
            className="w-full md:w-auto flex justify-center md:justify-start"
          >
            <button
              type="button"
              className="mt-4 bg-primary text-white px-8 py-4 rounded-xl text-lg font-bold shadow-md hover:bg-accent transition-all duration-300"
            >
              <T text={'Acesse nosso acervo 3D'} />{' '}
            </button>
          </a>
        </div>
      </div>
    </section>
  );
}
