# Restoran MF Platformu README

MF platformu restoran əməliyyatlarını üç müstəqil domenə (Orders, Inventory, Meals) parçalayaraq CMD + Vite + Module Federation ilə reallaşdırır. Bu sənəd namizədin həlli necə qurduğunu və gələcəkdə hansı qərarlarla inkişaf etdirə biləcəyini qısa və aydın şəkildə izah edir.

## Ümumi arxitektura diaqramı

```
Monorepo
├─ apps/
│  ├─ shell (host)
│  ├─ orders (remote)
│  ├─ inventory (remote)
│  └─ meals (remote)
└─ packages/
   ├─ shared-config   (remote blueprint + nav metadata)
   ├─ shared-ui       (layout, theme, providers, testing helper)
   └─ shared-utils    (zustand store-lar, metrics, helpers)

[shared-config + shared-ui + shared-utils]
                │ (singleton paylaşım)
                ▼
          Shell (Vite host)
                │ React.lazy + Module Federation
                ▼
    Orders ◦ Inventory ◦ Meals remoteları
```

- Shell `apps/shell/src/App.tsx` daxilində `RemoteErrorBoundary` + `RemoteModuleContainer` ilə remoteları dinamik yükləyir.
- Paylaşılan store-lar (`useMealStore`, `useInventoryStore`, `useOperationsMetrics`) və UI komponentləri bütün domenlərdə eyni davranışı qoruyur.
- `remoteBlueprints` (`packages/shared-config/src/remotes.config.ts`) host və remotelar üçün tək həqiqət mənbəyidir.

## Microfrontend yanaşmasının səbəbi

- Domen ayrılığı: Orders-in form və status axını inventar və resept UI-larına toxunmadan inkişaf etdirilir.
- Müstəqil build/deploy: hər remote öz `vite.config.ts` faylı ilə fərdi olaraq build olunur, shell isə yalnız `remoteBlueprints` siyahısına yeni obyekt əlavə etməklə genişlənir.
- Texnoloji elastiklik: remotelar React + Vite-də qalsa da, dizayn hostdan asılı deyil; gələcəkdə spesifik domen üçün fərqli runtime əlavə etmək daha asandır.
- İstifadəçi təcrübəsi: host overview səhifəsi üç remotedan gələn metrikləri birləşdirərək rəhbərliyə vahid panel təqdim edir.

## Host və remotes necə işləyir

- **Blueprint axını:** `remoteBlueprints` → `remoteDefinitions` (`packages/shared-config/src/index.ts`) → host App və navigation. Eyni tip (`RemoteDefinition`) host ilə remotelar arasında kontrakt rolunu oynayır.
- **Env idarəsi:** hər blueprint `envKey` (məs. `VITE_ORDERS_REMOTE_URL`) saxlayır; host `loadEnv` vasitəsilə dev/prod URL-lərini qurur, default hal kimi `localhost:<port>/remoteEntry.js` istifadə olunur.
- **Module Federation:** host `apps/shell/vite.config.ts` daxilində `federation({ name: 'shell', remotes })` qurur. Remotelar (`apps/orders/vite.config.ts` və analoqları) `exposes: { './Module': './src/remote-entry.tsx' }` ilə modulu paylaşır.
- **Yükləmə mexanizmi:** host `React.lazy(() => import('<remote>/Module'))` və `Suspense` fallback-ları ilə runtime-da modul çağırır. `RemoteErrorBoundary` səhv və ya versiya uyğunsuzluğunu tutaraq istifadəçiyə retry imkanı verir.
- **Routing:** hər remote öz `BrowserRouter`-u ilə gəlir; əgər host daxilində artıq router varsa, remote `useInRouterContext` vasitəsilə bunu anlayır və əlavə `<BrowserRouter>` yaratmır (bax: `apps/orders/src/RemoteOrders.tsx`).

## Bundle & chunk strategiyası

- Host build-i `rollupOptions.output.manualChunks` ilə React, Router, MUI, Emotion, Module Federation SDK və `packages/shared-ui` üçün ayrıca chunk yaradır. Bu yanaşma ilk yüklənmədə keş effektivliyini artırır.
- Remotelar minimal bundle üçün `singleton` paylaşımı ilə React/MUI paketlərini hostla paylaşır; eyni versiya şərti Vite MF pluginində konfiqurasiya olunub.
- `vite-bundle-analyzer` həm host, həm də remotelarda mövcuddur; `ANALYZE=true npm run build --filter <workspace>` əmri statik HTML raportu açır.
- `modulePreload: false` (remotelar) və `modulePreload.polyfill=false` (host) ilə lazımsız preload skriptləri azaldılır.

## Testing strategiyası

- **Stack:** Vitest + Testing Library + jsdom (`vitest.config.ts`, `vitest.setup.ts`).
- **Provider-lər:** `renderWithProviders` (`packages/shared-ui/src/testing/renderWithProviders.tsx`) bütün testləri `AppProviders` (ThemeProvider + CssBaseline) ilə əhatə edir, beləliklə komponentlər real UI kontekstində işləyir.
- **MF mockları:** Vitest `resolve.alias` hissəsində `orders/Module`, `inventory/Module`, `meals/Module` real remotelar əvəzinə test stub-larına yönləndirilir (`tests/mocks/*.tsx`). Shell testləri (`apps/shell/src/__tests__/App.test.tsx`) bu alias sayəsində remotelar olmadan render edilir.
- **Remote testləri:** hər domen `apps/<remote>/src/__tests__` qovluğunda UI axınlarını test edir (məs. `OrdersApp.test.tsx` status dəyişdirmə dialoqunu yoxlayır, `InventoryDashboard.test.tsx` restock funksiyasını mock edir).
- **Shared store testləri:** zustand store-larının deterministik olması üçün `useMealStore.setState`, `useInventoryStore.setState` kimi setter-lər testlərdə istifadə olunur.
- **Coverage fəlsəfəsi:** unit (komponent və store), integration (shell + mock remotelar), contract (shared typelar) səviyyələri ayrıdır; əlavə olaraq MF-lər üçün e2e test planı açıq risk kimi qeyd olunur.

## CSS & UI architecture qərarları

- UI baza `packages/shared-ui`-da yerləşir: `AppLayout` mobil/desktop uyğun Drawer + AppBar qurur, navigation host tərəfindən ötürülür.
- `AppProviders` hər remoteda ThemeProvider + CssBaseline tətbiq edir, beləliklə stil toqquşmaları aradan qaldırılır.
- `appTheme` (`packages/shared-ui/src/theme.ts`) consistent typography, rəng palitrası və komponent override-ları (Button radius, font-family) saxlayır.
- Komponent səviyyəsində stil təkrarını azaltmaq üçün `sx` konstları (`formStyles`, `boardStyles`, `detailStyles`) yaradılıb; bu konstlar MUI `SxProps` tipini istifadə etdiyinə görə TypeScript səviyyəsində də yoxlanılır.
- UI elementləri `@shared/ui` paketindən tree-shake olunmuş şəkildə gəlir; host `AppLayout` və `MetricCard`-ı lazy-load edir ki, ilk yüklənmə vaxtı qısalsın.

## Form & validation yanaşması

- Orders domenində `OrderForm` Formik + Zod (schema `z.object`) ilə qurulub; `validate` funksiyası `schema.safeParse` nəticəsini Formik error-larına map edir.
- Inventar inteqrasiyası: form submit zamanı `useInventoryStore.consumeRecipe` çağırılır; kifayət qədər stock yoxdursa, form `inventoryError` state-i vasitəsilə istifadəçiyə xəbərdarlıq edir.
- `isSubmitting` bayraq və `productOptions.length` yoxlaması düymələri deaktiv edir, `Alert` komponentləri isə həm səhv, həm də informasiya mesajlarını göstərir.
- Ingredient siyahısı dinamikdir: seçilən reseptə görə `Stack component="ul"` içində maddələr və çoxluq göstərilir, bu da istifadəçiyə real-time feedback verir.

## Layihə böyüsə hansı risklər var

1. **Versiya sinxronu:** React/MUI kimi singleton paylaşılan asılılıqların versiyası host və remotelarda eyni saxlanılmalıdır; əks halda runtime import səhvləri yaranar.
2. **Blueprint koordinasiyası:** Çoxlu remote olduqda `remoteBlueprints`-dəki env dəyişənlərinin idarəsi çətinləşə bilər; CI-də tip yoxlaması və lint qaydaları tələb olunur.
3. **Store şişməsi:** `shared-utils` daxilindəki zustand store-ları domenlər artdıqca monolitə çevrilə bilər; seçimli import və selector-ların optimallaşdırılması vacibdir.
4. **Bundle ölçüsü:** Yeni komponentlər `shared-ui`-a əlavə olunarsa, hostda paylaşılmış chunk böyüyəcək; lazımi halda komponentləri ayrı paketlərə bölmək gərək olacaq.
5. **Observability:** MF-lərin ayrıca build etməsi deployment-i sürətləndirir, lakin inteqrasiya xətalarını izləmək üçün mərkəzləşdirilmiş logging hazırda yoxdur.

## Güclü tərəfləri

- `remoteBlueprints` sayəsində remoteların metadata-sı və navigation-u tək yerdə saxlanılır, əlavə remote üçün yalnız bir obyekt yazmaq kifayətdir.
- Paylaşılan zustand store-ları (orders metriki, inventar, meals) domenlərin məlumat mübadiləsini asanlaşdırır və host overview kartlarına birbaşa feed verir.
- Manual chunking və analyzer ilə bundle ölçülərinə nəzarət olunur, React/MUI kimi ağır paketlər reuse edilir.
- Testing infrastrukturu `renderWithProviders` + alias mock-ları ilə MF-ləri təcrid şərtlərində yoxlamağa imkan verir.
- Formik+Zod kombinasiyası həm UX, həm də etibarlı server-sidə validasiya üçün reuse edilə biləcək schema verir.

## Zəif tərəfləri

- Hazırda heç bir end-to-end və ya vizual regressiya testi yoxdur; yalnız unit/integration səviyyəsinə güvənmək risklidir.
- Module Federation runtime-ları (xüsusən dev rejimində) `eval` xəbərdarlıqları yaradır və bəzi təhlükəsizlik siyasətlərində bloklana bilər.
- Observability və telemetriya layihəyə inteqrasiya olunmayıb; remote fallback-ları yalnız UI səviyyəsində səhvləri tutur.
- `shared-utils` daxilindəki default məlumatlar (ingredient stock, meals) serverdən gəlmir, bu da real API ilə inteqrasiya zamanı refaktor ehtiyacını artırır.
