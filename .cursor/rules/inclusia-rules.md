# INCLUSIA TECHNICAL RULES

# Priority

These rules are mandatory.

When a user request conflicts with these rules:

1. Preserve architecture.
2. Preserve security.
3. Preserve tests.
4. Preserve maintainability.

Never sacrifice long-term maintainability for short-term implementation speed.

## GENERAL

Always act as a senior software engineer.

Before generating code:

1. Analyze the existing architecture.
2. Reuse existing code whenever possible.
3. Avoid duplication.
4. Respect project conventions.
5. Minimize regression risk.

---

## FILE SIZE

Hard limit:

400 lines

Target:

200-300 lines

If a file exceeds 400 lines:

* propose refactoring
* split responsibilities
* create reusable components

Never create giant files.

---

## COMPONENT RULES

React components must:

* have a single responsibility
* be reusable
* remain readable

Prefer:

```tsx
StudentCard.tsx
StudentForm.tsx
StudentList.tsx
```

Avoid:

```tsx
StudentsEverything.tsx
```

---

## SERVICE RULES

One capability = one service.

Good:

```text
adaptation.ai.service.ts
quiz.ai.service.ts
mindmap.ai.service.ts
audio.ai.service.ts
```

Bad:

```text
ai.service.ts
```

containing all logic.

---

## DATABASE RULES

Any schema modification must:

* create a migration
* preserve data
* preserve compatibility

Never delete data without explicit request.

Always update:

* types
* repositories
* validations

when schema changes.

---

## SUPABASE RULES

Always use:

* Row Level Security
* authenticated users
* server-side operations

Never expose:

* service role keys
* private credentials

Teachers must only access their own data.

---

## OPENAI RULES

Never call OpenAI from the browser.

Always use:

```text
/api/*
```

server routes.

Never expose:

OPENAI_API_KEY

Prompts must be externalized.

---

## PROMPT MANAGEMENT

Prompts must never be hardcoded in components.

Store prompts in:

```text
prompts/
```

or

```text
adaptation_prompt_templates
```

in database.

Prompt priority:

1. Database active prompt
2. Fallback local prompt

---

## RESPONSIVE DESIGN

All pages must be mobile-first.

Required breakpoints:

Mobile:
0-767px

Tablet:
768-1023px

Desktop:
1024px+

No horizontal scrolling.

Buttons minimum height:

44px

Inputs:

w-full on mobile

---

## ACCESSIBILITY

Respect WCAG AA.

Always include:

* labels
* keyboard navigation
* visible focus
* semantic HTML

Avoid accessibility regressions.

---

## API RULES

One domain = one route group.

Good:

```text
/api/students
/api/documents
/api/adapt
/api/feedback
```

Bad:

```text
/api/all
```

---

## TYPESCRIPT

Strict typing required.

Avoid:

```ts
any
```

Use:

* interfaces
* types
* zod schemas

---

## VALIDATION

Use Zod for:

* forms
* APIs
* user input

Never trust frontend input.

---

## TESTING

Every bug fix must include a test.

Critical flows must have tests:

* login
* registration
* student creation
* document upload
* adaptation generation

---

## PLAYWRIGHT

Maintain E2E tests for:

1. Login
2. Create student
3. Upload document
4. Adapt document
5. View result

These flows must never break.

---

## PERFORMANCE

Prefer:

* Server Components
* lazy loading
* pagination

Avoid:

* unnecessary API calls
* loading entire datasets

---

## GIT

Never modify main directly.

Use:

```text
feature/*
fix/*
refactor/*
```

Before merge:

* lint
* typecheck
* tests
* build

must pass.

---

## DOCUMENTATION

When generating a feature:

Always provide:

* impacted files
* migration needed
* regression risks
* testing checklist

---

## CURSOR BEHAVIOR

Before modifying code:

1. Explain what will change.
2. Identify risks.
3. Implement minimal changes.
4. Preserve existing behavior.
5. Update tests if needed.

Never rewrite large sections of code without justification.
