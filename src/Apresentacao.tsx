import React, { useState, useEffect, useCallback } from "react";

/**
 * Apresentação de slides — Réplica de Hagen et al. (2024)
 * Preparada como pré-defesa / apresentação de andamento de mestrado (PPGTCA/UTFPR).
 * Navegação: setas do teclado, clique nas bordas, ou botões.
 */

// ---------- Pequenos componentes de gráfico (auto-contidos) ----------

function MiniBar({ data, max }: { data: { label: string; value: number }[]; max?: number }) {
  const m = max ?? Math.max(...data.map((d) => d.value));
  return (
    <div className="mini-bar">
      {data.map((d) => (
        <div className="mini-bar-row" key={d.label}>
          <span className="mini-bar-label">{d.label}</span>
          <div className="mini-bar-track">
            <div className="mini-bar-fill" style={{ width: `${(d.value / m) * 100}%` }} />
          </div>
          <span className="mini-bar-value">{d.value.toLocaleString("pt-BR")}</span>
        </div>
      ))}
    </div>
  );
}

function MiniLine({
  categories,
  series,
  yMin = 0,
  yMax = 1,
}: {
  categories: string[];
  series: { label: string; values: number[]; color: string }[];
  yMin?: number;
  yMax?: number;
}) {
  const W = 620;
  const H = 280;
  const padL = 50;
  const padR = 24;
  const padT = 20;
  const padB = 40;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const scaleX = (i: number) => padL + (i / (categories.length - 1)) * plotW;
  const scaleY = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * plotH;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 620 }}>
      <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="#5b6b7a" />
      <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#5b6b7a" />
      {categories.map((c, i) => (
        <text key={c} x={scaleX(i)} y={H - padB + 20} textAnchor="middle" fontSize="13" fill="#cfd8e3">
          {c}
        </text>
      ))}
      {series.map((s) => (
        <g key={s.label}>
          <polyline
            fill="none"
            stroke={s.color}
            strokeWidth={2.5}
            points={s.values.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(" ")}
          />
          {s.values.map((v, i) => (
            <circle key={i} cx={scaleX(i)} cy={scaleY(v)} r={4} fill={s.color} />
          ))}
        </g>
      ))}
    </svg>
  );
}

// ---------- Layouts de slide ----------

function Kicker({ children }: { children: React.ReactNode }) {
  return <div className="kicker">{children}</div>;
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="bullets">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

interface Slide {
  content: React.ReactNode;
  variant?: "title" | "section" | "default";
}

// ---------- As slides ----------

const slides: Slide[] = [
  // 1. Título
  {
    variant: "title",
    content: (
      <>
        <Kicker>PPGTCA · UTFPR</Kicker>
        <h1 className="title-xl">
          Replicando Hagen et al. (2024): o microbioma do solo como preditor
          interpretável de estresse hídrico
        </h1>
        <p className="subtitle">
          Etapa preparatória da dissertação de mestrado — classificação de
          sanidade em soja a partir do microbioma
        </p>
        <div className="title-meta">Tassiane Anzolin · Programa de Pós-Graduação em Tecnologias Computacionais para o Agronegócio</div>
      </>
    ),
  },
  // 2. Agenda
  {
    content: (
      <>
        <Kicker>Sumário</Kicker>
        <h2>O que vamos ver hoje</h2>
        <div className="agenda-grid">
          <div><strong>1.</strong> Contexto e motivação</div>
          <div><strong>2.</strong> O artigo original</div>
          <div><strong>3.</strong> O dataset Grass-Drought</div>
          <div><strong>4.</strong> Pipeline de replicação</div>
          <div><strong>5.</strong> Processamento (DADA2, taxonomia)</div>
          <div><strong>6.</strong> Diversidade e abundância diferencial</div>
          <div><strong>7.</strong> Checagem de viés (t-SNE)</div>
          <div><strong>8.</strong> Machine Learning + SHAP</div>
          <div><strong>9.</strong> Comparação com o artigo</div>
          <div><strong>10.</strong> Teste de generalização (sorgo)</div>
          <div><strong>11.</strong> Relevância pra dissertação</div>
          <div><strong>12.</strong> Próximos passos</div>
        </div>
      </>
    ),
  },
  // 3. Contexto
  {
    content: (
      <>
        <Kicker>1 · Contexto</Kicker>
        <h2>Objeto da dissertação</h2>
        <Bullets
          items={[
            <>Classificar <strong>sanidade em soja</strong> a partir do microbioma associado à cultura</>,
            <>Combinar dados de <strong>múltiplos projetos</strong> de soja, não um único estudo controlado</>,
            <>Lacuna identificada: a maioria dos trabalhos trata o "projeto de origem" como irrelevante — mas ele pode confundir a análise</>,
          ]}
        />
      </>
    ),
  },
  // 4. Motivação da replicação
  {
    content: (
      <>
        <Kicker>1 · Contexto</Kicker>
        <h2>Por que replicar um artigo antes de usar dados próprios?</h2>
        <Bullets
          items={[
            "Validar a competência técnica sobre o pipeline inteiro num caso com resultado conhecido",
            "Detectar erros de metodologia antes que apareçam em dados originais e mais custosos",
            "Ter um ponto de comparação numérico direto: se bater com o publicado, o pipeline está correto",
          ]}
        />
      </>
    ),
  },
  // 5. Section: artigo
  {
    variant: "section",
    content: (
      <>
        <div className="section-num">02</div>
        <h2 className="section-title">O artigo original</h2>
      </>
    ),
  },
  // 6. O artigo
  {
    content: (
      <>
        <Kicker>2 · O artigo</Kicker>
        <h2>Hagen et al. (2024)</h2>
        <p className="lede">
          "Interpretable machine learning decodes soil microbiome's response
          to drought stress" — Environmental Microbiome, 19(35).
        </p>
        <Bullets
          items={[
            "Sequenciamento 16S rRNA do microbioma de solo/raiz/rizosfera",
            "Random Forest treinado para distinguir Controle vs. Seca",
            "Interpretação via SHAP: quais bactérias pesam mais na decisão do modelo",
          ]}
        />
      </>
    ),
  },
  // 7. Section: dataset
  {
    variant: "section",
    content: (
      <>
        <div className="section-num">03</div>
        <h2 className="section-title">O dataset Grass-Drought</h2>
      </>
    ),
  },
  // 8. Dataset
  {
    content: (
      <>
        <Kicker>3 · Dataset</Kicker>
        <h2>Grass-Drought (Naylor et al., 2017)</h2>
        <Bullets
          items={[
            "17 espécies de gramíneas + tomate, sob Controle ou Seca",
            "3 compartimentos: solo, raiz e rizosfera",
            "623 amostras, sequenciamento 16S V3–V4 (Illumina)",
          ]}
        />
        <MiniBar
          data={[
            { label: "Controle", value: 320 },
            { label: "Seca", value: 303 },
          ]}
        />
      </>
    ),
  },
  // 9. Section: pipeline
  {
    variant: "section",
    content: (
      <>
        <div className="section-num">04</div>
        <h2 className="section-title">Pipeline de replicação</h2>
      </>
    ),
  },
  // 10. Pipeline overview
  {
    content: (
      <>
        <Kicker>4 · Pipeline</Kicker>
        <h2>11 etapas, do dado bruto ao modelo final</h2>
        <div className="pipeline-strip">
          {[
            "Instalar QIIME 2", "Preparar amostras", "Baixar sequências",
            "Remover primers", "DADA2", "Taxonomia (SILVA)",
            "Diversidade + DAA", "t-SNE (viés)", "ML + SHAP",
            "Comparar", "Generalização",
          ].map((s, i) => (
            <div className="pipeline-node" key={s}>
              <div className="pipeline-num">{i + 1}</div>
              <div className="pipeline-label">{s}</div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  // 11. Aquisição de dados
  {
    content: (
      <>
        <Kicker>4 · Pipeline</Kicker>
        <h2>Obtenção dos dados brutos</h2>
        <Bullets
          items={[
            <>623 accessions SRA identificados a partir do <em>metadata.csv</em> do repositório do artigo — não do BioProject inteiro (que mistura outros experimentos)</>,
            "Download via qiime fondue get-sequences, direto do NCBI SRA",
            "0 falhas em 623 amostras (~18,7 GB de dados)",
          ]}
        />
      </>
    ),
  },
  // 12. Primers + DADA2
  {
    content: (
      <>
        <Kicker>5 · Processamento</Kicker>
        <h2>Remoção de primers e DADA2</h2>
        <Bullets
          items={[
            "Primers 341F/785R (região V3–V4 do 16S), removidos via cutadapt — 98,4% das leituras aproveitadas",
            "DADA2: aprendizado de erro, inferência de ASVs, junção de pares, remoção de quimeras",
            <>Resultado: <strong>36.543 ASVs</strong> em 623 amostras</>,
          ]}
        />
      </>
    ),
  },
  // 13. Taxonomia
  {
    content: (
      <>
        <Kicker>5 · Processamento</Kicker>
        <h2>Classificação taxonômica (SILVA)</h2>
        <Bullets
          items={[
            "Classificador SILVA treinado especificamente para a região V3-V4",
            "99,7% das ASVs classificadas com sucesso, confiança média 0,97",
            "Composição dominada por Pseudomonadota, Bacteroidota e Actinomycetota — esperado para solo/raiz",
          ]}
        />
        <MiniBar
          data={[
            { label: "Pseudomonadota", value: 9390 },
            { label: "Bacteroidota", value: 5920 },
            { label: "Actinomycetota", value: 3281 },
          ]}
        />
      </>
    ),
  },
  // 14. Section: diversidade/DAA
  {
    variant: "section",
    content: (
      <>
        <div className="section-num">06</div>
        <h2 className="section-title">Diversidade e Abundância Diferencial</h2>
      </>
    ),
  },
  // 15. Diversidade
  {
    content: (
      <>
        <Kicker>6 · Diversidade</Kicker>
        <h2>Diversidade alfa vs. beta</h2>
        <div className="two-col">
          <div className="stat-card">
            <div className="stat-label">Shannon (alfa)</div>
            <div className="stat-value">p = 0,145</div>
            <div className="stat-note">sem diferença significativa</div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-label">Bray-Curtis (beta, PERMANOVA)</div>
            <div className="stat-value">p = 0,001</div>
            <div className="stat-note">altamente significativo</div>
          </div>
        </div>
        <p className="lede small">
          Controle e Seca não têm comunidades mais ou menos diversas — têm
          comunidades <em>diferentes</em>, em composição.
        </p>
      </>
    ),
  },
  // 16. DAA 5 métodos
  {
    content: (
      <>
        <Kicker>6 · DAA</Kicker>
        <h2>5 métodos de Análise de Abundância Diferencial</h2>
        <MiniBar
          data={[
            { label: "edgeR", value: 2498 },
            { label: "Wilcoxon", value: 2100 },
            { label: "ANCOM-BC2", value: 1708 },
            { label: "DESeq2", value: 1136 },
            { label: "ALDEx2", value: 590 },
          ]}
        />
        <p className="lede small">
          <strong>668 ASVs</strong> significativas nos 5 métodos ao mesmo tempo —
          o conjunto de consenso mais confiável.
        </p>
      </>
    ),
  },
  // 17. DAA todos os ranks
  {
    content: (
      <>
        <Kicker>6 · DAA</Kicker>
        <h2>Estendendo aos 5 níveis taxonômicos</h2>
        <p className="lede small">3 métodos mais consistentes: DESeq2, ANCOM-BC2, ALDEx2</p>
        <MiniLine
          categories={["Filo", "Classe", "Ordem", "Família", "Gênero"]}
          series={[
            { label: "DESeq2", values: [23, 48, 119, 176, 275], color: "#e8b04b" },
            { label: "ANCOM-BC2", values: [22, 49, 124, 198, 310], color: "#6fa3ae" },
            { label: "ALDEx2", values: [22, 41, 98, 166, 260], color: "#8aa26a" },
          ]}
          yMin={0}
          yMax={320}
        />
      </>
    ),
  },
  // 18. Section: t-SNE
  {
    variant: "section",
    content: (
      <>
        <div className="section-num">07</div>
        <h2 className="section-title">Checagem de viés (t-SNE)</h2>
      </>
    ),
  },
  // 19. t-SNE
  {
    content: (
      <>
        <Kicker>7 · Viés</Kicker>
        <h2>As amostras se agrupam pelo motivo certo?</h2>
        <Bullets
          items={[
            "t-SNE geral: compartimento (solo/raiz/rizosfera) domina a projeção — não regime de rega",
            "Espécie de planta: bem misturada, sem confundimento",
            "t-SNE estratificada por compartimento: separação Controle/Seca aparece nos 3, com intensidade diferente",
          ]}
        />
        <MiniBar
          data={[
            { label: "Rizosfera", value: 100 },
            { label: "Raiz", value: 70 },
            { label: "Solo", value: 45 },
          ]}
        />
        <p className="lede small">Separação relativa (forte → fraca): rizosfera &gt; raiz &gt; solo</p>
      </>
    ),
  },
  // 20. Conclusão viés
  {
    content: (
      <>
        <Kicker>7 · Viés</Kicker>
        <h2>Por que isso importa pra dissertação</h2>
        <Bullets
          items={[
            "Mesmo num único estudo controlado, o sinal biológico não é homogêneo entre subgrupos",
            "Em múltiplos projetos de soja combinados, essa heterogeneidade tende a ser maior",
            <>Reforça a necessidade da validação <strong>leave-one-project-out</strong> planejada</>,
          ]}
        />
      </>
    ),
  },
  // 21. Section: ML
  {
    variant: "section",
    content: (
      <>
        <div className="section-num">08</div>
        <h2 className="section-title">Machine Learning + SHAP</h2>
      </>
    ),
  },
  // 22. ML metodologia
  {
    content: (
      <>
        <Kicker>8 · ML</Kicker>
        <h2>Random Forest com validação cruzada aninhada</h2>
        <Bullets
          items={[
            "Testado nos 5 níveis taxonômicos (filo a gênero)",
            "Nested CV: laço externo avalia, laço interno otimiza hiperparâmetros",
            "SHAP no nível de gênero: interpreta quais bactérias pesam na decisão",
          ]}
        />
      </>
    ),
  },
  // 23. ML resultados
  {
    content: (
      <>
        <Kicker>8 · ML</Kicker>
        <h2>Desempenho por nível taxonômico</h2>
        <MiniLine
          categories={["Filo", "Classe", "Ordem", "Família", "Gênero"]}
          series={[
            { label: "Acurácia", values: [0.904, 0.908, 0.916, 0.934, 0.937], color: "#e8b04b" },
            { label: "AUC", values: [0.956, 0.966, 0.971, 0.980, 0.979], color: "#6fa3ae" },
          ]}
          yMin={0.85}
          yMax={1.0}
        />
        <p className="lede small">Gênero: melhor desempenho — igual ao artigo original.</p>
      </>
    ),
  },
  // 24. Section: comparação
  {
    variant: "section",
    content: (
      <>
        <div className="section-num">09</div>
        <h2 className="section-title">Comparação com o artigo</h2>
      </>
    ),
  },
  // 25. Comparação números
  {
    content: (
      <>
        <Kicker>9 · Comparação</Kicker>
        <h2>Nível de gênero: réplica vs. original</h2>
        <table className="pres-table">
          <thead><tr><th>Métrica</th><th>Hagen et al.</th><th>Esta réplica</th></tr></thead>
          <tbody>
            <tr><td>Acurácia</td><td>0,923</td><td>0,937</td></tr>
            <tr><td>F1-score</td><td>0,921</td><td>0,937</td></tr>
            <tr><td>Recall</td><td>0,954</td><td>0,963</td></tr>
            <tr><td>AUC</td><td>0,980</td><td>0,979</td></tr>
          </tbody>
        </table>
      </>
    ),
  },
  // 26. Kribbella — o achado mais forte
  {
    content: (
      <>
        <Kicker>9 · Comparação</Kicker>
        <h2 className="highlight-title">O achado mais forte da replicação</h2>
        <p className="lede">
          O táxon marcador nº 1 apontado pelo SHAP foi o gênero{" "}
          <em>Kribbella</em> — <strong>exatamente o mesmo</strong> relatado
          por Hagen et al. (2024) como o marcador mais consistente.
        </p>
        <p className="lede small">
          Combinado ao AUC quase idêntico (0,979 vs. 0,980), essa
          coincidência é forte evidência de que o pipeline captura o mesmo
          sinal biológico do estudo original — não um artefato do
          processamento.
        </p>
      </>
    ),
  },
  // 27. Concordância DAA x SHAP
  {
    content: (
      <>
        <Kicker>9 · Comparação</Kicker>
        <h2>Concordância entre DAA e SHAP</h2>
        <div className="two-col">
          <div className="stat-card">
            <div className="stat-label">Esta replicação</div>
            <div className="stat-value">61,3%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Artigo original</div>
            <div className="stat-value">79,6–82,6%</div>
          </div>
        </div>
        <p className="lede small">
          Mesma ordem de grandeza — diferença esperada, já que o critério
          exato do artigo não está publicamente documentado.
        </p>
      </>
    ),
  },
  // 28. Generalização
  {
    content: (
      <>
        <Kicker>10 · Generalização</Kicker>
        <h2>Teste com um dataset independente (sorgo)</h2>
        <Bullets
          items={[
            "Aplicar o modelo treinado no Grass-Drought, sem retreinar, num dataset novo",
            "Dataset Sorghum-Drought: 449 amostras (233 Controle / 216 Seca)",
            "Investigação revelou 3 grupos de tratamento reais (Controle, seca pré e pós-florescimento)",
            "Em andamento — download e processamento das 449 amostras",
          ]}
        />
      </>
    ),
  },
  // 29. Relevância pra dissertação
  {
    content: (
      <>
        <Kicker>11 · Relevância</Kicker>
        <h2>O que isso muda para a dissertação</h2>
        <table className="pres-table">
          <thead><tr><th>Neste estudo</th><th>Na dissertação (soja)</th></tr></thead>
          <tbody>
            <tr><td>Um estudo único e grande</td><td>Múltiplos projetos combinados</td></tr>
            <tr><td>Controle vs. Seca</td><td>Sadio vs. Doente</td></tr>
            <tr><td>Validação cruzada padrão</td><td>Leave-one-project-out</td></tr>
          </tbody>
        </table>
      </>
    ),
  },
  // 30. Próximos passos + obrigada
  {
    variant: "section",
    content: (
      <>
        <div className="section-num">12</div>
        <h2 className="section-title">Próximos passos</h2>
        <Bullets
          items={[
            "Concluir o teste de generalização (Sorghum-Drought)",
            "Levantar e consolidar múltiplos datasets reais de soja",
            "Aplicar o pipeline validado com a validação leave-one-project-out",
          ]}
        />
        <div className="thanks">Obrigada — perguntas?</div>
      </>
    ),
  },
];

export default function Apresentacao() {
  const [index, setIndex] = useState(0);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, slides.length - 1));
  }, []);
  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  const slide = slides[index];
  const progress = ((index + 1) / slides.length) * 100;

  return (
    <div className="deck">
      <style>{`
        :root {
          --bg: #10151d;
          --bg-alt: #161d27;
          --ink: #eef2f6;
          --ink-soft: #9fb0c0;
          --accent: #e8b04b;
          --accent-2: #6fa3ae;
          --accent-3: #8aa26a;
          --rule: #2a3543;
          --font-serif: "Iowan Old Style", Georgia, "Times New Roman", serif;
          --font-sans: "IBM Plex Sans", -apple-system, "Segoe UI", sans-serif;
        }
        * { box-sizing: border-box; }
        html, body, #root { height: 100%; margin: 0; }
        .deck {
          background: var(--bg);
          color: var(--ink);
          font-family: var(--font-sans);
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .progress-track {
          height: 3px;
          background: var(--rule);
          width: 100%;
        }
        .progress-fill {
          height: 100%;
          background: var(--accent);
          transition: width 0.35s ease;
        }
        .stage {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 8vw;
        }
        .slide {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 8vw;
          animation: slideIn 0.45s ease both;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slide.section-slide {
          align-items: flex-start;
          justify-content: center;
          background: linear-gradient(135deg, var(--bg) 60%, var(--bg-alt));
        }
        .slide.title-slide {
          align-items: flex-start;
          justify-content: center;
        }
        .kicker {
          font-family: var(--font-sans);
          font-size: 13px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 14px;
          font-weight: 600;
        }
        h1.title-xl {
          font-family: var(--font-serif);
          font-size: clamp(28px, 4.2vw, 54px);
          line-height: 1.15;
          margin: 0 0 20px;
          max-width: 16ch;
        }
        h2 {
          font-family: var(--font-serif);
          font-size: clamp(24px, 3.2vw, 40px);
          margin: 0 0 22px;
          line-height: 1.2;
        }
        h2.highlight-title { color: var(--accent); }
        .subtitle {
          font-size: clamp(15px, 1.6vw, 20px);
          color: var(--ink-soft);
          max-width: 46ch;
          margin: 0 0 24px;
        }
        .title-meta {
          font-size: 14px;
          color: var(--ink-soft);
          border-top: 1px solid var(--rule);
          padding-top: 14px;
          max-width: 50ch;
        }
        .lede {
          font-size: clamp(16px, 1.8vw, 22px);
          color: var(--ink);
          max-width: 56ch;
          line-height: 1.5;
          margin: 0 0 12px;
        }
        .lede.small { font-size: clamp(13px, 1.3vw, 16px); color: var(--ink-soft); }
        .bullets {
          list-style: none;
          padding: 0;
          margin: 0;
          max-width: 62ch;
        }
        .bullets li {
          font-size: clamp(15px, 1.6vw, 20px);
          line-height: 1.5;
          padding: 10px 0 10px 28px;
          position: relative;
          border-bottom: 1px solid var(--rule);
        }
        .bullets li::before {
          content: "→";
          position: absolute;
          left: 0;
          color: var(--accent);
        }
        .bullets li:last-child { border-bottom: none; }
        .agenda-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 40px;
          max-width: 70ch;
          font-size: clamp(14px, 1.5vw, 18px);
        }
        .agenda-grid strong { color: var(--accent); margin-right: 8px; }
        .section-num {
          font-family: var(--font-serif);
          font-size: clamp(60px, 9vw, 140px);
          color: var(--rule);
          line-height: 1;
          margin-bottom: 0.1em;
        }
        .section-title {
          font-size: clamp(26px, 3.6vw, 48px);
        }
        .pipeline-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          max-width: 80ch;
        }
        .pipeline-node {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-alt);
          border: 1px solid var(--rule);
          border-radius: 20px;
          padding: 6px 14px 6px 8px;
        }
        .pipeline-num {
          background: var(--accent);
          color: #1a1408;
          font-weight: 700;
          font-size: 12px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pipeline-label { font-size: 13px; }
        .mini-bar { max-width: 60ch; margin-top: 12px; }
        .mini-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .mini-bar-label { width: 110px; font-size: 13px; color: var(--ink-soft); flex-shrink: 0; }
        .mini-bar-track { flex: 1; height: 14px; background: var(--rule); border-radius: 4px; overflow: hidden; }
        .mini-bar-fill { height: 100%; background: var(--accent); }
        .mini-bar-value { font-size: 12.5px; color: var(--ink-soft); width: 60px; text-align: right; }
        .two-col {
          display: flex;
          gap: 24px;
          margin: 10px 0 18px;
          flex-wrap: wrap;
        }
        .stat-card {
          background: var(--bg-alt);
          border: 1px solid var(--rule);
          border-radius: 10px;
          padding: 18px 24px;
          min-width: 200px;
        }
        .stat-card.highlight { border-color: var(--accent); }
        .stat-label { font-size: 12.5px; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-value { font-family: var(--font-serif); font-size: 32px; margin: 6px 0; }
        .stat-note { font-size: 12.5px; color: var(--ink-soft); }
        table.pres-table {
          border-collapse: collapse;
          font-size: clamp(13px, 1.4vw, 17px);
          max-width: 70ch;
        }
        table.pres-table th, table.pres-table td {
          text-align: left;
          padding: 8px 22px 8px 0;
          border-bottom: 1px solid var(--rule);
        }
        table.pres-table th { color: var(--accent); font-weight: 600; font-size: 0.85em; }
        .thanks {
          font-family: var(--font-serif);
          font-size: clamp(24px, 3vw, 36px);
          color: var(--accent);
          margin-top: 20px;
        }
        .nav-zone {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 12%;
          cursor: pointer;
          z-index: 5;
        }
        .nav-zone.left { left: 0; }
        .nav-zone.right { right: 0; }
        .controls {
          position: absolute;
          bottom: 18px;
          right: 28px;
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 13px;
          color: var(--ink-soft);
          z-index: 6;
        }
        .controls button {
          background: var(--bg-alt);
          border: 1px solid var(--rule);
          color: var(--ink);
          width: 34px;
          height: 34px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
        }
        .controls button:hover { border-color: var(--accent); color: var(--accent); }
      `}</style>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="stage">
        <div
          key={index}
          className={`slide ${slide.variant === "section" ? "section-slide" : ""} ${
            slide.variant === "title" ? "title-slide" : ""
          }`}
        >
          {slide.content}
        </div>
        <div className="nav-zone left" onClick={goPrev} />
        <div className="nav-zone right" onClick={goNext} />
      </div>

      <div className="controls">
        <button onClick={goPrev} aria-label="Anterior">‹</button>
        <span>{index + 1} / {slides.length}</span>
        <button onClick={goNext} aria-label="Próximo">›</button>
      </div>
    </div>
  );
}
