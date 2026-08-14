import type { MermaidSetup } from '@slidev/types'
import { defineMermaidSetup } from '@slidev/types'

export default defineMermaidSetup((): ReturnType<MermaidSetup> => {
  return {
    theme: 'neutral',
    // themeVariables: {
    //   primaryColor: '#04d5e7',
    //   primaryBorderColor: '#04d5e7',
    //   primaryTextColor: '#0b1120',
    //   lineColor: '#04d5e7',
    //   secondaryColor: '#febe29',
    //   secondaryBorderColor: '#febe29',
    //   tertiaryColor: '#fe4352',
    //   tertiaryBorderColor: '#fe4352',
    // },
  }
})
