# 🚀 WetHelder - Netlify Deployment Gids

## ✅ Voorbereiding Voltooid

Je app is nu klaar voor Netlify deployment! Alle problemen zijn opgelost:

- ✅ CSS fouten gerepareerd (`border-primary-200` → `border-blue-200`)
- ✅ NextAuth environment variables toegevoegd
- ✅ TypeScript fouten opgelost
- ✅ Build test succesvol (zie terminal output)
- ✅ PostgreSQL configuratie klaar
- ✅ Netlify configuratie bestanden aangemaakt

---

## 📋 Stap-voor-Stap Deployment

### **1. Database Setup (VERPLICHT)**

Maak een gratis PostgreSQL database aan bij één van deze providers:

**🔥 Aanbevolen: Neon.tech**
1. Ga naar [neon.tech](https://neon.tech)
2. Maak gratis account aan
3. Maak nieuwe database: `wetHelder`
4. Kopieer de connection string (begint met `postgresql://`)

**Alternatieven:**
- [Supabase.com](https://supabase.com) (gratis tier)
- [Railway.app](https://railway.app) (gratis tier)

### **2. GitHub Repository**

1. Maak nieuwe repository op GitHub
2. Upload je code:
```bash
git init
git add .
git commit -m "Initial commit - WetHelder app"
git branch -M main
git remote add origin https://github.com/jouw-username/wetHelder.git
git push -u origin main
```

### **3. Netlify Deployment**

1. Ga naar [netlify.com](https://netlify.com)
2. Klik "New site from Git"
3. Verbind je GitHub repository
4. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`

### **4. Environment Variables**

Ga naar **Site settings > Environment variables** en voeg toe:

```
NEXTAUTH_URL=https://jouw-site-naam.netlify.app
NEXTAUTH_SECRET=uqyD6cAFPtkglDrTdcehDsAACmjx3bDbrB4Txs4seKw=
DEEPSEEK_API_KEY=sk-f762ff07e6aa4d9589d4b8d35f4ebcfb
DATABASE_URL=postgresql://user:password@host:port/dbname
```

**⚠️ Belangrijk:** Vervang `DATABASE_URL` met jouw echte PostgreSQL connection string!

### **5. Netlify Plugin**

Voeg de Next.js plugin toe:
1. Ga naar **Site settings > Build & deploy > Plugins**
2. Zoek en installeer: `@netlify/plugin-nextjs`

### **6. Database Migratie**

Na deployment, voer database migratie uit:
1. Ga naar **Site settings > Functions**
2. Of gebruik Netlify CLI:
```bash
netlify dev
npx prisma db push
```

---

## 🔧 Troubleshooting

### **Build Errors**
- Controleer of alle environment variables correct zijn ingesteld
- Zorg dat `DATABASE_URL` een geldige PostgreSQL connection string is

### **Database Errors**
- Controleer of je database online is
- Test de connection string lokaal eerst

### **NextAuth Errors**
- Zorg dat `NEXTAUTH_URL` exact je Netlify URL is
- Controleer of `NEXTAUTH_SECRET` is ingesteld

---

## 📊 Na Deployment

Je app heeft deze features:
- ✅ Nederlandse juridische AI assistent
- ✅ Verkeersovertredingen database
- ✅ User accounts met Google OAuth
- ✅ Chat geschiedenis
- ✅ Admin dashboard
- ✅ Privacy disclaimers
- ✅ Responsive design

**Admin toegang:**
- Email: `sanderhelmink@gmail.com`
- Wachtwoord: `Beheerder123`

---

## 🎯 Success!

Als alles goed gaat, is je WetHelder app binnen 10 minuten live op Netlify! 

**Test deze URLs na deployment:**
- `/` - Hoofdpagina met chat
- `/boetes` - Verkeersovertredingen
- `/auth/signin` - Inloggen
- `/auth/signup` - Registreren
- `/admin` - Admin dashboard

Veel succes! 🚀
