# Carinder

Tinder für Autos: Du bekommst ein Fahrzeug mit Foto, Modell, Baujahr, Kilometerstand und Motorisierung angezeigt und swipest es nach links (Nope), nach rechts (Like) oder nach oben (Superlike). Gelikte Autos landen in deiner **Garage**, und jeder Swipe verbessert die nächsten Vorschläge.

iOS- und Android-App mit Expo (SDK 58, React Native, TypeScript), Backend über Supabase.

## Status

| Bereich | Stand |
|---|---|
| Swipe-Deck mit Gesten und Buttons | ✅ |
| Empfehlungen anhand der Fahrzeug-Merkmale, mit Exploration | ✅ |
| Garage, Detailansicht, Filter | ✅ |
| Demo-Modus ohne Backend (300 generierte Fahrzeuge) | ✅ |
| Supabase-Schema mit RLS, Login per E-Mail-Code | ✅, braucht ein Supabase-Projekt |
| Sign in with Apple / Google, Konto löschen, Store-Release | ⏳ Phase 5 |
| Echte Inserate (mobile.de-API / Händler-Feed) | ⏳ Phase 6, braucht einen Datenzugang |

## Schnellstart (Demo-Modus)

```bash
npm install
npx expo start
```

Dann den QR-Code mit **Expo Go** scannen. Ohne Supabase-Konfiguration läuft die App im Demo-Modus: Es gibt kein Konto, und Swipes und Filter bleiben auf dem Gerät.

## Mit Supabase (echte Konten)

1. Ein Projekt auf [supabase.com](https://supabase.com) anlegen, oder lokal `npx supabase start` ausführen (dafür brauchst du Docker).
2. Das Schema einspielen: `npx supabase db push` (remote) bzw. `npx supabase db reset` (lokal, spielt `supabase/seed.sql` mit ein).
3. **Remote:** Unter *Auth → Email Templates* in die Vorlagen „Magic Link“ und „Confirm signup“ `{{ .Token }}` einbauen, denn die App meldet dich per 6-stelligem Code an (Vorlage: `supabase/templates/login-code.html`). Lokal ist das über `supabase/config.toml` schon erledigt.
4. `.env.example` nach `.env.local` kopieren und die URL sowie den Publishable/Anon-Key eintragen.
5. `npx expo start` neu starten.

Die Demo-Fahrzeuge für die Datenbank erzeugst du mit `npm run seed:sql` neu.

## Architektur

```
src/app/            Screens (expo-router): Swipen, Garage, Profil, Login, Details
src/components/     SwipeDeck (Gesture Handler v3 + Reanimated 4), VehicleCard, ...
src/domain/         Reine Logik ohne React: Fahrzeug-Typ, Filter, Scoring, Feed, VehicleSource
src/data/           Repositories (Demo/Supabase), Demo-Inventar, Datenquellen
supabase/           Migrationen, Seed, Auth-Config
```

- **Repository-Schicht:** `CarinderRepository` hat zwei Implementierungen. `LocalRepository` arbeitet mit AsyncStorage und der Demo-Quelle, `SupabaseRepository` mit Postgres und RLS.
- **Empfehlungen** (`src/domain/scoring.ts`): Ein Like gibt +1, ein Superlike +2 und ein Nope −0,5 auf jedes Merkmal des Autos (Marke, Modell, Karosserie, Kraftstoff, Getriebe, Preis-, Baujahr-, km- und PS-Klasse). Nach 30 Tagen zählt ein Swipe nur noch halb. Etwa 15 % jedes Batches sind Zufallsauswahlen, damit du nicht in einer Blase hängen bleibst. Supabase liefert über `feed_candidates()` bereits gefilterte, ungeswipte Kandidaten, und die App rankt sie mit derselben Logik wie im Demo-Modus.
- **Datenquellen** (`src/domain/source.ts`): Jede Quelle implementiert `VehicleSource` und liefert `Vehicle`-Objekte. Eine neue Quelle (mobile.de Search-API, Händler-CSV) heißt: eine neue Datei plus ein serverseitiger Ingest-Job, kein App-Update. Zugangsdaten gehören nie in die App.

## Zu mobile.de

Die offizielle [Search-API](https://services.mobile.de/manual/search-api.html) braucht Zugangsdaten, die mobile.de selbst vergibt. Scraping oder Reverse Engineering der privaten API ist für eine öffentliche App keine Option: Es verstößt gegen die AGB, berührt das Datenbankherstellerrecht (§ 87b UrhG) und die Bildrechte der Händler. Deshalb nutzt die App vorerst Demo-Daten. Echte Inserate kommen über einen offiziellen Zugang oder Händler-Partnerschaften.

## Entwicklung

```bash
npm run lint        # ESLint (eslint-config-expo)
npm run typecheck   # tsc
npm test            # Jest (Scoring, Feed, Demo-Repository)
```
