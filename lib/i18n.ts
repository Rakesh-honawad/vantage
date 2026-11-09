export type Locale = 'en' | 'hi' | 'de'
export const defaultLocale: Locale = 'en'
export const locales = ['en', 'hi', 'de'] as const

export const translations = {
  en: {
    home: 'Home',
    packages: 'Packages',
    contact: 'Contact',
    findJourney: 'Find a journey',
    anywhereKerala: 'Anywhere in Kerala',
    anyMonth: 'Any month',
    featured: 'Featured journeys',
    seeAll: 'See all packages',
    searchPackages: 'Search places or journeys',
    anyDestination: 'Any destination',
    anyLength: 'Any length',
    anyHotel: 'Any hotel',
    clear: 'Clear',
    journey: 'journey',
    journeys: 'journeys',
    destination: 'Destination',
    when: 'When',
    packageLabel: 'Packages',
    route: 'The route',
    included: 'Included',
    notIncluded: 'Not included',
    whereStay: 'Where you stay',
    seasonalPrices: 'Seasonal prices',
    season: 'Season',
    dates: 'Dates',
    price: 'Price',
    askQuote: 'Travelling in another month? Ask us and we will quote it.',
    changes: 'Changes and cancellation',
    makeItYours: 'Make it yours',
    tellUsAbout: 'Tell us about',
    yourTrip: 'Your trip',
    about: 'About',
    enquiryReceived: 'Enquiry received',
    thankYou: 'Thank you',
    replyWithinHour: 'We will reply within the hour.',
    yourConsultant: "Your consultant's reply will appear on",
    yourEnquiryPage: 'your enquiry page',
    saveLink: 'Save the link.',
    sendEnquiry: 'Send enquiry',
    sending: 'Sending',
    yourName: 'Your name',
    phoneNumber: 'Phone number',
    whatsappConsent: 'I am happy to receive a WhatsApp reply.',
    privacyText: 'We only use your details to plan this trip.',
    privacyLink: 'How we use your data',
    done: 'Done',
    footerExplore: 'Explore',
    sayHello: 'Say hello',
    privacy: 'Privacy',
    search: 'Search',
    filter: 'Filter',
    count: 'journey',
    
  },
  hi: {
    home: 'होम',
    packages: 'पैकेज',
    contact: 'संपर्क',
    findJourney: 'यात्रा खोजें',
    anywhereKerala: 'केरल में कहीं भी',
    anyMonth: 'कोई भी महीना',
    featured: 'विशेष यात्रा',
    seeAll: 'सभी पैकेज देखें',
    searchPackages: 'स्थान या यात्रा खोजें',
    anyDestination: 'कोई भी गंतव्य',
    anyLength: 'कोई भी लंबाई',
    anyHotel: 'कोई भी होटल',
    clear: 'साफ़ करें',
    journey: 'यात्रा',
    journeys: 'यात्राएँ',
    destination: 'गंतव्य',
    when: 'कब',
    packageLabel: 'पैकेज',
    route: 'मार्ग',
    included: 'शामिल',
    notIncluded: 'शामिल नहीं',
    whereStay: 'आप कहाँ ठहरेंगे',
    seasonalPrices: 'मौसमी कीमतें',
    season: 'मौसम',
    dates: 'तारीखें',
    price: 'कीमत',
    askQuote: 'अलग महीने में यात्रा कर रहे हैं? हमें बताइए, हम उद्धरण देंगे।',
    changes: 'परिवर्तन और रद्दीकरण',
    makeItYours: 'इसे अपने लिए बनाएं',
    tellUsAbout: 'हमें बताइए',
    yourTrip: 'आपकी यात्रा',
    about: 'के बारे में',
    enquiryReceived: 'निवेदन प्राप्त हुआ',
    thankYou: 'धन्यवाद!',
    replyWithinHour: 'हम एक घंटे के भीतर जवाब देंगे।',
    yourConsultant: 'आपके कंसल्टेंट का जवाब यहाँ दिखाई देगा',
    yourEnquiryPage: 'आपकी enquiry page',
    saveLink: 'लिंक सेव करें।',
    sendEnquiry: 'रिक्वेस्ट भेजें',
    sending: 'भेज रहे हैं',
    yourName: 'आपका नाम',
    phoneNumber: 'फोन नंबर',
    whatsappConsent: 'मैं WhatsApp से जवाब पाना चाहता/चाहती हूँ।',
    privacyText: 'हम आपके विवरण का उपयोग केवल इस यात्रा की योजना बनाने के लिए करते हैं।',
    privacyLink: 'हम आपके डेटा का उपयोग कैसे करते हैं',
    done: 'ठीक है',
    footerExplore: 'एक्सप्लोर',
    sayHello: 'नमस्कार',
    privacy: 'गोपनीयता',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    count: 'यात्रा',
  },
  de: {
    home: 'Startseite',
    packages: 'Pakete',
    contact: 'Kontakt',
    findJourney: 'Reise finden',
    anywhereKerala: 'Überall in Kerala',
    anyMonth: 'Beliebiger Monat',
    featured: 'Empfohlene Reisen',
    seeAll: 'Alle Pakete anzeigen',
    searchPackages: 'Orte oder Reisen suchen',
    anyDestination: 'Beliebiges Ziel',
    anyLength: 'Beliebige Dauer',
    anyHotel: 'Beliebiges Hotel',
    clear: 'Zurücksetzen',
    journey: 'Reise',
    journeys: 'Reisen',
    destination: 'Ziel',
    when: 'Wann',
    packageLabel: 'Pakete',
    route: 'Route',
    included: 'Inklusive',
    notIncluded: 'Nicht inklusive',
    whereStay: 'Wo Sie übernachten',
    seasonalPrices: 'Saisonpreise',
    season: 'Saison',
    dates: 'Daten',
    price: 'Preis',
    askQuote: 'Reisen Sie in einem anderen Monat? Sagen Sie uns Bescheid, wir erstellen ein Angebot.',
    changes: 'Änderungen und Stornierung',
    makeItYours: 'Machen Sie es zu Ihrer Reise',
    tellUsAbout: 'Erzählen Sie uns von',
    yourTrip: 'Ihrer Reise',
    about: 'über',
    enquiryReceived: 'Anfrage erhalten',
    thankYou: 'Vielen Dank!',
    replyWithinHour: 'Wir antworten Ihnen innerhalb einer Stunde.',
    yourConsultant: 'Die Antwort Ihres Beraters erscheint auf',
    yourEnquiryPage: 'Ihrer Anfrageseite',
    saveLink: 'Link speichern.',
    sendEnquiry: 'Anfrage senden',
    sending: 'Senden',
    yourName: 'Ihr Name',
    phoneNumber: 'Telefonnummer',
    whatsappConsent: 'Ich bin damit einverstanden, per WhatsApp kontaktiert zu werden.',
    privacyText: 'Wir verwenden Ihre Daten nur zur Planung dieser Reise.',
    privacyLink: 'Wie wir Ihre Daten nutzen',
    done: 'Fertig',
    footerExplore: 'Entdecken',
    sayHello: 'Hallo sagen',
    privacy: 'Datenschutz',
    search: 'Suche',
    filter: 'Filter',
    count: 'Reise',
  },
} as const

export function getLocale(searchParams?: Record<string, string | string[] | undefined>): Locale {
  const value = Array.isArray(searchParams?.lang) ? searchParams.lang[0] : searchParams?.lang
  return value === 'hi' || value === 'de' ? value : 'en'
}

export function getText(locale: Locale, key: keyof typeof translations.en) {
  return translations[locale][key]
}

export function withLocale(path: string, locale: Locale) {
  const [base, raw] = path.split('?')
  const params = new URLSearchParams(raw ?? '')
  if (locale === 'en') params.delete('lang')
  else params.set('lang', locale)
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

export function pluralize(locale: Locale, count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural
}

export function labelForCount(locale: Locale, count: number) {
  return count === 1 ? getText(locale, 'journey') : getText(locale, 'journeys')
}

export function getSearchValue(searchParams?: Record<string, string | string[] | undefined>, key: string = 'lang') {
  const v = searchParams?.[key]
  return Array.isArray(v) ? v[0] : v
}
