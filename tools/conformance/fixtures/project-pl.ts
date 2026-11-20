// A brain in Polish with a `sections` map.
import type { Files } from "../build.ts";
import { accepted, INDEX_EMPTY, PL_LABELS, step } from "./documents.ts";

export const PL_SECTIONS = `sections:
  goal: Cel
  scope: Zakres
  out-of-scope: Poza zakresem
  decisions: Decyzje
  acceptance: Kryteria akceptacji
  stages: Etapy
  log: Przebieg
  open-questions: Otwarte pytania
  context: Kontekst
  options: Opcje
  recommendation: Rekomendacja
  decider: Kto i kiedy rozstrzyga
  decision: Decyzja
  consequences: Konsekwencje
  proposed: Do podjęcia
  accepted: Podjęte
  rejected: Odrzucone
  superseded: Zastąpione
  status: Status
  assignee: Wykonawcy
`;

export const PL_DESCRIPTION = "Źródło prawdy serwisu Faktury: wystawianie i numeracja faktur dla klientów sklepu.";

export const PL_README = `---
brain: faktury
lang: pl
spec: 1.0.0
owner: ola
description: "${PL_DESCRIPTION}"
${PL_SECTIONS}---
# Faktury

Serwis Faktury wystawia faktury dla zamówień sklepu i nadaje im numery. Brain jest źródłem prawdy produktu, architektury, infrastruktury i kodu: decyzja zapada najpierw tutaj, potem trafia do kodu, a zmiana, która odchodzi od dokumentu, aktualizuje go w tym samym PR.

${INDEX_EMPTY}

## Kroki

Fazy rozbijamy na kroki w \`steps/NN-krotka-nazwa.md\`. Krok to spec, według którego powstaje praca; jego status jest we frontmatterze.

## Konwencje

- Decyzje leżą w podkatalogach \`decisions/\` per domena (\`decisions/<domena>/\`), np. \`process/\` dla zasad pracy. Domena to krótka angielska nazwa w kebab-case. Nową zakładamy, gdy decyzja nie pasuje do żadnej istniejącej; decyzja dotycząca kilku domen idzie do tej, w której ma największy skutek.
`;

export const PL_DECISION = { context: "Kontekst", decision: "Decyzja" };

export const LANGUAGES_PL = accepted(
    "Języki pracy",
    "Kod, identyfikatory, komentarze, komunikaty, commity, gałęzie i PR po angielsku; dokumentacja po polsku.",
    "Kod, identyfikatory, komentarze, komunikaty logów i błędów, commity, nazwy gałęzi i PR są po angielsku. Dokumentacja w brainie jest po polsku.",
    { apply: "always", labels: PL_DECISION },
);

export const ORDER_PL = accepted(
    "Brain razem z pracą",
    "Zmiany w brainie idą w tym samym PR co praca, która z nich wynika.",
    "Zmiany w brainie (decyzje, także `proposed`, kroki, dokumenty) idą w tym samym PR co praca, która z nich wynika, w dowolnych jego commitach, także w tym samym commicie co praca. Wyjątkiem jest krok: commit, który ustawia mu `agreed`, jest przed pracą nad nim, a każdy skończony etap to osobny commit. W tym PR są też widoki generowane i bloki zarządzane plików instrukcji. Decyzja `proposed` albo nowy krok, które dotyczą pracy innych osób, mogą trafić na główną gałąź wcześniej osobnym małym PR.",
    {
        apply: "always",
        labels: PL_DECISION,
        context: "Kolejność pracy to decyzja zespołu; to domyślne ustawienie szablonu startowego dotbrain.",
    },
);

export const NUMBERING_PL = accepted(
    "Numeracja faktur",
    "Faktury mają numery `FV/RRRR/MM/NNNN`, nadawane w transakcji razem z zapisem faktury.",
    "Numer faktury ma postać `FV/RRRR/MM/NNNN` i jest nadawany w tej samej transakcji, w której zapisujemy fakturę. Numeracja zaczyna się od `0001` w każdym miesiącu ([model danych](../../architecture/overview.md)).",
    { apply: '"src/invoices/**"', date: "2026-11-02", labels: PL_DECISION },
);

export const STORAGE_PL = `---
status: proposed
description: "Czy PDF-y faktur przechowujemy w bazie, czy w object storage."
---
# Przechowywanie PDF-ów faktur

## Kontekst

Każda faktura ma PDF, który klient pobiera przez lata.

## Opcje

1. **W bazie:** jedna kopia zapasowa, ale baza rośnie.
2. **W object storage:** tanio i bez limitu, ale druga usługa.

## Kto i kiedy rozstrzyga

Ola, przed krokiem 2.
`;

export const OVERVIEW_PL = `---
description: "Architektura serwisu Faktury: komponenty i model danych."
---
# Przegląd

Serwis to jedno API z bazą PostgreSQL. Faktura ma numer, klienta, pozycje i PDF.
`;

export const STEP1_PL = step(
    "01",
    "szkielet",
    "in-progress",
    "Wdrożone API, które wystawia fakturę z numerem.",
    "Sklep wystawia fakturę dla zamówienia przez API.",
    "- `POST /invoices` z numeracją według [decyzji](../decisions/domain/2026-11-02-invoice-numbering.md).",
    ["Faktura wystawiona przez API ma numer `FV/RRRR/MM/NNNN`."],
    {
        log: ["- 2026-11-02: Start; endpoint i numeracja w transakcji, sprawdzone testem równoległego wystawiania."],
        assignee: "user:ola",
        labels: PL_LABELS,
    },
);

export const PL_CLAUDE = "# Faktury\n\n## Komendy\n\n- `npm test` uruchamia testy.\n";

export function plProject(): Files {
    return {
        ".brain/README.md": PL_README,
        ".brain/decisions/process/2026-11-01-languages.md": LANGUAGES_PL,
        ".brain/decisions/process/2026-11-01-order-of-work.md": ORDER_PL,
        ".brain/decisions/domain/2026-11-02-invoice-numbering.md": NUMBERING_PL,
        ".brain/decisions/data/2026-11-03-invoice-pdf-storage.md": STORAGE_PL,
        ".brain/architecture/overview.md": OVERVIEW_PL,
        ".brain/steps/01-walking-skeleton.md": STEP1_PL,
        "CLAUDE.md": PL_CLAUDE,
        "src/invoices/number.ts": 'export function nextNumber(): string {\n  return "FV/2026/11/0001";\n}\n',
    };
}
