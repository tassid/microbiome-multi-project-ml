import React, { useState, useRef } from "react";
import {
  Copy,
  Check,
  Download,
  Scissors,
  Dna,
  Tag,
  BarChart3,
  Brain,
  ClipboardCheck,
  ListChecks,
  Sprout,
  FlaskConical,
  BookOpen,
  GraduationCap,
  Sliders,
  Layers,
  Repeat,
  FolderTree,
  Eye,
} from "lucide-react";

/**
 * Documento de acompanhamento — Réplica do estudo de microbioma do solo
 * sob estresse hídrico (Hagen et al., 2024).
 * Visual: artigo acadêmico (estilo LaTeX). Voz: estudante explicando, casual.
 */

type SectionId = "s1" | "s2" | "s3" | "s4" | "s4b" | "s5" | "refs";

const TERMS: Record<string, string> = {
  microbioma:
    "O conjunto de todos os micro-organismos (principalmente bactérias) que vivem num lugar — aqui, no solo perto das raízes das plantas.",
  "16s":
    "Um pedacinho específico do DNA que toda bactéria tem. Sequenciar essa parte é como ler o \"nome de família\" de cada bactéria numa amostra.",
  sequenciamento:
    "O processo de \"ler\" o DNA das bactérias presentes numa amostra, letra por letra (A, T, C, G).",
  asv: "Uma sequência de DNA específica encontrada na amostra, tratada como uma bactéria (ou linhagem) diferente das outras.",
  dada2:
    "O programa que pega os dados brutos do sequenciamento e limpa os erros, transformando tudo em uma lista organizada de ASVs.",
  quimeras:
    "Sequências \"falsas\", criadas por acidente durante o processo de laboratório, que parecem uma bactéria mas na verdade são um erro técnico. O DADA2 remove essas.",
  primers:
    "Pedacinhos curtos de DNA usados no laboratório pra \"marcar\" onde começar e terminar de copiar o material genético das bactérias.",
  cutadapt:
    "O programa usado pra cortar fora esses pedacinhos de primer das sequências, antes de analisar o resto.",
  taxonomia:
    "O \"nome científico\" de cada bactéria — de que família, gênero ou espécie ela é, mais ou menos como uma árvore genealógica.",
  silva:
    "Um grande banco de dados online com sequências de bactérias já identificadas, usado como \"dicionário\" pra dar nome às sequências encontradas.",
  diversidadeAlfa:
    "Quantas espécies diferentes de bactérias existem dentro de UMA amostra — tipo contar quantos tipos de doce tem numa caixa.",
  diversidadeBeta:
    "O quanto DUAS amostras são parecidas ou diferentes entre si, em termos de quais bactérias elas têm.",
  daa: "Um conjunto de testes estatísticos que compara dois grupos (por exemplo, solo regado vs. solo seco) pra achar quais bactérias aparecem em quantidade bem diferente entre eles.",
  randomForest:
    "Um tipo de modelo de inteligência artificial que toma decisões combinando várias \"árvores de decisão\" simples, tipo uma votação entre várias opiniões.",
  nestedCV:
    "Uma forma cuidadosa de testar se o modelo realmente aprendeu algo útil, e não só \"decorou\" os dados de treino, dividindo os dados em pedaços de um jeito específico.",
  shap: "Uma ferramenta que abre a \"caixa preta\" do modelo e explica quais bactérias pesaram mais na decisão dele — tipo um resumo do raciocínio da inteligência artificial.",
  looPo:
    "Um jeito de testar o modelo em que, em vez de misturar tudo aleatoriamente, cada teste deixa de fora um estudo/projeto inteiro — pra ver se o modelo funciona além do experimento específico onde foi treinado.",
  rizosfera:
    "A fina camada de solo bem coladinha nas raízes da planta, onde a interação com as bactérias é mais intensa.",
  bioproject:
    "Um \"projeto guarda-chuva\" dentro de um banco de dados público (o NCBI/SRA), onde os cientistas depositam os dados brutos de sequenciamento de uma pesquisa.",
  qiimeView:
    "Um site (view.qiime2.org) que abre os arquivos gerados pelo QIIME 2 (.qza e .qzv) direto no navegador, sem precisar instalar nada nem enviar os dados pra nenhum servidor — é só arrastar o arquivo pra tela.",
  permanova:
    "Um teste estatístico que verifica se dois (ou mais) grupos de amostras têm comunidades bacterianas realmente diferentes, sem exigir que os dados sigam uma distribuição específica — funciona bem mesmo com dados de microbioma, que costumam ser bem \"tortos\".",
  pseudoF:
    "O número que o teste PERMANOVA calcula pra medir o quanto os grupos se separam — quanto maior, mais forte é a diferença entre eles. Sozinho não diz muita coisa; o que importa é o p-valor que vem junto.",
  variancia:
    "O quanto de toda a diferença entre as amostras pode ser \"atribuída\" a um fator específico (aqui, se a amostra é Controle ou Seca). Mesmo uma porcentagem pequena pode ser estatisticamente importante, porque o resto da variação vem de todas as outras diferenças naturais entre amostras (espécie de planta, local, etc.).",
  rarefacao:
    "Uma forma de deixar todas as amostras \"justas\" entre si: já que cada amostra foi sequenciada com uma profundidade diferente, a rarefação sorteia aleatoriamente o mesmo número de leituras de cada amostra, pra não comparar uma amostra rica em dados com outra pobre.",
  quartil:
    "Uma forma de dividir os dados em quatro partes iguais. O 1º quartil é o valor abaixo do qual estão 25% dos dados; o 3º quartil, abaixo do qual estão 75%. A distância entre eles mostra o quão espalhados os valores estão no meio da distribuição.",
  tsne: "Uma técnica que pega dados com milhares de \"dimensões\" (uma por bactéria, por exemplo) e os achata num mapa de duas dimensões fácil de olhar — amostras parecidas ficam pertinho, amostras diferentes ficam longe. Serve pra enxergar visualmente se existem grupos escondidos nos dados.",
  vies: "Quando um modelo aprende a reconhecer algo que não era pra ele aprender — por exemplo, de qual projeto ou espécie de planta veio a amostra, em vez do que realmente importa (seca ou sanidade) — porque esses fatores, sem querer, também formam grupos bem separados nos dados.",
  phyloseq: "O formato de dados padrão em R para estudos de microbioma: junta numa única estrutura a tabela de contagens de cada ASV, a taxonomia de cada uma e os metadados das amostras (regime de rega, compartimento etc.), pra facilitar todas as análises seguintes.",
  wilcoxonMethod: "Um teste estatístico que compara dois grupos sem assumir que os dados seguem uma distribuição específica (como a curva de sino) — útil porque dados de microbioma raramente seguem essa curva.",
  edgerMethod: "Um método originalmente criado para comparar níveis de expressão de genes (RNA-seq), adaptado aqui para comparar quantidades de bactérias entre grupos.",
  deseqMethod: "Parecido com o edgeR na origem (RNA-seq), mas usa uma forma diferente de estimar o quanto os dados variam naturalmente antes de decidir se uma diferença é real.",
};

function Term({ id, children }: { id: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const def = TERMS[id];
  return (
    <span className="term-wrap">
      <button
        type="button"
        className="term-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {children}
      </button>
      {open && def && (
        <span className="term-pop">
          <span className="term-pop-text">{def}</span>
          <button
            type="button"
            className="term-pop-close"
            onClick={() => setOpen(false)}
            aria-label="fechar"
          >
            ×
          </button>
        </span>
      )}
    </span>
  );
}

interface TocEntry {
  id: SectionId;
  number: string;
  label: string;
  icon: React.ReactNode;
}

const TOC: TocEntry[] = [
  { id: "s1", number: "1", label: "Do que se trata", icon: <Sprout size={14} /> },
  { id: "s2", number: "2", label: "O dataset", icon: <FlaskConical size={14} /> },
  { id: "s3", number: "3", label: "Conceitos que precisam ficar claros", icon: <BookOpen size={14} /> },
  { id: "s4", number: "4", label: "Comandos do pipeline", icon: <ListChecks size={14} /> },
  { id: "s4b", number: "5", label: "Resultados obtidos até agora", icon: <BarChart3 size={14} /> },
  { id: "s5", number: "6", label: "Por que isso importa pra tese", icon: <GraduationCap size={14} /> },
  { id: "refs", number: "", label: "Referências", icon: <BookOpen size={14} /> },
];

const STEP_ICONS: Record<number, React.ReactNode> = {
  1: <ClipboardCheck size={17} />,
  2: <ListChecks size={17} />,
  3: <Download size={17} />,
  4: <Scissors size={17} />,
  5: <Dna size={17} />,
  6: <Tag size={17} />,
  7: <BarChart3 size={17} />,
  8: <Eye size={17} />,
  9: <Brain size={17} />,
  10: <Check size={17} />,
};

type CommandEntry = string | { code: string; caption: React.ReactNode };

interface Step {
  n: number;
  title: string;
  note: React.ReactNode;
  commands: CommandEntry[];
}

const STEPS: Step[] = [
  {
    n: 1,
    title: "Instalar o QIIME 2",
    note: (
      <>
        O QIIME 2 é o programa principal usado em quase todas as etapas
        seguintes — ele reúne, num só lugar, as ferramentas de{" "}
        <Term id="dada2">DADA2</Term>, de download de dados, de corte de
        primer e de classificação taxonômica. Essa etapa só prepara o
        "ambiente" de trabalho, num Mac Apple Silicon rodando via Rosetta 2
        (porque o QIIME 2 ainda não tem uma versão nativa pra esse tipo de
        chip).
      </>
    ),
    commands: [
      `CONDA_SUBDIR=osx-64 conda env create \\
  --name rachis-qiime2-2026.7 \\
  --file https://raw.githubusercontent.com/qiime2/distributions/refs/heads/dev/2026.7/qiime2/released/rachis-qiime2-osx-64-conda.yml
conda activate rachis-qiime2-2026.7
conda config --env --set subdir osx-64`,
    ],
  },
  {
    n: 2,
    title: "Preparar a lista de amostras",
    note: (
      <>
        Antes de baixar qualquer coisa, é preciso saber exatamente{" "}
        <em>quais</em> amostras pertencem a este estudo. O{" "}
        <Term id="bioproject">BioProject</Term> onde os dados foram
        publicados reúne 880 experimentos, mas só 623 são deste estudo —
        os outros são de pesquisas diferentes do mesmo grupo de
        cientistas. Por isso, em vez de usar o BioProject inteiro, a lista
        de amostras foi tirada direto do arquivo <em>metadata.csv</em>{" "}
        que os autores do artigo publicaram junto com o código, e depois
        transformada num formato que o QIIME 2 entende.
      </>
    ),
    commands: [
      `(echo "ID"; cat grass_drought_accessions.txt) > accessions_com_header.tsv

qiime tools import \\
  --type NCBIAccessionIDs \\
  --input-path accessions_com_header.tsv \\
  --output-path grass-drought-ids.qza`,
    ],
  },
  {
    n: 3,
    title: "Baixar as sequências brutas",
    note: (
      <>
        Com a lista de 623 amostras em mãos, o passo seguinte é baixar os
        dados de <Term id="sequenciamento">sequenciamento</Term> de cada
        uma delas, direto do banco público onde foram armazenados (o
        SRA, mantido pelo governo americano). Cada amostra gera um par de
        arquivos (leitura "de ida" e "de volta" do sequenciador), então
        são 623 pares de arquivos no total — o que explica por que esse
        passo demora bastante (nesse caso, cerca de 11 horas).
      </>
    ),
    commands: [
      `qiime fondue get-sequences \\
  --i-accession-ids grass-drought-ids.qza \\
  --p-email <email> \\
  --p-threads 4 \\
  --output-dir sequencias_grass_drought`,
    ],
  },
  {
    n: 4,
    title: "Tirar os primers",
    note: (
      <>
        Antes de sequenciar, os cientistas usam pedacinhos de DNA chamados{" "}
        <Term id="primers">primers</Term> pra "marcar" qual parte do genoma
        da bactéria vai ser copiada e lida. Só que esses primers ficam
        grudados nas pontas de cada leitura depois do sequenciamento, e
        eles não são informação útil sobre a bactéria em si — só "ruído"
        do processo de laboratório. Por isso, antes de qualquer análise,
        eles precisam ser cortados fora. Aqui foram usados os primers
        341F e 785R, que marcam a região V3–V4 do{" "}
        <Term id="16s">16S rRNA</Term>, do jeito que Naylor et al. (2017)
        descreveram no artigo original desse dataset.
      </>
    ),
    commands: [
      `qiime cutadapt trim-paired \\
  --i-demultiplexed-sequences sequencias_grass_drought/paired_reads.qza \\
  --p-front-f CCTACGGGNBGCASCAG \\
  --p-front-r GACTACNVGGGTATCTAATCC \\
  --p-discard-untrimmed \\
  --p-cores 4 \\
  --output-dir cutadapt_output`,
    ],
  },
  {
    n: 5,
    title: "Ver a qualidade e rodar o DADA2",
    note: (
      <>
        Nem toda posição de uma leitura de sequenciamento tem a mesma
        confiabilidade — normalmente, o começo da leitura é bem preciso, e
        o final vai piorando. O primeiro comando gera um gráfico (visto no{" "}
        <Term id="qiimeView">QIIME 2 View</Term>) que mostra essa qualidade
        posição por posição, o que permite decidir onde "cortar" cada
        leitura antes de continuar (aqui, a leitura de ida foi cortada em
        260 posições, e a de volta em 190). Com esse corte definido, o{" "}
        <Term id="dada2">DADA2</Term> entra em ação:
        ele aprende o padrão de erro típico do sequenciamento, agrupa as
        leituras em <Term id="asv">ASVs</Term> (que representam bactérias
        individuais), junta o par de leitura "de ida" e "de volta" de cada
        uma, e descarta{" "}
        <Term id="quimeras">quimeras</Term>. No final dessa etapa, existe
        uma tabela dizendo quantas vezes cada bactéria apareceu em cada
        amostra — a base pra tudo que vem depois.
      </>
    ),
    commands: [
      {
        code: `qiime demux summarize \\
  --i-data cutadapt_output/trimmed_sequences.qza \\
  --o-visualization cutadapt_output/trimmed_sequences_summary.qzv`,
        caption: "Gera o gráfico interativo de qualidade por posição — é olhando esse resultado que se decide onde truncar cada leitura.",
      },
      {
        code: `qiime dada2 denoise-paired \\
  --i-demultiplexed-seqs cutadapt_output/trimmed_sequences.qza \\
  --p-trunc-len-f 260 \\
  --p-trunc-len-r 190 \\
  --p-n-threads 4 \\
  --output-dir dada2_output \\
  --verbose`,
        caption: "Roda o DADA2 propriamente dito: aprende o erro, infere ASVs, junta os pares e remove quimeras. Gera a tabela final de ASVs por amostra.",
      },
    ],
  },
  {
    n: 6,
    title: "Atribuir taxonomia com o SILVA",
    note: (
      <>
        A tabela de <Term id="asv">ASVs</Term> gerada pelo DADA2 tem
        sequências de DNA, mas não diz o <em>nome</em> de cada bactéria —
        só o código genético dela. Essa etapa resolve isso: compara cada
        ASV com o banco de dados <Term id="silva">SILVA</Term>, que já tem
        milhares de sequências identificadas, e usa um método estatístico
        (o classificador RDP) pra dizer qual é a{" "}
        <Term id="taxonomia">taxonomia</Term> mais provável de cada uma —
        de que família, gênero ou espécie de bactéria se trata.
      </>
    ),
    commands: [
      {
        code: `curl -L -o silva-v3v4-classifier.qza "https://www.arb-silva.de/archive/current/QIIME2/2026.7/SSU/V3V4-341f-806r/uniform/SILVA_144_SSURef_NR99_uniform_classifier_V3V4-341f-806r.qza"`,
        caption: "Baixa o classificador do SILVA já treinado especificamente para a região V3–V4 (mesmos primers 341F/785R usados aqui) — encontrado no site oficial do SILVA depois que os links antigos do QIIME 2 deixaram de funcionar.",
      },
      {
        code: `qiime feature-classifier classify-sklearn \\
  --i-classifier silva-v3v4-classifier.qza \\
  --i-reads dada2_output/representative_sequences.qza \\
  --p-n-jobs 4 \\
  --output-dir taxonomy_output \\
  --verbose`,
        caption: "Aplica o classificador às ASVs do DADA2, gerando a tabela final com a taxonomia e a confiança de cada atribuição.",
      },
    ],
  },
  {
    n: 7,
    title: "Diversidade e abundância diferencial",
    note: (
      <>
        Com as bactérias já identificadas, essa etapa faz duas coisas.
        Primeiro, descreve o quão diversa é cada amostra (
        <Term id="diversidadeAlfa">diversidade alfa</Term>) e o quanto as
        amostras diferem entre si (
        <Term id="diversidadeBeta">diversidade beta</Term>) — uma forma de
        enxergar, de forma visual, se o grupo Controle e o grupo Seca
        realmente formam comunidades bacterianas diferentes. O filtro de
        prevalência aqui mantém ASVs presentes em pelo menos 5% das
        amostras (não 95% — esse é o filtro mais permissivo que o próprio
        artigo usa, para remover só as ASVs raríssimas). Os resultados já
        confirmam o padrão do artigo: a diversidade Shannon não difere
        significativamente entre Controle e Seca (p = 0,145), mas a
        composição da comunidade (Bray-Curtis, PERMANOVA) difere
        fortemente (p = 0,001) — ou seja, as mesmas bactérias em
        proporções diferentes, não uma comunidade mais ou menos diversa.
        Segundo, roda cinco testes estatísticos diferentes (a{" "}
        <Term id="daa">análise de abundância diferencial</Term>) pra
        descobrir quais bactérias específicas aparecem em quantidade
        significativamente diferente entre os dois grupos — usar cinco
        métodos ao mesmo tempo, em vez de um só, ajuda a confiar mais no
        resultado quando todos concordam. Os 5 métodos já foram executados
        com sucesso (resultados na seção 5.3).
      </>
    ),
    commands: [
      {
        code: `qiime feature-table filter-features \\
  --i-table dada2_output/table.qza \\
  --p-min-samples 32 \\
  --o-filtered-table table-filtered.qza`,
        caption: "Remove as ASVs raríssimas (presentes em menos de 5% das 623 amostras), sem descartar nada biologicamente relevante.",
      },
      {
        code: `qiime diversity core-metrics \\
  --i-table table-filtered.qza \\
  --p-sampling-depth 17291 \\
  --m-metadata-file sample-metadata.tsv \\
  --output-dir core-metrics-results \\
  --verbose`,
        caption: "Rarefaz todas as amostras em 17.291 leituras e calcula de uma vez a diversidade alfa (Shannon, Observed Features, Evenness) e beta (Bray-Curtis, Jaccard) com PCoA de cada.",
      },
      {
        code: `qiime diversity alpha-group-significance \\
  --i-alpha-diversity core-metrics-results/shannon_vector.qza \\
  --m-metadata-file sample-metadata.tsv \\
  --o-visualization core-metrics-results/shannon-group-significance.qzv`,
        caption: "Testa (Kruskal-Wallis) se a diversidade Shannon difere entre Controle e Seca. Resultado: p = 0,145, sem diferença significativa.",
      },
      {
        code: `qiime diversity beta-group-significance \\
  --i-distance-matrix core-metrics-results/bray_curtis_distance_matrix.qza \\
  --m-metadata-file sample-metadata.tsv \\
  --m-metadata-column Watering_Regm \\
  --p-pairwise \\
  --o-visualization core-metrics-results/bray-curtis-watering-significance.qzv`,
        caption: "Testa (PERMANOVA) se a composição da comunidade difere entre os grupos. Resultado: p = 0,001, altamente significativo.",
      },
      {
        code: `# Exportar tabela rarefeita e taxonomia para uso em R
qiime tools export \\
  --input-path core-metrics-results/rarefied_table.qza \\
  --output-path exported-rarefied-table

qiime tools export \\
  --input-path taxonomy_output/classification.qza \\
  --output-path exported-taxonomy`,
        caption: "Converte os artefatos .qza em arquivos comuns (.biom e .tsv) que o R consegue ler diretamente, preparando a ponte QIIME 2 → R.",
      },
      {
        code: `# =============================================================
# Análise de Abundância Diferencial (DAA) - 5 métodos
# Replicando Hagen et al. (2024), nível de ASV, Watering_Regm
# =============================================================

library(phyloseq)
library(biomformat)
library(tidyverse)
library(microbiome)
library(microbiomeMarker)
library(ANCOMBC)
library(UpSetR)
library(gtools)`,
        caption: "Carrega todos os pacotes de R necessários para o restante do script.",
      },
      {
        code: `# -------------------------------------------------------------
# 1. Importar os dados exportados do QIIME 2
# -------------------------------------------------------------

# Ajuste os caminhos abaixo se você rodou os comandos de export
# em uma pasta diferente da atual.

biom_data_obj <- read_biom("exported-rarefied-table/feature-table.biom")
otu_mat       <- as(biom_data(biom_data_obj), "matrix")

taxonomy_tsv <- read.delim("exported-taxonomy/taxonomy.tsv", stringsAsFactors = FALSE)
# taxonomy_tsv tem colunas: Feature.ID, Taxon, Confidence

# separar a string de taxonomia em colunas por rank
# nota: "Kingdom" é o único nome de domínio que o phyloseq reconhece
# (usar "Domain" quebra funções downstream que esperam ranks padrão)
tax_split <- taxonomy_tsv %>%
  separate(Taxon, into = c("Kingdom","Kingdom2","Phylum","Class","Order","Family","Genus"),
           sep = ";", fill = "right", extra = "drop") %>%
  mutate(across(Kingdom:Genus, ~ trimws(.))) %>%
  column_to_rownames("Feature.ID")

tax_mat <- as.matrix(tax_split[, c("Kingdom","Phylum","Class","Order","Family","Genus")])

metadata <- read.delim("sample-metadata.tsv", stringsAsFactors = FALSE)
metadata <- metadata[metadata$sample.id != "#q2:types", ]
rownames(metadata) <- metadata$sample.id`,
        caption: "Carrega as sequências (biom), taxonomia e metadados exportados do QIIME 2, juntando taxonomia e metadados numa única tabela.",
      },
      {
        code: `# -------------------------------------------------------------
# 2. Montar o objeto phyloseq
# -------------------------------------------------------------

ps_rare_filtered <- phyloseq(
  otu_table(otu_mat, taxa_are_rows = TRUE),
  tax_table(tax_mat),
  sample_data(metadata)
)

print(ps_rare_filtered)

taxa_info <- data.frame(tax_table(ps_rare_filtered)) %>%
  rownames_to_column(var = "ASV")`,
        caption: "Monta o objeto phyloseq — a estrutura de dados padrão em R para análises de microbioma, unindo contagens, taxonomia e metadados das amostras num só lugar.",
      },
      {
        code: `# -------------------------------------------------------------
# 3. Wilcoxon rank-sum (sobre dados transformados por CLR)
# -------------------------------------------------------------

ps_rare_filtered_clr <- microbiome::transform(ps_rare_filtered, "clr")

ps_wilcox_r <- as.data.frame(t(as(phyloseq::otu_table(ps_rare_filtered_clr), "matrix")))
ps_wilcox_r$Watering_Regm <- phyloseq::sample_data(ps_rare_filtered_clr)$Watering_Regm

wilcox_pval <- function(df) wilcox.test(abund ~ Watering_Regm, data = df)$p.value

wilcox_results_r <- ps_wilcox_r %>%
  gather(key = ASV, value = abund, -Watering_Regm) %>%
  group_by(ASV) %>%
  nest() %>%
  mutate(p_value = map_dbl(data, wilcox_pval)) %>%
  dplyr::select(ASV, p_value)

sig_wilcox_r <- wilcox_results_r %>%
  full_join(taxa_info, by = "ASV") %>%
  arrange(p_value) %>%
  mutate(BH_FDR = p.adjust(p_value, "BH")) %>%
  filter(BH_FDR < 0.05) %>%
  dplyr::select(ASV, p_value, BH_FDR, everything()) %>%
  arrange(order(gtools::mixedorder(ASV)))

cat("Wilcoxon: ", nrow(sig_wilcox_r), "ASVs significativas\\n")`,
        caption: "Primeiro método: transforma os dados por CLR (log-razão centrada) e roda um teste de Wilcoxon ASV por ASV, comparando Controle e Seca.",
      },
      {
        code: `# -------------------------------------------------------------
# 4. edgeR
# -------------------------------------------------------------

edger_microbiomeMarker <- run_edger(
  ps_rare_filtered, group = "Watering_Regm", method = "QLFT",
  taxa_rank = "none", transform = "identity", norm = "none",
  p_adjust = "BH", pvalue_cutoff = 0.05
)
edger_marker <- marker_table(edger_microbiomeMarker) %>%
  as_tibble() %>%
  arrange(order(gtools::mixedorder(feature))) %>%
  dplyr::rename(ASV = feature) %>%
  left_join(taxa_info, by = "ASV")

cat("edgeR: ", nrow(edger_marker), "ASVs significativas\\n")`,
        caption: "Segundo método: edgeR, originalmente criado para RNA-seq, adaptado aqui para detectar ASVs com abundância diferente entre os grupos.",
      },
      {
        code: `# -------------------------------------------------------------
# 5. DESeq2
# -------------------------------------------------------------

deseq_microbiomeMarker <- run_deseq2(
  ps_rare_filtered, group = "Watering_Regm", confounders = character(0),
  contrast = NULL, taxa_rank = "none", norm = "none", transform = "identity",
  fitType = "local", sfType = "poscounts", betaPrior = FALSE, useT = FALSE,
  p_adjust = "BH", pvalue_cutoff = 0.05
)
deseq_marker <- marker_table(deseq_microbiomeMarker) %>%
  as_tibble() %>%
  arrange(order(gtools::mixedorder(feature))) %>%
  dplyr::rename(ASV = feature) %>%
  left_join(taxa_info, by = "ASV")

cat("DESeq2: ", nrow(deseq_marker), "ASVs significativas\\n")`,
        caption: "Terceiro método: DESeq2, um dos mais usados em expressão gênica, aqui aplicado à tabela de ASVs sem normalização extra (norm = \"none\"), já que os dados já vêm rarefeitos.",
      },
      {
        code: `# -------------------------------------------------------------
# 6. ALDEx2 (chamado diretamente, sem o wrapper do microbiomeMarker,
#    que tem um bug interno de compatibilidade nesta versão)
# -------------------------------------------------------------
library(ALDEx2)

otu_int <- round(as(phyloseq::otu_table(ps_rare_filtered), "matrix"))
conds   <- as.character(phyloseq::sample_data(ps_rare_filtered)$Watering_Regm)

x_clr    <- aldex.clr(otu_int, conds, mc.samples = 128, denom = "iqlr", verbose = TRUE)
x_tt     <- aldex.ttest(x_clr, paired.test = FALSE)
x_effect <- aldex.effect(x_clr)

aldex_all <- data.frame(x_tt, x_effect)
aldex_all$BH_wilcoxon <- p.adjust(aldex_all$wi.ep, method = "BH")

aldex_marker <- aldex_all %>%
  rownames_to_column("ASV") %>%
  filter(BH_wilcoxon < 0.05) %>%
  arrange(order(gtools::mixedorder(ASV))) %>%
  left_join(taxa_info, by = "ASV")

cat("ALDEx2: ", nrow(aldex_marker), "ASVs significativas\\n")`,
        caption: "Quarto método: ALDEx2, que gera 128 amostras Monte Carlo por ASV para estimar a incerteza da composição antes de testar. O wrapper do microbiomeMarker quebrou por um bug interno, então o ALDEx2 foi chamado direto — daí o código ficar um pouco diferente dos outros quatro métodos.",
      },
      {
        code: `# -------------------------------------------------------------
# 7. ANCOM-BC2
# -------------------------------------------------------------

ancom_da <- ancombc2(
  data = ps_rare_filtered, tax_level = NULL, fix_formula = "Watering_Regm",
  p_adj_method = "BH", lib_cut = 0, group = "Watering_Regm",
  struc_zero = FALSE, neg_lb = FALSE, alpha = 0.05, global = FALSE
)

ancom_res <- data.frame(
  ASV   = unlist(ancom_da$res$taxon),
  lfc   = unlist(ancom_da$res$lfc_Watering_RegmDrought),
  W     = unlist(ancom_da$res$W_Watering_RegmDrought),
  p_val = unlist(ancom_da$res$p_Watering_RegmDrought),
  q_val = unlist(ancom_da$res$q_Watering_RegmDrought)
)

ancombc2_marker <- ancom_res %>%
  filter(q_val < 0.05) %>%
  arrange(order(gtools::mixedorder(ASV))) %>%
  left_join(taxa_info, by = "ASV") %>%
  mutate(enrich_group = ifelse(lfc >= 0, "Drought", "Control")) %>%
  dplyr::rename(ef_ancombc2 = lfc, pvalue = p_val, padj = q_val)

cat("ANCOM-BC2: ", nrow(ancombc2_marker), "ASVs significativas\\n")`,
        caption: "Quinto método: ANCOM-BC2, que modela diretamente o viés de composição dos dados de microbioma (em vez de só normalizar), com correção de FDR.",
      },
      {
        code: `# -------------------------------------------------------------
# 8. Comparar os 5 métodos com UpSetR
# -------------------------------------------------------------

upset_list <- list(
  Wilcoxon = sig_wilcox_r$ASV,
  edgeR    = edger_marker$ASV,
  DESeq2   = deseq_marker$ASV,
  ALDEx2   = aldex_marker$ASV,
  ANCOMBC2 = ancombc2_marker$ASV
)

pdf("upset_daa_comparison.pdf", width = 8, height = 5)
print(upset(fromList(upset_list), order.by = "freq"))
dev.off()

cat("\\nResumo final:\\n")
print(sapply(upset_list, length))
cat("\\nGráfico salvo em: upset_daa_comparison.pdf\\n")`,
        caption: "Reúne as ASVs significativas dos 5 métodos numa lista e gera um gráfico UpSetR — mostra visualmente quantas ASVs cada método achou sozinho e quantas se repetem entre métodos.",
      },
      {
        code: `# -------------------------------------------------------------
# 9. Salvar tudo pra não precisar rodar de novo
# -------------------------------------------------------------

save(sig_wilcox_r, edger_marker, deseq_marker, aldex_marker, ancombc2_marker,
     file = "daa_results_asv_level.RData")
cat("\\nResultados salvos em: daa_results_asv_level.RData\\n")`,
        caption: "Salva todos os resultados num único arquivo .RData, para não precisar rodar tudo de novo caso a sessão do R feche.",
      },

    ],
  },
  {
    n: 8,
    title: "Verificar viés de agrupamento com t-SNE",
    note: (
      <>
        Antes de treinar qualquer modelo, é importante checar se as
        amostras não estão se agrupando por um motivo "errado". A{" "}
        <Term id="tsne">t-SNE</Term> é uma técnica de redução de
        dimensionalidade que pega os milhares de valores de abundância de
        cada amostra e projeta tudo num mapa de duas dimensões, fácil de
        visualizar — amostras parecidas ficam próximas, amostras diferentes
        ficam distantes. O objetivo aqui não é bonito, é diagnóstico: se as
        amostras se agruparem principalmente por espécie de planta,
        compartimento (solo/raiz/rizosfera) ou projeto de origem — em vez
        de por regime de rega — isso é sinal de{" "}
        <Term id="vies">viés de agrupamento</Term>, e um Random Forest
        treinado nesses dados corre o risco de aprender a reconhecer
        espécie de planta ou projeto, não seca de verdade. Essa checagem é
        especialmente relevante porque a dissertação pretende combinar
        dados de vários projetos diferentes de soja: se o t-SNE mostrar
        agrupamento por projeto em vez de por sanidade, a validação
        leave-one-project-out não é opcional — é obrigatória. Resultado
        real (seção 5.4): compartimento se mostrou o eixo de maior viés,
        mas o sinal de regime de rega se manteve real dentro de cada
        compartimento isolado.
      </>
    ),
    commands: [
      `from sklearn.manifold import TSNE
import matplotlib.pyplot as plt

# X = tabela de abundância relativa (amostras x táxons), já filtrada
tsne = TSNE(n_components=2, perplexity=30, random_state=42)
embedding = tsne.fit_transform(X)

# plotar colorindo por Watering_Regm, depois por Isolation_Source
# e por Plant_Body_Site, separadamente — comparar os três mapas
fig, ax = plt.subplots()
scatter = ax.scatter(embedding[:, 0], embedding[:, 1], c=labels_watering_regm)
plt.savefig("tsne_watering_regm.png")`,
    ],
  },
  {
    n: 9,
    title: "Machine Learning: RFC + SHAP",
    note: (
      <>
        Esta é a etapa em que o computador realmente "aprende" a
        diferença entre solo sob seca e solo bem regado. Um modelo{" "}
        <Term id="randomForest">Random Forest</Term> é treinado usando a
        quantidade de cada bactéria como pista, e testado com{" "}
        <Term id="nestedCV">validação cruzada aninhada</Term> pra garantir
        que ele realmente aprendeu um padrão geral, e não só "decorou" as
        amostras que viu. Depois de treinado, a técnica de{" "}
        <Term id="shap">SHAP</Term> é usada pra abrir essa "caixa preta" e
        mostrar exatamente quais bactérias pesaram mais na decisão do
        modelo — são essas as candidatas a "bactérias marcadoras" de
        estresse hídrico.
      </>
    ),
    commands: [
      `from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GridSearchCV, StratifiedKFold
import shap

# nested CV: laço externo avalia, laço interno otimiza hiperparâmetros
outer_cv = StratifiedKFold(n_splits=5, shuffle=True)`,
    ],
  },
  {
    n: 10,

    title: "Comparar com o artigo publicado",
    note: (
      <>
        A última etapa é conferir se o trabalho bateu com o que os
        autores originais encontraram: a acurácia do modelo ficou parecida
        com a deles, e as bactérias apontadas pelo SHAP como mais
        importantes são as mesmas que o artigo aponta? Se sim, é sinal de
        que o pipeline inteiro — do download dos dados brutos até o
        modelo final — foi reproduzido corretamente, e está pronto pra
        ser adaptado com dados reais de soja.
      </>
    ),
    commands: [],
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
      } catch {
        /* no-op */
      }
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={handleCopy}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "copiado" : "copiar"}
    </button>
  );
}

function Listing({ command }: { command: string }) {
  return (
    <div className="listing-wrap">
      <pre className="listing">
        <code>{command}</code>
      </pre>
      <CopyButton text={command} />
    </div>
  );
}

/** Boxplot de duas caixas, com dados reais extraídos do alpha-compare.svg (Shannon, Controle vs. Seca). */
function ShannonBoxplot() {
  const W = 420;
  const H = 260;
  const padL = 40;
  const padB = 30;
  const padT = 14;
  const plotH = H - padT - padB;
  const yMin = 5;
  const yMax = 10;
  const scaleY = (v: number) => padT + (yMax - v) * (plotH / (yMax - yMin));

  const groups = [
    { label: "Controle (n=302)", min: 6.07, q1: 7.80, median: 8.66, q3: 9.05, max: 9.63, cx: 130 },
    { label: "Seca (n=275)", min: 5.97, q1: 7.57, median: 8.65, q3: 8.96, max: 9.56, cx: 300 },
  ];
  const boxW = 70;

  return (
    <figure className="chart-fig">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Boxplot do índice de Shannon por regime de rega">
        {/* eixo y */}
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="var(--ink)" strokeWidth={1} />
        {[5, 6, 7, 8, 9, 10].map((v) => (
          <g key={v}>
            <line x1={padL - 4} y1={scaleY(v)} x2={padL} y2={scaleY(v)} stroke="var(--ink)" />
            <text x={padL - 8} y={scaleY(v) + 3} textAnchor="end" fontSize="10" fill="var(--ink-soft)">{v}</text>
          </g>
        ))}
        {/* eixo x */}
        <line x1={padL} y1={H - padB} x2={W - 20} y2={H - padB} stroke="var(--ink)" strokeWidth={1} />
        {groups.map((g) => (
          <g key={g.label}>
            {/* whisker */}
            <line x1={g.cx} y1={scaleY(g.min)} x2={g.cx} y2={scaleY(g.q1)} stroke="var(--ink)" strokeDasharray="2,2" />
            <line x1={g.cx} y1={scaleY(g.q3)} x2={g.cx} y2={scaleY(g.max)} stroke="var(--ink)" strokeDasharray="2,2" />
            {/* box */}
            <rect x={g.cx - boxW / 2} y={scaleY(g.q3)} width={boxW} height={scaleY(g.q1) - scaleY(g.q3)} fill="#fff" stroke="var(--ink)" />
            {/* median */}
            <line x1={g.cx - boxW / 2} y1={scaleY(g.median)} x2={g.cx + boxW / 2} y2={scaleY(g.median)} stroke="var(--ink)" strokeWidth={1.5} />
            <text x={g.cx} y={H - padB + 16} textAnchor="middle" fontSize="11" fill="var(--ink)">{g.label}</text>
          </g>
        ))}
      </svg>
      <figcaption>
        Figura 1. Índice de Shannon por regime de rega — dados extraídos da visualização QIIME 2 (não significativo, p = 0,145).
      </figcaption>
    </figure>
  );
}

/** Gráfico de barras horizontal genérico, estilo acadêmico (sem cor, só ink). */
function BarChart({
  data,
  unit = "",
}: {
  data: { label: string; value: number }[];
  unit?: string;
}) {
  const W = 460;
  const rowH = 26;
  const padL = 190;
  const padR = 60;
  const H = data.length * rowH + 20;
  const max = Math.max(...data.map((d) => d.value));
  const scaleX = (v: number) => (v / max) * (W - padL - padR);

  return (
    <figure className="chart-fig">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Gráfico de barras">
        {data.map((d, i) => {
          const y = i * rowH + 10;
          const w = scaleX(d.value);
          return (
            <g key={d.label}>
              <text x={padL - 8} y={y + rowH / 2 + 4} textAnchor="end" fontSize="11" fill="var(--ink)">
                {d.label}
              </text>
              <rect x={padL} y={y + 3} width={w} height={rowH - 10} fill="#fff" stroke="var(--ink)" />
              <text x={padL + w + 6} y={y + rowH / 2 + 4} fontSize="10.5" fill="var(--ink-soft)">
                {d.value.toLocaleString("pt-BR")}{unit}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

export default function App() {
  const [, setActive] = useState<SectionId>("s1");
  const refs = useRef<Partial<Record<SectionId, HTMLElement | null>>>({});

  const scrollTo = (id: SectionId) => {
    setActive(id);
    refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="doc">
      <style>{`
        :root {
          --paper: #fbfaf7;
          --ink: #1a1a1a;
          --ink-soft: #55534a;
          --rule: #1a1a1a;
          --rule-light: #cdc7b6;
          --mono-bg: #14130f;
          --mono-text: #d9e9c8;
          --font-serif: "Latin Modern Roman", "CMU Serif", "STIX Two Text", "Georgia", "Times New Roman", serif;
          --font-mono: "Latin Modern Mono", "CMU Typewriter Text", "Courier New", monospace;
        }
        * { box-sizing: border-box; }
        .doc {
          background: var(--paper);
          color: var(--ink);
          font-family: var(--font-serif);
          min-height: 100vh;
        }
        .grid {
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr);
          max-width: 1060px;
          margin: 0 auto;
        }
        @media (max-width: 820px) {
          .grid { grid-template-columns: 1fr; }
          .toc { position: static !important; border-right: none !important; border-bottom: 1px solid var(--rule-light); }
        }

        .toc {
          position: sticky;
          top: 0;
          align-self: start;
          height: 100vh;
          overflow-y: auto;
          border-right: 1px solid var(--rule-light);
          padding: 60px 22px 24px;
        }
        .toc-heading {
          font-variant: small-caps;
          letter-spacing: 0.04em;
          font-size: 12px;
          color: var(--ink-soft);
          margin-bottom: 12px;
          border-bottom: 1px solid var(--rule-light);
          padding-bottom: 8px;
        }
        .toc-item {
          display: flex;
          align-items: center;
          gap: 7px;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          font-family: var(--font-serif);
          color: var(--ink);
          font-size: 13px;
          padding: 5px 0;
          cursor: pointer;
        }
        .toc-item:hover { text-decoration: underline; }
        .toc-item svg { flex-shrink: 0; opacity: 0.7; }
        .toc-num { display: inline-block; width: 18px; color: var(--ink-soft); }

        .paper { padding: 60px 68px 130px; }
        @media (max-width: 820px) { .paper { padding: 44px 24px 100px; } }

        .masthead {
          text-align: center;
          border-bottom: 1px double var(--rule);
          padding-bottom: 26px;
          margin-bottom: 40px;
        }
        .doc-title { font-size: 24px; font-weight: 700; line-height: 1.35; margin: 0 0 12px; }
        .doc-authors { font-size: 14.5px; margin-bottom: 4px; }
        .doc-affil { font-size: 12.5px; color: var(--ink-soft); font-style: italic; }
        .doc-note { font-size: 12px; color: var(--ink-soft); margin-top: 10px; }

        .abstract { max-width: 42em; margin: 0 auto 44px; padding: 0 20px; }
        .abstract-heading { text-align: center; font-weight: 700; font-size: 13.5px; margin-bottom: 10px; }
        .abstract p { font-size: 13.5px; text-align: justify; font-style: italic; margin: 0; }

        section { margin-bottom: 48px; scroll-margin-top: 20px; }

        h2.sec {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 16px;
          padding-bottom: 4px;
          border-bottom: 1px solid var(--rule);
        }
        .sec-num { margin-right: 10px; }

        p {
          max-width: 46em;
          font-size: 15px;
          line-height: 1.6;
          text-align: justify;
          margin: 0 0 14px;
          hyphens: auto;
        }
        p + p { text-indent: 1.6em; }
        strong { font-weight: 700; }
        em { font-style: italic; }

        .term-list { margin: 0 0 8px; padding: 0; list-style: none; max-width: 50em; }
        .term-list li { margin-bottom: 14px; font-size: 14.5px; line-height: 1.55; display: flex; align-items: flex-start; gap: 10px; }
        .term-name { font-weight: 700; font-style: italic; }
        .concept-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          border: 1.5px solid var(--ink);
          border-radius: 6px;
          color: var(--ink);
          margin-top: 1px;
        }
        .concept-text { flex: 1; }

        .term-wrap { position: relative; display: inline; }
        .term-trigger {
          font: inherit;
          color: inherit;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          border-bottom: 1.5px dotted #8a6a2f;
          color: #6b4a12;
        }
        .term-trigger:hover { background: #fff2cf; }
        .term-pop {
          position: absolute;
          left: 0;
          top: 100%;
          margin-top: 6px;
          width: 240px;
          background: #fffdf5;
          border: 1.5px solid var(--ink);
          border-radius: 8px;
          padding: 10px 26px 10px 12px;
          font-size: 12.5px;
          line-height: 1.45;
          text-align: left;
          text-indent: 0;
          box-shadow: 3px 3px 0 rgba(0,0,0,0.08);
          z-index: 20;
          display: inline-block;
        }
        .term-pop-text { display: block; color: var(--ink); }
        .term-pop-close {
          position: absolute;
          top: 4px;
          right: 6px;
          background: none;
          border: none;
          font-size: 15px;
          line-height: 1;
          cursor: pointer;
          color: var(--ink-soft);
        }
        .term-pop-close:hover { color: var(--ink); }

        table.formal {
          border-collapse: collapse;
          width: 100%;
          margin: 8px 0 8px;
          font-size: 13.5px;
        }
        table.formal caption { caption-side: top; text-align: left; font-size: 13px; margin-bottom: 8px; }
        table.formal caption .cap-label { font-weight: 700; }
        table.formal thead tr { border-top: 1.5px solid var(--rule); border-bottom: 1px solid var(--rule); }
        table.formal tbody tr:last-child { border-bottom: 1.5px solid var(--rule); }
        table.formal th, table.formal td { text-align: left; padding: 7px 14px 7px 0; font-weight: 400; }
        table.formal th { font-weight: 700; }
        .table-caption-below { font-size: 12.5px; color: var(--ink-soft); margin: 6px 0 20px; }
        .pending-cell { color: var(--ink-soft); font-style: italic; }

        .chart-fig {
          margin: 12px 0 22px;
          padding: 14px 16px;
          border: 1px solid var(--rule-light);
          border-radius: 8px;
          background: #fff;
        }
        .chart-fig svg { display: block; }
        .chart-fig figcaption {
          font-size: 12px;
          font-style: italic;
          color: var(--ink-soft);
          margin-top: 8px;
          text-align: center;
        }

        .bar-viz {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
          margin: 0 0 26px;
          padding: 16px 18px;
          border: 1px solid var(--rule-light);
          border-radius: 8px;
          background: #fff;
        }
        @media (max-width: 600px) { .bar-viz { grid-template-columns: 1fr; } }
        .bar-group-label {
          font-size: 11px;
          font-variant: small-caps;
          letter-spacing: 0.04em;
          color: var(--ink-soft);
          margin-bottom: 8px;
        }
        .bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; }
        .bar-tag { font-size: 12px; width: 62px; flex-shrink: 0; }
        .bar-track {
          flex: 1;
          height: 9px;
          background: var(--rule-light);
          border-radius: 4px;
          overflow: hidden;
        }
        .bar-fill { height: 100%; background: var(--ink); border-radius: 4px; }
        .bar-fill.alt { background: #8a6a2f; }
        .bar-val { font-size: 11.5px; color: var(--ink-soft); width: 30px; text-align: right; }

        .task-row { border-bottom: 1px solid var(--rule-light); padding: 14px 0; }
        .task-row:first-child { border-top: 1.5px solid var(--rule); }
        .task-row:last-child { border-bottom: 1.5px solid var(--rule); }
        .task-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 4px; }
        .task-title { font-weight: 700; font-size: 14.5px; display: flex; align-items: center; gap: 8px; }
        .task-title .n { font-weight: 400; margin-right: 0; color: var(--ink-soft); }
        .step-icon { display: inline-flex; color: var(--ink-soft); flex-shrink: 0; }

        .flow-diagram {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 4px;
          margin: 4px 0 26px;
          padding: 16px;
          border: 1px solid var(--rule-light);
          border-radius: 8px;
          background: #fff;
        }
        .flow-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          width: 40px;
        }
        .flow-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border: 1.5px solid var(--ink);
          border-radius: 50%;
          color: var(--ink);
          background: #fff;
        }
        .flow-n { font-size: 10px; color: var(--ink-soft); }
        .flow-arrow { color: var(--ink-soft); font-size: 13px; flex-shrink: 0; padding: 0 1px; }
        @media (max-width: 560px) { .flow-diagram { justify-content: center; } }
        .task-note { font-size: 13.5px; text-align: justify; margin: 0; max-width: 50em; }

        .listing-wrap {
          margin: 10px 0 6px;
          background: var(--mono-bg);
          border-radius: 6px;
          padding: 10px 12px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }
        .cmd-caption {
          font-size: 12.5px;
          color: var(--ink-soft);
          text-align: left;
          margin: 0 0 16px;
          padding-left: 2px;
          border-left: 2px solid var(--rule-light);
          padding-left: 10px;
        }
        pre.listing { margin: 0; overflow-x: auto; flex: 1; }
        .listing code {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--mono-text);
          white-space: pre-wrap;
          word-break: break-word;
        }
        .copy-btn {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 5px;
          background: #2a2921;
          border: 1px solid #45432f;
          color: #e6e1d0;
          font-size: 10.5px;
          font-family: var(--font-serif);
          padding: 5px 9px;
          border-radius: 5px;
          cursor: pointer;
        }
        .copy-btn:hover { background: #3a3826; }
        .copy-btn.copied { background: #3f5e3f; border-color: #3f5e3f; color: #fff; }

        ol.refs { list-style: none; padding: 0; margin: 0; max-width: 50em; }        ol.refs li {
          font-size: 14px;
          margin-bottom: 14px;
          padding-left: 2.4em;
          text-indent: -2.4em;
          line-height: 1.5;
        }

        .footnote {
          font-size: 12.5px;
          color: var(--ink-soft);
          border-top: 1px solid var(--rule-light);
          padding-top: 10px;
          margin-top: 36px;
          max-width: 46em;
        }
        footer.pagefoot {
          text-align: center;
          font-size: 11px;
          color: var(--ink-soft);
          border-top: 1px double var(--rule);
          padding: 18px 0;
        }
      `}</style>

      <div className="grid">
        <nav className="toc">
          <div className="toc-heading">Sumário</div>
          {TOC.map((t) => (
            <button key={t.id} className="toc-item" onClick={() => scrollTo(t.id)}>
              {t.icon}
              <span className="toc-num">{t.number}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <main className="paper">
          <div className="masthead">
            <div className="doc-title">
              Replicando Hagen&nbsp;et&nbsp;al. (2024): o que o solo conta
              sobre a seca, antes de aplicar isso na soja
            </div>
            <div className="doc-authors">Tassiane Anzolin</div>
            <div className="doc-affil">
              PPGTCA — Universidade Tecnológica Federal do Paraná
            </div>
            <div className="doc-note">caderno de acompanhamento — atualizado conforme o trabalho avança</div>
          </div>

          <div className="abstract">
            <div className="abstract-heading">Resumo</div>
            <p>
              Este é o registro de como a autora está replicando, do zero, o
              pipeline do artigo de Hagen et al. (2024) — que usa machine
              learning pra descobrir se o solo está estressado pela seca só
              olhando pras bactérias que vivem nele. A orientadora pediu
              essa replicação completa (dos dados brutos até o modelo final)
              antes de aplicar a mesma lógica no tema da dissertação:
              sanidade em soja a partir do microbioma, com foco em validar o
              modelo entre vários projetos diferentes ao mesmo tempo.
            </p>
          </div>

          {/* 1 */}
          <section id="s1" ref={(el) => { refs.current["s1"] = el; }}>
            <h2 className="sec"><span className="sec-num">1.</span>Do que se trata</h2>
            <p>
              A ideia central do artigo é: se você sequenciar as bactérias
              do <Term id="microbioma">microbioma</Term> que vive no solo
              perto das raízes de uma planta, dá pra treinar um modelo (um{" "}
              <Term id="randomForest">Random Forest</Term>) que reconhece, só
              pelo perfil dessas bactérias, se a planta está sofrendo com
              falta d'água. Não é só "prever" — o artigo também mostra{" "}
              <em>quais</em> bactérias o modelo usou pra decidir isso,
              usando uma técnica chamada <Term id="shap">SHAP</Term>.
            </p>
            <p>
              O motivo de refazer tudo isso, passo a passo, é que a
              dissertação vai usar exatamente essa mesma lógica — só que pra
              soja, e pra sanidade em vez de seca. Antes de aplicar num dado
              que ninguém nunca processou, faz sentido garantir que cada
              etapa funciona num estudo que já tem resultado publicado, pra
              dar pra comparar e saber se ficou certo.
            </p>
          </section>

          {/* 2 */}
          <section id="s2" ref={(el) => { refs.current["s2"] = el; }}>
            <h2 className="sec"><span className="sec-num">2.</span>O dataset</h2>
            <p>
              O conjunto de dados usado no artigo é chamado{" "}
              <em>Grass-Drought</em>, produzido por Naylor, DeGraaf, Purdom e
              Coleman-Derr (2017). Eles plantaram várias espécies de
              gramíneas (e tomate, como grupo de comparação) e dividiram em
              dois grupos — regados normalmente (Controle) e sob seca
              (Seca) — coletando amostras de solo, raiz e{" "}
              <Term id="rizosfera">rizosfera</Term> de cada planta.
            </p>
            <table className="formal">
              <caption><span className="cap-label">Tabela 1.</span> Resumo do dataset Grass-Drought.</caption>
              <thead><tr><th>O quê</th><th>Quanto</th></tr></thead>
              <tbody>
                <tr><td>Total de amostras</td><td>623 (320 Controle / 303 Seca)</td></tr>
                <tr><td>Compartimentos</td><td>Solo (205) · Raiz (207) · Rizosfera (211)</td></tr>
                <tr><td>Sequenciamento</td><td>16S rRNA, região V3–V4, Illumina pareado</td></tr>
                <tr><td>Onde os dados foram obtidos</td><td>NCBI SRA, BioProject PRJNA369551</td></tr>
              </tbody>
            </table>
            <div className="table-caption-below">Fonte: metadata.csv do repositório de Hagen et al. (2024).</div>
            <div className="bar-viz">
              <div className="bar-group">
                <div className="bar-group-label">Regime</div>
                <div className="bar-row">
                  <span className="bar-tag">Controle</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: "51.4%" }} /></div>
                  <span className="bar-val">320</span>
                </div>
                <div className="bar-row">
                  <span className="bar-tag">Seca</span>
                  <div className="bar-track"><div className="bar-fill alt" style={{ width: "48.6%" }} /></div>
                  <span className="bar-val">303</span>
                </div>
              </div>
              <div className="bar-group">
                <div className="bar-group-label">Compartimento</div>
                <div className="bar-row">
                  <span className="bar-tag">Solo</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: "32.9%" }} /></div>
                  <span className="bar-val">205</span>
                </div>
                <div className="bar-row">
                  <span className="bar-tag">Raiz</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: "33.2%" }} /></div>
                  <span className="bar-val">207</span>
                </div>
                <div className="bar-row">
                  <span className="bar-tag">Rizosfera</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: "33.9%" }} /></div>
                  <span className="bar-val">211</span>
                </div>
              </div>
            </div>
            <p>
              Um ponto que gerou confusão no início: o{" "}
              <Term id="bioproject">BioProject</Term> inteiro tem 880
              experimentos, mas boa parte não é desse estudo — há outras
              plantas misturadas ali, de outras pesquisas do mesmo grupo. A
              lista certa das 623 amostras só apareceu ao consultar
              diretamente o arquivo <em>metadata.csv</em> que acompanha o
              código do artigo, em vez de tentar filtrar o BioProject inteiro
              manualmente.
            </p>
          </section>

          {/* 3 */}
          <section id="s3" ref={(el) => { refs.current["s3"] = el; }}>
            <h2 className="sec"><span className="sec-num">3.</span>Conceitos que precisam ficar claros</h2>
            <p>
              Clique em cada termo abaixo pra ver a explicação em linguagem
              simples.
            </p>
            <ul className="term-list">
              <li>
                <span className="concept-icon"><Dna size={16} /></span>
                <span className="concept-text">
                  <Term id="asv"><span className="term-name">ASV</span></Term>{" "}
                  — variante de sequência que representa uma bactéria
                  específica encontrada na amostra.
                </span>
              </li>
              <li>
                <span className="concept-icon"><Sliders size={16} /></span>
                <span className="concept-text">
                  <Term id="dada2"><span className="term-name">DADA2</span></Term>{" "}
                  — o programa que organiza as leituras brutas em ASVs,
                  corrigindo erros e removendo{" "}
                  <Term id="quimeras">quimeras</Term>.
                </span>
              </li>
              <li>
                <span className="concept-icon"><Layers size={16} /></span>
                <span className="concept-text">
                  <Term id="diversidadeAlfa"><span className="term-name">Diversidade alfa</span></Term>{" "}
                  e{" "}
                  <Term id="diversidadeBeta"><span className="term-name">diversidade beta</span></Term>{" "}
                  — o quanto uma amostra é diversa por dentro, e o quanto duas
                  amostras diferem entre si.
                </span>
              </li>
              <li>
                <span className="concept-icon"><BarChart3 size={16} /></span>
                <span className="concept-text">
                  <Term id="daa"><span className="term-name">DAA</span></Term>{" "}
                  (Análise de Abundância Diferencial) — os testes que acham
                  quais bactérias mudam de quantidade entre os grupos.
                </span>
              </li>
              <li>
                <span className="concept-icon"><Repeat size={16} /></span>
                <span className="concept-text">
                  <Term id="nestedCV"><span className="term-name">Nested CV</span></Term>{" "}
                  — o jeito cuidadoso de testar o modelo sem deixar ele
                  "colar" nos dados de teste.
                </span>
              </li>
              <li>
                <span className="concept-icon"><Brain size={16} /></span>
                <span className="concept-text">
                  <Term id="shap"><span className="term-name">SHAP</span></Term>{" "}
                  — a ferramenta que explica o raciocínio do modelo, bactéria
                  por bactéria.
                </span>
              </li>
              <li>
                <span className="concept-icon"><FolderTree size={16} /></span>
                <span className="concept-text">
                  <Term id="looPo"><span className="term-name">Leave-one-project-out</span></Term>{" "}
                  — a validação que deixa um projeto inteiro de fora do teste,
                  em vez de amostras soltas. É essa a que a dissertação
                  pretende usar.
                </span>
              </li>
              <li>
                <span className="concept-icon"><Tag size={16} /></span>
                <span className="concept-text">
                  <Term id="silva"><span className="term-name">SILVA</span></Term>{" "}
                  — o banco de dados que funciona como dicionário pra dar nome
                  (<Term id="taxonomia">taxonomia</Term>) a cada ASV.
                </span>
              </li>
              <li>
                <span className="concept-icon"><Eye size={16} /></span>
                <span className="concept-text">
                  <Term id="qiimeView"><span className="term-name">QIIME 2 View</span></Term>{" "}
                  — o site usado pra abrir os gráficos e resultados (.qza/.qzv)
                  gerados pelo QIIME 2, sem precisar instalar nada.
                </span>
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section id="s4" ref={(el) => { refs.current["s4"] = el; }}>
            <h2 className="sec"><span className="sec-num">4.</span>Comandos do pipeline</h2>
            <div className="flow-diagram">
              {STEPS.map((step, i) => (
                <React.Fragment key={step.n}>
                  <div className="flow-node">
                    <div className="flow-icon">{STEP_ICONS[step.n]}</div>
                    <div className="flow-n">{step.n}</div>
                  </div>
                  {i < STEPS.length - 1 && <div className="flow-arrow">→</div>}
                </React.Fragment>
              ))}
            </div>
            <p>
              Cada etapa abaixo explica o que acontece e por quê, seguida
              do(s) comando(s) usado(s) — os já executados e os que ainda
              serão usados mais adiante — para que qualquer pessoa entenda o
              processo e consiga reproduzi-lo.
            </p>
            {STEPS.map((step) => (
              <div className="task-row" key={step.n}>
                <div className="task-head">
                  <div className="task-title">
                    <span className="step-icon">{STEP_ICONS[step.n]}</span>
                    <span className="n">{step.n}.</span>
                    {step.title}
                  </div>
                </div>
                <p className="task-note">{step.note}</p>
                {step.commands.map((cmd, i) => {
                  const code = typeof cmd === "string" ? cmd : cmd.code;
                  const caption = typeof cmd === "string" ? null : cmd.caption;
                  return (
                    <div key={i}>
                      <Listing command={code} />
                      {caption && <p className="cmd-caption">{caption}</p>}
                    </div>
                  );
                })}
              </div>
            ))}
          </section>

          {/* 5 - RESULTADOS */}
          <section id="s4b" ref={(el) => { refs.current["s4b"] = el; }}>
            <h2 className="sec"><span className="sec-num">5.</span>Resultados obtidos até agora</h2>
            <p>
              Um resumo consolidado de todos os números produzidos pela
              replicação até o momento, organizado por etapa. As etapas 9
              (Machine Learning) e 10 (comparação final) ainda estão
              pendentes.
            </p>

            <h3 className="sub-title">5.1 Processamento DADA2 e taxonomia</h3>
            <p>
              Antes de qualquer filtro, o <Term id="dada2">DADA2</Term>
              gerou 36.543 <Term id="asv">ASVs</Term> a partir das 623
              amostras. Cada uma foi comparada ao banco{" "}
              <Term id="silva">SILVA</Term>, resultando numa{" "}
              <Term id="taxonomia">taxonomia</Term> atribuída pra 36.446
              delas (97 ficaram sem classificação — uma taxa de sucesso de
              99,7%), com confiança média de 0,97 numa escala de 0 a 1.
            </p>
            <table className="formal">
              <caption><span className="cap-label">Tabela 3.</span> Números da tabela de ASVs antes de qualquer filtro.</caption>
              <thead><tr><th>Métrica</th><th>Valor</th></tr></thead>
              <tbody>
                <tr><td>Amostras com dados após DADA2</td><td>623</td></tr>
                <tr><td>ASVs únicas (sem filtro)</td><td>36.543</td></tr>
                <tr><td>Total de observações (leituras)</td><td>32.100.122</td></tr>
                <tr><td>ASVs classificadas com sucesso</td><td>36.446 de 36.543 (97 sem classificação)</td></tr>
                <tr><td>Confiança média da classificação (SILVA)</td><td>0,97</td></tr>
                <tr><td>ASVs com confiança ≥ 0,90</td><td>88,2%</td></tr>
              </tbody>
            </table>

            <p>
              Entre as bactérias identificadas, seis filos concentram a
              maior parte das ASVs — um filo é um nível bem alto da{" "}
              <Term id="taxonomia">taxonomia</Term>, agrupando famílias
              inteiras de bactérias com características em comum:
            </p>
            <BarChart
              data={[
                { label: "Pseudomonadota", value: 9390 },
                { label: "Bacteroidota", value: 5920 },
                { label: "Actinomycetota", value: 3281 },
                { label: "Myxococcota", value: 3191 },
                { label: "Verrucomicrobiota", value: 2209 },
                { label: "Acidobacteriota", value: 1869 },
              ]}
            />
            <table className="formal">
              <caption><span className="cap-label">Tabela 4.</span> Filos bacterianos mais abundantes identificados.</caption>
              <thead><tr><th>Filo</th><th>ASVs</th></tr></thead>
              <tbody>
                <tr><td>Pseudomonadota (ex-Proteobacteria)</td><td>9.390</td></tr>
                <tr><td>Bacteroidota</td><td>5.920</td></tr>
                <tr><td>Actinomycetota</td><td>3.281</td></tr>
                <tr><td>Myxococcota</td><td>3.191</td></tr>
                <tr><td>Verrucomicrobiota</td><td>2.209</td></tr>
                <tr><td>Acidobacteriota</td><td>1.869</td></tr>
              </tbody>
            </table>
            <div className="table-caption-below">
              Composição condizente com o esperado para microbioma de solo/raiz de gramíneas.
            </div>

            <h3 className="sub-title">5.2 Filtro de prevalência e diversidade</h3>
            <p>
              A tabela de ASVs foi filtrada para manter apenas as sequências
              presentes em pelo menos 5% das 623 amostras — um corte
              deliberadamente permissivo, que remove apenas ruído raríssimo
              (sequências vistas em uma ou duas amostras isoladas, prováveis
              erros residuais de sequenciamento) sem descartar táxons
              biologicamente relevantes. Isso reduziu a tabela de 36.543
              para 4.354 ASVs, mantendo 618 das 623 amostras.
            </p>
            <p>
              Sobre essa tabela filtrada, a diversidade foi calculada numa{" "}
              <Term id="rarefacao">profundidade de rarefação</Term> de
              17.291 leituras por amostra — o mesmo valor usado por Hagen et
              al. (2024), escolhido deliberadamente para permitir
              comparação direta.
            </p>

            <ShannonBoxplot />

            <table className="formal">
              <caption><span className="cap-label">Tabela 5.</span> Comparação entre os resultados de diversidade desta replicação e os valores publicados por Hagen et al. (2024).</caption>
              <thead><tr><th>Métrica</th><th>Hagen et al. (2024)</th><th>Esta replicação</th></tr></thead>
              <tbody>
                <tr>
                  <td>ASVs após filtro de prevalência</td>
                  <td>3.276 (de 25.415)</td>
                  <td>4.354 (de 36.543)</td>
                </tr>
                <tr>
                  <td>Diversidade alfa (Shannon), Controle vs. Seca</td>
                  <td>Sem diferença significativa</td>
                  <td>p = 0,145 (sem diferença significativa)</td>
                </tr>
                <tr>
                  <td>Diversidade beta (Bray-Curtis, <Term id="permanova">PERMANOVA</Term>)</td>
                  <td>Significativa; regime de rega explica 6,8% da <Term id="variancia">variância</Term></td>
                  <td>p = 0,001; regime de rega explica ≈ 4,1% da variância (<Term id="pseudoF">pseudo-F</Term> = 24,83, n = 577)</td>
                </tr>
              </tbody>
            </table>
            <div className="table-caption-below">
              O percentual de variância desta replicação foi estimado a
              partir do pseudo-F pela relação padrão para PERMANOVA de um
              fator: R² = (a−1)F / [(a−1)F + (n−a)].
            </div>

            <div className="callout">
              <div className="callout-label">leitura comparativa</div>
              <p>
                O padrão qualitativo bate exatamente com o artigo original
                nos dois testes: nenhuma diferença de diversidade Shannon, e
                uma diferença altamente significativa na composição via
                Bray-Curtis. A magnitude do efeito (variância explicada)
                ficou na mesma ordem de grandeza — 4,1% aqui contra 6,8% no
                artigo — uma diferença pequena e esperada, já que o total de
                ASVs, o número de amostras retidas (618 vs. o valor
                reportado no artigo) e detalhes finos de parâmetros de
                sequenciamento e do ambiente de execução nunca são
                idênticos entre replicações independentes. O ponto central
                — Controle e Seca não têm comunidades mais ou menos
                diversas, mas têm comunidades <em>diferentes</em> em
                composição — se confirma nos dois casos.
              </p>
            </div>

            <h3 className="sub-title">5.3 Análise de Abundância Diferencial (resultados parciais)</h3>
            <p>
              Depois de montar o objeto <Term id="phyloseq">phyloseq</Term>{" "}
              (a estrutura que junta a tabela de ASVs, a taxonomia e os
              metadados das amostras num só lugar), o script roda os cinco
              métodos de <Term id="daa">DAA</Term> em sequência, cada um com
              uma forma diferente de decidir se uma ASV muda de quantidade
              entre Controle e Seca. Rodar cinco ao mesmo tempo, em vez de
              confiar num só, é uma forma de checar se o resultado é
              robusto — ASVs que aparecem como significativas em vários
              métodos ao mesmo tempo são candidatas mais confiáveis a
              táxons marcadores do que as que só um método aponta.
            </p>
            <table className="formal">
              <caption><span className="cap-label">Tabela 6.</span> ASVs significativas por método (de 4.354 ASVs testadas, α = 0,05 com correção BH).</caption>
              <thead><tr><th>Método</th><th>Como funciona</th><th>ASVs significativas</th></tr></thead>
              <tbody>
                <tr>
                  <td><Term id="wilcoxonMethod">Wilcoxon</Term></td>
                  <td>Teste não-paramétrico simples, sobre dados transformados por CLR</td>
                  <td>2.100</td>
                </tr>
                <tr>
                  <td><Term id="edgerMethod">edgeR</Term></td>
                  <td>Modelo estatístico originalmente feito para RNA-seq</td>
                  <td>2.498</td>
                </tr>
                <tr>
                  <td><Term id="deseqMethod">DESeq2</Term></td>
                  <td>Também de RNA-seq, modela a variância de forma diferente do edgeR</td>
                  <td>1.136</td>
                </tr>
                <tr>
                  <td>ALDEx2</td>
                  <td>Gera 128 réplicas Monte Carlo por ASV para estimar incerteza antes de testar</td>
                  <td>590</td>
                </tr>
                <tr>
                  <td>ANCOM-BC2</td>
                  <td>Modela diretamente o viés de composição dos dados de microbioma</td>
                  <td>1.708</td>
                </tr>
              </tbody>
            </table>
            <BarChart
              data={[
                { label: "edgeR", value: 2498 },
                { label: "Wilcoxon", value: 2100 },
                { label: "ANCOM-BC2", value: 1708 },
                { label: "DESeq2", value: 1136 },
                { label: "ALDEx2", value: 590 },
              ]}
            />
            <div className="callout">
              <div className="callout-label">por que os números variam tanto entre métodos</div>
              <p>
                Não é motivo de alarme o edgeR e o ALDEx2 discordarem tanto
                (2.498 vs. 590) — é justamente por isso que o artigo
                original usa cinco métodos e depois cruza os resultados: os
                cinco fazem suposições estatísticas diferentes sobre como a
                variância se comporta nos dados, e o ALDEx2 em particular é
                o mais conservador, por incorporar a incerteza da
                composição antes mesmo de testar. A comparação de
                sobreposição entre os cinco conjuntos, gerada via UpSetR,
                mostra o número que realmente importa aqui:{" "}
                <strong>668 ASVs foram significativas nos 5 métodos ao
                mesmo tempo</strong> — esse é o conjunto mais confiável de
                candidatas a táxons marcadores, porque nenhum dos cinco
                métodos discorda dele. Os próximos maiores grupos (472,
                432, 389 ASVs) são interseções quase completas, faltando
                só um método por vez, o que reforça que a convergência
                entre métodos é a regra, não a exceção.
              </p>
            </div>

            <h3 className="sub-title">5.4 Checagem de viés (t-SNE)</h3>
            <p>
              Antes de avançar pra etapa de Machine Learning, foi feita a
              checagem de viés de agrupamento descrita na etapa 8 (seção 4).
              A projeção <Term id="tsne">t-SNE</Term> geral, colorida por
              três fatores diferentes (regime de rega, compartimento e
              espécie de planta), mostrou que compartimento
              (solo/raiz/rizosfera) é o eixo de maior variância na
              comunidade bacteriana — resultado esperado e consistente com
              Hagen et al. (2024) — enquanto espécie de planta apareceu bem
              misturada, sem indício de confundimento.
            </p>
            <figure className="chart-fig">
              <img
                src={`${import.meta.env.BASE_URL}figures/tsne_bias_check.png`}
                alt="Projeção t-SNE geral colorida por regime de rega, compartimento e espécie de planta"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              <figcaption>
                Figura 2. Projeção t-SNE geral: compartimento forma os
                agrupamentos mais nítidos dos três fatores testados.
              </figcaption>
            </figure>
            <p>
              Para isolar se o sinal de regime de rega era real ou apenas
              um subproduto do eixo de compartimento, a t-SNE foi refeita
              separadamente dentro de cada compartimento:
            </p>
            <figure className="chart-fig">
              <img
                src={`${import.meta.env.BASE_URL}figures/tsne_by_compartment.png`}
                alt="Projeção t-SNE estratificada por compartimento, colorida por regime de rega"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              <figcaption>
                Figura 3. t-SNE dentro de cada compartimento, colorida só
                por regime de rega — a separação Controle/Seca varia em
                nitidez, mas aparece nos três painéis.
              </figcaption>
            </figure>
            <figure className="chart-fig">
              <img
                src={`${import.meta.env.BASE_URL}figures/tsne_bias_check_stratified.png`}
                alt="Checagem de viés estratificada"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              <figcaption>
                Figura 4. Versão estratificada da checagem de viés,
                complementando a Figura 3.
              </figcaption>
            </figure>
            <table className="formal">
              <caption><span className="cap-label">Tabela 8.</span> Separação Controle/Seca por compartimento, na t-SNE estratificada.</caption>
              <thead><tr><th>Compartimento</th><th>n amostras</th><th>Balanceamento Controle/Seca</th><th>Separação visual</th></tr></thead>
              <tbody>
                <tr><td>Rizosfera</td><td>208</td><td>107 / 101 (51% / 49%)</td><td>Forte, quase sem sobreposição</td></tr>
                <tr><td>Raiz</td><td>180</td><td>97 / 83 (54% / 46%)</td><td>Moderada, com sobreposição parcial</td></tr>
                <tr><td>Solo</td><td>189</td><td>98 / 91 (52% / 48%)</td><td>Mais fraca, bastante mistura</td></tr>
              </tbody>
            </table>
            <p>
              O balanceamento entre Controle e Seca ficou praticamente
              igual nos três compartimentos, o que descarta desbalanceamento
              amostral como explicação para a diferença de nitidez entre
              eles. A leitura mais provável é biológica: a rizosfera
              responde de forma mais rápida e intensa ao estresse hídrico
              da planta do que o solo bulk, que tende a ser mais tamponado.
            </p>
            <div className="callout">
              <div className="callout-label">conclusão</div>
              <p>
                O sinal de estresse hídrico é real e está presente nos três
                compartimentos, não é um artefato do agrupamento por
                compartimento — mas sua intensidade varia (rizosfera &gt;
                raiz &gt; solo). Isso reforça, já nesta réplica, a lógica
                por trás da validação <Term id="looPo">leave-one-project-out</Term>{" "}
                planejada para a dissertação (seção 6): mesmo dentro de um
                único estudo controlado, o sinal biológico não é homogêneo
                entre subgrupos, então em múltiplos projetos de soja
                combinados esse risco de heterogeneidade tende a ser maior,
                não menor. Na etapa 9 (Machine Learning), compartimento será
                tratado como estrato na validação, em vez de misturar tudo
                num único classificador.
              </p>
            </div>

            <h3 className="sub-title">5.5 Alvo de comparação para as próximas etapas</h3>
            <p>
              Para referência futura, os valores que a etapa de Machine
              Learning (seção 4, etapa 9) precisará se aproximar, publicados
              por Hagen et al. (2024) para o nível taxonômico de gênero — o
              que apresentou o melhor desempenho no artigo original:
            </p>
            <table className="formal">
              <caption><span className="cap-label">Tabela 9.</span> Desempenho do Random Forest no artigo original (nível de gênero, dataset Grass-Drought).</caption>
              <thead><tr><th>Métrica</th><th>Valor publicado</th></tr></thead>
              <tbody>
                <tr><td>Acurácia</td><td>0,923 ± 0,029</td></tr>
                <tr><td>F1-score</td><td>0,921 ± 0,030</td></tr>
                <tr><td>Recall</td><td>0,954 ± 0,029</td></tr>
                <tr><td>AUC</td><td>0,980 ± 0,010</td></tr>
                <tr><td>Táxon marcador mais consistente</td><td>Gênero <em>Kribbella</em></td></tr>
                <tr><td>Concordância DAA × SHAP (todos os ranks)</td><td>79,6% a 82,6%</td></tr>
              </tbody>
            </table>

            <p>
              A Análise de Abundância Diferencial com os 5 métodos (DESeq2,
              ALDEx2, edgeR, ANCOM-BC2, Wilcoxon) foi concluída com sucesso
              (resultados na seção 5.3) — incluindo contornar um bug interno
              do pacote <code>microbiomeMarker</code> no ALDEx2, resolvido
              chamando o ALDEx2 diretamente. A checagem de viés via t-SNE, o
              Machine Learning (Random Forest + SHAP) e a comparação final
              com os valores publicados ainda não foram iniciados.
            </p>
          </section>

          {/* 6 */}
          <section id="s5" ref={(el) => { refs.current["s5"] = el; }}>
            <h2 className="sec"><span className="sec-num">6.</span>Por que isso importa pra tese</h2>
            <p>
              A dissertação usa a mesma lógica desse artigo, mas para
              classificar <strong>sanidade em soja</strong> a partir do{" "}
              <Term id="microbioma">microbioma</Term>. A diferença principal
              é combinar dados de{" "}
              <strong>vários projetos de soja diferentes</strong> — algo que
              a maioria dos trabalhos revisados não trata com cuidado, ou
              seja, treinam e testam misturando tudo, sem checar se o modelo
              está só "decorando" as particularidades de cada projeto.
            </p>
            <table className="formal">
              <caption><span className="cap-label">Tabela 10.</span> O que muda entre este estudo e a dissertação.</caption>
              <thead><tr><th>Neste estudo</th><th>Na dissertação</th></tr></thead>
              <tbody>
                <tr><td>Um único estudo grande</td><td>Vários projetos de soja combinados</td></tr>
                <tr><td>Controle vs. Seca</td><td>Sadio vs. Doente</td></tr>
                <tr><td>Validação cruzada padrão</td><td>Leave-one-project-out</td></tr>
              </tbody>
            </table>
            <p>
              Replicar esse pipeline inteiro primeiro é a forma mais direta
              de garantir que, ao chegar nos dados reais de soja, os
              problemas que aparecerem sejam sobre a ciência em si — e não
              sobre um comando de terminal configurado errado sem perceber.
            </p>
          </section>

          {/* REFERÊNCIAS */}
          <section id="refs" ref={(el) => { refs.current["refs"] = el; }}>
            <h2 className="sec">Referências</h2>
            <ol className="refs">
              <li>
                HAGEN, M.; DASS, R.; WESTHUES, C.; BLOM, J.; SCHULTHEISS,
                S.&nbsp;J.; PATZ, S. Interpretable machine learning decodes
                soil microbiome&#39;s response to drought stress.{" "}
                <em>Environmental Microbiome</em>, v.&nbsp;19, n.&nbsp;35, 2024.
              </li>
              <li>
                NAYLOR, D.; DEGRAAF, S.; PURDOM, E.; COLEMAN-DERR, D. Drought
                and host selection influence bacterial community dynamics in
                the grass root microbiome. <em>The ISME Journal</em>,
                v.&nbsp;11, n.&nbsp;12, p.&nbsp;2691&#8211;2704, 2017.
              </li>
              <li>
                TAKAHASHI, S.; TOMITA, J.; NISHIOKA, K.; HISADA, T.;
                NISHIJIMA, M. Development of a prokaryotic universal primer
                for simultaneous analysis of Bacteria and Archaea using
                next-generation sequencing. <em>PLOS ONE</em>, v.&nbsp;9,
                n.&nbsp;8, e105592, 2014.
              </li>
            </ol>
          </section>

          <div className="footnote">
            Isto é um caderno de acompanhamento, não um relatório final — a
            seção 4 vai mudando conforme o trabalho avança de verdade.
          </div>
        </main>
      </div>

      <footer className="pagefoot">— caderno vivo · PPGTCA / UTFPR —</footer>
    </div>
  );
}
