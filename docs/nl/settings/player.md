# Nuvio Player settings

Nuvio biedt verschillende player settings om je ervaring aan te passen.

> [!IMPORTANT]
> Elke feature die niet specifiek is gelabeld met [Android TV Only], [Mobile Only] of [Windows Only], is beschikbaar op Mobile, Android TV en Windows.

---

## Intro en outro overslaan

Nuvio maakt gebruik van drie afzonderlijke databases voor het overslaan van intro's en outro's, met prioriteit in deze volgorde: **IntroDB**, **AniSkip** en **Anime Skip**.

- **IntroDB** en **AniSkip** kunnen direct in- of uitgeschakeld worden.
- **Anime Skip** vereist een ID en configuratie om te kunnen gebruiken.

**Om deze features in/uit te schakelen:**
1. Ga naar **Instellingen**.
2. Selecteer **Afspelen** (Playback).
3. Selecteer **Skip Segments**.

**Om een gratis Anime Skip Client ID te verkrijgen:**
1. Ga naar [Anime Skip](https://anime-skip.com).
2. Maak een account aan.
3. Ga na het inloggen naar je profile.
4. Selecteer **API Clients**.
5. Selecteer **Add a New Client**.
6. Voer de app-naam "Nuvio" en een beschrijving van "Nuvio" in.
7. Selecteer **Create**.
8. Kopieer de gegenereerde Client ID (een lange reeks cijfers en letters).
9. Ga terug naar Nuvio, plak de Client ID en selecteer **Opslaan** (Save).

**Intro's en outro's indienen bij IntroDB** [Mobile Windows]:

Nuvio stelt je in staat om tijdstempels in te dienen bij de door de community gevulde database van IntroDB. Hiervoor heb je een API-sleutel nodig:
1. Ga naar [Intro DB](https://introdb.app).
2. Maak een account aan.
3. Ga na het inloggen naar **Account Settings**.
4. Selecteer **Generate Key**.
5. Kopieer de sleutel.
6. Ga terug naar Nuvio, plak de API-sleutel en selecteer **Opslaan** (Save).

**Automatisch overslaan & Inhoudswaarschuwingen:**
- **Content Warnings:** Toont een ouderlijk toezicht overlay wanneer het afspelen start.
- **Automatic Skipping** [Android TV Only]: Kies welke segmenten (intro's/outro's) automatisch worden overgeslagen zonder melding.

[Terug naar boven](#Nuvio-player settings)

---

## Streamselectie en Automatisch afspelen van streams

### Streamselectie

Streamselectie omvat twee hoofdopties:

- **Reuse Last Link:** Bij het hervatten van een titel probeert Nuvio exact dezelfde stream te gebruiken die je tijdens je vorige sessie hebt geselecteerd.
- **Last Link Cache Duration:** Bepaalt hoe lang Nuvio de laatst geselecteerde link vasthoudt. Opties zijn onder andere 1, 6 en 12 uur, evenals 1, 2, 3 en 7 dagen.

> [!NOTE]
> Debrid-links zijn meestal slechts een bepaalde tijd geldig. Als je een te lange duur selecteert, kan Nuvio proberen af te spelen via een verlopen, ongeldige link.

### Stream en Automatisch afspelen

Dit gedeelte bepaalt hoe de app zich gedraagt wanneer je een media-item selecteert: of de stream automatisch start of dat je zelf een link kunt kiezen.

**Selection Mode (Selectiemodus)**
Bepaalt de logica die wordt gebruikt om beschikbare streams af te handelen:
- **Auto-play first source:** Scant automatisch op streams en speelt onmiddellijk de eerste geldige bron af die wordt gevonden, zonder om bevestiging te vragen.
- **Manual:** Toont een volledige lijst van alle gevonden streams, zodat je deze handmatig kunt controleren en selecteren op basis van kwaliteit, bestandsgrootte of bron.
- **Regex (Regular Expression):** Een geavanceerde filtermodus die streamtitels of metadata scant op specifieke tekstpatronen (bijv. 1080p, 4K, HEVC, specifieke release-groepen) en matches prioriteert of filtert op basis van je aangepaste expressies.

**Stream Selection Timeout (Time-out voor streamselectie)**
Stelt de maximale duur in die de applicatie wacht op resultaten van addons of plugins voordat deze verdergaat:
- **Opties:** Instant (Onmiddellijk), 5s tot 30s (in stappen van 5 seconden), Unlimited (Onbeperkt).
- *Hoe het werkt:* Als een time-out wordt bereikt, stopt Nuvio met zoeken en speelt de beste optie af die tot dan toe is gevonden (indien automatisch afspelen is ingeschakeld) of toont een gedeeltelijke lijst (bij handmatige selectie). De optie **Unlimited** zorgt ervoor dat de app wacht tot elke provider klaar is met zoeken, ongeacht hoe lang dit duurt.

**Bron- & addon-filtering**
Deze instellingen bepalen precies welke addons of plugins streams mogen zoeken en aanbieden.

- **Auto-play Source Scope:** Beperkt de pool van providers bij het gebruik van een automatische afspeelmodus.
  - *Opties:* All sources (Alle bronnen), Select addons, Plugins only.
- **Allowed Addons:** Biedt fijnmazige controle over geïnstalleerde uitbreidingen tijdens het zoekproces.
  - *Opties:* All addons, Custom Selection.
- **Allowed Plugins:** Regelt welke plugins worden gebruikt tijdens het zoekproces.
  - *Opties:* All enabled plugins, Custom Selection.

[Terug naar boven](#Nuvio-player settings)

---

## Volgende aflevering (Next Episode)

De categorie Next Episode bevat verschillende instellingen om continu kijken te optimaliseren:

- **Auto-Play Next Episode:** Wanneer dit is ingeschakeld, start Nuvio het bronselectieproces zodra de melding "volgende aflevering" verschijnt. Deze melding wordt geactiveerd door:
  - Het overslaan van een outro (Outro skip).
  - Als er geen outro-skip aanwezig is, zodra de drempelwaarde voor de volgende aflevering (Next Episode Threshold) is bereikt.
- **Prefer Binge Group:** Nuvio probeert de volgende aflevering te vinden met hetzelfde bronprofiel voordat het terugvalt op andere opties. Als je bijvoorbeeld een aflevering via *AIOStreams* hebt bekeken, zal Nuvio proberen de volgende aflevering van *AIOStreams* in dezelfde kwaliteit te vinden voordat het andere providers probeert.
- **Reuse Binge Groups:** Zorgt ervoor dat wanneer je terugkeert naar een serie, de app automatisch dezelfde streambron of release-groep onthoudt en prioriteit geeft die je eerder bekeek. Als je een specifieke 1080p-release-groep hebt geselecteerd, wordt je sessie aan dat profile gekoppeld. Bij hervatten via "Verder kijken" (Continue Watching) zoekt Nuvio specifiek naar die exacte release-groep in plaats van automatisch een nieuwe bron te selecteren.
- **Next Episode Threshold Mode:** Wordt gebruikt als terugval als er geen outro-skip aanwezig is. Dit kan worden ingesteld in stappen van 0,5% van 100% tot 97%.
  - *Op 100%:* Nuvio start het bronselectieproces pas als de media volledig is afgelopen.
  - *Op 97%:* Nuvio start het bronselectieproces wanneer de media voor 97% is voltooid (bijv. bij een aflevering van 30 minuten begint de selectie op 29 minuten en 6 seconden).
- **Are You Still Watching?** [Android TV Only]: Vraagt de gebruiker na een ingesteld aantal opeenvolgende automatisch afgespeelde afleveringen of ze nog kijken, om oneindig afspelen te voorkomen als je in slaap valt.

[Terug naar boven](#Nuvio-player settings)

---

## Ondertiteling en Audio

### Audio-instellingen
Deze instellingen bepalen de standaard gesproken taalsporen die worden geselecteerd wanneer een stream start.
- **Preferred Audio Language:** De primaire gesproken taal die de app automatisch moet selecteren als het mediabestand meerdere audiotracks bevat.
- **Secondary Audio Language:** Je back-up audiotrack als de primaire keuze niet beschikbaar is.
- **Skip Silence:** Slaat stilte in de audio dynamisch over tijdens het afspelen.
- **Enable downmix:** Gebruikt het FFmpeg-downmix-pad voor audioverwerking. Indien uitgeschakeld, volgt audio het standaard Android-/apparaatpad.
  - "Downmixing" betekent dat een meerkanaals surround sound-audiotrack (zoals 5.1 of 7.1 audio, bedoeld voor 6 tot 8 luidsprekers) wordt samengeperst tot slechts twee kanalen (Links en Rechts) voor een standaard stereo-opstelling.
  - Als je alleen de ingebouwde TV-luidsprekers of een basis 2.0 soundbar gebruikt, kan je systeem fysiek niet het dedicated "center-kanaal" afspelen waar 90% van de stemmen in moderne films vandaan komt. Als je het gevoel hebt dat explosies oorverdovend zijn maar stemmen fluisterend zacht klinken, komt dit doordat het center-kanaal ontbreekt. Door dit in te schakelen, dwing je de app om al die surround-luidsprekers correct te mengen naar een stereo-indeling, zodat je stemmen duidelijk kunt horen.

### Ondertitelingsvoorkeuren
Deze instellingen bepalen welke tekstvertalingen op het scherm worden getoond en hoe menu's worden gefilterd.
- **Preferred Language:** De primaire taal voor je ondertitels.
- **Secondary Preferred Language:** Je back-up ondertiteltaal.
- **Use Forced Subtitles (Aan/Uit):** Geeft prioriteit aan "forced" (geforceerde) ondertitels die overeenkomen met je voorkeurstaal. Geforceerde ondertitels vertalen vreemde talen, buitenaardse dialogen of tekst op het scherm, terwijl de rest van de media in je gesproken hoofdtaal blijft.
- **Show Only Preferred Languages (Aan/Uit):** Filtert het ondertitelmenu om alle sporen te verbergen die niet exact overeenkomen met je primaire en secundaire taalvoorkeuren.
- **Subtitle Styling** [TV Optimized]: Biet fijnmazige controle over de weergave van ondertitels, waaronder **Size (grootte)**, **Vertical Offset** (om rekening te houden met zwarte balken), **Text Color** (tekstkleur), **Background Color** (achtergrondkleur) en **Outline/Outline Color** (randkleur).
- **Use libass for ASS/SSA subtitles:** Een experimentele optie om de geavanceerde libass-engine te gebruiken voor het renderen van complexe stijlen, positionering en animaties van ASS/SSA-ondertitels.
  - Door dit in te schakelen, gebruikt de player een gespecialiseerde grafische engine (libass) om complexe ondertitels perfect te tekenen. Als dit uit staat, kan de player alle kleuren en opmaak verwijderen, of erger nog, crashen bij het lezen van het bestand.

### Opstartgedrag van addon-ondertitels
Bepaalt hoe intensief Nuvio zoekt naar externe ondertitels wanneer een video begint te spelen, met een balans tussen laadtijd en beschikbaarheid.
- **Fast startup:** Geeft prioriteit aan onmiddellijk afspelen door het automatisch ophalen van externe addon-ondertitels over te slaan. Je moet ze handmatig aanvragen in de player.
- **Preferred only:** Een gebalanceerde aanpak. Haalt tijdens het laden ondertitels op van addons, maar alleen degene die overeenkomen met je taalvoorkeuren.
- **All subtitles:** Haalt alle beschikbare addon-ondertitels voor de video op en laadt ze, wat maximale keuze biedt ten koste van iets langere laadtijden.

[Terug naar boven](#Nuvio-player settings)

---

## Player- en Decoder-opties

### Videospeler & Interface
Regelt de visuele ervaring en interactie binnen de media player.

- **Loading Overlay:** Toont een laadscherm of laadanimatie om bufferen, zwarte schermen of overgangen te verbergen. De overlay blijft zichtbaar tot het eerste frame van de video klaar is.
- **Pause Overlay:** Toont een detail-overlay na 5 seconden wanneer het afspelen is gepauzeerd.
- **OSD Clock** [Android TV Only]: Toont de huidige tijd en de geschatte eindtijd wanneer de afspeelbediening op het scherm zichtbaar is.
- **Player (Player):** Bepaalt welke video-engine je streams verwerkt.
  - *Internal:* Houdt je binnen Nuvio met de ingebouwde player.
  - *Internal Engine:* Kies tussen ExoPlayer of libmpv als de primaire renderer.
  - *Auto-switch engine on startup error* [Android TV Only]: Schakelt automatisch terug van ExoPlayer naar libmpv bij gedetecteerde anime of als een stream niet start.
  - *External:* Stuurt de videolink door naar een externe app die op je apparaat is geïnstalleerd (bijv. VLC, MX Player).
- **Hold To Speed** [Mobile Only]: Een touchscreen-snelkoppeling om door te spoelen. Door ergens op de videospeler ingedrukt te houden, wordt de afspeelsnelheid tijdelijk verhoogd. Het afspelen hervat op normale snelheid bij loslaten.
- **Hold Speed** [Mobile Only]: Configureert de exacte vermenigvuldigingsfactor van de afspeelsnelheid bij gebruik van de "Hold To Speed"-feature.
- **Gesture Controls** [Mobile Only]: Activeert verticale veeggebaren op de linker- en rechterkant van het scherm om snel het volume en de helderheid aan te passen.

### Geavanceerde verwerking & decodering
Technische instellingen die bepalen hoe de hardware en software van je apparaat ruwe video- en audiogegevens verwerken.

- **Decoder Priority:** Bepaalt of hardware- of software-decoders (FFmpeg) worden gebruikt voor audio en video.
  - *Device decoders only:* Gebruik alleen ingebouwde hardwaredecoders. Meest compatibel, maar ondersteunt mogelijk niet alle formaten.
  - *Prefer device decoders:* Gebruik hardwaredecoders indien beschikbaar, en val terug op FFmpeg. Recommended voor de meeste apparaten.
  - *Prefer app decoders (FFmpeg):* Gebruik FFmpeg-decoders indien beschikbaar. Betere ondersteuning voor formaten, maar hoger CPU-gebruik.
- **DV7 - HEVC Fallback:** Dolby Vision Profile 7 (DV7) is een premium HDR-indeling. Het afspelen van een DV7-bestand op niet-ondersteunde hardware leidt vaak tot vervormde kleuren (bijv. een volledig paars of groen scherm). Door dit in te schakelen, wordt de onleesbare Dolby Vision-informatie weggelaten en wordt de video omgezet naar standaard HEVC (H.265) voor een correcte kleurweergave.
- **Preserve DV mapping (DV7 to DV8.1)** [Android TV Only]: Behoudt de oorspronkelijke tone-mapping van de maker, wat iets meer rekenkracht per frame vereist.
- **Convert DV5 to DV8.1** [Android TV Only]: Stuurt Profile 5-streams uit als Profile 8.1 for HDR10-compatibele uitvoer, wat helpt bij de juiste kleurweergave op apparaten die geen native DV5-decoder hebben.
- **Auto Frame Rate & Resolution** [Android TV Only]: Past de verversingssnelheid van je TV dynamisch aan om precies overeen te komen met die van het bronbestand, om schokken bij camerabewegingen te voorkomen. Opties zijn:
  - *Off:* Wijzig de verversingssnelheid niet.
  - *On start:* Schakel over wanneer het afspelen begint.
  - *On start/stop:* Schakel over bij de start en herstel de oorspronkelijke snelheid bij het stoppen.
- **Tunneled Playback:** Gebruikt een geoptimaliseerd afspeelpad op laag niveau voor audio en video. Dit verbetert de synchronisatie tussen beeld en geluid en kan veeleisende 4K HDR-bestanden soepeler afspelen.
  - Normaal verwerkt je apparaat video, audio, interface-elementen en achtergrondtaken via gedeelde systeempaden. Tunneled Playback maakt een directere verbinding tussen de mediastream en de afspeelhardware van het apparaat.
  - Aanbeveling: Laat deze optie standaard uitgeschakeld. Schakel haar in bij synchronisatieproblemen of wanneer veeleisende 4K HDR-bestanden frames overslaan of haperen. Schakel de optie weer uit als er door beperkte hardwareondersteuning afspeelproblemen ontstaan.
- **RTX Video Super Resolution** [Windows Only]: Schaalt video met een lage resolutie op met NVIDIA RTX AI Super Resolution.
- **Force AC-3 Transcoding (Optisch/SPDIF):** Zet meerkanaals formaten (TrueHD, DTS, AAC, etc.) in realtime om naar Dolby Digital 5.1 voor optische/SPDIF-verbindingen.
  - Oudere optische audiokabels (met het rode lampje) hebben een strikte bandbreedtebeperking. Ze kunnen moderne, niet-gecomprimeerde audioformaten zoals TrueHD of DTS-HD fysiek niet doorsturen. Ze ondersteunen maximaal standaard Dolby Digital 5.1 (ook bekend als AC-3).
  - Als je een oudere AV-ontvanger of soundbar hebt die via een optische kabel op je TV is aangesloten, zal het afspelen van een moderne 4K-film met een TrueHD-track resulteren in stilte of harde ruis. Deze instelling werkt als een live vertaler: het pakt de zware moderne audio en zet deze direct om naar standaard Dolby Digital 5.1, zodat je oudere audiosysteem de film daadwerkelijk kan afspelen.

[Terug naar boven](#Nuvio-player settings)

---

## Buffer en Netwerk [Android TV Only]

Deze instellingen regelen hoeveel videogegevens in het geheugen worden bewaard en hoe peer-to-peer-streams worden verwerkt.

### Aangepaste afspeelbuffers (Custom Playback Buffers)
Overschrijft de standaard buffering van Media3 met aangepaste waarden. Indien uitgeschakeld, gebruikt de player de standaard bufferduur en targetgroottes van Media3.
- **Min Buffer Duration:** Minimale hoeveelheid te bufferen media. De player probeert ervoor te zorgen dat er altijd ten minste deze hoeveelheid inhoud is gebufferd ten opzichte van de huidige afspeelpositie.
- **Max Buffer Duration:** Maximale hoeveelheid te bufferen media. Moet ten minste gelijk zijn aan de minimale bufferduur. Hogere waarden gebruiken meer geheugen, maar zorgen voor een soepelere weergave bij onstabiele verbindingen.
- **Initial Buffer:** Hoeveel inhoud moet worden gebufferd voordat het afspelen begint. Lagere waarden starten sneller, maar kunnen leiden tot haperingen bij het opstarten op trage verbindingen.
- **Buffer After Rebuffer:** Hoeveel inhoud moet worden gebufferd nadat het afspelen is vastgelopen door bufferen. Hogere waarden verminderen herhaaldelijke bufferonderbrekingen.
- **Back Buffer Duration:** Hoeveel al afgespeelde inhoud in het geheugen moet worden bewaard. Dit maakt snel terugspoelen mogelijk zonder opnieuw te downloaden. Stel in op 0 om uit te schakelen en geheugen te besparen. (Reserveert ongeveer 50 MB bovenop de Target Buffer).
- **Managed Memory Budget:** Beperkt de buffer tot een veilig deel van het geheugen van dit apparaat. Schakel dit uit om zelf de Target Buffer Size in te stellen (geavanceerd: grote waarden kunnen apparaten met weinig geheugen laten crashen).
- **Target Buffer Size:** Maximaal RAM-geheugen dat wordt gebruikt voor vooruit-buffering. Berekend op basis van het beschikbare geheugen van je apparaat. (Vereist het uitschakelen van Managed Memory Budget).
- **Allow Larger Target Buffer:** Verwijdert de geheugenlimiet van het apparaat op de schuifregelaar voor Target Buffer Size, waardoor waarden tot 2 GB mogelijk zijn. Kan crashen op apparaten met minder dan 2 GB RAM.

### Schijfcache
- **VOD Disk Cache:** Slaat gedownloade bytes op schijf op voor de huidige stream. Breidt de mogelijkheid tot direct terugspoelen uit tot buiten de back-buffer in het geheugen, en helpt bij het opvangen van korte netwerkonderbrekingen. Geldt alleen voor progressieve streams (geen HLS/DASH).
- **Auto Size:** Wanneer dit is ingeschakeld, wordt de cachegrootte bepaald op basis van de vrije schijfruimte. Schakel dit uit om handmatig een grootte te kiezen. De automatische modus richt zich op ongeveer 10% van de vrije ruimte. De handmatige modus behoudt ongeveer 1024 MB marge.

### Netwerk & P2P
- **Custom Network:** Geeft de downloadclient opdracht om meerdere parallelle verbindingen op te zetten voor het ophalen van progressieve streams (in plaats van een enkele verbinding) om netwerken met een hoge bandbreedte optimaal te benutten.
- **P2P Streaming:** Schakelt directe verwerkingsconfiguraties in of beperkt deze voor ruwe peer-to-peer (torrent) streams.
- **Hide torrent stats:** Voorkomt dat realtime logbestanden van peer-verbindingen, seed-aantallen en overlays van downloadsnelheid verschijnen tijdens het laden en afspelen.

[Terug naar boven](#Nuvio-player settings)

---

## MPV

### Wat is MPV?
MPV is a highly advanced, open-source media player engine built into Nuvio as an alternative to the standard ExoPlayer.

### Waarom is MPV zo goed voor anime?
Anime leunt zwaar op een complex ondertitelformaat genaamd **ASS/SSA**. Dit is niet zomaar platte tekst onderaan het scherm; het bevat aangepaste lettertypen, kleuren, animaties en nauwkeurige positionering op het scherm (zoals het vertalen van een Japans bord op de achtergrond of het tonen van stuiterende karaoke-teksten). Standaard players hebben vaak moeite om dit correct te renderen, wat leidt tot vertraging of ontbrekende tekst. MPV wordt alom beschouwd als de gouden standaard om deze complexe anime-ondertitels vlekkeloos te renderen zonder videoframes te verliezen.

### Uitleg van MPV-opties

De MPV-configuratie in Nuvio richt zich momenteel op **Hardware Decoding** (Hardware-decodering). Dit vertelt de player hoe deze de fysieke chips van je apparaat moet gebruiken om de video te verwerken.

- **Auto (auto-safe)**
  - *Wat het is:* Een slimme automatische modus.
  - *Wat het doet:* Het probeert de hardwarechips van je apparaat te gebruiken om de video te decoderen, maar als het een fout of een niet-ondersteund formaat tegenkomt, valt het veilig terug op software-decodering, zodat je video niet crasht.
- **Hardware (direct) (mediacodec)**
  - *Wat het is:* De snelste en meest efficiënte methode.
  - *Wat het doet:* Het stuurt de video rechtstreeks via de hardwaredecoder van je apparaat naar het scherm. Dit verbruikt de minste batterij en zorgt voor de soepelste weergave op compatibele apparaten.
- **Hardware (copy) (mediacodec-copy)**
  - *What het is:* Hardware-decodering met een tussenstap.
  - *Wat het doet:* Het gebruikt de hardwarechip om de video te decoderen, maar kopieert de videoframes vervolgens terug naar het softwaregeheugen van het systeem voordat ze op het scherm worden getoond. Dit is vaak nodig zodat de player complexe anime-ondertitels correct over het videoframe kan "tekenen".
- **Disabled (no) (Uitgeschakeld)**
  - *Wat het is:* Pure software-decodering.
  - *Wat het doet:* Schakelt de hardwarechips volledig uit en dwingt de hoofdprocessor (CPU) van je apparaat om al het zware werk te doen.

---

### Aanbevolen apparaatinstellingen

- **Voor algemeen gebruik:** Stel in op **Auto (auto-safe)** of **Hardware (direct)**. Dit geeft je de beste batterijduur en de soepelste weergave voor standaard films en series.
- **Voor anime-kijkers:** Stel in op **Hardware (copy) (mediacodec-copy)**. Als je anime bekijkt met zware, gestileerde ondertiteling en visuele haperingen of zwarte schermen opmerkt, zorgt de "copy"-modus ervoor dat de ondertiteling correct over de video kan worden geplaatst.

> [!WARNING]
> Deze optie kan ertoe leiden dat de player gaat haperen als je apparaat niet over voldoende bronnen beschikt om de video te decoderen. Zwakkere Android TV-boxen kunnen moeite hebben met deze optie.

- **Voor troubleshooting:** Als een specifiek videobestand wordt afgespeeld met een groen scherm, vervormde kleuren of alleen geluid zonder beeld, verander dit dan in **Disabled (no)**. Het forceren van software-decodering omzeilt meestal hardware-incompatibiliteiten, waardoor het bestand toch kan worden afgespeeld.

[Terug naar boven](#Nuvio-player settings)
