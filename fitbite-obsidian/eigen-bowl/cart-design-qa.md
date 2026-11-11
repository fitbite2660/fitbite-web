# Mobiel bestellingsoverzicht — 10 november 2026

Volgende stap na de Crousty-bestelreis. Bestaand mandje krijgt compacte productregels met dezelfde warme donkere zaak, crème typografie en bediening. Geen nieuwe generaties. XL-producten gebruiken hun huidige losse productfoto, oude menu-items hun bestaande beeld; eigen samenstellingen zonder exacte foto gebruiken het Fitbite-logo.

Nieuwe werking:
- Identieke recepten gegroepeerd; afzonderlijke bowl-ID's blijven behouden voor compatibiliteit met bestaande tellers.
- Plus/min (1–99 per groep), groep verwijderen, ingrediënten uitklappen.
- Verschillende formaten, routes, sauzen of porties blijven aparte regels. Sidebowl-dubbele porties behouden.
- Oud menu-object ondersteunt eveneens plus/min/verwijderen.
- Mobiele lijst scrolt binnen het scherm; afrekenen en verder kijken blijven bereikbaar.
- Afrekensamenvatting toont gegroepeerde aantallen.

Controle:
- JS-syntax; invarianttests identieke recepten, andere maten/sauzen/routes, Sidebowl-portieherhaling en signature-kopieën.
- Browser 390×844: XL Crousty 1→2, herladen bewaart aantal, bestaande Korean Chicken 1→2→1, kassasamenvatting 2 × Crousty + 1 × Korean Chicken.
- Browser 320×740: ingrediënten uitklappen, terug naar 1 Crousty, scrollbare inhoud en vaste knoppen zichtbaar; geen consolefouten.
- Test-Crousty verwijderd na controle. Oorspronkelijk 1 × Korean Chicken behouden.
- Bewijs outputs/fitbite-bestellingsoverzicht-2026-11-10/01-overzicht-gsm.jpg en 02-samenstelling-klein.jpg. Foto-overzicht toont tijdelijke voorbeeldbestelling uit UI-test.

Beperkingen: prijzen zijn nog niet bevestigd voor de eigen site en blijven als proef vermeld. Geen echte betaalstap of productiepublicatie. Eigen samengestelde recepten hebben nog geen dynamisch gegenereerde productfoto; logo voorkomt een onjuiste voorstelling van ingrediënten.
