import React, { useState, useEffect, useCallback } from "react";

/**
 * Apresentação de slides: réplica de Hagen et al. (2024)
 * Preparada como pré-defesa / apresentação de andamento de mestrado (PPGTCA/UTFPR).
 * Navegação: setas do teclado, clique nas bordas, ou botões.
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
          Etapa preparatória da dissertação de mestrado, classificação de
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
        <Concept term="microbioma">
          O conjunto de micro-organismos (principalmente bactérias) que vivem
          associados a um ambiente: aqui, ao redor e dentro das raízes das
          plantas.
        </Concept>
        <Bullets
          items={[
            <>Classificar <strong>sanidade em soja</strong> a partir do microbioma associado à cultura</>,
            <>Combinar dados de <strong>múltiplos projetos</strong> de soja, não um único estudo controlado</>,
            <>Lacuna identificada: a maioria dos trabalhos trata o "projeto de origem" como irrelevante, mas ele pode confundir a análise</>,
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
          to drought stress", Environmental Microbiome, 19(35).
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
          depois, o que pesou na decisão de cada árvore.
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
            <>623 accessions SRA identificados a partir do <em>metadata.csv</em> do repositório do artigo, não do BioProject inteiro (que mistura outros experimentos)</>,
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
        <Concept term="ASV e DADA2">
          ASV é uma sequência de DNA identificada com precisão de
          nucleotídeo: cada uma representa uma "bactéria" distinta
          encontrada na amostra. DADA2 é o algoritmo que transforma as
          leituras brutas do sequenciador nessa tabela de ASVs, corrigindo
          erros de leitura.
        </Concept>
        <Bullets
          items={[
            "Primers 341F/785R (região V3–V4 do 16S), removidos via cutadapt, com 98,4% das leituras aproveitadas",
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
            "Composição dominada por Pseudomonadota, Bacteroidota e Actinomycetota, esperado para solo/raiz",
          ]}
        />
        <MiniBar
          data={[
            { label: "Pseudomonadota", value: 9390 },
            { label: "Bacteroidota", value: 5920 },
            { label: "Actinomycetota", value: 3281 },
          ]}
        />
        <Concept term="taxonomia e SILVA">
          Taxonomia é o "nome científico" de cada bactéria: de que família,
          gênero ou espécie ela é. SILVA é o banco de dados de referência
          com milhares de sequências já identificadas, usado como
          dicionário pra dar esse nome a cada ASV.
        </Concept>
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
        <Concept term="diversidade alfa e beta">
          Alfa mede o quão diversa é a comunidade <em>dentro</em> de uma
          amostra (índice de Shannon). Beta mede o quanto duas amostras{" "}
          <em>diferem entre si</em> em composição (Bray-Curtis), testado
          estatisticamente via PERMANOVA.
        </Concept>
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
          Controle e Seca não têm comunidades mais ou menos diversas; têm
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
        <Concept term="Análise de Abundância Diferencial (DAA)">
          Testes estatísticos que descobrem quais bactérias específicas
          mudam de quantidade entre os grupos (Controle vs. Seca). Usar 5
          métodos diferentes, em vez de um só, ajuda a confiar mais no
          resultado quando todos concordam.
        </Concept>
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
          <strong>668 ASVs</strong> significativas nos 5 métodos ao mesmo tempo:
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
        <Concept term="níveis taxonômicos (filo a gênero)">
          A taxonomia é hierárquica, como uma árvore genealógica: filo é um
          grupo bem amplo de bactérias, gênero é bem específico. Repetir a
          análise em cada nível mostra em que "resolução" o sinal
          biológico aparece com mais força.
        </Concept>
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
          decimals={0}
          yLabel="Táxons significativos"
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
        <Concept term="t-SNE">
          Técnica que pega dados com milhares de "dimensões" (uma por
          bactéria) e os achata num mapa 2D fácil de olhar: amostras
          parecidas ficam pertinho, diferentes ficam longe. Serve pra
          enxergar visualmente se existem grupos escondidos nos dados.
        </Concept>
        <Bullets
          items={[
            "t-SNE geral: compartimento (solo/raiz/rizosfera) domina a projeção, não regime de rega",
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
        <Concept term="validação cruzada aninhada (Nested CV)">
          Um jeito cuidadoso de testar o modelo: um laço externo avalia o
          desempenho, um laço interno ajusta os parâmetros, em camadas
          separadas, pra garantir que o modelo não "colou" nos dados de
          teste.
        </Concept>
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
        <Concept term="acurácia e AUC">
          Acurácia é a proporção de acertos do modelo. AUC resume o quão
          bem ele separa os dois grupos em todos os limiares de decisão
          possíveis: varia de 0,5 (chute aleatório) a 1,0 (separação
          perfeita).
        </Concept>
        <MiniLine
          categories={["Filo", "Classe", "Ordem", "Família", "Gênero"]}
          series={[
            { label: "Acurácia", values: [0.904, 0.908, 0.916, 0.934, 0.937], color: "#e8b04b" },
            { label: "AUC", values: [0.956, 0.966, 0.971, 0.980, 0.979], color: "#6fa3ae" },
          ]}
          yMin={0.85}
          yMax={1.0}
        />
        <p className="lede small">Gênero: melhor desempenho, igual ao artigo original.</p>
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
  // 26. Kribbella: o achado mais forte
  {
    content: (
      <>
        <Kicker>9 · Comparação</Kicker>
        <h2 className="highlight-title">O achado mais forte da replicação</h2>
        <p className="lede">
          O táxon marcador nº 1 apontado pelo SHAP foi o gênero{" "}
          <em>Kribbella</em>, <strong>exatamente o mesmo</strong> relatado
          por Hagen et al. (2024) como o marcador mais consistente.
        </p>
        <p className="lede small">
          Combinado ao AUC quase idêntico (0,979 vs. 0,980), essa
          coincidência é forte evidência de que o pipeline captura o mesmo
          sinal biológico do estudo original, não um artefato do
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
          Mesma ordem de grandeza; diferença esperada, já que o critério
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
            "Em andamento: download e processamento das 449 amostras",
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
  // 30. Conclusão
  {
    content: (
      <>
        <Kicker>Conclusão</Kicker>
        <h2>O que este trabalho demonstra</h2>
        <Bullets
          items={[
            <>Pipeline replicado <strong>do dado bruto ao modelo final</strong>, com resultados batendo de perto com o artigo original em todas as frentes</>,
            <>Diversidade, DAA, t-SNE e ML convergem para a mesma conclusão biológica, inclusive o táxon marcador (<em>Kribbella</em>)</>,
            "Investigação de dados reais (BioProjects confusos, tipos de sequenciamento misturados) já foi enfrentada e resolvida",
            <>Pipeline <strong>validado e pronto</strong> para ser adaptado aos dados reais de soja</>,
          ]}
        />
      </>
    ),
  },
  // 31. Próximos passos + obrigada
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
          padding: 60px 7vw 70px;
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
          font-size: clamp(22px, 2.8vw, 34px);
          margin: 0 0 20px;
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
          margin-bottom: 14px;
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
          margin: 4px 0 14px;
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
        .card-block-body { padding: 10px 18px 14px; }

        .bullets {
          list-style: none;
          padding: 0;
          margin: 0;
          max-width: 62ch;
        }
        .bullets li {
          font-size: clamp(14px, 1.35vw, 18px);
          line-height: 1.5;
          padding: 8px 0 8px 26px;
          position: relative;
        }
        .bullets li::before {
          content: "●";
          font-size: 8px;
          position: absolute;
          left: 2px;
          top: 15px;
          color: var(--gold-deep);
        }
        .section-slide .bullets li::before { color: var(--gold); }
        .agenda-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px 40px;
          max-width: 72ch;
          font-size: clamp(13px, 1.3vw, 16.5px);
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
        .mini-bar { max-width: 60ch; margin-top: 10px; }
        .mini-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 7px; }
        .mini-bar-label { width: 108px; font-size: 12.5px; color: var(--ink-soft); flex-shrink: 0; }
        .mini-bar-track { flex: 1; height: 13px; background: var(--rule); border-radius: 4px; overflow: hidden; }
        .mini-bar-fill { height: 100%; background: var(--gold); }
        .mini-bar-value { font-size: 12px; color: var(--ink-soft); width: 58px; text-align: right; }
        .two-col {
          display: flex;
          gap: 20px;
          margin: 8px 0 16px;
          flex-wrap: wrap;
        }
        .stat-card {
          background: var(--cream);
          border-radius: 10px;
          padding: 16px 22px;
          min-width: 190px;
          border-top: 4px solid var(--gold);
        }
        .stat-card.highlight { border-top-color: var(--red); }
        .stat-label { font-size: 12px; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.04em; }
        .stat-value { font-family: var(--font-serif); font-weight: 700; font-size: 28px; margin: 5px 0; color: var(--ink); }
        .stat-note { font-size: 12px; color: var(--ink-soft); }
        table.pres-table {
          border-collapse: collapse;
          font-size: clamp(12.5px, 1.2vw, 15.5px);
          max-width: 70ch;
        }
        table.pres-table th, table.pres-table td {
          text-align: left;
          padding: 7px 20px 7px 0;
          border-bottom: 1px solid var(--rule);
        }
        table.pres-table th { color: var(--gold-deep); font-weight: 700; font-size: 0.85em; }
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