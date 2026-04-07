import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './openapi.yaml',
  output: {
    path: './src/generated',
  },
  plugins: [
    {
      name: '@hey-api/client-next',
      runtimeConfigPath: '../client',
    },
    '@hey-api/typescript',
    '@hey-api/sdk',
  ],
});
