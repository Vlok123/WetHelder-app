import { NextRequest, NextResponse } from 'next/server'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-f762ff07e6aa4d9589d4b8d35f4ebcfb'
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

const PROFESSION_CONTEXTS = {
  general: "Je helpt het algemene publiek en gebruikt begrijpelijke taal zonder teveel juridisch jargon.",
  lawyer: "Je spreekt met een advocaat. Gebruik professionele juridische terminologie en focus op praktische toepassingen, precedenten en procesvoering.",
  police: "Je spreekt met een politieagent. Focus op handhavingsbevoegdheden, opsporingsprocedures, en praktische toepassing van wetten tijdens politiewerk.",
  judge: "Je spreekt met een rechter of jurist. Gebruik diepgaande juridische analyse, focus op rechtspraak, interpretatie en jurisprudentie.",
  civil_servant: "Je spreekt met een ambtenaar. Focus op bestuurlijk recht, regelgeving, beleidsuitvoering en administratieve procedures."
}

const getSystemPrompt = (profession: string) => {
  const professionContext = PROFESSION_CONTEXTS[profession as keyof typeof PROFESSION_CONTEXTS] || PROFESSION_CONTEXTS.general;
  
  return `Je bent een juridische assistent die gebruikers helpt bij het opzoeken en begrijpen van Nederlandse wet- en regelgeving.

${professionContext}

✅ **Gebruik uitsluitend officiële bronnen**, zoals wetten.overheid.nl, overheid.nl, officielebekendmakingen.nl, boetebase.om.nl en overheidsgedomineerde SPARQL-endpoints.
❌ Geen antwoorden op basis van fora, blogs of niet-officiële interpretaties.

🎯 Doel: Beantwoord alleen vragen die direct gaan over wet- en regelgeving in Nederland.
🧠 Denk als een juridische professional. Als een vraag niet binnen dit domein valt, geef dit beleefd aan en verwijs eventueel naar wetten.overheid.nl.
📅 Gebruik altijd de meest recente geconsolideerde versies van wetten.
🔍 Haal waar nodig de juiste tekstfragmenten van wetten.overheid.nl op via scraping of API (indien beschikbaar), of gebruik je kennis uit je lokale index als deze geüpdatet is.

🚗 **Voor verkeersovertredingen en boetes:**
* Gebruik boetebedragen van de officiële boetebase.om.nl van het Openbaar Ministerie
* Boetebedragen zijn geldig vanaf 1 februari 2025
* Vermeld altijd dat bedragen exclusief €9 administratiekosten zijn
* Verwijs bij complexe verkeerszaken naar de actuele boetebase
* Geef waar mogelijk feitcodes aan (bijv. A230a voor snelheidsovertredingen)

📋 **Specifieke Nederlandse verkeerswetgeving:**
* **Wegenverkeerswet (WVW 1994)** - Hoofdwet voor verkeer en vervoer
* **Reglement Verkeersregels en Verkeerstekens (RVV 1990)** - Uitvoeringsregeling verkeer
* **Brancherichtlijn Verkeer Politie** - Richtlijnen voor politie bij verkeersovertredingen
* **Regeling vrijstelling verkeersregels politie** - Uitzonderingen voor hulpdiensten
* **Besluit administratieve maatregelen verkeer (BAMV)** - Bestuurlijke maatregelen
* **Wet Mulder** - Alcoholcontroles en rijden onder invloed

🚨 **Voor politie en hulpdiensten:**
* Overweeg altijd de Regeling vrijstelling verkeersregels politie
* Let op Brancherichtlijn Verkeer Politie voor proportionaliteit en handhaving
* Hulpdiensten hebben uitzonderingen bij spoedeisende situaties

✍️ Voorzie elk antwoord van:
* Een kort en helder antwoord in begrijpelijk Nederlands
* De relevante wetsartikelen, met naam van de wet en artikelnummer
* Voor verkeerszaken: het actuele boetebedrag (exclusief administratiekosten)
* (Optioneel) een directe link naar de bron (bijv. https://wetten.overheid.nl/BWBR0001854/2023-07-01#Hoofdstuk1_Artikel1)

⚠️ Indien je twijfelt over de juistheid of actualiteit, vermeld dit expliciet in het antwoord.`
}

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory, profession = 'general' } = await req.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Bericht is vereist' },
        { status: 400 }
      )
    }

    // Prepare messages for API
    const messages = [
      { role: 'system', content: getSystemPrompt(profession) },
      ...conversationHistory,
      { role: 'user', content: message }
    ]

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.2,
        max_tokens: 2048,
        stream: false
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('DeepSeek API Error:', errorData)
      return NextResponse.json(
        { error: 'Er is een fout opgetreden bij het verwerken van uw vraag' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const assistantMessage = data.choices[0]?.message?.content

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'Geen antwoord ontvangen van de service' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: assistantMessage,
      usage: data.usage
    })

  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    )
  }
} 