/**
 * Fundo estático do hero — imagem da marca (globo + rede de conexões teal),
 * com camadas de gradiente para fundir a foto ao container escuro e garantir
 * contraste do texto. Sem WebGL nem loop de animação.
 */
const HeroBackdrop = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {/* Imagem de fundo */}
    <img
      src="/fundo-hero.png"
      alt=""
      aria-hidden
      className="absolute inset-0 h-full w-full object-cover"
    />
    {/* Escurece a esquerda para leitura do título/texto */}
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(90deg, rgba(4,10,12,0.92) 0%, rgba(4,10,12,0.62) 34%, rgba(4,10,12,0.15) 60%, transparent 100%)",
      }}
    />
    {/* Funde as bordas da foto ao container (topo/base) */}
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(180deg, rgba(5,12,14,0.55) 0%, transparent 22%, transparent 72%, rgba(4,10,12,0.85) 100%)",
      }}
    />
    {/* Brilho teal sutil vindo da direita, reforçando a marca */}
    <div
      className="absolute -right-[10%] top-[8%] h-[70%] w-[55%] rounded-full blur-[120px]"
      style={{ background: "radial-gradient(circle, rgba(20,184,166,0.20) 0%, transparent 68%)" }}
    />
  </div>
);

export default HeroBackdrop;
