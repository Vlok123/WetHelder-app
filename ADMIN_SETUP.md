# Admin Dashboard Setup

## 🔧 Admin Toegang Configureren

Om toegang te krijgen tot het admin dashboard, moet je je email adres toevoegen aan de admin lijst:

### 1. **Admin Email Toevoegen**

**Bestand:** `app/api/admin/stats/route.ts` (regel 8-12)
```typescript
const ADMIN_EMAILS = [
  'admin@example.com',
  'your-email@domain.com',
  'jouw-email@domein.nl'  // ← Voeg jouw email hier toe
]
```

**Bestand:** `app/components/ChatInterface.tsx` (regel 242-243)
```typescript
{(session.user?.email === 'admin@example.com' || 
  session.user?.email === 'your-email@domain.com' ||
  session.user?.email === 'jouw-email@domein.nl') && (  // ← En hier ook
```

### 2. **Admin Dashboard Bereiken**

1. **Maak een account aan** met je admin email
2. **Log in** op de applicatie  
3. **Klik op "Admin"** knop in de header (alleen zichtbaar voor admin emails)
4. **Bekijk statistieken** op `/admin`

## 📊 Dashboard Features

### **Statistieken Overzicht:**
- 👥 **Totaal Gebruikers** - Aantal geregistreerde accounts
- 💬 **Conversaties** - Totaal aantal gesprekken
- 📈 **Berichten** - Totaal aantal chat berichten
- 📅 **Vandaag** - Nieuwe gesprekken vandaag

### **Gedetailleerde Analytics:**
- 🎯 **Beroep Verdeling** - Welke beroepen gebruiken de app
- 📊 **Gebruikspatronen** - Berichten per week/gesprek
- 👤 **Recente Gebruikers** - Laatste 10 nieuwe accounts
- 🔍 **Real-time Data** - Alle statistieken live bijgewerkt

## 🛡️ Beveiliging

- ✅ **Email Verificatie** - Alleen specifieke emails krijgen toegang
- ✅ **Session Check** - Gebruiker moet ingelogd zijn
- ✅ **API Beveiliging** - Server-side admin controle
- ❌ **Geen Gebruikersbeheer** - Alleen statistieken (veiliger)

## 🚀 Dashboard URL

Na configuratie bereikbaar op: `http://localhost:3001/admin`

## 📝 Voorbeeld Statistieken

```
┌─ Admin Dashboard ──────────────────────┐
│                                        │
│ 👥 Gebruikers: 25    💬 Gesprekken: 150 │  
│ 📈 Berichten: 800    📅 Vandaag: 8     │
│                                        │
│ Beroep Verdeling:                      │
│ ████████ Advocaten (40%)               │
│ ██████ Algemeen (25%)                  │
│ ████ Politie (15%)                     │
│ ███ Rechters (12%)                     │
│ ██ Ambtenaren (8%)                     │
│                                        │
│ Laatste Gebruikers:                    │
│ Jan de Vries - Advocaat - Vandaag      │
│ Marie Jansen - Politie - Gisteren      │
│ ...                                    │
└────────────────────────────────────────┘
```

## ⚠️ Belangrijk

- **Verander de default admin emails** voor productie gebruik
- **Gebruik sterke authenticatie** voor admin accounts  
- **Monitor admin activiteit** voor beveiliging
- **Backup database** regelmatig voor data veiligheid 