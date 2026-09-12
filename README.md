# Réplica de Hagen et al. (2024): microbioma do solo e estresse hídrico

Documento de acompanhamento técnico da replicação completa (dados brutos → modelo final) do estudo:

> Hagen, M.; Dass, R.; Westhues, C.; Blom, J.; Schultheiss, S. J.; Patz, S. **Interpretable machine learning decodes soil microbiome's response to drought stress**. *Environmental Microbiome*, 19(35), 2024. [doi: 10.1186/s40793-024-00578-1](https://doi.org/10.1186/s40793-024-00578-1)

**Site publicado:** https://tassid.github.io/microbiome-multi-project-ml/

## Contexto

Esta replicação é uma etapa preparatória da dissertação de mestrado da autora no PPGTCA/UTFPR, cujo objeto é a classificação de sanidade em soja a partir do microbioma, com validação estatística entre múltiplos projetos de origem dos dados (*leave-one-project-out*). Reproduzir o pipeline completo de Hagen et al. (2024) — do download das sequências brutas do NCBI SRA até a interpretação via SHAP — serve para validar a competência técnica sobre todo o processo antes de aplicá-lo a dados originais de soja.

## O que o site documenta

- O conjunto de dados original (*Grass-Drought*, Naylor et al., 2017)
- Um glossário interativo dos conceitos técnicos envolvidos (ASV, DADA2, SHAP, Nested CV, leave-one-project-out, etc.)
- Todos os comandos do pipeline, na ordem em que entram, com botão de copiar
- Os resultados obtidos até o momento, comparados diretamente com os valores publicados no artigo original
- A relação entre esta replicação e os objetivos da dissertação

## Stack técnica

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript
- [lucide-react](https://lucide.dev/) para os ícones
- Deploy automático via GitHub Actions para GitHub Pages

## Rodando localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
```

Os arquivos finais são gerados em `dist/`.

## Deploy

O deploy é automático: qualquer push na branch `main` dispara o workflow em `.github/workflows/deploy.yml`, que builda o projeto e publica o resultado no GitHub Pages.

## Estrutura

```
src/
  App.tsx        — todo o conteúdo e a lógica do documento
  main.tsx       — ponto de entrada React
  index.css      — reset mínimo de estilos
.github/
  workflows/
    deploy.yml   — workflow de build + deploy para GitHub Pages
```

## Status

Documento vivo — atualizado conforme o trabalho de replicação avança. Etapas concluídas até o momento: instalação do ambiente, download das sequências brutas, remoção de primers, DADA2, classificação taxonômica (SILVA) e análises de diversidade. Em andamento: Análise de Abundância Diferencial (5 métodos). Pendentes: Machine Learning (Random Forest + SHAP) e comparação final com os valores publicados.
