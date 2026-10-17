import { defineConfig } from '@neon/config/v1';
export default defineConfig({ auth: false, buckets: { 'hoa-uploads': { access: 'private' } },
  branch: branch => !branch.isDefault && !branch.exists ? { ttl: '1d' } : {},
});
