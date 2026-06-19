# Audit responsive — Inclusia

## Problèmes détectés

| Zone | Problème | Gravité |
|------|----------|---------|
| Layout dashboard | Sidebar fixe 256px, contenu compressé sur mobile | Critique |
| Navigation | Pas de menu hamburger / drawer | Critique |
| Dashboard stats | Grille 4 colonnes fixe | Élevée |
| Liste élèves | Tableau seul, débordement horizontal | Élevée |
| Liste documents | Tableau seul, illisible sur mobile | Élevée |
| Adaptations (résultat) | Contenu long empilé sans structure | Élevée |
| Formulaires auth | Grille 2 colonnes prénom/nom sur petit écran | Moyenne |
| Boutons header | Largeur fixe, non empilés | Moyenne |
| Typographie | `text-xs` / `text-sm` sur contenu principal | Moyenne |
| Safe area iPhone | Encoches non gérées | Moyenne |
| Page Paramètres | Lien nav vers `/settings` sans page | Moyenne |

## Correctifs appliqués

### Layout
- **Sheet shadcn/ui** : drawer latéral avec hamburger (`MobileNav`)
- Fermeture automatique après navigation (`onNavigate`)
- Sidebar masquée `< lg`, header mobile sticky avec safe-area
- `PageContainer` : `max-w-7xl mx-auto px-4 md:px-6 lg:px-8`

### Composants UI
- `Button` / `Input` : `min-h-[44px]`, `text-base`
- `Sheet`, `Tabs` ajoutés
- `globals.css` : safe-area, `overflow-x: hidden`, `text-base` body

### Pages dashboard
- Toutes les pages utilisent `PageContainer` + `AppHeader` responsive
- Stats : `grid-cols-1 md:grid-cols-2 xl:grid-cols-4`
- Actions header : `w-full sm:w-auto`

### Listes
- **Élèves** : cards mobile / table desktop
- **Documents** : cards mobile / table desktop
- **Adaptations** : cards empilées responsive

### Adaptations (détail)
- Mobile : onglets Tabs (Cours, Fiche, Quiz, Plus)
- Desktop : vue complète

### Formulaires
- Champs `w-full`, grilles `grid-cols-1 sm:grid-cols-2`
- Groupes boutons empilés `flex-col sm:flex-row`

### Accessibilité
- `aria-label` sur menu hamburger et onglets
- Zones tactiles ≥ 44px
- Focus visible (`focus-visible:ring`)
- Contraste conservé (palette existante WCAG AA)

### Tests Playwright
- Projets : iPhone 14, iPhone SE, Galaxy S23, iPad, Desktop
- Vérifications : connexion, navigation, formulaires, absence scroll horizontal

## Composants modifiés

```
src/components/ui/sheet.tsx          (nouveau)
src/components/ui/tabs.tsx             (nouveau)
src/components/ui/button.tsx
src/components/ui/input.tsx
src/components/layout/mobile-nav.tsx   (nouveau)
src/components/layout/nav-content.tsx  (nouveau)
src/components/layout/page-container.tsx (nouveau)
src/components/layout/dashboard-shell.tsx
src/components/layout/app-sidebar.tsx
src/components/layout/app-header.tsx
src/app/globals.css
src/app/layout.tsx
src/app/(auth)/layout.tsx
src/app/(dashboard)/dashboard/page.tsx
src/app/(dashboard)/students/page.tsx
src/app/(dashboard)/students/new/page.tsx
src/app/(dashboard)/documents/page.tsx
src/app/(dashboard)/adaptations/page.tsx
src/app/(dashboard)/adaptations/new/page.tsx
src/app/(dashboard)/adaptations/[id]/page.tsx
src/app/(dashboard)/settings/page.tsx  (nouveau)
src/features/students/components/student-list.tsx
src/features/students/components/student-form.tsx
src/features/documents/components/document-list.tsx
src/features/documents/components/document-upload-form.tsx
src/features/adaptations/components/adaptation-list.tsx
src/features/adaptations/components/adaptation-result.tsx
src/features/adaptations/components/adaptation-wizard.tsx
src/features/auth/components/login-form.tsx
src/features/auth/components/register-form.tsx
src/features/dashboard/components/stats-cards.tsx
playwright.config.ts                   (nouveau)
tests/e2e/mobile-responsive.spec.ts    (nouveau)
tests/e2e/helpers/auth.ts              (nouveau)
```

## Lancer les tests E2E

```bash
# Variables optionnelles pour tests authentifiés
export E2E_EMAIL=vous@ecole.fr
export E2E_PASSWORD=votre_mot_de_passe

npm run test:e2e
npm run test:e2e:ui   # interface Playwright
```
