# Bowlselectie — 10 november 2026

## Visuele bron en scope

Bron: `outputs/fitbite-voorpagina-werkend-2026-11-06/02-bowls.jpg`, de werkende versie van de goedgekeurde voorpaginaschets. De opdracht vraagt dezelfde stijl op de nieuwe bowlpagina en een bowl die bij selectie naar voren komt. De selectiestaat is een nieuwe interactie, geen pixelkopie van een eerdere detailmock.

Preview: http://127.0.0.1:4173/bowls/index.html . De knop Bekijk de bowls op de voorpagina verwijst hiernaar.

## Bewijs

In `outputs/fitbite-bowls-interactief-2026-11-10/` vanaf projectroot:

- `01-tafel.jpg`, `02-salmon.jpg`: browserscreenshots op 390×844 CSS px, export 390×844 px.
- `stijlvergelijking.jpg`: bron en nieuwe tafelpagina naast elkaar op dezelfde 390×844-verhouding; geen extra density-scaling.
- `tafel-naar-bowl.jpg`: tafel en geselecteerde bowl naast elkaar.
- `royal-320.jpg`: lange titel/XL-selectie op 320×740.

De gecombineerde beelden zijn geopend en visueel beoordeeld. Header, tekst en knoppen zijn op deze grootte duidelijk leesbaar; extra crops waren niet nodig. Een detailstaat heeft geen exact eerdere bron; beoordeeld op expliciete wensen: dezelfde zaak, hele bowl zichtbaar, vergrijzing, crème bediening, geen witte productkaart.

## Bevindingen en correcties

1. P2: focus op formaatkeuze kon de interne container enkele pixels scrollen, waardoor de header bovenaan afsneed. `overflow:clip` gebruikt voor de scènelaag. Nieuwe capture bevestigt appTop=0, scrollY=0, app.scrollTop=0 en een complete header.
2. P2: eerste bewijsopname was vóór het decoderen van alle WebP-lagen, met ontbrekende bowls. Per bowl zichtbaarheid nu pas na decode; definitieve tafelcapture na acht geladen lagen. Geen kapotte afbeeldingen.
3. P2: enkele nummers bij bowls werden door de opstelling overlapt. De decoratieve nummers verwijderd. De bowls blijven direct aanklikbaar; een volledige namenlijst is beschikbaar.
4. Functionele eerste-load fout door oude gecachete catalogus: versieparameter toegevoegd aan gewijzigde gedeelde scripts. Na herladen geen nieuwe runtimefouten; het log bevat nog één historische fout van 19:25:28 UTC vóór de correctie.

## Verplichte visuele oppervlakken

- Typografie: dezelfde Futura/Outfit en Optima/Candara-keuze als de voorpagina; naam 36–49 px, leesbare ingrediënten en 44+ px formaatbediening. Lange XL-titel past op 320 px.
- Ruimte en indeling: bestaande 500 px maximale breedte, header/gutters overgenomen, volledige mobiele scèneruimte. Meer verticale spreiding dan de homepage om acht afzonderlijke gerechten aan te kunnen tikken. Detailbowl geheel zichtbaar, geen horizontale overflow op 320×740 of 390×844.
- Kleuren: bestaande crème en warme houtkleuren behouden. Achtergrond wordt gedimd/vergrijsd bij selectie; de gekozen bowl behoudt kleur.
- Beelden: negen nieuwe fotolagen uit ingebouwde ImageGen, op basis van de bestaande scène. Transparante bowls bewegen zonder ingrediëntenwissel tijdens de interactie. Native bronbestanden en prompts/provenance in `media/`. Runtime WebP-lagen samen circa 1,6 MiB. Geen Higgsfield-credits gebruikt. Kleine veranderingen in schermdetails en foodstyling tegenover de oude homepage zijn generatieve verschillen; dit zijn conceptbeelden, geen echte nieuwe restaurantopnamen.
- Inhoud: acht bowls uit het bestaande foodbrief. Medium/Large voor gewone bowls en XL voor Royal. Geen onbevestigde prijzen verzonnen. De interface vermeldt Bestelproef · prijzen volgen. Recepten en gegenereerde voedselbeelden moeten vóór productie nog door de zaak bevestigd worden.

## Interacties en gegevens

In browser getest: voorpagina → Bekijk de bowls; alle acht gerechten afzonderlijk aanklikbaar; terug naar tafel; namenlijstselectie; ingrediëntenvenster; Medium/Large; XL; toevoegen Fresh Salmon Large; juiste naam/maat/ingrediënten in gedeelde mand; aansluiting naar kassascène zonder betaling. Tijdelijke testbowl weer via UI verwijderd, oorspronkelijke Korean Chicken bleef behouden.

Node-invariantcontrole: acht unieke product-ID's, onbekende productnaam valt veilig terug, bestaande menuhoeveelheden blijven behouden, acht signature-recepten en een bestaande eigen bowl overleven de normalisatie. JavaScript-syntax gecontroleerd.

Reduced-motion schakelt de beweging uit via dezelfde mediaquery; code gecontroleerd, geen fysieke iPhone of OS-reduced-motion-test. De beweging is een interactief fotolaageffect, geen vrije 3D-reconstructie. De bestaande checkout blijft een demo en behoudt zijn eigen huidige vormgeving.

## Follow-up polish

P3: ingrediënten en exacte productfotografie laten goedkeuren vóór publicatie; overgang van de oorspronkelijke samengestelde homepagefoto naar de losse bowlopstelling kan later fotografisch nog strakker aansluiten. Geen open P0/P1/P2 binnen deze prototype-opdracht.

## Implementatiechecklist

- [x] Dezelfde stijl en echte logo overgenomen
- [x] Acht afzonderlijk selecteerbare bowls en behoud van beeldidentiteit tijdens beweging
- [x] Detail, formaat, mand en terugroute werkend
- [x] Mobiele browserbeelden gecontroleerd en oorspronkelijke mand behouden
- [x] Geen betaalactie of productiepublicatie

final result: passed

## Update — vier XL-specials en Higgsfield-bronnen

De actuele Takeaway-indeling en gebruikersbevestiging vervangen de acht zichtbare vaste bowls door vier XL-specials. De oude ID's blijven voor bestaande mandjes bewaard.

Bewijs in `outputs/fitbite-xl-menu-2026-11-10/`: `01-xl-tafel.jpg`, `02-crousty-vooraan.jpg`, `03-sidebowl-keuzes.jpg`, `04-voorpagina-xl.jpg`, `05-drie-routes.jpg` op 390×844; `06-klein-scherm.jpg` op 320×740. Voorpagina en geselecteerde bowl visueel geopend en beoordeeld. Dezelfde crème kleuren, fonts, header en restaurantomgeving; volledige productsilhouetten, bestelknop en lange titel passen op klein scherm. Nieuwe Crousty/Sidebowl zijn brongebaseerde conceptfotolagen. Afbeeldingen wijzigen niet dynamisch met de Sidebowl-portiekeuzes; dat staat bij de keuze uitgelegd.

Gecorrigeerd: gecachete builder-CSS veroorzaakte groot logo; cacheversie toegevoegd. Foto/alt van proteïnebowl-intro aangepast naar keuken zonder rijstbeeld. Sauzen-defaults Sidebowl behouden na form reset. Ontbrekende schepbeelden tonen geen onjuiste variant of kapotte URL. Algemene checkout blijft visuele bestelproef.

Getest: syntax vier scripts; vier unieke zichtbare XL-producten; normalisatie legacy bowl; vier porties met duplicaten; afwijzen ongeldige portietelling; routekeuzes blijven bewaard. Browser: Sidebowl toevoegen met twee Nuggets-porties, Teriyaki/Sriracha mayo en crispy ui; juiste gegevens in mand; verwijderen testitem. Proteïnebowl: vijf mix-ins verplicht, zesde geweigerd, toevoegen en gegevens behouden in andere route. Crousty: groentenstap overgeslagen, één proteïne nodig, maximaal twee sauzen. Voorpagina naar XL, modal met drie routes. Oorspronkelijke mand behouden, geen echte betaling. Geen nieuwe browserwaarschuwingen of fouten.

Beperking: nog geen fysieke gsmtest; drie nieuwe proteïneschepbeelden en receptspecifieke kassafoto's zijn volgende beeldbewerking, niet als afgerond gepresenteerd. Volledige oude root-menu nog niet vervangen. XL-hoofdflow en routegedrag geslaagd als lokale ontwerp-/bestelproef.

## Rechthoekige Crousty en bestelreis — 10 november 2026

Gebruiker leverde rechthoekig Crousty-bakje aan en vroeg de bewegende mobiele route naar ingepakte bestelling bij de kassa te zien. Vervangt de ronde Crousty-laag op voorpagina en XL-tafel. Nieuwe open en gesloten assets behouden hetzelfde bakje en recept; oorspronkelijke kassafoto als achtergrond zonder oude ronde verpakking. Ingebouwde ImageGen, geen Higgsfield-credits.

Interactie: tafel → selectie (850 ms) → productinformatie → toevoegen → Naar de kassa (1,8 s camerabeweging) → verpakking (900 ms). Demonstratieknop speelt dit af zonder mandmutatie. Gesloten bakje blijft ook op het bestaande afrekenscherm zichtbaar als de laatst toegevoegde bowl de Crousty is. Reduced-motion slaat de bewegingen over. Terug en replay annuleren actieve checkoutanimaties; een eigen keuze/add onderbreekt automatische demo.

Browser getest op 390×844 en 320×740. Hele tray en bediening zichtbaar, geen consolefouten. Normale add→checkout→mand getest; juiste Crousty opgeslagen. Mand→afrekenen toont dezelfde rechthoekige verpakking. Tijdelijke testitems verwijderd, oorspronkelijke Korean Chicken behouden. JavaScript-syntax beide gewijzigde scripts gecontroleerd.

Bewijs `outputs/fitbite-crousty-bestelreis-2026-11-10/`: detail/kassa/screenshots, 220 browserframes met echte timing en `bestelreis-gsm.mp4` (390×844, 9,33 s). MP4 lokaal met macOS AVFoundation gecodeerd; frame op seconde 7 gedecodeerd en visueel correct/rechtop beoordeeld. Dit is de werkelijk uitgevoerde UI, geen los nagemaakte video. Geen betaling gestart.

Beperkingen: fotolaagovergang en verpakkingcrossfade; geen vrije 3D-wandeling of exacte fysische dekselbeweging. Generatieve cameravariant van aangeleverd product. Ander XL-recept gebruikt nog algemene ronde verpakking; nieuwe exacte verpakkingsidentiteit specifiek voor de gevraagde XL Crousty. Prijzen/betaling blijven demo.
