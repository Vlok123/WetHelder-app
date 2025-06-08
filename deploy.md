# 🚀 WetHelder - Complete Deployment Guide

## ✅ Wat ik al voor je heb gedaan:

- ✅ Database configuratie naar PostgreSQL  
- ✅ Netlify optimalisaties (netlify.toml + next.config.js)
- ✅ Build scripts geüpdatet  
- ✅ Git changes gecommit
- ✅ CSS problemen opgelost

## 🔥 Stappen die jij moet doen:

### **1. Neon Database Setup**
1. Ga naar [neon.tech](https://neon.tech) → Sign up (gratis)
2. Maak database: `wetHelder`
3. Kopieer de connection string (postgresql://...)

### **2. Update Environment**
Vervang je `.env.local` met:
```bash
DATABASE_URL="postgresql://jouw-neon-connection-string-hier"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="uqyD6cAFPtkglDrTdcehDsAACmjx3bDbrB4Txs4seKw="
DEEPSEEK_API_KEY="sk-f762ff07e6aa4d9589d4b8d35f4ebcfb"
```

### **3. Test Database Connectie**
```bash
npx prisma db push
```

### **4. GitHub Repository**
1. Ga naar [github.com](https://github.com) → New repository
2. Naam: `wetHelder` (of andere naam)
3. Voer uit:
```bash
git remote add origin https://github.com/jouw-username/wetHelder.git
git push -u origin main
```

### **5. Netlify Deployment**
1. Ga naar [netlify.com](https://netlify.com) → New site from Git
2. Selecteer je GitHub repo
3. Build settings:
   - Build command: `npm run deploy`
   - Publish directory: `.next`

### **6. Netlify Environment Variables**
Ga naar Site Settings → Environment Variables en voeg toe:
```
NEXTAUTH_URL=https://jouw-site-naam.netlify.app
NEXTAUTH_SECRET=uqyD6cAFPtkglDrTdcehDsAACmjx3bDbrB4Txs4seKw=
DEEPSEEK_API_KEY=sk-f762ff07e6aa4d9589d4b8d35f4ebcfb
DATABASE_URL=postgresql://jouw-neon-connection-string
```

### **7. Netlify Plugin**
Ga naar Site Settings → Build & Deploy → Plugins:
- Installeer: `@netlify/plugin-nextjs`

## 🎯 Success! 
Je app draait nu op Netlify met Neon database!

## 🔍 Features die live zijn:
- ✅ Nederlandse juridische AI assistent
- ✅ Verkeersovertredingen database  
- ✅ User accounts & gesprekgeschiedenis
- ✅ Admin dashboard (sanderhelmink@gmail.com)
- ✅ Responsive design
- ✅ Optimale performance

**Test URLs na deployment:**
- `/` - Hoofdpagina
- `/boetes` - Verkeersbonnen
- `/auth/signin` - Inloggen  
- `/admin` - Admin panel

Veel succes! 🚀 