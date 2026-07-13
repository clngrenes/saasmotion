# screenshot-3d-video

Generiert aus hochgeladenen App-Screenshots animierte 3D-Produktvideos. Der
Screenshot wird als Textur auf ein Device-Frame-Mesh in einer Three.js-Szene
gelegt; eine choreografierte Kamera-/Mesh-Animation wird als Remotion-Composition
frame-synchron gerendert (kompatibel mit Remotion Lambda).

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + React 19 + Tailwind CSS 4
- **3D:** React Three Fiber + Three.js
- **Video:** Remotion + `@remotion/three` (`ThreeCanvas`, frame-synchron)
- **Validierung:** zod (Composition-Schema)

## Kern-Composition

Die erste Composition liegt unter [`src/remotion/`](src/remotion/):

```
src/remotion/
├── index.ts                     # registerRoot()
├── Root.tsx                     # <Composition> Registrierung + defaultProps
├── compositions/
│   └── ScreenshotVideo.tsx      # Haupt-Composition (frame-synchron)
├── components/
│   ├── DeviceFrameMesh.tsx      # Gehäuse + Screenshot-Display (Cover-UV)
│   └── SuspenseLoader.tsx       # delayRender()-Brücke für Textur-Suspense
├── presets/
│   ├── index.ts                 # PRESET_REGISTRY + computePresetFrame()
│   ├── shared.ts                # DEVICE_FRAME, computeScreenInlay(), Helfer
│   ├── zelios-style.ts          # Dolly-in + Kamera-Y-Schwenk
│   ├── apple-style.ts           # statische Kamera, Screen rotiert um Y
│   ├── minimal-flat.ts          # Slide-in von unten, keine 3D-Rotation
│   └── __tests__/presets.test.ts
├── schemas/
│   └── screenshot-video-schema.ts
└── types/
    └── screenshot-video.ts      # öffentliche Props + Preset-Typen
```

### Props (`ScreenshotVideoProps`)

| Prop               | Typ                | Beschreibung                              |
| ------------------ | ------------------ | ----------------------------------------- |
| `screenshotUrl`    | `string` (URL)     | Remote-URL des Screenshots (S3 o. Ä.)     |
| `presetName`       | `CameraPresetName` | `zelios-style` \| `apple-style` \| `minimal-flat` |
| `durationInFrames` | `number`           | Länge; steuert die Composition-Dauer      |

### Animations-Regel

Jede Bewegung (Kamera, Position, Rotation) wird deterministisch aus
`useCurrentFrame()` berechnet. `useFrame()` aus React Three Fiber wird **nicht**
verwendet — das würde beim Rendern zu Flackern und nicht-deterministischem Output
führen. Die Preset-Funktionen sind reine Funktionen `(ctx) => { camera, mesh }`
und daher unit-testbar.

## Kommandos

```bash
npm run remotion:studio                       # Interaktives Studio
npm test                                       # Preset-Unit-Tests (vitest)

# Video rendern (Default-Preset: zelios-style)
npx remotion render src/remotion/index.ts ScreenshotVideo out/video.mp4

# Anderes Preset via Props
npx remotion render src/remotion/index.ts ScreenshotVideo out/apple.mp4 \
  --props='{"screenshotUrl":"https://.../shot.png","presetName":"apple-style","durationInFrames":150}'
```

## S3 / CORS

Der Screenshot wird zur Render-Zeit im (headless) Browser als Cross-Origin-Textur
geladen. Der Storage-Bucket muss daher CORS erlauben, sonst schlägt das
Textur-Loading fehl (tainted canvas). Minimal-Konfiguration:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"]
  }
]
```

`three`s `TextureLoader` setzt `crossOrigin="anonymous"` bereits als Default; der
Bucket muss lediglich den Header `Access-Control-Allow-Origin` zurückgeben.

## Aspect-Ratio

Der Screenshot wird per **Cover**-Modus in ein festes Device-Display gemappt
(`computeScreenInlay()` in [`presets/shared.ts`](src/remotion/presets/shared.ts)).
Hoch- und Querformate werden dabei mittig zugeschnitten, sodass der Look
unabhängig vom Upload-Format konsistent bleibt. Ein `contain`-Modus (Letterbox)
ist ebenfalls implementiert.
