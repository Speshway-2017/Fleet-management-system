import { z } from 'zod';

// Disable runtime `new Function` JIT in Zod v4 so strict `script-src` CSP
// works without `'unsafe-eval'`.
z.config({ jitless: true });
