# Plan 50: Myra Custom Avatar Icons, 50-Item Wallpaper Collection & 50 Smart Voice Commands

## Overview
This implementation executes **Plan 50** and the user's icon customization request:
1. **Myra Avatar & Icon Studio**: Dynamic icon/avatar selection across the Header, Center VoiceOrb, Floating Assistant Bubble, and Chat message avatars.
2. **50-Pack Wallpaper & Avatar Themes**: Expanded catalog of 50 high-quality wallpapers and avatar styles spanning Anime, GF Romance, Cyberpunk AI, Nature Sakura, and Dark AMOLED.
3. **50 Smart Mobile Voice Commands**: Expanded quick command deck and voice recognition covering phone system settings, WhatsApp, YouTube, camera, alarms, wallpapers, and cute interactions.
4. **50% Battery Saver Mode**: Quick toggle and automated trigger for 50% battery threshold in the Smart Battery Saver system.

---

## Architecture & Changes

### 1. Avatar Model & Customization System (`src/utils/avatars.ts`, `src/types/assistant.ts`)
- Define `MyraAvatar` with properties:
  - `id`: unique identifier
  - `name`: display title (e.g., "Cute Anime Myra", "Hologram AI", "Sakura Princess", "Cyberpunk Idol", "Romantic Heart")
  - `category`: 'anime' | 'cute' | 'tech' | 'romance' | 'minimal'
  - `iconType`: 'emoji' | 'lucide' | 'image'
  - `iconValue`: emoji / Lucide icon name / high-res avatar image URL
  - `gradient`: matching tailwind gradient for badges and rings
  - `accentColor`: hex accent color
- Provide default avatar fallback and persistent storage via `localStorage.getItem('myra_selected_avatar')`.

### 2. Avatar Studio Modal (`src/components/AvatarStudioModal.tsx`)
- Interactive dialog with:
  - Live preview badge showing how Myra looks in Header, VoiceOrb, and Floating Bubble.
  - Category filters: All, Cute Anime, Tech AI, Romance GF, Minimal.
  - Grid of avatars with instant selection, sound effect feedback, and active checkmark.
  - Custom avatar upload or URL support.

### 3. Comprehensive Icon Integration across Applet
- **Header (`src/App.tsx`)**: Replaces fixed icons with the active Myra avatar badge and adds an "Avatar Studio" button.
- **VoiceOrb (`src/components/VoiceOrb.tsx`)**: Displays the selected avatar image/icon in the center core during idle, listening, thinking, and speaking states.
- **Floating Assistant Bubble (`src/components/FloatingAssistantBubble.tsx`)**: Displays the chosen avatar in the floating widget.
- **Chat Dialogue (`src/App.tsx`)**: Shows Myra's customized avatar next to assistant response bubbles.

### 4. 50-Item Wallpaper Collection (`src/utils/wallpapers.ts`)
- Expand `MYRA_WALLPAPERS` to 50 curated wallpapers organized by category with matching orb gradients and accent colors.
- Search and category filter inside `WallpaperModal.tsx`.

### 5. 50 Quick Smart Commands (`src/components/QuickCommands.tsx`)
- Expand quick commands to 50 categorized actions with scrollable tabs:
  - Device Controls (Torch, Volume 50%, Brightness 50%, Wi-Fi, Bluetooth, DND)
  - Entertainment & Media (YouTube music, videos)
  - WhatsApp & Communication (Chat, voice call, video call)
  - GF Mode & Romance (Compliments, love shayari, cute voice, hearts)
  - Wallpaper & Avatar shortcuts ("Icon badlo", "Anime avatar", "50 wallpapers")

### 6. 50% Battery Saver Preset (`src/components/SmartBatterySaverModal.tsx`)
- Add a direct 50% battery threshold trigger and quick preset.

---

## Verification Plan
1. Open Avatar Studio, change avatar to Anime / Hologram / Sakura, verify it updates in Header, VoiceOrb, Floating Bubble, and Chat.
2. Browse through the 50 wallpapers in the Wallpaper Studio and test instant switching.
3. Test voice command "Icon badlo" and "Plan 50" to ensure smooth voice automation.
4. Run `compile_applet` to verify zero TypeScript errors.
