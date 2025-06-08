# 🚀 Quick Netlify Upload

## ✅ KLAAR VOOR UPLOAD!

Je WetHelder app is volledig voorbereid. Volg deze stappen:

---

## 📤 **STAP 1: Upload naar GitHub**

1. **Ga naar [github.com](https://github.com)**
2. **Klik "New repository"** 
3. **Repository naam:** `wetHelder` (of wat je wilt)
4. **Maak hem PUBLIC** ✅
5. **Klik "Create repository"**

6. **Kopieer deze commando's en plak in je terminal:**

```bash
git remote add origin https://github.com/JOUW-USERNAME/wetHelder.git
git branch -M main  
git push -u origin main
```

_(Vervang `JOUW-USERNAME` met je GitHub username)_

---

## 🌐 **STAP 2: Deploy op Netlify**

1. **Ga naar [netlify.com](https://netlify.com)**
2. **Klik "New site from Git"**
3. **Verbind GitHub** en selecteer je `wetHelder` repository
4. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Klik "Deploy"

---

## ⚙️ **STAP 3: Environment Variables**

**GA NAAR:** Site settings > Environment variables > **Add variable**

**VOEG DEZE TOE:**

```
NEXTAUTH_URL = https://jouw-site-naam.netlify.app
NEXTAUTH_SECRET = uqyD6cAFPtkglDrTdcehDsAACmjx3bDbrB4Txs4seKw=
DEEPSEEK_API_KEY = sk-f762ff07e6aa4d9589d4b8d35f4ebcfb
DATABASE_URL = [MAAK GRATIS DATABASE - zie hieronder]
```

---

## 🗄️ **STAP 4: Gratis Database**

**Ga naar [neon.tech](https://neon.tech):**
1. Maak gratis account
2. Create Database: `wetHelder`  
3. **KOPIEER** de connection string
4. **PLAK** als `DATABASE_URL` in Netlify

---

## 🎯 **KLAAR!**

⏱️ **Binnen 5 minuten** staat je WetHelder app online!

**Test deze URLs:**
- `/` - Chat assistent  
- `/boetes` - Verkeersovertredingen
- `/admin` - Admin dashboard  

**Admin login:**
- Email: `sanderhelmink@gmail.com`
- Password: `Beheerder123`

---

## 🔄 **Updates maken**

Voor toekomstige updates:
```bash
git add .
git commit -m "Update beschrijving"
git push
```

Netlify deploy automatisch! 🚀
