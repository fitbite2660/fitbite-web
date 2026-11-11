> Actueel sinds 3 november 2026: de gebruiker koos daarna de Savory-voorpagina met één realistische videoproef. Zie ../design-qa.md en savory-source/. Onderstaande mapping beschrijft de bewaarde Soda-uitvoering (../soda.html); de openstaande 3D-eisen blijven gelden.

# Fitbite Obsidian — implementatiestatus

3 november 2026 · scope: deze bestaande map aanpassen aan de door de gebruiker gekozen Soda-template.

**Gerealiseerd:** een Fitbite-homepage met Soda's compositie, een blauwe bowl als eerste productbeeld, vier categorieën en behoud van de bestaande winkelmand en deelfuncties. De actieve app staat in één `index.html` met inline CSS en JavaScript; `style.css` en `app.js` zijn ongewijzigde, niet-ingeladen legacybestanden. De hero gebruikt fotografische uitsneden en categoriebeelden met beweging. Dat is geen echte interactieve 3D of werkende Bowl Builder. Uitvoering en controles staan in het [uitvoeringsplan](</Users/adnane/Documents/ChatGPT/website FB/docs/superpowers/plans/2026-11-03-fitbite-soda.md>).

## Bronnen en voorrang

- [Soda-template](Soda-template.md): gekozen visuele compositie, radiale achtergrond, glasknoppen, centraal product en categoriewissel.
- [Fitbite-briefing](Fitbite-briefing.md): volledige langetermijnvisie, ongewijzigd bewaard.
- [Werkplan v0.5](</Users/adnane/Documents/ChatGPT/website FB/outputs/Fitbite-werkplan-en-storyboard-v0.5.md>) en [macro-interactie](</Users/adnane/Documents/ChatGPT/website FB/outputs/Fitbite-saladette-macro-interactie.md>): laatste bevestigde antwoorden. De vlucht bij de volgende groente en de combinatie echte macro + interactieve 3D zijn **gekozen**, ook al noemt de oudere briefing de vlucht nog een voorstel.
- [Inventaris 3 november](</Users/adnane/Documents/ChatGPT/website FB/outputs/Fitbite-inventaris-2026-11-03.md>): afgebakende controle van bereikbaar bronmateriaal; geen claim dat alle historische uploads of chats compleet zijn.

## Briefing → uitvoering

| Eis of keuze | Concrete invulling | Status in deze map |
|---|---|---|
| Gekozen Soda-template | Centrale productpresentatie, grote koppen, radiale kleur, glasnavigatie, categoriekaarten en beweging, vertaald naar Fitbite. | Gerealiseerd en in browser bekeken; geen claim van exacte 3D-reproductie. |
| Blauwe bowl eerst; vier categorieën | Pokébowls als start, daarnaast Crousty, Korean chicken en Smoothies. | Gerealiseerd; snelle categoriewissels gecontroleerd. |
| iPhone in portret; eten krijgt de ruimte | Compacte bediening en dominante productvisual; desktop schaalt mee. | Getest op browserviewports 390 × 844 en 375 × 667; geen fysieke iPhone-test. |
| Herkenbare zaak en producten | Bestaand Fitbite-logo en eigen beschikbare productbeelden gebruiken. | In homepage verwerkt; nog geen restaurantreconstructie. |
| Bestaand bestellen en delen | Hele menu-items kiezen, aantallen wijzigen, localStorage, demo-afronden, deelkaart/export. | Behouden en opnieuw getest; PNG-export geslaagd, geen externe deelactie verstuurd. |
| Basis → groenten → proteïne → toppings | Stappen strikt in die volgorde; groenten aanwezig vóór proteïne, toppings pas na keuze. | Niet gerealiseerd; homepagecategorieën zijn geen builderstappen. |
| Plaats van sauzen | Met gebruiker afstemmen; geen positie als definitief behandelen. | Open ontwerpbeslissing. |
| Exact dezelfde aanpasbare bowl | Gekozen ingrediënten bewaren bij wijzigen, teruggaan en toevoegen; geen dubbele porties. | Niet gerealiseerd; huidige mand telt complete producten. Een vaste voorbeeldfoto legt geen klantselectie vast. |
| Rechtstreeks saladettebak aantikken | Klik-/tikzones op de echte bakken met correcte ruimtelijke indeling. | Niet gerealiseerd. |
| Eerste keuze mango | Alleen extreme echte macro: vezels, snijvlak, vocht en glans; nog geen vlucht. | Gekozen, niet gerealiseerd. Een uitvergrote overzichtsfoto voldoet niet. |
| Volgende keuze avocado | Avocado verschijnt als macro terwijl de eerder gekozen mango eenmaal naar dezelfde bowl vliegt. | Gekozen, niet gerealiseerd. |
| Verder en snel tikken | Laatste geselecteerde groente landt bij Verder; nieuwste macro blijft leesbaar, geen verlies of dubbele landing. | Gekozen, niet gerealiseerd. |
| Echte macro + interactieve 3D | Echte foto/film levert detail; afzonderlijke 3D-objecten leveren wijzigbare vlucht en landing. | Gekozen productieroute voor de latere kwaliteitsproef; deze homepage gebruikt fotografische uitsneden. |
| Proteïne- en restaurantlocaties | Kip uit de warmhouder; zalm uit de saladette naast de sauzen. Camerawissel volgt de echte indeling. | Niet gerealiseerd; geen fictieve keuken toevoegen. |
| Luik onder de tv en echte bar | Luik als mogelijke doorgang naar de keuken; bij afrekenen voor de echte bar eindigen. | Ontwerpvisie, niet gerealiseerd. Meta-brilperspectief blijft inspiratie, geen definitief gekozen stijl. |
| Proteïne-inslag | Geloofwaardige krachtige vlucht/inslag; blauwe keramiek barst/breekt met gewicht, licht en timing. | Niet gerealiseerd in deze map. De afgewezen procedurele proef is geen goedgekeurde visuele richting. |
| Overgang naar echte verpakking | Dezelfde rijst, groenten en proteïne belanden in ronde bruine kartonnen bowl; geen keramiekscherven in het eten. | Niet gerealiseerd; selectiecontinuïteit moet aantoonbaar blijven. |
| Filmische categorieovergangen | Beweging, timing en ruimtelijkheid beoordelen; alleen fade/draaiing bewijst niet de gevraagde effectkwaliteit. | Fotografische Soda-overgangen gebouwd en gecontroleerd; de hogere briefingambitie is hiermee niet bewezen. |
| Bronbehoud en eerlijke techniek | Originelen, briefing en eerdere studies behouden; Base44 ongemoeid. Geen video of 2D-parallax als interactieve 3D benoemen. | Geen Base44-acties uitgevoerd. Geen fictieve homepagebeloftes, reviews of awards toegevoegd. |

## Geverifieerd in deze uitvoering

Browsercontrole door de uitvoerende agent: desktop **1280 × 720**, mobiel **390 × 844** en **375 × 667**. Na herstel ligt op 375px de bestelknop met onderrand **577px** boven de vaste navigatie met bovenrand **600px**; `scrollWidth` is **375px**. De drie gemelde reviewissues zijn daarna ook in de code opnieuw gecontroleerd: navigatieruimte/overflow, focusherstel na Crousty-film en focusbehoud na mandwijziging.

| Controle | Geobserveerd resultaat |
|---|---|
| Snel Korean → Smoothies → Korean | Navigatie, CTA, productbeeld en deelkaart eindigen op Korean. |
| Toevoegen, plus/min, herladen | Aantallen kloppen; twee items blijven na herladen bewaard. |
| Afhalen afronden | Demosucces getoond, mand daarna leeg; niets besteld of betaald. |
| Bezorgen kiezen | Adresveld verschijnt. |
| Crousty-film → menu → sluiten | Focus keert terug naar `#hero-order`, met DOM-meting bevestigd. |
| Plus met Enter; laatste item verwijderen | Focus blijft op dezelfde plusknop; na verwijderen van het laatste item op de dialoogkop. |
| Animaties pauzeren | Werkt; Crousty-menu opent zonder film. |
| Storykaart bewaren | PNG-export geslaagd; bewijsbestand: [geverifieerde-storykaart.png](geverifieerde-storykaart.png). |
| Browserconsole | Geen errors of warnings tijdens de controles. |

**Beperkingen:** geen fysieke iPhone-test; OS-reduced-motion alleen beoordeeld via codecontrole; geen externe deelactie verstuurd. Deze controles bewijzen de genoemde homepage- en demofuncties, niet de interactieve bowl-, macro- of inslagvisie.

## Beschikbaar en nog nodig

De eerste code-inventaris van deze map bevat **17 lokale assets**: Fitbite-logo, vier hero-afbeeldingen, product-/lagenbeelden en drie video's. Dat aantal beschrijft de beginsituatie vóór deze aanpassing, niet de volledige werkmap. De bestaande code gebruikt afbeeldingen/video en CSS-parallax; de enige canvasfunctie maakt een deelkaart.

Echte saladette-, bar- en restaurantreferenties plus blauwe-bowlbeelden zijn elders in de werkmap bereikbaar volgens de inventaris. Deze beelden ondersteunen uiterlijk en camerageografie; er is geen gevalideerde maatvaste restaurantscan aangetoond.

Voor de gekozen interactieve vervolgscène ontbreken nog gevalideerde schone mango- en avocadomacro's, passende losse fotorealistische 3D-ingrediënten, een gevalideerd interactief 3D-model van de blauwe bowl en een opname met duidelijk herkenbare mango-/avocadobakken. De fotografische bowl-uitsnede op de homepage vervult die 3D-rol niet. Bowl met alleen rijst, losse porties en consistente belichting zijn aanvullende productiebenodigdheden. De bestaande kleine mangouitsnede met sesam is ongeschikt als extreme macro of zuiver ingrediëntasset. Voor inslag/verpakking ontbreken in deze map bovendien gevalideerde breuk-, overdrachts- en kartonnen-bowlassets.

Een statische hero bewijst de interactieve beeldkwaliteit niet. De latere proef moet eerst saladette → mango → avocado → Verder overtuigend en correct tonen, inclusief wijzigingen, snel tikken, minder beweging en een fysieke iPhone-controle, vóór uitbreiding naar proteïne-inslag en de volledige restaurantreis.
