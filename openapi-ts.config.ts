import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './openapi.yaml',
  output: {
    path: './services/generated',
  },
  plugins: [
    {
      name: '@hey-api/client-next',
      runtimeConfigPath: '../../lib/api/client.ts',
    },
    '@hey-api/typescript',
    '@hey-api/sdk',
  ],
});
