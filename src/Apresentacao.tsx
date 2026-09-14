import React, { useState, useEffect, useCallback } from "react";

/**
 * Apresentação de slides: réplica de Hagen et al. (2024)
 * Preparada como pré-defesa / apresentação de andamento de mestrado (PPGTCA/UTFPR).
 * Navegação: setas do teclado, clique nas bordas, ou botões.
 *
 * Objetivo desta versão: paridade científica com o caderno (App.tsx). Toda
 * afirmação quantitativa traz o número exato (± desvio padrão quando houver),
 * cada figura e tabela é numerada e legendada, e as figuras de t-SNE usam as
 * imagens reais geradas pelo pipeline (public/figures/*.png).
 */

// ---------- Pequenos componentes de gráfico (auto-contidos) ----------

function MiniBar({
  data,
  max,
  unit = "",
  yLabel,
}: {
  data: { label: string; value: number }[];
  max?: number;
  unit?: string;
  yLabel?: string;
}) {
  const m = (max ?? Math.max(...data.map((d) => d.value))) * 1.12;
  const W = 640;
  const rowH = 46;
  const padL = 150;
  const padR = 70;
  const padT = 12;
  const padB = 34;
  const plotW = W - padL - padR;
  const H = data.length * rowH + padT + padB;
  const scaleX = (v: number) => (v / m) * plotW;
  const nTicks = 5;
  const ticks = Array.from({ length: nTicks + 1 }, (_, i) => (m * i) / nTicks);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 720 }} role="img">
      {/* grade vertical + eixo x no topo */}
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={padL + scaleX(t)}
            y1={padT}
            x2={padL + scaleX(t)}
            y2={H - padB}
            stroke="#e3d9b8"
            strokeWidth={1}
          />
          <text
            x={padL + scaleX(t)}
            y={H - padB + 18}
            textAnchor="middle"
            fontSize="12.5"
            fill="#6b6b6b"
            fontFamily="Georgia, serif"
          >
            {Math.round(t).toLocaleString("pt-BR")}
          </text>
        </g>
      ))}
      {yLabel && (
        <text x={padL + plotW / 2} y={H - 4} textAnchor="middle" fontSize="12" fill="#8a8a8a">
          {yLabel}
        </text>
      )}
      {/* eixo y (linha base das barras) */}
      <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="#3a3a3a" strokeWidth={1.4} />

      {data.map((d, i) => {
        const y = padT + i * rowH;
        const barH = rowH * 0.5;
        const w = scaleX(d.value);
        return (
          <g key={d.label}>
            <text
              x={padL - 12}
              y={y + rowH / 2 + 5}
              textAnchor="end"
              fontSize="16"
              fill="#1a1a1a"
              fontFamily="Georgia, serif"
            >
              {d.label}
            </text>
            <rect
              x={padL}
              y={y + (rowH - barH) / 2}
              width={w}
              height={barH}
              fill="#f2b632"
              stroke="#8a6a10"
              strokeWidth={1}
              rx={2}
            />
            <text
              x={padL + w + 10}
              y={y + rowH / 2 + 5}
              fontSize="15"
              fontWeight={700}
              fill="#1a1a1a"
              fontFamily="Georgia, serif"
            >
              {d.value.toLocaleString("pt-BR")}{unit}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function MiniLine({
  categories,
  series,
  yMin = 0,
  yMax = 1,
  yLabel,
  decimals = 2,
}: {
  categories: string[];
  series: { label: string; values: number[]; color: string }[];
  yMin?: number;
  yMax?: number;
  yLabel?: string;
  decimals?: number;
}) {
  const W = 760;
  const H = 400;
  const padL = 68;
  const padR = 30;
  const padT = 24;
  const padB = 56;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const scaleX = (i: number) => padL + (i / (categories.length - 1)) * plotW;
  const scaleY = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * plotH;
  const nTicks = 5;
  const ticks = Array.from({ length: nTicks + 1 }, (_, i) => yMin + (i * (yMax - yMin)) / nTicks);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 760 }} role="img">
      {/* grade horizontal */}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={scaleY(t)} x2={W - padR} y2={scaleY(t)} stroke="#eee2c2" strokeWidth={1} />
          <text x={padL - 10} y={scaleY(t) + 5} textAnchor="end" fontSize="14" fill="#6b6b6b" fontFamily="Georgia, serif">
            {t.toFixed(decimals)}
          </text>
        </g>
      ))}
      {/* grade vertical (por categoria) */}
      {categories.map((c, i) => (
        <line
          key={c}
          x1={scaleX(i)}
          y1={padT}
          x2={scaleX(i)}
          y2={H - padB}
          stroke="#f4ecd4"
          strokeWidth={1}
        />
      ))}
      {/* eixos */}
      <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="#3a3a3a" strokeWidth={1.4} />
      <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#3a3a3a" strokeWidth={1.4} />

      {categories.map((c, i) => (
        <text
          key={c}
          x={scaleX(i)}
          y={H - padB + 26}
          textAnchor="middle"
          fontSize="15"
          fill="#1a1a1a"
          fontFamily="Georgia, serif"
        >
          {c}
        </text>
      ))}
      {yLabel && (
        <text
          x={18}
          y={padT + plotH / 2}
          textAnchor="middle"
          fontSize="12.5"
          fill="#8a8a8a"
          transform={`rotate(-90, 18, ${padT + plotH / 2})`}
        >
          {yLabel}
        </text>
      )}

      {series.map((s) => (
        <g key={s.label}>
          <polyline
            fill="none"
            stroke={s.color}
            strokeWidth={3}
            points={s.values.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(" ")}
          />
          {s.values.map((v, i) => (
            <g key={i}>
              <circle cx={scaleX(i)} cy={scaleY(v)} r={5.5} fill="#fff" stroke={s.color} strokeWidth={2.5} />
              <text
                x={scaleX(i)}
                y={scaleY(v) - 12}
                textAnchor="middle"
                fontSize="12"
                fontWeight={700}
                fill={s.color}
              >
                {v.toFixed(decimals)}
              </text>
            </g>
          ))}
        </g>
      ))}

      {/* legenda */}
      {series.map((s, i) => (
        <g key={s.label} transform={`translate(${padL + i * 160}, ${padT - 8})`}>
          <line x1={0} y1={0} x2={20} y2={0} stroke={s.color} strokeWidth={3} />
          <text x={26} y={4} fontSize="13" fill="#1a1a1a">
            {s.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Boxplot de duas caixas (Shannon: Controle vs. Seca), com os mesmos dados do caderno. */
function ShannonBoxplot() {
  const W = 520;
  const H = 300;
  const padL = 48;
  const padB = 34;
  const padT = 16;
  const plotH = H - padT - padB;
  const yMin = 5;
  const yMax = 10;
  const scaleY = (v: number) => padT + (yMax - v) * (plotH / (yMax - yMin));

  const groups = [
    { label: "Controle (n=302)", min: 6.07, q1: 7.8, median: 8.66, q3: 9.05, max: 9.63, cx: 170 },
    { label: "Seca (n=275)", min: 5.97, q1: 7.57, median: 8.65, q3: 8.96, max: 9.56, cx: 370 },
  ];
  const boxW = 96;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 560 }} role="img" aria-label="Boxplot do índice de Shannon por regime de rega">
      <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="#3a3a3a" strokeWidth={1.3} />
      {[5, 6, 7, 8, 9, 10].map((v) => (
        <g key={v}>
          <line x1={padL} y1={scaleY(v)} x2={W - 20} y2={scaleY(v)} stroke="#eee2c2" strokeWidth={1} />
          <text x={padL - 8} y={scaleY(v) + 4} textAnchor="end" fontSize="12.5" fill="#6b6b6b" fontFamily="Georgia, serif">{v}</text>
        </g>
      ))}
      <line x1={padL} y1={H - padB} x2={W - 20} y2={H - padB} stroke="#3a3a3a" strokeWidth={1.3} />
      {groups.map((g) => (
        <g key={g.label}>
          <line x1={g.cx} y1={scaleY(g.min)} x2={g.cx} y2={scaleY(g.q1)} stroke="#8a6a10" strokeDasharray="3,3" />
          <line x1={g.cx} y1={scaleY(g.q3)} x2={g.cx} y2={scaleY(g.max)} stroke="#8a6a10" strokeDasharray="3,3" />
          <rect x={g.cx - boxW / 2} y={scaleY(g.q3)} width={boxW} height={scaleY(g.q1) - scaleY(g.q3)} fill="#f2b632" fillOpacity={0.35} stroke="#8a6a10" strokeWidth={1.3} />
          <line x1={g.cx - boxW / 2} y1={scaleY(g.median)} x2={g.cx + boxW / 2} y2={scaleY(g.median)} stroke="#1a1a1a" strokeWidth={2} />
          <text x={g.cx} y={H - padB + 18} textAnchor="middle" fontSize="13.5" fill="#1a1a1a" fontFamily="Georgia, serif">{g.label}</text>
        </g>
      ))}
      <text x={16} y={padT + plotH / 2} textAnchor="middle" fontSize="12" fill="#8a8a8a" transform={`rotate(-90, 16, ${padT + plotH / 2})`}>índice de Shannon</text>
    </svg>
  );
}

// ---------- Layouts de slide ----------

function Kicker({ children }: { children: React.ReactNode }) {
  return <div className="kicker">{children}</div>;
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <div className="card-block">
      <div className="card-block-body">
        <ul className="bullets">
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Concept({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="concept-box">
      <div className="concept-box-term">O que é {term}?</div>
      <div className="concept-box-text">{children}</div>
    </div>
  );
}

/** Legenda de figura/tabela, no formato "Figura N. texto". */
function Caption({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="fig-caption">
      <span className="fig-lab">{label}</span> {children}
    </p>
  );
}

/** Figura de imagem (PNG real do pipeline) com legenda numerada. */
function Figure({
  src,
  alt,
  label,
  caption,
}: {
  src: string;
  alt: string;
  label: string;
  caption: React.ReactNode;
}) {
  return (
    <figure className="img-figure">
      <img src={`${import.meta.env.BASE_URL}${src}`} alt={alt} />
      <figcaption>
        <span className="fig-lab">{label}</span> {caption}
      </figcaption>
    </figure>
  );
}

/** Tabela científica com caption e nota de rodapé opcional. */
function DataTable({
  label,
  title,
  head,
  rows,
  note,
  emphasizeLast,
}: {
  label: string;
  title: React.ReactNode;
  head: React.ReactNode[];
  rows: React.ReactNode[][];
  note?: React.ReactNode;
  emphasizeLast?: boolean;
}) {
  return (
    <div className="table-wrap">
      <div className="table-cap">
        <span className="fig-lab">{label}</span> {title}
      </div>
      <table className="pres-table">
        <thead>
          <tr>{head.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className={emphasizeLast && ri === rows.length - 1 ? "row-emph" : ""}>
              {r.map((c, ci) => <td key={ci}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {note && <div className="table-note">{note}</div>}
    </div>
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
          Etapa preparatória da dissertação de mestrado: classificação de
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
          <div><strong>4.</strong> Pipeline de replicação (11 etapas)</div>
          <div><strong>5.</strong> Processamento (DADA2, taxonomia)</div>
          <div><strong>6.</strong> Diversidade e abundância diferencial</div>
          <div><strong>7.</strong> Checagem de viés (t-SNE)</div>
          <div><strong>8.</strong> Machine Learning + SHAP</div>
          <div><strong>9.</strong> Comparação com o artigo</div>
          <div><strong>10.</strong> Teste de generalização (sorgo)</div>
          <div><strong>11.</strong> Relevância pra dissertação</div>
          <div><strong>12.</strong> Próximos passos</div>
        </div>
        <p className="lede small">
          Resumo: pipeline replicado do dado bruto ao modelo final, com
          resultados batendo de perto com o artigo original em diversidade,
          abundância diferencial, aprendizado de máquina e interpretação (SHAP).
        </p>
      </>
    ),
  },
  // 3. Contexto
  {
    content: (
      <>
        <Kicker>1 · Contexto</Kicker>
        <h2>Objeto da dissertação</h2>
        <Concept term="microbioma">
          O conjunto de micro-organismos (principalmente bactérias) que vivem
          associados a um ambiente: aqui, ao redor e dentro das raízes das
          plantas.
        </Concept>
        <Bullets
          items={[
            <>Classificar <strong>sanidade em soja</strong> (sadio vs. doente) a partir do microbioma associado à cultura</>,
            <>Combinar dados de <strong>múltiplos projetos</strong> de soja, não um único estudo controlado</>,
            <>Lacuna identificada: a maioria dos trabalhos trata o "projeto de origem" como irrelevante, mas ele pode <em>confundir</em> a análise</>,
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
        <p className="lede small">
          Referência-base: Hagen, M. et al. Interpretable machine learning
          decodes soil microbiome's response to drought stress.{" "}
          <em>Environmental Microbiome</em>, v. 19, n. 35, 2024.
        </p>
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
          to drought stress", <em>Environmental Microbiome</em>, 19(35).
        </p>
        <Bullets
          items={[
            "Sequenciamento 16S rRNA do microbioma de solo/raiz/rizosfera",
            "Random Forest treinado para distinguir Controle vs. Seca",
            "Interpretação via SHAP: quais bactérias pesam mais na decisão do modelo",
          ]}
        />
        <Concept term="16S rRNA, Random Forest e SHAP">
          16S rRNA é o gene usado para "ler" quais bactérias existem numa
          amostra. Random Forest é um modelo de IA que combina várias
          "árvores de decisão" simples pra classificar. SHAP explica,
          depois, o que pesou na decisão do modelo, bactéria por bactéria.
        </Concept>
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
  // 8. Dataset + Tabela 1 + figura
  {
    content: (
      <>
        <Kicker>3 · Dataset</Kicker>
        <h2>Grass-Drought (Naylor et al., 2017)</h2>
        <DataTable
          label="Tabela 1."
          title="Resumo do dataset Grass-Drought."
          head={["O quê", "Quanto"]}
          rows={[
            ["Total de amostras", "623 (320 Controle / 303 Seca)"],
            ["Compartimentos", "Solo (205) · Raiz (207) · Rizosfera (211)"],
            ["Sequenciamento", "16S rRNA, região V3–V4, Illumina pareado"],
            ["Origem dos dados", "NCBI SRA, BioProject PRJNA369551"],
          ]}
          note="Fonte: metadata.csv do repositório de Hagen et al. (2024)."
        />
        <MiniBar
          data={[
            { label: "Controle", value: 320 },
            { label: "Seca", value: 303 },
          ]}
          yLabel="nº de amostras"
        />
        <Caption label="Figura 1.">
          Distribuição das 623 amostras por regime de rega: desenho quase
          balanceado (51,4% Controle / 48,6% Seca).
        </Caption>
      </>
    ),
  },
  // 9. BioProject confusão
  {
    content: (
      <>
        <Kicker>4 · Pipeline · Etapa 2</Kicker>
        <h2>Obtenção dos dados: qual é a amostra certa?</h2>
        <Bullets
          items={[
            <>O BioProject inteiro (PRJNA369551) reúne <strong>880 experimentos</strong>, mas só <strong>623</strong> são deste estudo; o resto é de outras pesquisas do mesmo grupo</>,
            <>A lista correta veio do arquivo <em>metadata.csv</em> publicado com o código, não de filtrar o BioProject manualmente</>,
            "Download via qiime fondue get-sequences (NCBI SRA): 0 falhas em 623 amostras, ~11 h de execução (~18,7 GB)",
          ]}
        />
        <p className="lede small">
          Lição transferível pra dissertação: BioProjects públicos misturam
          experimentos; a curadoria da lista de amostras é parte da ciência.
        </p>
      </>
    ),
  },
  // 10. Section: pipeline
  {
    variant: "section",
    content: (
      <>
        <div className="section-num">04</div>
        <h2 className="section-title">Pipeline de replicação</h2>
      </>
    ),
  },
  // 11. Pipeline overview
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
        <p className="lede small">
          Ferramentas: QIIME 2 (aquisição, cutadapt, DADA2, SILVA, diversidade),
          R (phyloseq, DAA em 5 métodos), Python (t-SNE, Random Forest, SHAP).
        </p>
      </>
    ),
  },
  // 12. Primers + DADA2
  {
    content: (
      <>
        <Kicker>5 · Processamento · Etapas 4–5</Kicker>
        <h2>Remoção de primers e DADA2</h2>
        <Concept term="ASV e DADA2">
          ASV é uma sequência de DNA identificada com precisão de
          nucleotídeo: cada uma representa uma "bactéria" distinta
          encontrada na amostra. DADA2 é o algoritmo que transforma as
          leituras brutas do sequenciador nessa tabela de ASVs, corrigindo
          erros de leitura.
        </Concept>
        <Bullets
          items={[
            <>Primers 341F/785R (região V3–V4 do 16S) removidos via cutadapt, com <strong>98,4%</strong> das leituras aproveitadas</>,
            "Truncagem: leitura de ida em 260 pb, de volta em 190 pb (definida pelo gráfico de qualidade)",
            "DADA2: aprendizado de erro, inferência de ASVs, junção de pares, remoção de quimeras",
            <>Resultado bruto: <strong>36.543 ASVs</strong> e 32.100.122 leituras em 623 amostras</>,
          ]}
        />
      </>
    ),
  },
  // 13. Taxonomia SILVA + Tabela 2
  {
    content: (
      <>
        <Kicker>5 · Processamento · Etapa 6</Kicker>
        <h2>Classificação taxonômica (SILVA)</h2>
        <Concept term="taxonomia e SILVA">
          Taxonomia é o "nome científico" de cada bactéria (família, gênero,
          espécie). SILVA é o banco de referência usado como dicionário pra
          nomear cada ASV; aqui, o classificador uniforme treinado pra V3–V4.
        </Concept>
        <DataTable
          label="Tabela 2."
          title="Números da tabela de ASVs antes de qualquer filtro."
          head={["Métrica", "Valor"]}
          rows={[
            ["Amostras com dados após DADA2", "623"],
            ["ASVs únicas (sem filtro)", "36.543"],
            ["Total de observações (leituras)", "32.100.122"],
            ["ASVs classificadas com sucesso", "36.446 de 36.543 (99,7%)"],
            ["Confiança média da classificação", "0,97"],
            ["ASVs com confiança ≥ 0,90", "88,2%"],
          ]}
        />
      </>
    ),
  },
  // 14. Filos abundantes + Figura 2 + Tabela 3
  {
    content: (
      <>
        <Kicker>5 · Processamento</Kicker>
        <h2>Composição: filos mais abundantes</h2>
        <MiniBar
          data={[
            { label: "Pseudomonadota", value: 9390 },
            { label: "Bacteroidota", value: 5920 },
            { label: "Actinomycetota", value: 3281 },
            { label: "Myxococcota", value: 3191 },
            { label: "Verrucomicrobiota", value: 2209 },
            { label: "Acidobacteriota", value: 1869 },
          ]}
          yLabel="nº de ASVs"
        />
        <Caption label="Figura 2.">
          Seis filos concentram a maior parte das ASVs. Composição condizente
          com o esperado para microbioma de solo/raiz de gramíneas (Tabela 3).
        </Caption>
      </>
    ),
  },
  // 15. Section: diversidade/DAA
  {
    variant: "section",
    content: (
      <>
        <div className="section-num">06</div>
        <h2 className="section-title">Diversidade e Abundância Diferencial</h2>
      </>
    ),
  },
  // 16. Diversidade alfa vs beta + Shannon boxplot
  {
    content: (
      <>
        <Kicker>6 · Diversidade</Kicker>
        <h2>Diversidade alfa vs. beta</h2>
        <Concept term="diversidade alfa e beta">
          Alfa mede o quão diversa é a comunidade <em>dentro</em> de uma
          amostra (índice de Shannon). Beta mede o quanto duas amostras{" "}
          <em>diferem entre si</em> em composição (Bray-Curtis), testado via
          PERMANOVA.
        </Concept>
        <div className="two-col">
          <div className="stat-card">
            <div className="stat-label">Shannon (alfa)</div>
            <div className="stat-value">p = 0,145</div>
            <div className="stat-note">Kruskal-Wallis, sem diferença</div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-label">Bray-Curtis (beta, PERMANOVA)</div>
            <div className="stat-value">p = 0,001</div>
            <div className="stat-note">pseudo-F = 24,83; n = 577</div>
          </div>
        </div>
        <ShannonBoxplot />
        <Caption label="Figura 3.">
          Índice de Shannon por regime de rega (dados da visualização QIIME 2).
          Distribuições praticamente sobrepostas: Controle e Seca não têm
          comunidades mais ou menos diversas, têm comunidades <em>diferentes</em> em composição.
        </Caption>
      </>
    ),
  },
  // 17. Diversidade: comparação com artigo (Tabela 4)
  {
    content: (
      <>
        <Kicker>6 · Diversidade</Kicker>
        <h2>Comparação direta com o artigo</h2>
        <DataTable
          label="Tabela 4."
          title="Diversidade: esta replicação vs. Hagen et al. (2024)."
          head={["Métrica", "Hagen et al.", "Esta réplica"]}
          rows={[
            ["ASVs após filtro de prevalência", "3.276 (de 25.415)", "4.354 (de 36.543)"],
            ["Shannon (Controle vs. Seca)", "Sem diferença", "p = 0,145 (sem diferença)"],
            [
              <>Bray-Curtis (PERMANOVA)</>,
              "Sig.; rega explica 6,8%",
              "p = 0,001; rega explica ≈ 4,1%",
            ],
          ]}
          note={
            <>
              Variância explicada estimada do pseudo-F pela relação padrão da
              PERMANOVA de um fator: R² = (a−1)F / [(a−1)F + (n−a)]. Magnitude
              na mesma ordem de grandeza do artigo (4,1% vs. 6,8%).
            </>
          }
        />
      </>
    ),
  },
  // 18. DAA 5 métodos + Figura 4
  {
    content: (
      <>
        <Kicker>6 · DAA</Kicker>
        <h2>5 métodos de Análise de Abundância Diferencial</h2>
        <Concept term="Análise de Abundância Diferencial (DAA)">
          Testes estatísticos que descobrem quais bactérias mudam de
          quantidade entre Controle e Seca. Usar 5 métodos (α = 0,05, correção
          de Benjamini-Hochberg) em vez de um só aumenta a confiança quando
          todos concordam.
        </Concept>
        <MiniBar
          data={[
            { label: "edgeR", value: 2498 },
            { label: "Wilcoxon", value: 2100 },
            { label: "ANCOM-BC2", value: 1708 },
            { label: "DESeq2", value: 1136 },
            { label: "ALDEx2", value: 590 },
          ]}
          yLabel="ASVs significativas (de 4.354)"
        />
        <Caption label="Figura 4.">
          ASVs significativas por método. A variação (2.498 no edgeR vs. 590 no
          ALDEx2, o mais conservador) é esperada: cada método faz suposições
          estatísticas distintas. Consenso via UpSetR: <strong>668 ASVs</strong>{" "}
          significativas nos 5 métodos ao mesmo tempo.
        </Caption>
      </>
    ),
  },
  // 19. DAA todos os ranks + Figura 5 + Tabela 5
  {
    content: (
      <>
        <Kicker>6 · DAA</Kicker>
        <h2>Estendendo aos 5 níveis taxonômicos</h2>
        <p className="lede small">
          3 métodos mais consistentes (DESeq2, ANCOM-BC2, ALDEx2), mesma
          estrutura usada depois no Machine Learning.
        </p>
        <MiniLine
          categories={["Filo", "Classe", "Ordem", "Família", "Gênero"]}
          series={[
            { label: "DESeq2", values: [23, 48, 119, 176, 275], color: "#e8b04b" },
            { label: "ANCOM-BC2", values: [22, 49, 124, 198, 310], color: "#6fa3ae" },
            { label: "ALDEx2", values: [22, 41, 98, 166, 260], color: "#8aa26a" },
          ]}
          yMin={0}
          yMax={320}
          decimals={0}
          yLabel="Táxons significativos"
        />
        <Caption label="Figura 5.">
          Táxons significativos por nível taxonômico. O número cresce do filo
          ao gênero (há mais gêneros distintos que filos), e os 3 métodos
          concordam bem em todos os níveis (Tabela 5).
        </Caption>
      </>
    ),
  },
  // 20. Section: t-SNE
  {
    variant: "section",
    content: (
      <>
        <div className="section-num">07</div>
        <h2 className="section-title">Checagem de viés (t-SNE)</h2>
      </>
    ),
  },
  // 21. t-SNE geral (Figura 6, imagem real)
  {
    content: (
      <>
        <Kicker>7 · Viés</Kicker>
        <h2>As amostras se agrupam pelo motivo certo?</h2>
        <Concept term="t-SNE e viés de agrupamento">
          t-SNE achata os milhares de valores de abundância de cada amostra
          num mapa 2D: amostras parecidas ficam perto. Serve pra checar se as
          amostras se agrupam por regime de rega (o que queremos) ou por um
          fator "errado" (compartimento, espécie, projeto), o que seria viés.
        </Concept>
        <Figure
          src="figures/tsne_bias_check.png"
          alt="Projeção t-SNE geral colorida por regime de rega, compartimento e espécie de planta"
          label="Figura 6."
          caption={
            <>
              Projeção t-SNE geral colorida por três fatores. Compartimento
              (solo/raiz/rizosfera) forma os agrupamentos mais nítidos, o eixo
              de maior variância; espécie de planta aparece bem misturada, sem
              confundimento.
            </>
          }
        />
      </>
    ),
  },
  // 22. t-SNE estratificada por compartimento (Figura 7, imagem real) + Tabela 6
  {
    content: (
      <>
        <Kicker>7 · Viés</Kicker>
        <h2>Projeção t-SNE estratificada por compartimento, colorida por regime de rega</h2>
        <Figure
          src="figures/tsne_by_compartment.png"
          alt="Projeção t-SNE estratificada por compartimento, colorida por regime de rega"
          label="Figura 7."
          caption={
            <>
              t-SNE dentro de cada compartimento, colorida só por regime de
              rega: a separação Controle/Seca varia em nitidez, mas aparece nos
              três painéis (rizosfera &gt; raiz &gt; solo).
            </>
          }
        />
        <DataTable
          label="Tabela 6."
          title="Separação Controle/Seca por compartimento na t-SNE estratificada."
          head={["Compartimento", "n", "Balanceamento", "Separação"]}
          rows={[
            ["Rizosfera", "208", "107 / 101", "Forte"],
            ["Raiz", "180", "97 / 83", "Moderada"],
            ["Solo", "189", "98 / 91", "Mais fraca"],
          ]}
          note="Balanceamento quase igual nos três, o que descarta desbalanceamento amostral como causa da diferença de nitidez; a leitura mais provável é biológica."
        />
      </>
    ),
  },
  // 23. t-SNE estratificada (Figura 8) + conclusão viés
  {
    content: (
      <>
        <Kicker>7 · Viés</Kicker>
        <h2>Conclusão da checagem de viés</h2>
        <Figure
          src="figures/tsne_bias_check_stratified.png"
          alt="Versão estratificada da checagem de viés de agrupamento"
          label="Figura 8."
          caption={
            <>
              Versão estratificada da checagem de viés, complementando a Figura
              7. O sinal de estresse hídrico é real nos três compartimentos, não
              é artefato do agrupamento por compartimento.
            </>
          }
        />
        <Bullets
          items={[
            "Mesmo num único estudo controlado, o sinal biológico não é homogêneo entre subgrupos",
            "Em múltiplos projetos de soja combinados, essa heterogeneidade tende a ser maior, não menor",
            <>Reforça a necessidade da validação <strong>leave-one-project-out</strong> planejada pra dissertação</>,
          ]}
        />
      </>
    ),
  },
  // 24. Section: ML
  {
    variant: "section",
    content: (
      <>
        <div className="section-num">08</div>
        <h2 className="section-title">Machine Learning + SHAP</h2>
      </>
    ),
  },
  // 25. ML metodologia
  {
    content: (
      <>
        <Kicker>8 · ML</Kicker>
        <h2>Random Forest com validação cruzada aninhada</h2>
        <Concept term="validação cruzada aninhada (Nested CV)">
          Um jeito cuidadoso de testar o modelo: um laço externo (5 folds)
          avalia o desempenho, um laço interno (3 folds) otimiza os
          hiperparâmetros, em camadas separadas, pra garantir que o modelo não
          "colou" nos dados de teste.
        </Concept>
        <Bullets
          items={[
            "Testado nos 5 níveis taxonômicos (filo a gênero)",
            "GridSearch interno: n_estimators, max_depth, min_samples_leaf",
            "SHAP no nível de gênero: interpreta quais bactérias pesam na decisão",
          ]}
        />
      </>
    ),
  },
  // 26. ML resultados por rank (Tabela 7 + Figura 9)
  {
    content: (
      <>
        <Kicker>8 · ML</Kicker>
        <h2>Desempenho por nível taxonômico</h2>
        <DataTable
          label="Tabela 7."
          title="Random Forest por nível taxonômico (média ± dp, 5 folds)."
          head={["Nível", "Acurácia", "F1", "Recall", "AUC"]}
          rows={[
            ["Filo", "0,904 ± 0,011", "0,903", "0,913", "0,956"],
            ["Classe", "0,908 ± 0,017", "0,905", "0,910", "0,966"],
            ["Ordem", "0,916 ± 0,020", "0,916", "0,940", "0,971"],
            ["Família", "0,934 ± 0,024", "0,933", "0,943", "0,980"],
            ["Gênero", "0,937 ± 0,023", "0,937", "0,963", "0,979"],
          ]}
          emphasizeLast
        />
        <MiniLine
          categories={["Filo", "Classe", "Ordem", "Família", "Gênero"]}
          series={[
            { label: "Acurácia", values: [0.904, 0.908, 0.916, 0.934, 0.937], color: "#e8b04b" },
            { label: "AUC", values: [0.956, 0.966, 0.971, 0.980, 0.979], color: "#6fa3ae" },
          ]}
          yMin={0.85}
          yMax={1.0}
        />
        <Caption label="Figura 9.">
          Acurácia e AUC crescem do filo ao gênero; gênero tem o melhor
          desempenho, igual ao artigo original.
        </Caption>
      </>
    ),
  },
  // 27. Section: comparação
  {
    variant: "section",
    content: (
      <>
        <div className="section-num">09</div>
        <h2 className="section-title">Comparação com o artigo</h2>
      </>
    ),
  },
  // 28. Comparação números (Tabela 8)
  {
    content: (
      <>
        <Kicker>9 · Comparação</Kicker>
        <h2>Nível de gênero: réplica vs. original</h2>
        <DataTable
          label="Tabela 8."
          title="Comparação direta com o artigo original (nível de gênero)."
          head={["Métrica", "Hagen et al. (2024)", "Esta réplica"]}
          rows={[
            ["Acurácia", "0,923 ± 0,029", "0,937 ± 0,023"],
            ["F1-score", "0,921 ± 0,030", "0,937 ± 0,023"],
            ["Recall", "0,954 ± 0,029", "0,963 ± 0,024"],
            ["AUC", "0,980 ± 0,010", "0,979 ± 0,010"],
          ]}
          note="Todas as métricas dentro de um desvio padrão dos valores publicados."
        />
      </>
    ),
  },
  // 29. Kribbella: o achado mais forte
  {
    content: (
      <>
        <Kicker>9 · Comparação</Kicker>
        <h2 className="highlight-title">O achado mais forte da replicação</h2>
        <p className="lede">
          O táxon marcador nº 1 apontado pelo SHAP foi o gênero{" "}
          <em>Kribbella</em> (família Kribbellaceae), <strong>exatamente o
          mesmo</strong> relatado por Hagen et al. (2024) como o marcador mais
          consistente.
        </p>
        <p className="lede small">
          Combinado ao AUC quase idêntico (0,979 vs. 0,980), essa coincidência
          é forte evidência de que o pipeline captura o mesmo sinal biológico
          do estudo original, não um artefato do processamento.
        </p>
      </>
    ),
  },
  // 30. Concordância DAA x SHAP (Tabela 9)
  {
    content: (
      <>
        <Kicker>9 · Comparação</Kicker>
        <h2>Concordância entre DAA e SHAP</h2>
        <DataTable
          label="Tabela 9."
          title="Concordância DAA (consenso ≥ 2 de 3 métodos) × SHAP, nível gênero."
          head={["Métrica", "Valor"]}
          rows={[
            ["Táxons no consenso da DAA (≥ 2 de 3)", "173"],
            ["Táxons em comum com o topo do SHAP", "106"],
            ["Concordância (interseção / consenso DAA)", "61,3%"],
            ["Concordância (Jaccard)", "44,2%"],
            ["Concordância no artigo original", "79,6% a 82,6%"],
          ]}
          note={
            <>
              Mesma ordem de grandeza; diferença esperada, já que o critério
              exato do artigo não está documentado publicamente.{" "}
              <em>Kribbella</em> está entre os 106 táxons de concordância.
            </>
          }
        />
      </>
    ),
  },
  // 31. Section: generalização
  {
    variant: "section",
    content: (
      <>
        <div className="section-num">10</div>
        <h2 className="section-title">Teste de generalização (sorgo)</h2>
      </>
    ),
  },
  // 32. Generalização + Tabela 10
  {
    content: (
      <>
        <Kicker>10 · Generalização</Kicker>
        <h2>Teste com um dataset independente (sorgo)</h2>
        <p className="lede small">
          Aplicar o modelo treinado no Grass-Drought, sem retreinar, num
          dataset novo (Sorghum-Drought, BioProject PRJNA435634). Encontrar os
          dados certos deu trabalho: o BioProject mistura shotgun (WGS) com
          amplicon 16S e ainda tem um lote de <em>tomate</em> misturado.
        </p>
        <DataTable
          label="Tabela 10."
          title="Composição final do subconjunto Sorghum-Drought."
          head={["Critério", "Valor"]}
          rows={[
            ["Amostras totais", "449"],
            ["Controle / Seca", "233 / 216"],
            ["Compartimentos", "Raiz (160) · Solo (150) · Rizosfera (139)"],
            ["Seleção", "Controle + seca pré-florescimento, semanas 2–7 e 10–17"],
          ]}
          note="Critério próprio, explícito e reproduzível (o critério exato do artigo não está documentado)."
        />
      </>
    ),
  },
  // 32b. Resultado da generalização (Tabela 11)
  {
    content: (
      <>
        <Kicker>10 · Generalização</Kicker>
        <h2 className="highlight-title">O modelo não generalizou bem, e isso importa</h2>
        <DataTable
          label="Tabela 11."
          title="Desempenho dentro do estudo original vs. generalizando para o sorgo (nível de gênero)."
          head={["Métrica", "Grass-Drought", "Sorghum-Drought"]}
          rows={[
            ["Acurácia", "0,937", "0,595"],
            ["F1-score", "0,937", "0,560"],
            ["Recall", "0,963", "0,537"],
            ["AUC", "0,979", "0,621"],
          ]}
          note="Dos 613 gêneros aprendidos no Grass-Drought, 514 também apareceram no sorgo; os demais foram tratados como ausentes (zero). Modelo aplicado sem nenhum retreinamento."
          emphasizeLast
        />
        <Concept term="por que isso é um resultado bom, não ruim">
          Um AUC de 0,621 é só fracamente melhor que chute aleatório (0,5),
          bem distante do 0,979 obtido dentro do próprio Grass-Drought. Um
          modelo treinado numa mistura de espécies de gramíneas não
          transferiu bem para uma espécie diferente, mesmo com a mesma
          metodologia. Isso é evidência empírica de que combinar projetos
          sem controlar pela origem arrisca essa mesma queda de
          desempenho, justificando a validação leave-one-project-out.
        </Concept>
      </>
    ),
  },
  // 33. Relevância pra dissertação (Tabela 12)
  {
    content: (
      <>
        <Kicker>11 · Relevância</Kicker>
        <h2>O que isso muda para a dissertação</h2>
        <DataTable
          label="Tabela 12."
          title="O que muda entre este estudo e a dissertação."
          head={["Neste estudo", "Na dissertação (soja)"]}
          rows={[
            ["Um estudo único e grande", "Múltiplos projetos combinados"],
            ["Controle vs. Seca", "Sadio vs. Doente"],
            ["Validação cruzada padrão", "Leave-one-project-out"],
          ]}
        />
        <p className="lede small">
          Replicar o pipeline inteiro primeiro garante que, nos dados reais de
          soja, os problemas sejam sobre a ciência, e não sobre um comando de
          terminal configurado errado sem perceber.
        </p>
      </>
    ),
  },
  // 34. Conclusão
  {
    content: (
      <>
        <Kicker>Conclusão</Kicker>
        <h2>O que este trabalho demonstra</h2>
        <Bullets
          items={[
            <>Pipeline replicado <strong>do dado bruto ao modelo final</strong>, com resultados batendo de perto com o artigo original em todas as frentes</>,
            <>Diversidade, DAA, t-SNE e ML convergem para a mesma conclusão biológica, inclusive o táxon marcador (<em>Kribbella</em>)</>,
            <>Teste de generalização mostrou queda real de desempenho entre espécies (AUC 0,979 → 0,621), validando empiricamente por que o leave-one-project-out é necessário</>,
            "Investigação de dados reais (BioProjects confusos, tipos de sequenciamento misturados) já foi enfrentada e resolvida",
            <>Pipeline <strong>validado e pronto</strong> para ser adaptado aos dados reais de soja</>,
          ]}
        />
      </>
    ),
  },
  // 35. Próximos passos + obrigada
  {
    variant: "section",
    content: (
      <>
        <div className="section-num">12</div>
        <h2 className="section-title">Próximos passos</h2>
        <Bullets
          items={[
            "Levantar e consolidar múltiplos datasets reais de soja",
            "Aplicar o pipeline validado com a validação leave-one-project-out",
          ]}
        />
        <div className="thanks">Obrigada! Perguntas?</div>
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
          --navy: #10151d;
          --gold: #f2b632;
          --gold-deep: #e0a01f;
          --cream: #fdecc5;
          --ink: #1a1a1a;
          --ink-soft: #5a5a5a;
          --rule: #e7ddc0;
          --red: #c0392b;
          --font-serif: Georgia, "Times New Roman", serif;
          --font-sans: "IBM Plex Sans", -apple-system, "Segoe UI", sans-serif;
        }
        * { box-sizing: border-box; }
        html, body, #root { height: 100%; margin: 0; }
        .deck {
          background: #fbfaf6;
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
          background: var(--gold);
          transition: width 0.35s ease;
        }
        .stage {
          flex: 1;
          position: relative;
          display: flex;
          align-items: stretch;
          justify-content: center;
          overflow: hidden;
        }
        .corner-accent {
          position: absolute;
          top: 0;
          right: 0;
          width: 220px;
          height: 220px;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }
        .corner-accent::before {
          content: "";
          position: absolute;
          top: -60px;
          right: -60px;
          width: 300px;
          height: 300px;
          background: var(--navy);
          transform: rotate(45deg);
        }
        .corner-accent::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 100%;
          background-image: repeating-linear-gradient(
            -45deg,
            var(--gold) 0px, var(--gold) 2px,
            transparent 2px, transparent 14px
          );
          opacity: 0.9;
        }
        .slide {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding: 52px 7vw 62px;
          animation: slideIn 0.4s ease both;
          overflow-y: auto;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slide.section-slide {
          justify-content: center;
          background: var(--navy);
          color: #fdecc5;
        }
        .slide.title-slide {
          justify-content: center;
          align-items: flex-start;
        }
        .kicker {
          font-family: var(--font-sans);
          font-size: 12.5px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--gold-deep);
          margin-bottom: 10px;
          font-weight: 700;
        }
        .section-slide .kicker { color: var(--gold); }
        h1.title-xl {
          font-family: var(--font-serif);
          font-weight: 700;
          font-size: clamp(26px, 3.6vw, 46px);
          line-height: 1.2;
          margin: 0 0 18px;
          max-width: 18ch;
          color: var(--ink);
        }
        h2 {
          font-family: var(--font-serif);
          font-weight: 700;
          font-size: clamp(20px, 2.6vw, 32px);
          margin: 0 0 16px;
          line-height: 1.25;
          color: var(--ink);
        }
        .section-slide h2 { color: #fdecc5; }
        h2.highlight-title { color: var(--gold-deep); }
        .subtitle {
          font-size: clamp(14px, 1.4vw, 18px);
          color: var(--ink-soft);
          max-width: 48ch;
          margin: 0 0 22px;
        }
        .title-meta {
          font-size: 13px;
          color: var(--ink-soft);
          border-top: 2px solid var(--gold);
          padding-top: 12px;
          max-width: 52ch;
        }
        .lede {
          font-size: clamp(15px, 1.5vw, 19px);
          color: var(--ink);
          max-width: 58ch;
          line-height: 1.55;
          margin: 0 0 10px;
        }
        .section-slide .lede { color: #fdecc5; }
        .lede.small { font-size: clamp(12.5px, 1.15vw, 14.5px); color: var(--ink-soft); }
        .section-slide .lede.small { color: #cbb98a; }

        .card-block {
          background: var(--cream);
          border-radius: 10px;
          overflow: hidden;
          max-width: 66ch;
          margin-bottom: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }
        .section-slide .card-block {
          background: rgba(253,236,197,0.1);
          box-shadow: none;
          border: 1px solid rgba(253,236,197,0.25);
        }
        .concept-box {
          border-left: 3px solid var(--gold-deep);
          background: rgba(242,182,50,0.08);
          border-radius: 0 8px 8px 0;
          padding: 8px 16px;
          max-width: 58ch;
          margin: 4px 0 12px;
        }
        .section-slide .concept-box {
          border-left-color: var(--gold);
          background: rgba(253,236,197,0.06);
        }
        .concept-box-term {
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--gold-deep);
          margin-bottom: 3px;
        }
        .section-slide .concept-box-term { color: var(--gold); }
        .concept-box-text {
          font-size: clamp(12.5px, 1.15vw, 15px);
          color: var(--ink-soft);
          line-height: 1.45;
        }
        .section-slide .concept-box-text { color: #d8c99a; }
        .card-block-head {
          background: var(--gold);
          color: #2a1f04;
          font-weight: 700;
          font-size: clamp(13px, 1.3vw, 16px);
          padding: 8px 16px;
        }
        .card-block-body { padding: 8px 18px 12px; }

        .bullets {
          list-style: none;
          padding: 0;
          margin: 0;
          max-width: 62ch;
        }
        .bullets li {
          font-size: clamp(13.5px, 1.3vw, 17px);
          line-height: 1.5;
          padding: 7px 0 7px 26px;
          position: relative;
        }
        .bullets li::before {
          content: "●";
          font-size: 8px;
          position: absolute;
          left: 2px;
          top: 14px;
          color: var(--gold-deep);
        }
        .section-slide .bullets li::before { color: var(--gold); }
        .agenda-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 40px;
          max-width: 72ch;
          font-size: clamp(13px, 1.3vw, 16.5px);
          margin-bottom: 14px;
        }
        .agenda-grid strong { color: var(--gold-deep); margin-right: 8px; }
        .section-num {
          font-family: var(--font-serif);
          font-size: clamp(54px, 7.5vw, 120px);
          color: var(--gold);
          line-height: 1;
          margin-bottom: 0.1em;
          opacity: 0.85;
        }
        .section-title { font-size: clamp(24px, 3.2vw, 42px); }
        .pipeline-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          max-width: 82ch;
          margin-bottom: 14px;
        }
        .pipeline-node {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--cream);
          border: 1px solid var(--rule);
          border-radius: 20px;
          padding: 5px 14px 5px 6px;
        }
        .pipeline-num {
          background: var(--gold);
          color: #2a1f04;
          font-weight: 700;
          font-size: 11.5px;
          width: 19px;
          height: 19px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pipeline-label { font-size: 12.5px; color: var(--ink); }
        .two-col {
          display: flex;
          gap: 20px;
          margin: 6px 0 12px;
          flex-wrap: wrap;
        }
        .stat-card {
          background: var(--cream);
          border-radius: 10px;
          padding: 14px 20px;
          min-width: 190px;
          border-top: 4px solid var(--gold);
        }
        .stat-card.highlight { border-top-color: var(--red); }
        .stat-label { font-size: 12px; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.04em; }
        .stat-value { font-family: var(--font-serif); font-weight: 700; font-size: 26px; margin: 5px 0; color: var(--ink); }
        .stat-note { font-size: 12px; color: var(--ink-soft); }

        /* Figuras e legendas científicas */
        .fig-caption {
          font-size: clamp(11.5px, 1.08vw, 13.5px);
          font-style: italic;
          color: var(--ink-soft);
          max-width: 66ch;
          line-height: 1.45;
          margin: 6px 0 10px;
        }
        .fig-caption .fig-lab, .img-figure figcaption .fig-lab, .table-cap .fig-lab {
          font-style: normal;
          font-weight: 700;
          color: var(--ink);
        }
        .img-figure {
          margin: 4px 0 10px;
          max-width: 780px;
        }
        .img-figure img {
          width: 100%;
          height: auto;
          display: block;
          border: 1px solid var(--rule);
          border-radius: 6px;
          background: #fff;
        }
        .img-figure figcaption {
          font-size: clamp(11.5px, 1.08vw, 13.5px);
          font-style: italic;
          color: var(--ink-soft);
          max-width: 78ch;
          line-height: 1.45;
          margin-top: 6px;
        }

        /* Tabelas */
        .table-wrap { max-width: 74ch; margin: 4px 0 12px; }
        .table-cap {
          font-size: clamp(12px, 1.1vw, 14px);
          color: var(--ink-soft);
          margin-bottom: 6px;
        }
        table.pres-table {
          border-collapse: collapse;
          font-size: clamp(12.5px, 1.2vw, 15.5px);
          width: 100%;
        }
        table.pres-table th, table.pres-table td {
          text-align: left;
          padding: 6px 18px 6px 0;
          border-bottom: 1px solid var(--rule);
        }
        table.pres-table thead tr { border-top: 1.5px solid var(--gold-deep); }
        table.pres-table th { color: var(--gold-deep); font-weight: 700; font-size: 0.85em; }
        table.pres-table tr.row-emph td { font-weight: 700; background: rgba(242,182,50,0.12); }
        .table-note {
          font-size: clamp(11px, 1.02vw, 12.5px);
          color: var(--ink-soft);
          font-style: italic;
          margin-top: 6px;
          max-width: 70ch;
          line-height: 1.4;
        }

        .thanks {
          font-family: var(--font-serif);
          font-weight: 700;
          font-size: clamp(22px, 2.6vw, 32px);
          color: var(--gold);
          margin-top: 18px;
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
        .footer-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 26px;
          background: var(--gold);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          font-size: 10.5px;
          color: #2a1f04;
          z-index: 6;
        }
        .footer-bar .center { opacity: 0.85; }
        .controls {
          position: absolute;
          bottom: 34px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: var(--ink-soft);
          z-index: 7;
        }
        .controls button {
          background: #fff;
          border: 1px solid var(--rule);
          color: var(--ink);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 15px;
        }
        .controls button:hover { border-color: var(--gold-deep); color: var(--gold-deep); }
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
        <div className="corner-accent" />
        <div className="nav-zone left" onClick={goPrev} />
        <div className="nav-zone right" onClick={goNext} />
      </div>

      <div className="footer-bar">
        <span>Tassiane Anzolin · PPGTCA/UTFPR</span>
        <span className="center">Réplica Hagen et al. (2024): microbioma e estresse hídrico</span>
        <span>{index + 1} / {slides.length}</span>
      </div>

      <div className="controls">
        <button onClick={goPrev} aria-label="Anterior">‹</button>
        <button onClick={goNext} aria-label="Próximo">›</button>
      </div>
    </div>
  );
}