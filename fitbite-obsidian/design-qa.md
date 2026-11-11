# Design-QA — gekozen Fitbite-voorpagina

Datum: 3 november 2026

**Findings**
Geen resterende P0/P1/P2-afwijkingen binnen deze lokale homepage en de ene goedgekeurde videoproef. De foto is bewust uitgebreid met camerabeweging. De bestaande lokale productdemo blijft de bestemming van bestelknoppen; dit is geen kopie van de Base44-orderbackend.

**Bewijs en vergelijking**
Bron: https://savory-ease-copy-ae387405.base44.app/.
Implementatie: http://127.0.0.1:4173/ en index.html in deze map.
Alle onderstaande bestanden staan in references/savory-source/.

- Desktop, CSS viewport 1280×720: desktop-top-final.jpg en implementation-desktop-top.jpg, beide 1274×717 pixels. Volledige pagina: desktop-full.jpg en implementation-desktop-full.jpg, beide 1274×2229 pixels. Beide paren samen in dezelfde beeldinvoer visueel beoordeeld.
- Mobiel, CSS viewport 390×844: mobile-top.jpg en implementation-mobile-top.jpg; mobile-bottom.jpg en implementation-mobile-bottom.jpg. Alle vier 384×831 pixels. De browsercapture schaalt beide evenveel; daarom geen aanvullende normalisatie nodig.
- Mobiele menu-overlay: mobile-menu.jpg en implementation-mobile-menu.jpg, beide 390×844 pixels. De bron stond onderaan en de implementatie bovenaan: alleen de overlay, typografie, sluitknop en links vergeleken; de doorschijnende pagina erachter is bewust een andere scrollstaat.
- Extra responsive controle: implementation-mobile-375.jpg bij CSS 375×667; geen horizontale overflow, alle zichtbare afbeeldingen geladen.
- Detailvergelijking: mobiele bovenkant en footer op leesbare schaal; alle CTA's, tekstregels, logo en navigatie-iconen zichtbaar. Video-begin, -midden en -einde naast de originele foto: video-begin-comparison.jpg, video-middle-comparison.jpg en video-end-comparison.jpg.

**Vijf verplichte oppervlakken**
- Typografie: dezelfde Inter en Outfit lokaal opgeslagen; gewichten, hoofdletters, regelafbreking en tracking sluiten visueel aan. Fonts waren geladen tijdens browsercontrole.
- Ruimte en indeling: dezelfde herohoogtes, 24px hoeken, marges, tweekoloms productbeelden/categorieën en mobiele footer. Geen overlap of afgesneden bediening waargenomen.
- Kleuren: originele CSS met roomwit, donkergroen, actiegroen en bannergradient behouden. De scrolled-header toont dezelfde lichte achtergrond.
- Beeld: originele logo-, hero- en productbestanden gekopieerd. Een gegenereerde 1080p-clip is toegevoegd aan de hero. Camerapositie/crop en kleine generatieve textuurverschillen zijn een bewuste afwijking; geen duidelijke smeltende of zwevende bowls gezien in de drie controles. Andere productfoto's blijven exact het bronmateriaal, met een kleine hover/focus-zoom.
- Inhoud: homepagecopy, adres, contactgegevens en openingsuren overgenomen. De generieke Instagram-link uit de bron blijft een bekende bronbeperking. Menu/checkout gebruiken de eerdere lokale demo en geven dat expliciet aan.

**Controle en herstelhistorie**
1. Tijdens eerste integratie blokkeerde een onjuiste selectorhelper de navigatie-/motionhandlers. Hersteld naar de arrayhelper. Na herladen werken zoeken, menu, video en cart. Geen nieuwe consolefouten in de laatste controle.
2. [P2] De zoekhulp suggereerde zalm en smoothie, terwijl alleen Engelse/individuele productnamen werden doorzocht. Nederlandse en categoriezoekwoorden toegevoegd. Browserbewijs na herstel: zalm geeft Fresh Salmon Bowl; smoothie geeft vier resultaten.
3. Daarna bron en definitieve implementatie samen vergeleken op desktop, mobiel en in de footer. Geen resterende visuele fixes nodig.

**Geteste interacties**
Bestel nu opent bowlselectie. Zoeken en categoriewissel werken. Tropical toegevoegd en weer verwijderd, bestaande Korean Chicken Bowl in de mand behouden. Menu openen/sluiten en Contact-scrollanker werken. Clip laadt op 1920×1080, speelt 5,041667 seconden, kan pauzeren, blijft op het laatste frame staan en speelt opnieuw na een tik. Reduced-motion-code en CSS statisch nagekeken; geen wijziging van OS-instellingen. Afspelen pauzeert buiten beeld en bij verborgen tab via IntersectionObserver/visibilitychange.

**Open punten en testgrenzen**
Geen fysieke iPhone/Safari-prestatiemeting. Geen volledige toegankelijkheidsaudit. Geen echte bestelling, betaling of bezorgkoppeling. Volledige interactieve ingrediëntenbouw en proteïne-inslag blijven afzonderlijk productiewerk. Er is één betaalde videoproef gemaakt; geen tweede generatie.

**Implementation Checklist**
- [x] Bronbeelden en fonts lokaal
- [x] Desktop/mobiel vergelijken
- [x] Video en pauze/replay
- [x] Menu, zoeken en cart controleren
- [x] Zoektermen herstellen en opnieuw controleren
- [x] Bewijs en herkomst bewaren

final result: passed
