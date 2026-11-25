# Development report

FindIt is implemented as an independent Next.js application at the root of `ajccc02/FindIt`. The application includes nine application routes, guest-owned report management, direct image uploads, explainable matching, numbered campus-building selection, migrations, optional demo seed, and the requested HCI documentation. See the README for structure, environment variables, database setup, and deployment steps.

## Verified during initial development

- Production build succeeded using Next.js's supported Webpack builder.

- Strict TypeScript checking and ESLint passed.

- Fourteen matching and validation unit tests passed.

- Five browser checks passed at 320, 375, 390, 430, and 1280 pixels. They cover public layouts, keyboard entry, horizontal overflow, custom unavailable-page rendering, and automated WCAG A/AA accessibility checks on the About page.

- Hosted PostgreSQL authorization assertions passed for shared authenticated reads, owner updates, rejection of non-owner changes, demo protection, storage path protection, feedback read denial, rating constraints, and required consent.

- The SQL test transaction rolled back. A subsequent check confirmed sixteen demo reports, zero feedback responses, and zero remaining test identities.

- Supabase's security advisor returned no findings. The production dependency audit returned zero known vulnerabilities.

The performance advisor reported informational unused-index notices on this newly created dataset. Review actual query usage after the study before changing indexes. [Supabase unused-index advisory](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)

## Live verification requirements

Anonymous sign-ins and matching Cloudflare Turnstile keys are required for public guest access. These settings are configured in the provider dashboards. Guest sign-in and shared-feed loading were verified in the deployed browser. The complete report/upload/two-session lifecycle remains an opt-in browser test and is not represented as passed.

The database and private storage configuration are applied to the dedicated FindIt project. The repository is now an independent application at its root. The production hostname is https://findit-campus-ajccc02.vercel.app. A successful hosting build alone does not establish all two-device acceptance criteria.

Vercel's GitHub account login connection must be added before automatic Git deployments can be linked. The initial deployment used the verified source files through Vercel's authenticated deployment API.

## Study and scope limitations

Guest sessions have no cross-device account recovery. Matching uses weighted rules and keywords. Abandoned uploads from closed tabs require researcher maintenance. No participant research, evaluation responses, usability scores, or showcase outcomes have been generated. The group must supply its actual midterm research, testing observations, and at least five real showcase evaluations.

## Campus-map and navigation update

The project owner requested removal of the Feedback section and replacement of generic locations with the supplied campus-map legend. The app now uses all 30 numbered buildings, including separate Food Innovation Centers 25 and 26. Feedback navigation, About content, page, and submission action are removed. Historical questionnaire data remains protected and new participant insertion is disabled. The fictional seed uses mapped buildings. The two existing Gymnasium reports are normalized to Building 16; the specific Main Building report is removed at the owner’s explicit request.

Current checks: strict TypeScript, ESLint, all 14 unit tests, five responsive/accessibility browser checks, and rollback-only PostgreSQL authorization assertions passed. The photo/two-session browser test remains skipped unless explicitly enabled against an appropriate test environment. The production Webpack build also passed. The first sandboxed prerender attempt was denied filesystem access; the same build succeeded outside the sandbox. The update was published to GitHub and deployed to the existing Vercel production project with status READY.

### Live update verification

The production browser showed all 30 buildings in the browse filter and both report forms. Filtering Building 9 returned its three actual demo reports. The longest building name fit the 320-pixel layout without horizontal overflow. Navigation has four entries and no Feedback link; `/feedback` shows the custom unavailable-page screen. Database verification confirmed 18 reports (16 demo and two retained participant reports), no retired generic locations, removal of the one explicitly requested report, denied participant feedback insertion, and a recorded migration version matching the repository file.

### Database advisor notes

The current security advisor warns about anonymous access on reports and storage, which is the intended authenticated guest model. Owner-only mutations and storage paths passed the rollback-only authorization checks. [Anonymous access policy advisory](https://supabase.com/docs/guides/database/database-advisors?queryGroups=lint&lint=0012_auth_allow_anonymous_sign_ins).

It also reports disabled leaked-password protection. FindIt currently offers guest sign-in only; review that protection before introducing password-based accounts. [Password protection guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
