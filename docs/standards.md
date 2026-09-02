# Coding Standards & TDD Policy

## Non-Negotiable TDD
Every function, method, or class created, refactored, or updated MUST be covered by unit tests.

### Test-First Requirement
- **Tests MUST be written before writing a single line of implementation code.**
- This applies to new features, bug fixes, and refactoring.
- If a function `A` is refactored into `a`, `b`, and `c`, unit tests for `a`, `b`, and `c` must be created first.

### Path Coverage
Unit tests must cover:
1. **Happy Paths**: Standard successful execution.
2. **Sad Paths**: Expected error conditions and failures.
3. **Edge Cases**: Boundary conditions, null/undefined inputs, extreme values.

## Clean Code & SOLID
- **S**ingle Responsibility: Each function/class should have one reason to change.
- **O**pen/Closed: Extendable without modifying existing code.
- **L**iskov Substitution: Subtypes must be substitutable for their base types.
- **I**nterface Segregation: Focused, thin interfaces.
- **D**ependency Inversion: Depend on abstractions, not concretions.

## Naming Conventions
- Variables/Functions: `camelCase`
- Classes/Interfaces: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Files: `kebab-case.ts`

## Mandatory Function Inline Documentation
Every function, method, or helper MUST include JSDoc inline documentation covering:
1. **Use Case**: Detailed description of what the function does and why it exists.
2. **Arguments**: `@param` specifications including type, description, and requirements.
3. **Dependencies**: External services, databases, models, or utility modules relied upon.
4. **Returns & Exceptions**: `@returns` type/description and `@throws` list of errors.

```typescript
/**
 * Establishes or reuses a cached MongoDB connection for serverless execution.
 * 
 * @usecase Maintains connection pool efficiency in Next.js App Router API routes.
 * @dependencies mongoose, process.env.MONGODB_URI
 * @returns {Promise<typeof mongoose>} Active Mongoose connection instance.
 * @throws {Error} Throws connection error if MONGODB_URI is invalid or unreachable.
 */
```

## Documentation
- Use JSDoc for all functions, methods, public interfaces, and complex logic.
- Maintain an up-to-date `README.md`, `ROADMAP.md`, and `docs/`.

