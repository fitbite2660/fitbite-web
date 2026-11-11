# Fitbite combinatie 1 + 3

Datum 6 november 2026. Scope van deze controle is de gekozen vervolgstap na toppings en de kassascène in de bestaande mobiele Eigen bowl-proef.

## Resultaat en bevindingen

Er blijven geen P0-, P1- of P2-bevindingen over. De laatste vergelijking is gebaseerd op de definitieve gerenderde schermen en de gekozen bronhelften in dezelfde vergelijkingsafbeeldingen. De primaire knoptekst is vergroot en op 320 px past de betaaltekst op één regel.

Bewuste functionele aanvullingen zijn de terugknop op het keuzescherm, het gekozen formaat naast ‘In je bestelling’ en de uitklapbare bestelling met plus op het kassascherm. De bron heeft die drie aanvullingen beperkt of niet. Ze ondersteunen wijzigen en inspecteren van de eigen bowl. De kassalink gebruikt de gekozen tekst ‘Terug naar het menu’.

Een kleine P3-afwijking blijft de extra dunne bovenlijn van het ingrediëntenoverzicht op het keuzescherm. De bestaande uitklapbare component gebruikt deze om de aanraking van de rij herkenbaar te maken. De iets andere fotolichting en minimale verschillen van de opnieuw gegenereerde detailtexturen zijn acceptabel binnen de geselecteerde cameracompositie.

## Bronnen en gelijke weergave

Werkende route is `http://127.0.0.1:4173/eigen-bowl/index.html`. De hoofdtest doorloopt de opening, Medium, Avocado, Verse zalm, Teriyaki en Krokante uitjes. De bewijsbeelden tonen één eigen bowl met een gesloten ingrediënten-/bestellingsoverzicht.

| Onderdeel | Bronpixels | Selectie uit bron | Genormaliseerde weergave |
| --- | --- | --- | --- |
| Links 1, Langs de bar | 1205 × 1306 | linkerkant `(0, 0, 600, 1306)` | 388 × 844, gecentreerd in 390 × 844 |
| Rechts 3, Bij het team | 1199 × 1312 | rechterkant `(606, 0, 1199, 1312)` | 381 × 844, gecentreerd in 390 × 844 |
| Implementatie | 780 × 1688 | volledig app-scherm | 390 × 844 CSS-pixels, DPR 2, verkleind naar DPR 1 voor de vergelijking |
| Extra kleine gsm | 640 × 1480 | volledig app-scherm | 320 × 740 CSS-pixels, DPR 2 |

De bronnen zijn rastermockups zonder vastgelegde CSS-dichtheid. Hun geselecteerde helft is proportioneel naar hoogte 844 verkleind en horizontaal gecentreerd. Er is geen vervorming van de bron toegepast. De scheidslijn van het ontwerpboard is verwijderd. Browserchrome en telefoonframes spelen geen rol in deze vergelijking.

Bronbestanden bevinden zich in `/Users/adnane/Documents/ChatGPT/website FB/outputs/fitbite-vervolg-varianten-2026-11-06/`.

- `01-langs-de-bar.png` voor het keuzescherm.
- `03-bij-het-team.png` voor het kassascherm.

Alle implementatiebewijzen en vergelijkingen bevinden zich in `/Users/adnane/Documents/ChatGPT/website FB/outputs/fitbite-combinatie-1-3-2026-11-06/`.

- `01-keuze-gsm.png` en `02-kassa-gsm.png` zijn de definitieve 390 px-schermen.
- `vergelijking-keuze.jpg` en `vergelijking-kassa.jpg` tonen telkens de bronhelft en de werkende site naast elkaar.
- `detail-keuze-kop.jpg`, `detail-keuze-bediening.jpg`, `detail-kassa-bediening.jpg` en `detail-kassa-beeld.jpg` zijn geïnspecteerd voor tekst, controls, de band en het logo.
- `keuze-320.png` en `kassa-320.png` tonen de kleine gsm, met zichtbare acties en de betaaltekst op één regel.
- `03-van-toppings-naar-kassa.mp4` is een echte opname van de lokale route, H.264, 390 × 844, 25 fps, ongeveer vier seconden.
- `04-gekozen-combinatie.jpg` is de gebruikersvoorvertoning met beide definitieve schermen van 390 × 844 en 12 px crème ertussen. Deze bevat geen QA-labels.

## Vereiste visuele onderdelen

| Onderdeel | Controle en oordeel |
| --- | --- |
| Fonts en typografie | Futura/Futura Medium voor de grote koppen en primaire acties; Optima voor het overzicht en de secundaire tekst. De keuzeheading gebruikt 51,48 px op 390 en breekt na ‘jouw’, overeenkomstig links 1. De kassakop gebruikt 46,8 px en staat beneden. De knop gebruikt nu 21,06 px op 390 en 18 px op 320. De passende gewichten, lettervormen, spatiëring en woordafbreking zijn in de detailbeelden vergeleken. Antialiasing verschilt normaal tussen rastermock en browser. |
| Layout en ritme | Volledige achtergrondfoto per scène, title boven bij keuze, title beneden bij kassa. Houten bowl staat links vooraan langs de diagonale bar. Bij kassa blijven verpakking, medewerker links en luik zichtbaar. De navigatie, ingrediëntenrij, volle primaire knop en onderlijnde kassalink passen op beide schermhoogten. Geen horizontale overflow. |
| Kleuren en tokens | Warme donkere bruine achtergrond, crème `rgb(244, 232, 211)` voor de knop, crème teksten, dunne transparante lichte lijnen. Contrast blijft zichtbaar boven de foto. De originele zaakkleuren en warme fotografie houden de bronrichting. |
| Beeldkwaliteit en assets | Geselecteerde UI-vrije bronbewerkingen hebben de gekozen camerahoeken, houten bowl en kraftverpakking met heldere deksel en herkenbaar Fitbite-logo. Het logo zit in het fotoasset. Alle geladen afbeeldingen hebben natuurlijke afmetingen. Geen gebroken afbeeldingen, lege placeholders of zichtbare compressieranden op gsm. |
| Copy en inhoud | ‘Helemaal jouw bowl.’, ‘Bekijk je ingrediënten’, ‘Afrekenen’, ‘Verder kijken op het menu’, ‘Online betalen uitproberen’ en ‘Terug naar het menu’ sluiten aan bij de gekozen schermen. Formaat en aantallen zijn werkelijke demo-selecties. Betalen blijft een expliciete lokale proef met zichtbare status. |

## Vergelijkingsgeschiedenis

1. Eerste gecombineerde vergelijking vond een P2 bij de primaire knoplabels. In het keuzescherm was ‘Afrekenen’ ongeveer een vijfde kleiner dan de bron. De implementatie gebruikte 18 px op 390.
2. De hoofdimplementatie wijzigde de knoptekst naar `clamp(18px, 5.4vw, 24px)`. Nieuwe 390-captures en de gerenderde detailvergelijkingen bevestigden de passende hiërarchie.
3. De controle op 320 ontdekte dat ‘Online betalen uitproberen’ nipt op een tweede regel belandde. Het label kreeg circa 209,44 px ruimte voor circa 209,84 px tekst. Dit was een responsive P2.
4. Alleen onder 360 px zijn de horizontale knoppadding en de gap verkleind. Laatste 320-capture toont een labelhoogte van 21,59 px op één regel. De knop blijft 60 px hoog en valt volledig binnen de 740 px-viewport. De 390-weergave is daardoor ongewijzigd. De definitieve vergelijkingsbeelden en video zijn daarna gecontroleerd.

## Interacties en browser

De Chromium-rendering met aanrakingsemulatie is uitgevoerd op 390 × 844 met normale beweging en 320 × 740 met verminderde beweging. Console/pageerrors en HTTP-fouten zijn bijgehouden, met nul fouten op beide routes.

Getest zijn het toevoegen vanuit de normale openingsroute, de terugweg naar toppings, wijziging van dezelfde bowl met behoud van het id, dubbel klikken op toevoegen, de menu-link, twee Crousty Pops toevoegen in het menu, doorgaan naar de gezamenlijke kassa, een tweede Large-bowl samenstellen en de volledige bestelling bekijken. Het eindresultaat bevat precies twee eigen bowls plus twee Crousty Pops, samen vier items. Er kwam geen dubbele eigen bowl bij. Gereduceerde beweging gaf geen cameramotion. De lokale betaalproef behoudt de mand.

De in-app Browser is aanvullend aangevraagd via CUA. Die gaf `Browser is not available: iab`; de browserinventaris was leeg. Daarom is de lokale Chromium-rendering gebruikt als fallback volgens de Browser Choice-regel. De browserbeelden, functionele checks en vergelijking zijn wel uitgevoerd. Geen fysieke iPhone/Safari-meting of publieke publicatie behoort tot deze controle.

## Afgerond

- Gekozen referenties en juiste schermhelften vastgesteld.
- Normale route en extra kleine gsm vastgelegd.
- Bron en implementatie in dezelfde beelden visueel vergeleken.
- Beide P2-issues hersteld en met nieuwe renders gecontroleerd.
- Vijf verplichte visuele onderdelen gecontroleerd.
- Mandgedrag, menukoppeling, betaalproef en verminderde beweging gecontroleerd.
- Definitieve screenshotcombinatie en videobewijs opgeslagen.

final result: passed
