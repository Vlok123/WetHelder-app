import { NextRequest, NextResponse } from 'next/server'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

interface SearchResult {
  category: string
  violation: string
  fineAmount: number
  feitcode?: string
  description: string
  confidence: number
}

// Extended synonym mapping for better search results
const SEARCH_SYNONYMS: Record<string, string[]> = {
  'inhalen': ['overhalen', 'rechts inhalen', 'links inhalen', 'rechtsinhalen', 'linksinhalen'],
  'overhalen': ['inhalen', 'rechts inhalen', 'links inhalen'],
  'rechtsinhalen': ['inhalen', 'overhalen', 'rechts inhalen'],
  'linksinhalen': ['inhalen', 'overhalen', 'links inhalen'],
  'rechts inhalen': ['inhalen', 'overhalen', 'rechtsinhalen'],
  'links inhalen': ['inhalen', 'overhalen', 'linksinhalen'],
  'telefoneren': ['bellen', 'telefoon', 'mobiel', 'handheld'],
  'bellen': ['telefoneren', 'telefoon', 'mobiel'],
  'whatsappen': ['appen', 'berichten', 'sms', 'chatten'],
  'appen': ['whatsappen', 'berichten', 'sms'],
  'sms\'en': ['appen', 'berichten', 'whatsappen'],
  'te hard': ['snelheid', 'snelheidslimiet', 'overschrijding', 'snel rijden'],
  'snelheid': ['te hard', 'snelheidslimiet', 'overschrijding'],
  'rood licht': ['stoplicht', 'verkeerslicht', 'door rood', 'rood'],
  'stoplicht': ['rood licht', 'verkeerslicht', 'rood'],
  'parkeren': ['stil staan', 'stoppen', 'neerzetten'],
  'stil staan': ['parkeren', 'stoppen'],
  'alcohol': ['dronken', 'onder invloed', 'promille', 'blazen'],
  'dronken': ['alcohol', 'onder invloed', 'promille'],
  'gordel': ['veiligheidsgordel', 'niet vastgemaakt'],
  'voorrang': ['voorrangsbord', 'verlenen', 'stoppen'],
  'ambulance': ['ziekenwagen', 'hulpdiensten', 'sirene'],
  'invalidenplaats': ['invalidenparkeerplaats', 'gehandicapte parkeerplaats', 'blauwe zone'],
  'gehandicapt': ['invalide', 'invalidenplaats', 'invalidenparkeerplaats']
}

const VIOLATION_DATABASE = [
  // Snelheidsovertredingen
  { 
    violation: 'Te hard rijden 1-10 km/h', 
    amount: 33, 
    category: 'Snelheid', 
    feitcode: 'A230a',
    officialText: 'Artikel 20 lid 1 en 2 RVV 1990: Niet rijden met de maximaal toegestane snelheid volgens artikel 21, 22 of 23 RVV 1990. Overschrijding van 1 tot 10 km/h.',
    keywords: ['snelheid', 'te hard', 'snelheidslimiet', 'km/h', 'overschrijding', 'snel rijden'] 
  },
  { 
    violation: 'Te hard rijden 11-15 km/h', 
    amount: 69, 
    category: 'Snelheid', 
    feitcode: 'A230b',
    officialText: 'Artikel 20 lid 1 en 2 RVV 1990: Niet rijden met de maximaal toegestane snelheid volgens artikel 21, 22 of 23 RVV 1990. Overschrijding van 11 tot 15 km/h.',
    keywords: ['snelheid', 'te hard', '11', '15', 'km/h'] 
  },
  { 
    violation: 'Te hard rijden 16-20 km/h', 
    amount: 113, 
    category: 'Snelheid', 
    feitcode: 'A230c',
    officialText: 'Artikel 20 lid 1 en 2 RVV 1990: Niet rijden met de maximaal toegestane snelheid volgens artikel 21, 22 of 23 RVV 1990. Overschrijding van 16 tot 20 km/h.',
    keywords: ['snelheid', 'te hard', '16', '20', 'km/h'] 
  },
  { 
    violation: 'Te hard rijden 21-25 km/h', 
    amount: 183, 
    category: 'Snelheid', 
    feitcode: 'A230d',
    officialText: 'Artikel 20 lid 1 en 2 RVV 1990: Niet rijden met de maximaal toegestane snelheid volgens artikel 21, 22 of 23 RVV 1990. Overschrijding van 21 tot 25 km/h.',
    keywords: ['snelheid', 'te hard', '21', '25', 'km/h'] 
  },
  { 
    violation: 'Te hard rijden 26-30 km/h', 
    amount: 274, 
    category: 'Snelheid', 
    feitcode: 'A230e',
    officialText: 'Artikel 20 lid 1 en 2 RVV 1990: Niet rijden met de maximaal toegestane snelheid volgens artikel 21, 22 of 23 RVV 1990. Overschrijding van 26 tot 30 km/h.',
    keywords: ['snelheid', 'te hard', '26', '30', 'km/h'] 
  },
  
  // Verkeerslichten en borden
  { 
    violation: 'Door rood licht rijden', 
    amount: 280, 
    category: 'Verkeerslichten', 
    feitcode: 'A068',
    officialText: 'Artikel 68 lid 1 RVV 1990: Niet stoppen voor een rood verkeerslicht of een geel knipperlicht na rood.',
    keywords: ['rood licht', 'stoplicht', 'verkeerslicht', 'rood', 'negeren'] 
  },
  { 
    violation: 'Negeren stopbord', 
    amount: 280, 
    category: 'Verkeersborden', 
    feitcode: 'A050',
    officialText: 'Artikel 50 RVV 1990: Niet stoppen voor bord B6 (stopbord) en doorrijden zonder voorrang te verlenen aan bestuurders op de kruisende weg.',
    keywords: ['stopbord', 'stop', 'stoppen', 'negeren stopbord', 'doorrijden'] 
  },
  { 
    violation: 'Negeren voorrangsbord', 
    amount: 230, 
    category: 'Verkeersborden', 
    feitcode: 'A019',
    officialText: 'Artikel 19 RVV 1990: Niet verlenen van voorrang aan bestuurders op de kruisende weg waar bord B1 (voorrangsbord) staat.',
    keywords: ['voorrang', 'voorrangsbord', 'verlenen', 'negeren voorrang'] 
  },
  
  // Inhalen en wegmarkering  
  { 
    violation: 'Inhalen bij doorgetrokken streep', 
    amount: 280, 
    category: 'Wegmarkering', 
    feitcode: 'A240',
    officialText: 'Artikel 24 lid 1 RVV 1990: Inhalen terwijl de doorgetrokken streep wordt overschreden, wat niet is toegestaan volgens de wegmarkering.',
    keywords: ['inhalen', 'doorgetrokken streep', 'witte streep', 'overhalen', 'wegmarkering', 'dubbele streep', 'inhaalverbod', 'rechtsinhalen', 'linksinhalen', 'rechts inhalen', 'links inhalen'] 
  },
  { 
    violation: 'Inhalen in bocht', 
    amount: 350, 
    category: 'Inhalen', 
    feitcode: 'A007a',
    officialText: 'Artikel 7 lid 2 sub a WVW 1994: Inhalen in of vlak voor een bocht waar het zicht beperkt is, wat gevaar kan opleveren.',
    keywords: ['inhalen', 'bocht', 'overhalen', 'inhalen bocht', 'gevaarlijk inhalen', 'rechtsinhalen', 'linksinhalen'] 
  },
  { 
    violation: 'Inhalen bij zebrapad', 
    amount: 280, 
    category: 'Inhalen', 
    feitcode: 'A007b',
    officialText: 'Artikel 7 lid 2 sub b WVW 1994: Inhalen vlak voor of op een voetgangersoversteekplaats (zebrapad).',
    keywords: ['inhalen', 'zebrapad', 'oversteekplaats', 'voetgangersoversteekplaats', 'overhalen'] 
  },
  
  // Gedrag achter het stuur
  { 
    violation: 'Bellen achter het stuur', 
    amount: 380, 
    category: 'Gedrag', 
    feitcode: 'A061a',
    officialText: 'Artikel 61a RVV 1990: Het vasthouden van een mobiele telefoon tijdens het rijden voor het voeren van een gesprek.',
    keywords: ['bellen', 'telefoon', 'mobiel', 'handheld', 'vasthouden telefoon', 'telefoneren'] 
  },
  { 
    violation: 'Appen achter het stuur', 
    amount: 380, 
    category: 'Gedrag', 
    feitcode: 'A061b',
    officialText: 'Artikel 61a RVV 1990: Het vasthouden van een mobiele telefoon tijdens het rijden voor het verzenden van berichten (WhatsApp, SMS).',
    keywords: ['appen', 'whatsappen', 'sms', 'berichten', 'telefoon vasthouden', 'chatten', 'sms\'en'] 
  },
  { 
    violation: 'Geen gordel om', 
    amount: 150, 
    category: 'Veiligheid', 
    feitcode: 'A059',
    officialText: 'Artikel 59 RVV 1990: Niet dragen van de veiligheidsgordel tijdens het besturen van een motorvoertuig.',
    keywords: ['gordel', 'veiligheidsgordel', 'niet vastgemaakt', 'veiligheid'] 
  },
  { 
    violation: 'Rijden onder invloed alcohol', 
    amount: 525, 
    category: 'Alcohol', 
    feitcode: 'A008',
    officialText: 'Artikel 8 WVW 1994: Besturen van een motorvoertuig terwijl het alcoholgehalte van de adem hoger is dan 220 microgram per liter uitgeademde lucht.',
    keywords: ['alcohol', 'dronken', 'onder invloed', 'promille', 'blazen'] 
  },
  
  // Parkeren
  { 
    violation: 'Parkeren op invalidenparkeerplaats', 
    amount: 390, 
    category: 'Parkeren', 
    feitcode: 'A024',
    officialText: 'Artikel 24 RVV 1990: Parkeren op een plaats die is bestemd voor gehandicapten zonder geldige invalidenkaart.',
    keywords: ['invalide', 'gehandicapt', 'invalidenparkeerplaats', 'blauwe zone', 'invalidenkaart', 'invalidenplaats', 'gehandicapte parkeerplaats'] 
  },
  { 
    violation: 'Parkeren bij brandkraan/brandweerweg', 
    amount: 140, 
    category: 'Parkeren', 
    feitcode: 'A025',
    officialText: 'Artikel 25 RVV 1990: Parkeren voor een brandkraan, brandweerweg of andere toegang voor hulpdiensten.',
    keywords: ['brandkraan', 'brandweer', 'toegang', 'hulpdiensten', 'nooduitgang'] 
  },
  { 
    violation: 'Parkeren op bushalte', 
    amount: 100, 
    category: 'Parkeren', 
    feitcode: 'A023',
    officialText: 'Artikel 23 RVV 1990: Parkeren op een bushalte of andere plaats bestemd voor openbaar vervoer.',
    keywords: ['bushalte', 'halte', 'openbaar vervoer', 'bus'] 
  },
  { 
    violation: 'Parkeren zonder parkeerschijf', 
    amount: 65, 
    category: 'Parkeren', 
    feitcode: 'A070',
    officialText: 'Artikel 70 RVV 1990: Parkeren in een blauwe zone zonder parkeerschijf of met verkeerde aankomsttijd.',
    keywords: ['parkeerschijf', 'blauwe zone', 'tijdlimiet'] 
  },
  
  // Overige overtredingen
  { 
    violation: 'Geen voorrang verlenen aan ambulance', 
    amount: 280, 
    category: 'Hulpdiensten', 
    feitcode: 'A058',
    officialText: 'Artikel 58 RVV 1990: Niet onmiddellijk de doorgang vrijmaken voor ambulances, politie en brandweer met optische en geluidssignalen.',
    keywords: ['ambulance', 'ziekenwagen', 'hulpdiensten', 'sirene', 'voorrang verlenen'] 
  },
  { 
    violation: 'Achteruitrijden op snelweg', 
    amount: 280, 
    category: 'Snelweg', 
    feitcode: 'A011',
    officialText: 'Artikel 11 WVW 1994: Achteruitrijden op de rijbaan van een autosnelweg of autoweg.',
    keywords: ['achteruitrijden', 'snelweg', 'achteruit', 'verkeerde richting'] 
  },
  { 
    violation: 'Spookrijden', 
    amount: 380, 
    category: 'Snelweg', 
    feitcode: 'A012',
    officialText: 'Artikel 12 WVW 1994: Rijden in tegengestelde richting op de rijbaan van een autosnelweg of autoweg.',
    keywords: ['spookrijden', 'verkeerde richting', 'tegemoetkomend', 'snelweg'] 
  }
]

const expandSearchTerms = (query: string): string[] => {
  const originalTerms = query.toLowerCase().split(/\s+/)
  const expandedTerms = new Set(originalTerms)
  
  // Add original query as a phrase
  expandedTerms.add(query.toLowerCase())
  
  // Add synonyms for each term
  originalTerms.forEach(term => {
    if (SEARCH_SYNONYMS[term]) {
      SEARCH_SYNONYMS[term].forEach(synonym => {
        expandedTerms.add(synonym.toLowerCase())
      })
    }
    
    // Check for compound terms that might match our synonyms
    Object.keys(SEARCH_SYNONYMS).forEach(key => {
      if (key.includes(term) || term.includes(key)) {
        SEARCH_SYNONYMS[key].forEach(synonym => {
          expandedTerms.add(synonym.toLowerCase())
        })
      }
    })
  })
  
  return Array.from(expandedTerms)
}

const improveSearchQuery = async (query: string): Promise<string[]> => {
  // First, use local synonym expansion for quick results
  const localTerms = expandSearchTerms(query)
  
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `Je bent een specialist in Nederlandse verkeersovertredingen. Gegeven een zoekterm, genereer relevante synoniemen en verwante termen voor verkeersovertredingen.

VOORBEELDEN:
- "inhalen doorgetrokken streep" → ["inhalen", "doorgetrokken streep", "witte streep", "overhalen", "wegmarkering", "inhaalverbod", "rechtsinhalen", "linksinhalen"]
- "door rood" → ["rood licht", "stoplicht", "verkeerslicht", "negeren"]
- "te hard" → ["snelheid", "snelheidslimiet", "km/h", "overschrijding"]
- "rechtsinhalen" → ["inhalen", "overhalen", "rechts inhalen", "links inhalen", "wegmarkering"]

Geef alleen relevante Nederlandse verkeersgerelateerde termen terug als JSON array van strings.`
          },
          {
            role: 'user', 
            content: `Zoekterm: "${query}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    })

    if (response.ok) {
      const data = await response.json()
      const content = data.choices[0]?.message?.content
      
      try {
        const terms = JSON.parse(content)
        if (Array.isArray(terms)) {
          // Combine local and AI terms
          const combined = localTerms.concat(terms.map(t => t.toLowerCase()))
          return Array.from(new Set(combined))
        }
      } catch {
        // Fallback: extract terms from text response
        const matches = content.match(/"([^"]+)"/g)
        if (matches) {
          const aiTerms = matches.map((m: string) => m.replace(/"/g, '').toLowerCase())
          const combined = localTerms.concat(aiTerms)
          return Array.from(new Set(combined))
        }
      }
    }
  } catch (error) {
    console.error('Query improvement failed, using local synonyms:', error)
  }
  
  return localTerms
}

const searchViolations = (searchTerms: string[], originalQuery: string): SearchResult[] => {
  const lowerTerms = searchTerms.map(term => term.toLowerCase())
  const lowerQuery = originalQuery.toLowerCase()
  
  const results: SearchResult[] = []
  
  VIOLATION_DATABASE.forEach(violation => {
    let score = 0
    let matchedTerms = 0
    
    // Check direct matches with violation text (highest priority)
    if (violation.violation.toLowerCase().includes(lowerQuery)) {
      score += 100
    }
    
    // Check if any search term is a close match to violation text
    lowerTerms.forEach(term => {
      if (violation.violation.toLowerCase().includes(term)) {
        score += 25
        matchedTerms++
      }
    })
    
    // Check keyword matches with improved scoring
    lowerTerms.forEach(term => {
      violation.keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase()
        
        // Exact keyword match
        if (keywordLower === term) {
          score += 30
          matchedTerms++
        }
        // Keyword contains term or vice versa
        else if (keywordLower.includes(term) || term.includes(keywordLower)) {
          score += 20
          matchedTerms++
        }
      })
      
      // Category match
      if (violation.category.toLowerCase().includes(term)) {
        score += 15
      }
      
      // Feitcode match
      if (violation.feitcode && violation.feitcode.toLowerCase().includes(term)) {
        score += 25
      }
    })
    
    // Boost score for multiple term matches
    if (matchedTerms > 1) {
      score *= 1.3
    }
    
    // Boost for very relevant matches
    if (matchedTerms >= 3) {
      score *= 1.5
    }
    
    if (score > 15) {
      results.push({
        category: violation.category,
        violation: violation.violation,
        fineAmount: violation.amount,
        feitcode: violation.feitcode,
        description: violation.officialText,
        confidence: Math.min(100, score)
      })
    }
  })
  
  // Sort by confidence and return top 8
  return results
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 8)
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] })
    }
    
    // Check if it's a feitcode
    if (/^[A-Z]{1,2}\s?\d{3}[a-z]?$/i.test(query.trim())) {
      const feitcode = query.toUpperCase().trim()
      return NextResponse.json({
        results: [{
          category: 'Feitcode',
          violation: `Overtreding met feitcode ${feitcode}`,
          fineAmount: 150,
          feitcode: feitcode,
          description: 'Specifieke overtreding volgens feitcode. Raadpleeg de Verkeersboete Assistent voor meer details.',
          confidence: 100
        }]
      })
    }
    
    // Improve search query with synonyms
    const searchTerms = await improveSearchQuery(query)
    
    // Search violations
    const results = searchViolations(searchTerms, query)
    
    return NextResponse.json({ 
      results,
      searchTerms: searchTerms // For debugging
    })
    
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het zoeken' },
      { status: 500 }
    )
  }
} 