# RSM365 — firmowa strona wizytówka

Nowoczesna strona firmy **RSM365 sp. z o.o.** (bezpieczeństwo Microsoft 365),
zbudowana na podstawie treści, kolorystyki i logo z poprzedniej strony rsm365.eu.
Statyczna, hostowana na **GitHub Pages**.

🔗 **Na żywo:** https://bachur90.github.io/rsm365/

## Stos

- Czysty HTML + CSS + JavaScript (bez narzędzi build)
- [three.js](https://threejs.org/) z CDN (importmap) — logo marki ożywione jako **wir cząsteczek 3D** w hero (8 spiralnych ramion w kolorach logo)
- Czcionki: Space Grotesk, Inter, IBM Plex Mono (Google Fonts)

## Kolorystyka (przeniesiona ze starej strony)

| Kolor | Hex | Zastosowanie |
|---|---|---|
| Fiolet | `#9033FB` | Filar „Audyt", akcent główny |
| Niebieski | `#45A4F6` | Filar „Wdrożenie" |
| Morski | `#0ECBC0` | Filar „Utrzymanie" |
| Zielony | `#00D084` | Filar „Szkolenia" |

Jasna baza (biel / #F7F8FB) — jak na starej stronie.

## Struktura

```
index.html            # treść — sekcje: hero, oferta (4 filary), zakres, dlaczego, o nas, współpraca, kontakt
assets/
  css/styles.css      # system projektowy „Spektrum ochrony"
  js/main.js          # wir 3D + interakcje UI
  img/logo.png        # logo RSM365 (ze starej strony)
  img/monitoring.jpg  # zdjęcie (sekcja „Dlaczego")
  img/team.jpg        # zdjęcie (sekcja „O nas")
.nojekyll
```

## Treści

Teksty oparte na oryginalnych treściach z rsm365.eu (hero, cztery filary oferty,
zakres działań, misja/wizja, współpraca, kontakty zespołu, NIP). Kontakt przez
`mailto:` do adresów zespołu.

## Uruchomienie lokalne

```bash
# dowolny serwer statyczny, np.:
npx serve .
```

## Dostępność i wydajność

- `prefers-reduced-motion` — scena 3D statyczna, animacje wyłączone
- Widoczny focus klawiatury, skip-link, semantyczny HTML
- Scena 3D pauzuje poza ekranem; pixelRatio ograniczony do 2
- Nagłówek auto-chowany przy przewijaniu w dół
