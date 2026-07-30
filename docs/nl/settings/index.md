---
pageClass: settings-overview-page
---

# Overzicht van de instellingen

De instellingen van Nuvio bieden uitgebreide aanpassingsmogelijkheden. Hieronder vind je een overzicht van de verschillen tussen **Mobiel**, **Android TV** en **Windows**.

> [!IMPORTANT]
> Elke functie zonder het label [Android TV Only], [Mobile Only] of [Windows Only] is beschikbaar op Mobiel, Android TV en Windows.

## 1. Algemeen en gebruikersinterface
| Instelling | Mobiel | Android TV | Windows |
| :--- | :--- | :--- | :--- |
| **Thema** | Kies een aangepast accentkleurenpalet. Schakel **AMOLED Black** in voor volledig zwarte achtergronden op OLED-schermen. | Kies een aangepast accentkleurenpalet. Schakel **AMOLED Mode** en **Pure Black Surfaces** in voor volledig zwarte app-achtergronden en kaartoppervlakken. | Kies een aangepast accentkleurenpalet. Schakel **AMOLED Black** in voor volledig zwarte achtergronden op OLED-schermen. |
| **Lettertype en taal** | Pas de algemene app-taal aan. | Pas het algemene lettertype en de app-taal aan. | Pas de algemene app-taal aan. |
| **Lay-out / startschermrijen** | Toon of verberg de rij **Verder kijken**. Kies **Card**, **Wide** of **Poster** als standaard kaarttype en beheer de hervatmelding bij het opstarten. | Kies voor Modern View, Grid View of Classic View. Schakel schermvullende hero-achtergronden in of uit en stel de zijbalk zo in dat deze automatisch inklapt. | Toon of verberg de rij **Verder kijken**, kies een standaard kaarttype, schakel het diepte-effect voor kaarten in en beheer de hervatmelding bij het opstarten. |
| **Gedrag van Volgende** | Stel **Prefer Episode Thumbnails**, **Up Next From Furthest Episode**, **Show Unaired Next Up Episodes** en **Blur Unwatched** in om de volgorde en spoilers te beheren. | Stel afspeelreeksen in met **Prefer Binge Group**, **Reuse Binge Groups** en het percentage voor **Next Episode Threshold Mode**. | Stel **Prefer Episode Thumbnails**, **Up Next From Furthest Episode**, **Show Unaired Next Up Episodes** en **Blur Unwatched** in om de volgorde en spoilers te beheren. |
| **Stijl van posterkaarten** | Pas de kaartbreedte en hoekafronding aan met een livevoorbeeld. Schakel liggende posters en verborgen labels in of uit. | Pas de kaartbreedte, hoekafronding en vertraging voor het uitvouwen van de achtergrond aan. Schakel liggende posters in of uit. | Pas de kaartbreedte, hoekafronding en vertraging voor het uitvouwen van de achtergrond aan. Schakel liggende posters in of uit. |

[Terug naar boven](#overzicht-van-de-instellingen)

## 2. Afspelen: [Bekijk de afspeelhandleiding](player.md)
- **Interne speler:** Aanbevolen voor de meeste gebruikers en ondersteunt hardwaredecodering.
  - *Interne engine:* Kies handmatig ExoPlayer of libmpv als primaire media-engine.
  - *Auto-switch engine on startup error* [Android TV Only]: Schakelt automatisch terug van ExoPlayer naar libmpv bij gedetecteerde anime of wanneer er een initialisatiefout optreedt.
- **Externe speler:** Handig bij codecproblemen. Nuvio kan de stream doorsturen naar VLC, MX Player of JustPlayer.
- **Hardwareversnelling:** Schakel dit in als je haperingen ervaart op oudere apparaten.
- **Volgende aflevering automatisch afspelen:** Start automatisch de volgende aflevering van een serie.
- **RTX Video Super Resolution** [Windows Only]: Schaalt video met een lage resolutie op met NVIDIA RTX AI Super Resolution.
- **Intro's en outro's overslaan:** Geeft prioriteit aan IntroDB, AniSkip en Anime Skip. Bevat hulpmiddelen voor het indienen van community-tijdstempels [Mobile Windows], inhoudswaarschuwingen en automatisch overslaan [Android TV Only].
- **Streamselectie en automatisch afspelen:** Stel onder andere *Reuse Last Link*, *Last Link Cache Duration*, de selectiemodus, time-outs en filters voor plug-ins en addons in.
- **Binge-opties:** Beheer afspeelreeksen met *Prefer Binge Group*, *Reuse Binge Groups* en *Next Episode Threshold Mode*. *Are You Still Watching?* [Android TV Only] vraagt na meerdere afleveringen of je nog kijkt.
- **Voorkeuren voor ondertiteling en audio:** Stelt primaire en secundaire talen in, filtert ongewenste sporen, kan stiltes overslaan en biedt een downmixoptie om meerkanaals surroundgeluid naar helder stereogeluid om te zetten.
- **Weergave van ondertiteling:** Past de grootte, verticale positie, tekstkleur, achtergrondkleur en omlijning van ondertitels aan. Bevat ook een experimentele optie voor de **libass-renderingengine** voor complexe ASS/SSA-ondertiteling.
- **Interface- en bedieningsoverlays:** Bevat laad- en pauzeoverlays, een systeemklok in de speler [Android TV Only], snelheidsbediening via aanraken en verticale veeggebaren voor volume en helderheid [Mobile Only].

[Terug naar boven](#overzicht-van-de-instellingen)

## 3. Accountintegraties: [Bekijk de integratiehandleiding](/nl/integrations/)
- **Trakt.tv:** Synchroniseert je "Up Next"-lijst en kijkgeschiedenis over al je Nuvio-apparaten.
- **TorBox / Premiumize:**
  - Essentieel voor buffer-vrije 4K-streams van hoge kwaliteit.
  - Vereist een API-sleutel of apparaatcode voor autorisatie.
- **Plug-ins en uitbreidingen:** Beheert externe scraperbronnen en maakt integraties mogelijk via directe URL-invoer of mobiele QR-codes.
- **Aanvullende TMDB-gegevens:** Haalt artwork, tekstloze achtergronden, aftellingen tot releases, cast- en crewlijsten, productienetwerken en de speelduur van afleveringen op.
- **MDBList Ratings API:** Koppelt een persoonlijke sleutel om beoordelingsscores van platforms (Trakt, IMDb, TMDB, Letterboxd, Rotten Tomatoes, Audience en Metacritic) op te halen en over titels in het dashboard te tonen.
- **Anime Skip-integratie:** Gebruikt een externe client-ID om nauwkeurige, door de community aangeleverde tijdstempels voor het overslaan van segmenten te activeren.

[Terug naar boven](#overzicht-van-de-instellingen)

## 4. Geavanceerd: [Bekijk de afspeelhandleiding](player.md)
- **Decoder-prioriteit:** Bepaalt de verwerkingsprioriteit via *Device decoders only* (strikte hardware-verwerking), *Prefer device decoders* (prioriteit voor hardware met software-terugval) of *Prefer app decoders (FFmpeg)* (software-verwerking voor oudere formaten).
- **DV7 - HEVC Fallback:** Corrigeert vervormde paarse of groene kleuren door niet-ondersteunde Dolby Vision Profile 7-video terug te laten vallen op standaard HEVC.
- **Dolby Vision-mapping** [Android TV Only]: Bevat *Preserve DV mapping (DV7 to DV8.1)* en *Convert DV5 to DV8.1*.
- **Verversingssnelheid automatisch aanpassen (AFR)** [Android TV Only]: Past de verversingssnelheid van je TV aan de inhoud aan, bijvoorbeeld 24 fps, om schokkerig beeld te voorkomen.
- **Tunneled Playback:** Verbetert de synchronisatie en vermindert de belasting via een geoptimaliseerd afspeelpad op ondersteunde apparaten. Dit kan veeleisende 4K HDR-video soepeler afspelen.
- **Force AC-3 Transcoding (Optisch/SPDIF):** Zet meerkanaals audioformaten (TrueHD, DTS, AAC) live om naar traditioneel gecomprimeerde Dolby Digital 5.1-sporen om audio via bandbreedte-beperkte digitale optische verbindingen te behouden.

[Terug naar boven](#overzicht-van-de-instellingen)

## 5. Buffer en netwerk [Android TV Only]: [Bekijk de afspeelhandleiding](player.md#buffer-en-netwerk-android-tv-only)
Deze instellingen bepalen de toewijzing van het interne geheugen, lokale caches en regels voor netwerkverkeer.

- **Aangepaste afspeelbuffers:** Overschrijft de standaard Media3-parameters volledig met gespecificeerde verwerkingslimieten:
  - *Min / Max Buffer Duration:* Stelt de veilige minimale en maximale tijdsduur van de inhoud in om vooruit te cachen ten opzichte van de huidige afspeelpositie.
  - *Initial Buffer & Buffer After Rebuffer:* Stelt de exacte bufferduur in die nodig is voordat een videostream start, of bij het opnieuw laden na een hapering.
  - *Back Buffer Duration:* Houdt reeds bekeken streamgegevens vast in het lokale geheugen om direct terugspoelen mogelijk te maken zonder de inhoud opnieuw te downloaden.
  - *Target Buffer Allocations:* Beheert het RAM-gebruik van het apparaat veilig via een automatisch *Managed Memory Budget*-filter, of omzeilt beperkingen om handmatige caching-schuifregelaars tot 2 GB te ontgrendelen via de *Allow Larger Target Buffer*-schakelaar.
- **Schijfcache-prestaties:** Stelt vaste cachepartities in op de opslag:
  - *VOD Disk Cache:* Slaat actieve gedownloade bestanden rechtstreeks op in de interne opslag om het afspelen te beschermen tegen tijdelijke netwerkonderbrekingen.
  - *Auto Size:* Automatiseert de cachegrootte op basis van ongeveer 10% van de beschikbare vrije ruimte, met opties voor handmatige aanpassingen.
- **Netwerk- en P2P-streamfilters:** Gebruikt *Custom Network* om meerdere downloadverbindingen voor progressieve links te openen. Bevat daarnaast instellingen voor *P2P Streaming* en *Hide torrent stats* om torrentstatistieken tijdens het afspelen te verbergen.

[Terug naar boven](#overzicht-van-de-instellingen)

## 6. Aanpassing en beheer
- **Profielen:** Beheer meerdere gebruikers, kijkgeschiedenissen en aanbevelingen afzonderlijk. [Bekijk de profielenhandleiding](profiles.md)
- **Collecties:** Maak uitgebreide aangepaste collecties door media te groeperen op genre, studio of aangepaste lijsten. [Bekijk de collectiehandleiding](collections.md).
- **Back-up en synchronisatie:** Exporteer of importeer appconfiguraties om lay-outs, trackingscripts en engine-instellingen naar andere apparaten te kopiëren.

[Terug naar boven](#overzicht-van-de-instellingen)
