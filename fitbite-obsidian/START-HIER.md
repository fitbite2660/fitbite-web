# Fitbite — volledige overdracht, 11 november 2026

Dit document vervangt de chat als startpunt voor de volgende bouwer. De bronbestanden in het archief zijn de actuele bestanden op het overdrachtsmoment, niet opnieuw gegenereerd of ingekort. Sommige oude ontwerpvarianten zijn bewust behouden; hun status staat hieronder.

## Dit codepakket gebruiken

Dit ZIP bevat uitsluitend tekst: 91 oorspronkelijke sitebestanden in hun originele mappenstructuur, dit START-HIER.md en twee menubestanden. De eerdere telling van 95 omvatte ook vier SVG-afbeeldingen; die zijn hier bewust niet opgenomen. De oorspronkelijke HTML/CSS/JS/JSON/Markdown/TXT-bestanden zijn ongewijzigd.

1. Pak `fitbite-code.zip` uit in een lege projectmap.
2. Open een terminal in die map.
3. Start met `python3 -m http.server 4173 --bind 127.0.0.1` (Windows: `py -m http.server 4173 --bind 127.0.0.1`). Er is geen apart startscript meegeleverd of nodig.
4. Open `http://127.0.0.1:4173/voorpagina/index.html`.

**Dit is een code-export: afbeeldingen, video's, SVG's en fontbestanden ontbreken bewust.** Verwijzingen naar deze media blijven in de originele code staan. Zonder de afzonderlijk bewaarde media is de visuele preview niet compleet. Herstel media later op hun oorspronkelijke paden voor het volledige ontwerp.

De nieuwste homepage is `voorpagina/index.html`. De `index.html` in de hoofdmap is een oudere versie. Er is geen npm-installatie of build nodig. Browsermandjes worden niet meegenomen.

## Actuele routes

| Route onder de sitehoofdmap | Functie |
|---|---|
| `voorpagina/index.html` | Nieuwe mobiele ontdekpagina: Croustys → XL bowls; logo, categorieën, scrollovergang |
| `voorpagina/index.html#bowls` | Direct naar de XL-scène |
| `bowls/index.html` | Vier XL-specials op tafel, gekozen bowl naar voren, ingrediënten, toevoegen |
| `bowls/index.html`, knop Speel de bestelreis af | Demonstratie met rechthoekige XL Crousty → kassa → ingepakt; zonder mandmutatie |
| `eigen-bowl/index.html?type=poke` | Eigen pokébowl |
| `eigen-bowl/index.html?type=crousty` | Eigen Crousty |
| `eigen-bowl/index.html?type=protein` | Eigen proteïnebowl zonder rijst |
| `eigen-bowl/index.html?bestelling=mand` | Nieuw bestellingsoverzicht met foto's, aantallen, ingrediënten en verwijderen |
| `eigen-bowl/index.html?bestelling=kassa` | Kassascène; alleen proefbetaling |
| `eigen-bowl/index.html?voorbeeld=sauzen` | Ontwerpvoorbeeld van de sausfase |
| `eigen-bowl/index.html?voorbeeld=toppings` | Ontwerpvoorbeeld van de toppingsfase |

## Bestanden waarmee je doorbouwt

- `voorpagina/index.html`, `page.css`, `page.js`: homepage, header, navigatie en scrollscènes.
- `bowls/index.html`, `page.css`, `page.js`: fotolagen op tafel, productselectie, Sidebowl-porties, bewegende kassareis.
- `assets/menu-products.js`: gedeelde catalogus, product-ID's, oude menucompatibiliteit, normalisatie en groepering van gelijke bowls.
- `eigen-bowl/index.html`, `builder.js`: samenstellen, mand, aantallen en checkout.
- `eigen-bowl/page.css`, `keuzestijlen.css`, `keuken.css`, `afwerking.css`: basis, ingredientkeuzes, keuken en eindscènes.
- `eigen-bowl/angles.js`: wisselen van saladettehoek.
- `voorpagina/media/`, `bowls/media/`, `eigen-bowl/media/`, `eigen-bowl/openingsbeelden/`: huidige beelden. Behoud relatieve paden.

## Wat werkt

- Mobiele ontdekpagina met warme restaurantfoto's en crème bediening.
- Eigen Fit Bite-logo naast Fitbite-woordmerk; PUURS vervangen in de actieve headers.
- Vier XL-producten direct aanklikbaar op tafel; hetzelfde productbeeld beweegt naar voren. Achtergrond wordt grijs/donker; geen witte productkaart.
- XL Crousty gebruikt de aangeleverde rechthoekige fiber tray, niet meer de ronde bowl. Er zijn passende open en ingepakte beeldvarianten.
- Bij Naar de kassa beweegt een productlaag over een wisselende restaurantachtergrond; bij de Crousty volgt deksel/papierband via een zachte beeldwisseling.
- Sidebowl: vier verplichte porties, herhaling toegestaan, twee sauzen, optionele crispy ui.
- Drie eigen-samenstelroutes met verschillende stapvolgorde en geldende limieten.
- Mand met productfoto's waar beschikbaar, aantallen, verwijderen en uitklapbare samenstelling. Alleen identieke recepten worden gegroepeerd. Andere maat, saus, route of porties blijven aparte regels.
- Bewaren in lokale browseropslag en herladen. Oud menu en nieuwe bowlmand worden samen geteld.
- Kassascène met besteloverzicht. De knop Online betalen uitproberen toont alleen een lokale bevestiging; er is geen betaling.
- De belangrijkste animaties hebben een reduced-motion-alternatief.

## Grenzen, half af en bekende risico's

1. Geen echte 3D-reconstructie: de huidige oplossing gebruikt transparante foto's, CSS-transformaties en de Web Animations API. De overgang is geen vrije wandeling door een gescande zaak.
2. Nieuwe hoofdroute heeft geen prijzen, rekent geen totaal en kent geen echte bezorgkosten/toeslagen. De tekst Bestelproef · prijzen volgen is opzettelijk. Oude demo's bevatten andere proefprijzen; neem die niet automatisch over.
3. `index.html`, `soda.html`, `montage-preview.html`, `kaarten/` en `bestelproef/` zijn oudere/alternatieve uitvoeringen. De link Het volledige menu op de nieuwe homepage gaat nog naar de oudere root-menu-uitvoering. Dat oude menu is niet volledig gelijkgetrokken met de nieuwe Takeaway-indeling.
4. Exacte nieuwe schepbeelden voor Nuggets, Crispy tenders en Gegrilde zalm ontbreken. De builder toont bij deze keuzes de naam/keuken zonder onjuist ingrediëntbeeld. Niet elk ingrediënt heeft dus al een eigen animatiebeeld.
5. Voor zelf samengestelde bowls wordt geen unieke productfoto opgebouwd. In de mand is het logo de veilige terugval als er geen exact productbeeld is.
6. De XL Sidebowl-foto is een voorbeeldmix en verandert niet met de gekozen vier porties. Dit wordt in het keuzevenster vermeld.
7. De specifieke rechthoekige verpakking is uitgewerkt voor XL Crousty. Andere XL-producten gebruiken nog het algemene ronde kassabeeld. Bij een gemengde mand toont de builder de Crousty-verpakking als de laatste bowl-entry een Crousty is; er worden niet meerdere ingepakte gerechten getoond.
8. De volle poké-modifierlijst van Takeaway is niet volledig gecontroleerd. De pokéroute gebruikt de bestaande proefset. Bij poké zijn groenten/proteïne/sauzen/toppings niet als volledig restaurantrecept verplicht gemaakt.
9. Eigen Crousty/proteïnebowl bewaren intern `size: Medium` voor compatibiliteit, maar tonen geen Medium/Large-keuze. Hun zichtbare maatlabel is Jouw samenstelling.
10. Browseropslag is lokaal en kan geblokkeerd of gewist worden. Mandmutaties in de nieuwe overzichtsfuncties melden opslagfouten; oudere codepaden vangen sommige opslagfouten stil af. Geen servervalidatie of voorraadgarantie.
11. Oude gerechten blijven in de gedeelde catalogus voor bestaande mandjes; dit betekent niet dat ze als actuele vaste bowl op de nieuwe XL-tafel worden aangeboden.
12. Oude documentatie/bronpagina's bevatten oude externe URL's, lokale machinepaden of afgekorte historische broncaptures. De overdracht kopieert die bestanden exact; het zijn geen actuele runtimevereisten. De aanvullende bestandenlijst en verwijzingscontrole staan in het eerdere volledige werkarchief, niet in dit codepakket. Oude `/menu/...`-links worden bij klikken door JavaScript afgehandeld; rechtstreeks openen van die paden op een eenvoudige statische server geeft geen afzonderlijke pagina.
13. Getest op browserformaten 390×844 en 320×740, eerder ook enkele andere formaten. Geen fysieke iPhone/Android-test of volledige browsermatrix afgerond.
14. De nieuwe gang naar de kassa en de bestaande volledige mand/checkout zijn verbonden, maar vormen nog geen productieklare bestelling met fulfilmentstatus.

## Nog niet gebouwd

- Productiebackend/database en centrale menubeheerfunctie.
- Orderverwerking naar keuken/kassa, bevestigingen en ordernummers.
- Echte online betaling en betaalstatus via bijvoorbeeld Mollie/Stripe/Bancontact.
- Definitieve prijzen, toeslagen, btw-/bezorgberekening en promotieregels.
- Complete nieuwe vormgeving en actuele producten voor voorgerechten, desserts, smoothies en koude dranken.
- Volledige afhaal-/bezorgflow, tijdslots, adresvalidatie en restaurantbeschikbaarheid.
- Definitieve allergenen-/dieetinformatie en productbeschrijvingen gecontroleerd door de zaak.
- Alle persoonlijke bowl-/verpakkingsvarianten, een volledige zaakscan en echte 3D-assets.
- Productiehosting, domein, releaseproces, monitoring en complete toegankelijkheids-/prestatiecontrole.

## Ontwerpafspraken

Gsm eerst. Volledige fotografische scène; producten groot, smakelijk, verschillend en kleurrijk. Echte zaak als referentie: lattenwand, donker antraciet werkblad, keukenluik en kassa moeten herkenbaar blijven. Keuzes moeten de klant door de zaak meenemen. Geen generieke witte kaarten onder de bowl; bij informatie wordt de achtergrond vergrijsd en blijven crème letters zichtbaar. Het hele gerecht moet in beeld blijven.

Kleuren huidige hoofdroute: crème `#f4e8d3`, inkt `#221b15`, donkere basis `#211b16`/`#261d15`; builderpapier `#fffaef`, rustige tekst `#e4d8c7`. Blauwe interfacebalken zijn vervangen door crème; productkleuren blijven wel toegestaan.

Typografie: `Futura, 'Futura Medium', Outfit, sans-serif` voor koppen; `Optima, Candara, 'Segoe UI', sans-serif` voor gewone tekst. Outfit is lokaal als WOFF2 aanwezig. Futura/Optima zijn systeemfonts, dus een andere machine kan op de fallback uitkomen. Inter WOFF2 is aanwezig voor de oudere site. De exact genoemde voorbeelden C/E uit de ontwerpfase zijn niet als losse fontbestanden gearchiveerd; de concrete huidige CSS is leidend.

Eigen poké: achter bar/formaat → saladette/groenten → keuken/proteïne op portioneerlepel → luik/sauspompen → andere saladettehoek/toppings → keuze verder menu of afrekenen → ingepakt aan kassa. Eigen Crousty slaat groenten over. Eigen proteïnebowl kiest eerst proteïne, daarna precies vijf mix-ins, zonder rijst.

Groenten die uit de lucht vallen en een exploderende bowl zijn bewust verlaten. De gekozen richting is een rustige, herkenbare bestelreis met productfocus en camerabeweging. Geen ongevraagde nieuwe Higgsfield-generaties; eerdere betaalbudgetten golden voor afzonderlijke generaties, niet als doorlopende toestemming.

## Architectuur en overdraagbaarheid

Gewone HTML/CSS/JavaScript. Geen framework, package.json of bundler nodig voor de actuele hoofdroute. Browser-API's: DOM, native dialog, URLSearchParams, localStorage, history, requestAnimationFrame, matchMedia, Web Animations API, image.decode(), crypto.randomUUID(), structuredClone(). Gebruik een recente browser en localhost of HTTPS voor de UUID-functie.

Opslag:
- `fitbite:saladette:proefmand:v1`: array individuele bowls met id, size, eventueel signature/kind, vegetables, protein, sauces, toppings en bij Sidebowl portions.
- `fitbite-obsidian-cart`: oud object product-ID → aantal, gedeeld zichtbaar in de nieuwe mand.
- `fitbite.video-order-demo.v1`: oudere onafhankelijke Fresh Salmon-videoproef.

`normalizeBowl` valideert/herstelt opgeslagen gerechten. `bowlKey` maakt een receptidentiteit, `groupBowls` groepeert gelijke entries. Plus voegt een gekopieerde entry met nieuwe UUID toe; min verwijdert één entry; verwijderen verwijdert de hele identieke groep. Daardoor blijven bestaande tellers werken zonder schemawijziging. Oude menu-items blijven een aparte opslagstructuur.

De statische deploy heeft geen API-sleutels of Higgsfield-login nodig. Higgsfield en ingebouwde ImageGen zijn gebruikt bij assetproductie, niet als live websitebackend. Bronnen en jobmetadata staan in JSON/promptbestanden. Media waren lokaal aanwezig in het volledige project, maar zijn niet opgenomen in dit codepakket. Browsermandjes zijn bewust geen projectbestanden en zitten niet in de export.

## Testen en verder werken

- Start altijd bij voorpagina/index.html; controleer ook de directe mandlink met lege opslag.
- Test iedere XL, de vier-portie Sidebowl, alle drie routes, terugnavigatie, duplicaten, verwijderen en herladen.
- Controleer productidentiteit in de Crousty-reis en de kassascène.
- Test 320×740, 390×844, grotere schermen en reduced motion; voer daarna echte telefoonproeven uit.
- Verifieer menukeuzes en websiteprijzen met de eigenaar vóór betaalintegratie.
- Maak één leidende catalogus voor alle routes; ruim verouderde navigatie pas op nadat duidelijk is welke historische ontwerpen behouden moeten blijven.
- Beeldbewerkingen en bewijsopnames staan in het volledige werkarchief. De mp4 `outputs/fitbite-crousty-bestelreis-2026-11-10/bestelreis-gsm.mp4` is een opname van de echte UI-beweging, geen runtime-afhankelijkheid.

## Meegeleverde menugegevens

- `assets/menu-products.js`: oorspronkelijke gedeelde productcatalogus en mandlogica.
- `eigen-bowl/builder.js`: oorspronkelijke samenstelstappen, opties en limieten.
- `MENU-ACTUEEL.md`: alle actuele keuzes en uitleg over ontbrekende websiteprijzen, oude proefprijzen en de eerdere Takeaway-momentopname.
- `MENU-DATA-UIT-CODE.json`: export van de gedeelde catalogus.

De nieuwe hoofdroute heeft geen ingestelde verkoopprijzen en geen echte betaalintegratie. Dit pakket bevat geen afbeeldingen, video's, lettertypen, codebundelduplicaten of andere ZIPs.
