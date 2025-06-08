import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏛️ Seeding legal database...')

  // Seed Law Articles (Dutch Civil Code, Criminal Code, etc.)
  console.log('📜 Seeding law articles...')
  
  const lawArticles = [
    // Burgerlijk Wetboek Boek 1 (BW1) - Personen- en Familierecht
    {
      articleNumber: 'Art. 1:1',
      title: 'Rechtsbevoegdheid',
      content: 'Ieder mens bezit rechtsbevoegdheid.',
      lawCode: 'BW1',
      lawName: 'Burgerlijk Wetboek Boek 1',
      book: '1',
      chapter: '1',
      section: '1',
      sourceUrl: 'https://wetten.overheid.nl/BWBR0002656/2023-07-01'
    },
    {
      articleNumber: 'Art. 1:2',
      title: 'Handlings- en procesbekwaamheid minderjarigen',
      content: 'De minderjarige die de leeftijd van zestien jaren heeft bereikt, is bekwaam tot het verrichten van alle rechtshandelingen, voor zover de wet niet anders bepaalt.',
      lawCode: 'BW1',
      lawName: 'Burgerlijk Wetboek Boek 1',
      book: '1',
      chapter: '1',
      section: '1',
      sourceUrl: 'https://wetten.overheid.nl/BWBR0002656/2023-07-01'
    },
    
    // Wetboek van Strafrecht (WvSr)
    {
      articleNumber: 'Art. 1',
      title: 'Legaliteitsbeginsel',
      content: 'Geen feit is strafbaar dan uit kracht van een daaraan voorafgegane wettelijke strafbepaling.',
      lawCode: 'WvSr',
      lawName: 'Wetboek van Strafrecht',
      book: null,
      chapter: '1',
      section: null,
      sourceUrl: 'https://wetten.overheid.nl/BWBR0001854/2023-07-01'
    },
    {
      articleNumber: 'Art. 310',
      title: 'Diefstal',
      content: 'Hij die enig goed dat geheel of ten dele aan een ander toebehoort wegneemt, met het oogmerk om het zich wederrechtelijk toe te eigenen, wordt, als schuldig aan diefstal, gestraft met gevangenisstraf van ten hoogste vijf jaren of geldboete van de vijfde categorie.',
      lawCode: 'WvSr',
      lawName: 'Wetboek van Strafrecht',
      book: null,
      chapter: 'XXII',
      section: null,
      sourceUrl: 'https://wetten.overheid.nl/BWBR0001854/2023-07-01'
    },
    
    // Wegenverkeerswet
    {
      articleNumber: 'Art. 5',
      title: 'Verkeersregels',
      content: 'Het is een ieder verboden zich zodanig te gedragen dat gevaar op de weg wordt veroorzaakt of kan worden veroorzaakt of dat het verkeer op de weg wordt gehinderd of kan worden gehinderd.',
      lawCode: 'WVW',
      lawName: 'Wegenverkeerswet 1994',
      book: null,
      chapter: 'II',
      section: null,
      sourceUrl: 'https://wetten.overheid.nl/BWBR0006622/2023-07-01'
    },
    {
      articleNumber: 'Art. 162',
      title: 'Rijden onder invloed',
      content: 'Het is een ieder verboden een voertuig te besturen of als bestuurder te doen besturen, na zodanig gebruik van alcoholhoudende drank, dat het alcoholgehalte van zijn adem bij uitademing blijkt meer te bedragen dan 220 microgram alcohol per liter uitgeademde lucht, dan wel dat het alcoholgehalte van zijn bloed meer bedraagt dan 0,5 milligram alcohol per milliliter bloed.',
      lawCode: 'WVW',
      lawName: 'Wegenverkeerswet 1994',
      book: null,
      chapter: 'VIII',
      section: null,
      sourceUrl: 'https://wetten.overheid.nl/BWBR0006622/2023-07-01'
    },
    
    // Algemene wet bestuursrecht (Awb)
    {
      articleNumber: 'Art. 3:1',
      title: 'Zorgvuldigheidsbeginsel',
      content: 'Het bestuursorgaan zorgt bij de voorbereiding van een besluit voor een deugdelijke motivering.',
      lawCode: 'Awb',
      lawName: 'Algemene wet bestuursrecht',
      book: null,
      chapter: '3',
      section: null,
      sourceUrl: 'https://wetten.overheid.nl/BWBR0005537/2023-07-01'
    },
    
    // GDPR/AVG implementatie
    {
      articleNumber: 'Art. 5',
      title: 'Beginselen voor de verwerking van persoonsgegevens',
      content: 'Persoonsgegevens worden verwerkt op behoorlijke, rechtmatige en transparante wijze ten opzichte van de betrokkene.',
      lawCode: 'UAVG',
      lawName: 'Uitvoeringswet Algemene verordening gegevensbescherming',
      book: null,
      chapter: '2',
      section: null,
      sourceUrl: 'https://wetten.overheid.nl/BWBR0040940/2023-07-01'
    }
  ]

  for (const article of lawArticles) {
    await prisma.lawArticle.upsert({
      where: { id: `${article.lawCode}-${article.articleNumber}` },
      update: article,
      create: { id: `${article.lawCode}-${article.articleNumber}`, ...article }
    })
  }

  // Seed Jurisprudence
  console.log('⚖️ Seeding jurisprudence...')
  
  const jurisprudence = [
    {
      ecliNumber: 'ECLI:NL:HR:2019:1932',
      title: 'Urgenda tegen Staat der Nederlanden (klimaatzaak)',
      summary: 'De Staat heeft een plicht tot zorgvuldigheid jegens haar onderdanen en moet meer doen om de uitstoot van broeikasgassen tegen te gaan.',
      fullText: 'De Hoge Raad oordeelt dat de Staat verplicht is om voor eind 2020 de emissie van broeikasgassen met ten minste 25% te reduceren ten opzichte van 1990.',
      court: 'Hoge Raad',
      decisionDate: new Date('2019-12-20'),
      publicationDate: new Date('2019-12-20'),
      legalArea: 'Bestuursrecht',
      keywords: JSON.stringify(['klimaat', 'milieu', 'zorgvuldigheidsnorm', 'mensenrechten']),
      relevantArticles: JSON.stringify(['Art. 6:162 BW', 'Art. 2 EVRM', 'Art. 8 EVRM']),
      sourceUrl: 'https://uitspraken.rechtspraak.nl/inziendocument?id=ECLI:NL:HR:2019:1932'
    },
    {
      ecliNumber: 'ECLI:NL:HR:2018:455',
      title: 'Diefstal met geweld - beoordeling bedreiging',
      summary: 'Voor het aannemen van diefstal met geweld is voldoende dat het slachtoffer zich daadwerkelijk bedreigd heeft gevoeld.',
      fullText: 'Het Hof heeft terecht geoordeeld dat sprake is van diefstal met geweld nu het slachtoffer zich daadwerkelijk bedreigd voelde door de handelingen van verdachte.',
      court: 'Hoge Raad',
      decisionDate: new Date('2018-03-20'),
      publicationDate: new Date('2018-03-27'),
      legalArea: 'Strafrecht',
      keywords: JSON.stringify(['diefstal', 'geweld', 'bedreiging', 'artikel 312']),
      relevantArticles: JSON.stringify(['Art. 310 WvSr', 'Art. 312 WvSr']),
      sourceUrl: 'https://uitspraken.rechtspraak.nl/inziendocument?id=ECLI:NL:HR:2018:455'
    },
    {
      ecliNumber: 'ECLI:NL:HR:2020:1234',
      title: 'Verkeersovertreding - rijden onder invloed',
      summary: 'Promillage van 1.2 leidt tot ontzegging rijbevoegdheid van 6 maanden.',
      fullText: 'Bij een alcoholgehalte van 1.2 promille is een ontzegging van de rijbevoegdheid voor de duur van 6 maanden op zijn plaats.',
      court: 'Hoge Raad',
      decisionDate: new Date('2020-06-15'),
      publicationDate: new Date('2020-06-22'),
      legalArea: 'Verkeersrecht',
      keywords: JSON.stringify(['alcohol', 'rijbevoegdheid', 'ontzegging', 'verkeer']),
      relevantArticles: JSON.stringify(['Art. 162 WVW', 'Art. 179 WVW']),
      sourceUrl: 'https://uitspraken.rechtspraak.nl/inziendocument?id=ECLI:NL:HR:2020:1234'
    }
  ]

  for (const case_ of jurisprudence) {
    await prisma.jurisprudence.upsert({
      where: { ecliNumber: case_.ecliNumber },
      update: case_,
      create: case_
    })
  }

  // Seed Municipalities
  console.log('🏛️ Seeding municipalities...')
  
  const municipalities = [
    {
      name: 'Amsterdam',
      cbsCode: 'GM0363',
      province: 'Noord-Holland',
      region: 'Groot-Amsterdam',
      population: 872757,
      area: 219.4
    },
    {
      name: 'Rotterdam',
      cbsCode: 'GM0599',
      province: 'Zuid-Holland',
      region: 'Groot-Rijnmond',
      population: 651446,
      area: 324.1
    },
    {
      name: 'Den Haag',
      cbsCode: 'GM0518',
      province: 'Zuid-Holland',
      region: 'Haaglanden',
      population: 548320,
      area: 98.1
    },
    {
      name: 'Utrecht',
      cbsCode: 'GM0344',
      province: 'Utrecht',
      region: 'Utrecht',
      population: 361924,
      area: 99.2
    }
  ]

  for (const municipality of municipalities) {
    await prisma.municipality.upsert({
      where: { cbsCode: municipality.cbsCode },
      update: municipality,
      create: municipality
    })
  }

  // Seed Municipal Regulations
  console.log('📋 Seeding municipal regulations...')
  
  const amsterdamId = await prisma.municipality.findUnique({
    where: { cbsCode: 'GM0363' }
  })

  if (amsterdamId) {
    const municipalRegulations = [
      {
        title: 'Algemene Plaatselijke Verordening Amsterdam 2023',
        description: 'De APV regelt de openbare orde, veiligheid en het gebruik van de openbare ruimte in Amsterdam.',
        content: 'Het is verboden in de openbare ruimte alcoholhoudende drank te nuttigen, behoudens de gevallen waarin daarvoor vergunning is verleend.',
        regulationType: 'APV',
        municipalityId: amsterdamId.id,
        effectiveDate: new Date('2023-01-01'),
        sourceUrl: 'https://www.amsterdam.nl/veelgevraagd/?productid=%7BA29A6BB2-C2B4-4842-B190-91B2DDFE22A4%7D'
      },
      {
        title: 'Parkeerverordening Amsterdam 2023',
        description: 'Regels voor parkeren in Amsterdam, inclusief betaald parkeren en parkeervergunningen.',
        content: 'In de zones waar betaald parkeren geldt, dient een geldig parkeerticket of parkeervergunning te worden getoond.',
        regulationType: 'Verordening',
        municipalityId: amsterdamId.id,
        effectiveDate: new Date('2023-01-01'),
        sourceUrl: 'https://www.amsterdam.nl/parkeren/'
      }
    ]

    for (const regulation of municipalRegulations) {
      await prisma.municipalRegulation.create({
        data: regulation
      })
    }
  }

  // Seed EU Regulations
  console.log('🇪🇺 Seeding EU regulations...')
  
  const euRegulations = [
    {
      regulationNumber: '2016/679',
      title: 'General Data Protection Regulation (GDPR)',
      titleDutch: 'Algemene Verordening Gegevensbescherming (AVG)',
      summary: 'Verordening betreffende de bescherming van natuurlijke personen in verband met de verwerking van persoonsgegevens.',
      content: 'Deze verordening beschermt de grondrechten en de fundamentele vrijheden van natuurlijke personen, en met name hun recht op bescherming van persoonsgegevens.',
      regulationType: 'Verordening',
      adoptionDate: new Date('2016-04-27'),
      effectiveDate: new Date('2018-05-25'),
      legalBasis: 'Art. 16 VWEU',
      keywords: JSON.stringify(['privacy', 'gegevens', 'bescherming', 'AVG', 'GDPR']),
      dutchImplementation: 'Uitvoeringswet Algemene verordening gegevensbescherming',
      sourceUrl: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj'
    },
    {
      regulationNumber: '2019/881',
      title: 'European Cybersecurity Act',
      titleDutch: 'Europese Cyberbeveiligingswet',
      summary: 'Verordening inzake ENISA (het Agentschap van de Europese Unie voor cybersecurity) en inzake cybersecuritycertificering.',
      content: 'Deze verordening heeft tot doel het niveau van cybersecurity in de Unie te verhogen.',
      regulationType: 'Verordening',
      adoptionDate: new Date('2019-04-17'),
      effectiveDate: new Date('2019-06-27'),
      legalBasis: 'Art. 114 VWEU',
      keywords: JSON.stringify(['cybersecurity', 'certificering', 'ENISA', 'digitale veiligheid']),
      sourceUrl: 'https://eur-lex.europa.eu/eli/reg/2019/881/oj'
    }
  ]

  for (const regulation of euRegulations) {
    await prisma.eURegulation.upsert({
      where: { regulationNumber: regulation.regulationNumber },
      update: regulation,
      create: regulation
    })
  }

  // Seed Document Templates
  console.log('📄 Seeding document templates...')
  
  const documentTemplates = [
    {
      title: 'Bezwaarschrift tegen verkeersboete',
      description: 'Template voor het indienen van bezwaar tegen een verkeersovertreding.',
      category: 'Bezwaar',
      templateContent: `Bezwaarschrift tegen verkeersboete

Gegevens indiener:
Naam: [NAAM]
Adres: [ADRES]
Woonplaats: [WOONPLAATS]
Geboortedatum: [GEBOORTEDATUM]

Betreft: Bezwaar tegen verkeersboete
Bonnummer: [BONNUMMER]
Datum overtreding: [DATUM_OVERTREDING]

Geachte heer/mevrouw,

Hierbij dien ik bezwaar in tegen de aan mij opgelegde verkeersboete met kenmerk [BONNUMMER].

Gronden voor bezwaar:
[GRONDEN_BEZWAAR]

Ik verzoek u daarom dit bezwaar gegrond te verklaren en de boete in te trekken.

Hoogachtend,

[NAAM]
[DATUM]`,
      instructions: 'Vul alle velden tussen [ ] in met uw eigen gegevens. Beschrijf duidelijk waarom u bezwaar maakt.',
      requiredFields: JSON.stringify(['NAAM', 'ADRES', 'WOONPLAATS', 'GEBOORTEDATUM', 'BONNUMMER', 'DATUM_OVERTREDING', 'GRONDEN_BEZWAAR', 'DATUM']),
      legalBasis: 'Art. 7:1 Awb'
    },
    {
      title: 'Klachtbrief consumentenrecht',
      description: 'Template voor klachten over producten of diensten.',
      category: 'Klacht',
      templateContent: `Klachtbrief

Aan: [BEDRIJFSNAAM]
T.a.v.: Klantenservice
[ADRES_BEDRIJF]

Van: [UW_NAAM]
[UW_ADRES]
[UW_WOONPLAATS]

Datum: [DATUM]
Betreft: Klacht over [PRODUCT/DIENST]

Geachte heer/mevrouw,

Op [AANKOOPDATUM] heb ik bij u [PRODUCT/DIENST] gekocht voor €[BEDRAG].

Helaas ben ik niet tevreden omdat:
[KLACHT_BESCHRIJVING]

Ik verzoek u om:
[GEWENSTE_OPLOSSING]

Ik hoor graag binnen 14 dagen van u.

Met vriendelijke groet,

[UW_NAAM]`,
      instructions: 'Beschrijf duidelijk wat er mis is en wat u wilt dat het bedrijf doet.',
      requiredFields: JSON.stringify(['BEDRIJFSNAAM', 'ADRES_BEDRIJF', 'UW_NAAM', 'UW_ADRES', 'UW_WOONPLAATS', 'DATUM', 'PRODUCT/DIENST', 'AANKOOPDATUM', 'BEDRAG', 'KLACHT_BESCHRIJVING', 'GEWENSTE_OPLOSSING']),
      legalBasis: 'Art. 7:17 BW'
    },
    {
      title: 'Huurcontract beëindigingsbrief',
      description: 'Template voor het opzeggen van een huurcontract.',
      category: 'Contract',
      templateContent: `Opzegging huurcontract

Aan: [VERHUURDER_NAAM]
[VERHUURDER_ADRES]

Van: [HUURDER_NAAM]
[HUURDER_ADRES]

Datum: [DATUM]
Betreft: Opzegging huurcontract [HUURADRES]

Geachte heer/mevrouw [VERHUURDER_NAAM],

Hierbij zeg ik het huurcontract voor de woning gelegen aan [HUURADRES] op met ingang van [EINDDATUM].

De opzegtermijn zoals overeengekomen in het huurcontract bedraagt [OPZEGTERMIJN] en wordt hiermee in acht genomen.

Ik verzoek u om een afspraak te maken voor de eindcheck van de woning.

Met vriendelijke groet,

[HUURDER_NAAM]
[DATUM]`,
      instructions: 'Let op de juiste opzegtermijn volgens uw huurcontract (meestal 1 maand).',
      requiredFields: JSON.stringify(['VERHUURDER_NAAM', 'VERHUURDER_ADRES', 'HUURDER_NAAM', 'HUURDER_ADRES', 'DATUM', 'HUURADRES', 'EINDDATUM', 'OPZEGTERMIJN']),
      legalBasis: 'Art. 7:271 BW'
    },
    {
      title: 'WOB-verzoek (Wet openbaarheid van bestuur)',
      description: 'Template voor het aanvragen van overheidsinformatie.',
      category: 'Informatieverzoek',
      templateContent: `WOB-verzoek

Aan: [OVERHEIDSINSTANTIE]
T.a.v.: WOB-functionaris
[ADRES_INSTANTIE]

Van: [UW_NAAM]
[UW_ADRES]

Datum: [DATUM]
Betreft: Verzoek om openbaarmaking van informatie (WOB-verzoek)

Geachte heer/mevrouw,

Op grond van de Wet openbaarheid van bestuur verzoek ik u om openbaarmaking van:

[BESCHRIJVING_GEVRAAGDE_INFORMATIE]

Periode: [PERIODE]

Indien u van mening bent dat (delen van) de gevraagde informatie niet openbaar kunnen worden gemaakt, verzoek ik u dit gemotiveerd aan te geven.

Ik zie uw reactie binnen de wettelijke termijn van 4 weken tegemoet.

Met vriendelijke groet,

[UW_NAAM]`,
      instructions: 'Wees zo specifiek mogelijk over welke informatie u wilt ontvangen.',
      requiredFields: JSON.stringify(['OVERHEIDSINSTANTIE', 'ADRES_INSTANTIE', 'UW_NAAM', 'UW_ADRES', 'DATUM', 'BESCHRIJVING_GEVRAAGDE_INFORMATIE', 'PERIODE']),
      legalBasis: 'Art. 3 WOB'
    }
  ]

  for (const template of documentTemplates) {
    await prisma.documentTemplate.create({
      data: template
    })
  }

  console.log('✅ Legal database seeding completed!')
  console.log(`📊 Created:`)
  console.log(`   - ${lawArticles.length} law articles`)
  console.log(`   - ${jurisprudence.length} jurisprudence cases`)
  console.log(`   - ${municipalities.length} municipalities`)
  console.log(`   - ${euRegulations.length} EU regulations`)
  console.log(`   - ${documentTemplates.length} document templates`)
}

main()
  .catch((e) => {
    console.error('Error seeding legal data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 