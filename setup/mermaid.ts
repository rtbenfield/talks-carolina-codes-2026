import type { MermaidSetup } from '@slidev/types'
import { defineMermaidSetup } from '@slidev/types'

// Diagrams render as a light, elevated card (like the QR codes and code
// blocks) so they stay legible regardless of the slide's light/dark mode
// or the animated background behind them. Add `theme: 'base'` to each
// ```mermaid fence to opt in — otherwise Slidev silently swaps in
// mermaid's stock "dark" theme whenever the deck is in dark mode.
export default defineMermaidSetup((): ReturnType<MermaidSetup> => {
  return {
    theme: 'base',
    themeVariables: {
      fontFamily: 'Sora, ui-sans-serif, system-ui, sans-serif',
      fontSize: '16px',

      background: '#f6fbfc',
      mainBkg: '#f6fbfc',
      textColor: '#0b1120',
      titleColor: '#0b1120',

      primaryColor: '#dff8fb',
      primaryBorderColor: '#04a9b8',
      primaryTextColor: '#0b1120',

      secondaryColor: '#fef0d2',
      secondaryBorderColor: '#d99612',
      secondaryTextColor: '#0b1120',

      tertiaryColor: '#ffe1e5',
      tertiaryBorderColor: '#dd2c3d',
      tertiaryTextColor: '#0b1120',

      // Matches nodeBorder/primaryBorderColor rather than a near-black
      // line: dark teal disappears where an edge crosses the animated
      // ambient background outside a card, especially in dark mode.
      lineColor: '#04a9b8',
      nodeBorder: '#04a9b8',
      clusterBkg: '#eef8f9',
      clusterBorder: '#04a9b8',
      defaultLinkColor: '#04a9b8',
      edgeLabelBackground: '#f6fbfc',

      actorBkg: '#dff8fb',
      actorBorder: '#04a9b8',
      actorTextColor: '#0b1120',
      actorLineColor: '#04a9b8',
      signalColor: '#04a9b8',
      signalTextColor: '#0b1120',
      labelBoxBkgColor: '#fef0d2',
      labelBoxBorderColor: '#d99612',
      labelTextColor: '#0b1120',
      loopTextColor: '#0b1120',
      noteBkgColor: '#fef0d2',
      noteBorderColor: '#d99612',
      noteTextColor: '#0b1120',

      pie1: '#04a9b8',
      pie2: '#fe4352',
      pie3: '#febe29',
      pieOuterStrokeColor: '#0b1120',
      pieTitleTextColor: '#0b1120',
      pieSectionTextColor: '#0b1120',
    },
    themeCSS: `
      .node rect, .node polygon, .node path, .node circle {
        rx: 10px;
        ry: 10px;
        filter: drop-shadow(0 6px 14px rgba(4, 169, 184, 0.16));
      }
      /* Flowchart subgraphs wrap a plain rect in a ".cluster" group; block
         diagrams put ".cluster" directly on the rect instead. Cover both. */
      .cluster rect, rect.cluster {
        rx: 16px;
        ry: 16px;
        fill: var(--diagram-cluster-bg, #eef8f9) !important;
      }
      .cluster-label span, .cluster text {
        color: var(--diagram-cluster-text, #0b1120) !important;
        fill: var(--diagram-cluster-text, #0b1120) !important;
      }
      .edgePath .path {
        stroke-width: 2px;
      }
      .edgeLabel {
        border-radius: 4px;
      }
    `,
    flowchart: {
      curve: 'basis',
      padding: 18,
      htmlLabels: true,
    },
  }
})
