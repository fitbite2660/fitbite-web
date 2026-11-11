# QA — herhalende overgangsproef

Datum: 3 november 2026
Preview: http://127.0.0.1:4173/montage-preview.html
Actieve index.html is byte-voor-byte gelijk aan de backup van vóór deze proef.

## Blokkerende bevinding
[P1] De gegenereerde clip toont niet de overkant van de tafel. Bij 0,05s, 2,0s en 3,8s blijft de opstelling aan de oorspronkelijke voorkant: lichte bowl links, houten bowl centraal, blauwe bowl rechts, sushi linksachter, smoothie en takeaway achteraan. De camerahoek verschuift maar niet ongeveer 180°. De opname is daarom afgekeurd voor het beoogde overkantshot. Geen tweede generatie gestart en geen verbetering gefingeerd met spiegelen.

Bewijs: opposite-begin-comparison.jpg, opposite-middle-comparison.jpg, opposite-end-comparison.jpg en de bijgewerkte opposite-review.html. Beide bronnen staan samen in de vergelijkingsbeelden. De MP4 is 1280×720, 4,041667 seconden, 1.318.585 bytes; SHA-256 staat in ../../assets/savory-hero-opposite.json. Eén geslaagde generatie voor de goedgekeurde 28 credits: 80cb423a-2211-4901-86ac-76b96ada636f. De eerdere 1080p-poging had geen job-ID en werd geweigerd wegens saldo.

## Technische controle
- Afzonderlijke montage-preview.html hergebruikt de oorspronkelijke 1080p-clip plus de nieuwe 720p-clip. Circa 4 seconden per opname, overgang 280ms, herhaling via assets/table-montage.js.
- Vier volledige cycli op desktop en zes op mobiel via DOM-status waargenomen; geen foutstatus of nieuwe consolefouten.
- Desktop 1280×720 en mobiel 390×844; geen horizontale overflow. Beelden/screenshots: montage-desktop-paused.jpg, montage-mobile.jpg.
- Pauzeknop stopt beide video's; hervatten werkt. Buiten beeld pauzeren gecontroleerd. Onbrekend tweede bestand: beide video's stoppen en originele foto blijft zichtbaar; geen zwart vlak.
- Tijdelijke lifecycle-test en regressietest geslaagd: wachten op geladen frame, overgangen, pauze/hervatten, viewport/tabpauze, reduced motion en cleanup. Een race bij snelle pauze tijdens hervatten is hersteld met epoch-/statuscontrole en negeren van verwachte AbortError.
- Geen fysieke iPhone/Safari-prestatiemeting en geen claim dat 720p dezelfde scherpte heeft als 1080p.

## Afbakening
De technische overgangsproef werkt. De oorspronkelijke homepage is niet vervangen omdat de nieuwe media de gewenste overkant niet tonen. Voor het inhoudelijke doel is eerst een betrouwbare referentie van de overkant nodig; daarna pas een afzonderlijk goedgekeurde nieuwe generatie overwegen.

final result: blocked
