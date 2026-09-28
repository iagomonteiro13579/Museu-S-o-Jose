'use client';
import Dialog from '@/components/Dialog';
import Footer from '@/components/Footer';
import IntroAcervo from '@/components/IntroAcervo';
import IntroArtigos from '@/components/IntroArtigos';
import { T, useLanguage } from '@/components/Language';
import SecondSection from '@/components/SecondSection';
import ThirdSection from '@/components/ThirdSection';
import VisitorCounter from '@/components/VisitorCounter';
import { ArrowUpRight, Pause, Play } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
export default function Home() {
  const [intro, setIntro] = useState(false);
  const [playing, setPlaying] = useState(true);
  const { t } = useLanguage();
  return (
    <div className="museum-home">
      <section className="museum-hero">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/imgs/bg1.png"
          ref={(video) => {
            if (video) {
              if (
                playing &&
                !window.matchMedia('(prefers-reduced-motion: reduce)').matches
              )
                video.play().catch(() => {});
              else video.pause();
            }
          }}
        >
          <source
            src="/videos/mb_video_capa_museu.mp4"
            media="(max-width: 767px)"
            type="video/mp4"
          />
          <source src="/videos/video_capa_museu.mp4" type="video/mp4" />
        </video>
        <div className="hero-shade" />
        <div className="hero-copy">
          <h1>
            <T text="Bem-vindo ao Museu Histórico de São José" />
          </h1>
          <p>
            <T text="Descubra a história e a cultura de São José em um espaço dedicado à memória, à educação e à valorização das nossas raízes. Explore exposições, participe de eventos e viva experiências únicas que conectam passado, presente e futuro da nossa cidade." />
          </p>
          <div className="hero-actions">
            <Link href="/acervo">
              <T text="Acervo" /> <ArrowUpRight size={20} />
            </Link>
            <button type="button" onClick={() => setIntro(true)}>
              <Play size={17} />
              <T text="Ver vídeo introdutório" />
            </button>
          </div>
        </div>
        <button
          type="button"
          className="hero-play"
          aria-label={t(playing ? 'Pausar vídeo' : 'Reproduzir vídeo')}
          onClick={() => setPlaying(!playing)}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
      </section>
      <SecondSection />
      <IntroAcervo />
      <IntroArtigos />
      <ThirdSection />
      <VisitorCounter />
      <Footer />
      {intro && (
        <Dialog
          title={t('Conheça o nosso Museu!')}
          onClose={() => setIntro(false)}
        >
          <video
            src="/videos/video_intro.mp4"
            controls
            autoPlay
            className="w-full"
            poster="/imgs/thumbnail.png"
          >
            <T text="Seu navegador não suporta o elemento de vídeo." />
          </video>
        </Dialog>
      )}
    </div>
  );
}
