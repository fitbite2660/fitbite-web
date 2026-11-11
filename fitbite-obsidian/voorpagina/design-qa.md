# Mobiele voorpagina — 6 november 2026

Resultaat: **passed voor deze lokale voorpaginaproef**. Geen open P0/P1/P2 bevindingen binnen deze scope. Geen productie- of betalingsgoedkeuring.

## Referentie en bewijs

Goedgekeurde bron: `outputs/fitbite-voorpagina-schets-2026-11-06/02-croustys-naar-bowls-met-logo.png` vanaf de projectroot. Twee panelen van ongeveer 630×1230. Voor vergelijking zijn beide bronpanelen afzonderlijk naar 390×761 geschaald en naast echte browserscreenshots op diezelfde viewport geplaatst.

Bewijs in `outputs/fitbite-voorpagina-werkend-2026-11-06/`: `vergelijking-croustys.jpg`, `vergelijking-bowls.jpg`, `qa-croustys.jpg`, `qa-bowls.jpg`. Definitieve mobiele previews: `01-croustys.jpg` en `02-bowls.jpg`, beide 390×844.

## Visuele controle

- Compositie behouden: beeldvullende zaak, eten op de tafel, grote titels bovenaan en crème bediening onderaan. Logo vervangt PUURS; Fitbite-woordmerk blijft staan.
- Acht bowls zichtbaar met de twee voorste volledig in beeld. Crousty-tray eveneens volledig zichtbaar. Geen witte kaart onder het product.
- Kleuren, titels, teksten, header en knoppen gecontroleerd tegen de bron. Native Futura/Optima blijft de eerder gekozen typografische richting.
- P3 verschillen: native letterweergave wijkt af van de gegenereerde schetstekst; de UI-vrije fotolagen zijn opnieuw gegenereerde afgeleiden, met kleine verschillen in voedselvormen en camerauitsnede. Geen claim van pixelidentieke foto's of nieuwe echte opnamen.

## Correctierondes

1. SVG MIME-type van lokale previewserver gecorrigeerd, waardoor winkelmand/menu/pijlen zichtbaar laden.
2. Koppen, kopruimte en knoppen aangepast op basis van vergelijking op dezelfde beeldverhouding; tweeregelige bowlkop apart geschaald.
3. Fade-through-dark vervangen door twee aangrenzende schuivende scènes, zodat pauzeren midden in de scroll geen leeg donker scherm geeft.

## Functionele verificatie

In de in-app browser gecontroleerd: Croustys opent Crousty-menu, bowls opent bowlmenu, eigen-bowl-link opent de bestaande samensteller, winkelmand opent de bestaande selectie. Bestaande cart met één item blijft behouden; geen bestelling of betaalactie uitgevoerd. Hamburger en categorie-anker werken. Terugnavigatie bewaart de cart.

390×844, 390×761 en 320×740 gecontroleerd. Op 320×740 geen horizontale overflow en geen kapotte afbeeldingen; bediening zichtbaar. Scroll bereikt beide juiste eindposities. Eindcontrole browserconsole: geen errors/warnings.

Reduced-motion en korte schermen gebruiken volgens codecontrole gestapelde statische scènes. Reduced-motion is niet als OS-instelling getest; geen fysieke iPhone/Safari-test. De overgang gebruikt fotolagen met verschuiving en lichte zoom, geen vrije 3D-camera.

## Scope

Preview: http://127.0.0.1:4173/voorpagina/index.html . Nieuwe voorpagina is een aparte reviewbare route. De knoppen sluiten aan op bestaande menu- en bestelproeven; hun oudere vormgeving valt buiten deze wijziging. Betaling blijft demo. Geen deployment en geen Higgsfield-credits gebruikt.
