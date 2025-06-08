# 🏛️ WetHelder

**Nederlandse juridische AI-assistent met verkeersbonnen zoekfunctionaliteit**

Een moderne web-applicatie die Nederlandse gebruikers helpt met juridische vragen en verkeersovertredingen door middel van AI-powered chat en gestructureerde zoekfunctionaliteit.

## ✨ Features

### 🤖 **AI Chat Assistent**
- Intelligente conversaties over Nederlandse wetgeving
- Contextbewuste antwoorden met juridische referenties
- Geïntegreerd met DeepSeek AI voor accurate informatie

### 🚗 **Verkeersbonnen Database**
- Zoek in uitgebreide database van verkeersovertredingen
- Filter op categorie, bedrag en artikelnummer
- Real-time zoekresultaten met gedetailleerde informatie

### 👤 **Gebruikersbeheer**
- Beveiligde authenticatie met NextAuth.js
- Persoonlijke chat geschiedenis
- Admin dashboard voor beheer

### 🎨 **Modern UI/UX**
- Responsive design met Tailwind CSS
- Dark/light mode ondersteuning
- Intuïtieve gebruikersinterface

## 🚀 Tech Stack

- **Frontend:** Next.js 14, React, TypeScript
- **Styling:** Tailwind CSS, Lucide Icons
- **Database:** PostgreSQL (Neon), Prisma ORM
- **Authentication:** NextAuth.js
- **AI:** DeepSeek API
- **Deployment:** Netlify

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- DeepSeek API key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/jouwgebruikersnaam/WetHelder-app.git
   cd WetHelder-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment variables**
   Create `.env.local`:
   ```bash
   DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   DEEPSEEK_API_KEY="your-deepseek-api-key"
   ```

4. **Database setup**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 Usage

### Chat Interface
1. Navigate to the main page
2. Start typing your legal question
3. Receive AI-powered responses with references

### Verkeersbonnen Search
1. Go to `/boetes`
2. Search by keyword, category, or amount
3. View detailed information about traffic violations

## 🏗️ Project Structure

```
├── app/
│   ├── api/           # API routes
│   ├── auth/          # Authentication pages
│   ├── boetes/        # Traffic violations search
│   ├── components/    # React components
│   └── globals.css    # Global styles
├── prisma/
│   └── schema.prisma  # Database schema
├── public/            # Static assets
└── netlify.toml       # Netlify configuration
```

## 🌐 Deployment

### Netlify Deployment
1. Connect GitHub repository to Netlify
2. Configure environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

Build settings are preconfigured in `netlify.toml`.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created with ❤️ for the Dutch legal community

---

**Status:** 🟢 Production Ready | **Database:** 🟢 Connected | **AI:** 🟢 Functional 