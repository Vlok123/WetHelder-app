# Nederlandse Juridische AI Assistent

Een moderne web-applicatie die gebruikers helpt bij het opzoeken en begrijpen van Nederlandse wet- en regelgeving, gebaseerd op officiële bronnen.

## ✨ Kenmerken

- 🏛️ **Officiële bronnen**: Uitsluitend gebaseerd op wetten.overheid.nl en overheidsgedomineerde bronnen
- 🤖 **AI-aangedreven**: Intelligente juridische interpretaties en antwoorden
- 💬 **Chat-interface**: Intuïtieve conversatie-ervaring
- 📱 **Responsive design**: Werkt op desktop en mobiel
- ⚡ **Real-time antwoorden**: Snelle responstijden
- 🔍 **Voorbeeldvragen**: Gemakkelijke start met veel gestelde vragen
- 👔 **Beroepspecifiek**: Pas antwoorden aan op basis van uw beroep (advocaat, politie, etc.)

## 🚀 Installatie

1. **Clone de repository:**
   ```bash
   git clone <repository-url>
   cd wet-app
   ```

2. **Installeer dependencies:**
   ```bash
   npm install
   ```

3. **Start de development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Open [http://localhost:3000](http://localhost:3000) in uw browser.

## 🔧 Configuratie

### Environment Variables

Maak een `.env.local` bestand in de root directory:

```env
DEEPSEEK_API_KEY=your-api-key-here
```

## 📚 Gebruik

1. **Start een conversatie**: Type uw juridische vraag in het invoerveld
2. **Voorbeeldvragen**: Klik op een van de voorgestelde vragen om te beginnen
3. **Officiële bronnen**: Alle antwoorden zijn gebaseerd op officiële Nederlandse wetgeving
4. **Links**: Directe links naar relevante wetsartikelen op wetten.overheid.nl

### Voorbeeldvragen

- "Wat staat er in artikel 5 van de Wegenverkeerswet?"
- "Mag een BOA geweld gebruiken volgens de wet?"
- "Wat zijn de eisen voor een bestuurlijke boete volgens de Awb?"
- "Welke bevoegdheden heeft de politie bij een aanhouding?"

## 🛠️ Technische Details

### Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: Advanced Language Model API
- **Deployment**: Vercel-ready

### API Configuratie

De applicatie gebruikt de volgende AI API instellingen:
- **Temperature**: 0.2 (voor juridische nauwkeurigheid)
- **Max tokens**: 2048
- **Context**: Volledige conversatiegeschiedenis
- **Beroepspecifiek**: Aangepaste prompts per beroepsgroep

### Systeemprompt

De AI gebruikt een gespecialiseerde prompt die:
- Alleen officiële bronnen gebruikt
- Juridische professionaliteit hanteert
- Nederlandse wetgeving prioriteert
- Bronverwijzingen toevoegt
- Twijfels expliciet vermeldt

## 🔒 Veiligheid en Betrouwbaarheid

- ✅ Alleen officiële overheid.nl bronnen
- ✅ Transparante bronverwijzingen
- ✅ Expliciete disclaimers bij onzekerheid
- ❌ Geen interpretaties van forums of blogs
- ❌ Geen niet-geverifieerde juridische adviezen

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build productie-versie
- `npm run start` - Start productie server
- `npm run lint` - Run ESLint

## 🤝 Bijdragen

Bijdragen zijn welkom! Open een issue of pull request voor:
- Bug-fixes
- Nieuwe features
- Documentatie-verbeteringen
- UI/UX-verbeteringen

## ⚖️ Disclaimer

Deze applicatie is bedoeld voor informatieve doeleinden. Voor juridisch advies dient u altijd een gekwalificeerde jurist te raadplegen.

## 📄 Licentie

MIT License - zie LICENSE bestand voor details. 