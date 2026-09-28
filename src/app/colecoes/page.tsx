import Footer from '@/components/Footer';
import InteractiveCarousel, {
  type Item as CarouselItemData,
} from '@/components/InteractiveCarousel';
import { T } from '@/components/Language';

const mockAfricana: CarouselItemData[] = [
  { id: 3, img: '/imgs/card1.png', text: 'Coroa Africana' },
  { id: 1, img: '/imgs/saopedro-Photoroom.png', text: 'Estátuas' },
  { id: 2, img: '/imgs/museu.jpg', text: 'Estampas Africanas' },
  { id: 4, img: '/imgs/donut.png', text: 'Máscara Africana' },
];

const mockIndigena: CarouselItemData[] = [
  { id: 1, img: '/imgs/bg11.jpg', text: 'Pulseiras' },
  { id: 2, img: '/imgs/card1.png', text: 'Brincos e Correntes' },
  { id: 3, img: '/imgs/saopedro-Photoroom.png', text: 'Cocar' },
  { id: 4, img: '/imgs/museu.jpg', text: 'Zarabatana' },
];

export default function ColecoesPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-[#222] text-white font-worksans">
      <main className="flex-1 px-4 md:px-10">
        <section className="w-full pt-24 pb-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <T text={'Coleções Culturais'} />{' '}
            </h1>
            <p className="text-lg md:text-xl text-gray-300">
              <T
                text={
                  'Explore objetos do acervo do Museu Histórico de São José que celebram as culturas africana e indígena.'
                }
              />{' '}
            </p>
          </div>

          {/* Carrossel Africano */}
          <div className="mt-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <T text="Coleção Africana" />
            </h2>
            <div className="bg-black rounded-xl">
              <InteractiveCarousel items={mockAfricana} />
            </div>
          </div>

          {/* Carrossel Indígena */}
          <div className="mt-24">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-left">
              <T text="Coleção Indígena" />
            </h2>
            <div className="bg-black rounded-xl p-4">
              <InteractiveCarousel items={mockIndigena} />
            </div>
          </div>

          {/* Botão */}
          <div className="mt-20 flex justify-center">
            <a href="/acervo/completo">
              <button
                type="button"
                className="bg-white text-black px-8 py-4 rounded-xl text-lg md:text-xl font-semibold shadow hover:scale-105 hover:bg-gray-200 transition"
              >
                <T text={'Conheça nosso acervo completo!'} />{' '}
              </button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
