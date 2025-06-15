module.exports = {
  // Figma API configuration
  figma: {
    fileKey: process.env.FIGMA_FILE_KEY,
  accessToken: process.env.FIGMA_ACCESS_TOKEN,
  },
  
  // Design tokens configuration
  tokens: {
    // Colors, typography, spacing, etc.
    colors: {
      source: 'figma',
      path: 'design-tokens/colors',
    },
    typography: {
      source: 'figma',
      path: 'design-tokens/typography',
    },
    spacing: {
      source: 'figma',
      path: 'design-tokens/spacing',
    },
  },
  
  // Component configuration
  components: {
    // Map Figma components to React Native components
    Button: {
      figmaComponent: 'Button',
      props: {
        variant: ['primary', 'secondary', 'tertiary'],
        size: ['small', 'medium', 'large'],
    },
    },
    Card: {
      figmaComponent: 'Card',
      props: {
        elevation: ['none', 'low', 'medium', 'high'],
      },
    },
  },
  
  // Output directory for the generated assets
  outputDir: './assets/figma',
  
  // File formats to export
  formats: ['svg', 'png'],
  
  // Scale factors for PNG exports
  scales: [1, 2, 3],
}; 