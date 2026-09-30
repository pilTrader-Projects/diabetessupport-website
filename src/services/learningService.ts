/**
 * @deprecated This file is now a thin re-export shim.
 *             All logic has been refactored into focused SRP services under:
 *             src/services/learning/
 *
 * Consumers using `import { LearningService } from '@/services/learningService'`
 * continue to work without any changes.
 */
export { LearningService } from './learning/index';
export * from './learning/index';
