import React, { createContext, useContext, useState, useEffect } from "react";

// Master Translations Dictionary for Smart Taluk Office Queue System
export const translations = {
  // Navigation & Brand
  nav: {
    portalName: {
      en: "Smart e-Seva Portal",
      ta: "ஸ்மார்ட் இ-சேவை போர்டல்",
      both: "Smart e-Seva • இ-சேவை போர்டல்",
    },
    talukOffice: {
      en: "Taluk Office",
      ta: "வட்டாட்சியர் அலுவலகம்",
      both: "Taluk Office • வட்டாட்சியர் அலுவலகம்",
    },
    queueManagement: {
      en: "Queue Management",
      ta: "வரிசை மேலாண்மை",
      both: "Queue Management • வரிசை மேலாண்மை",
    },
    publicScreen: {
      en: "Public Screen",
      ta: "பொது திரை பலகை",
      both: "Public Screen • பொது திரை பலகை",
    },
    myToken: {
      en: "My Token",
      ta: "என் டோக்கன்",
      both: "My Token • என் டோக்கன்",
    },
    takeToken: {
      en: "Take Token",
      ta: "டோக்கன் பெற",
      both: "Take Token • டோக்கன் பெற",
    },
    appointments: {
      en: "Appointments",
      ta: "முன்பதிவுகள்",
      both: "Appointments • முன்பதிவுகள்",
    },
    liveQueue: {
      en: "Live Queue",
      ta: "நேரலை வரிசை",
      both: "Live Queue • நேரலை வரிசை",
    },
    officerDesk: {
      en: "Officer Desk",
      ta: "அதிகாரி மேஜை",
      both: "Officer Desk • அதிகாரி மேஜை",
    },
    deptQueue: {
      en: "Department Queue",
      ta: "துறை வரிசை",
      both: "Dept Queue • துறை வரிசை",
    },
    adminConsole: {
      en: "Admin Console",
      ta: "நிர்வாக பலகை",
      both: "Admin Console • நிர்வாக பலகை",
    },
    login: {
      en: "Login",
      ta: "உள்நுழைக",
      both: "Login • உள்நுழைக",
    },
    signUp: {
      en: "Citizen Sign Up",
      ta: "குடிமக்கள் பதிவு",
      both: "Citizen Sign Up • குடிமக்கள் பதிவு",
    },
    logout: {
      en: "Logout",
      ta: "வெளியேறு",
      both: "Logout • வெளியேறு",
    },
    loggedInAs: {
      en: "Logged in as",
      ta: "உள்நுழைந்துள்ள பயனர்",
      both: "Logged in as • பயனர்",
    },
  },

  // Language names
  lang: {
    both: {
      label: "Eng + தமிழ்",
      full: "Both (English & தமிழ்)",
      flag: "🌐",
    },
    ta: {
      label: "தமிழ்",
      full: "தமிழ் (Tamil)",
      flag: "🇮🇳",
    },
    en: {
      label: "English",
      full: "English",
      flag: "🇬🇧",
    },
  },

  // Home Page
  home: {
    badge: {
      en: "Digital India Initiative • Taluk Office e-Queue",
      ta: "டிஜிட்டல் இந்தியா திட்டம் • வட்டாட்சியர் அலுவலக மின்னணு வரிசை",
      both: "Digital India Initiative • வட்டாட்சியர் அலுவலக மின்னணு வரிசை",
    },
    heroTitlePrefix: {
      en: "Transparent, Fast &",
      ta: "வெளிப்படையான, விரைவான மற்றும்",
      both: "Transparent, Fast & வெளிப்படையான",
    },
    heroDignified: {
      en: "Dignified",
      ta: "மரியாதைக்குரிய",
      both: "Dignified • மரியாதைக்குரிய",
    },
    heroTitleSuffix: {
      en: "Public Services",
      ta: "மக்கள் சேவைகள்",
      both: "Public Services • மக்கள் சேவைகள்",
    },
    heroSubtitle: {
      en: "Eliminating long waiting queues at the Taluk Office. Generate walk-in tokens from your mobile, book advance appointments, and track your queue position in real time.",
      ta: "வட்டாட்சியர் அலுவலகத்தில் நீண்ட நேரம் காத்திருப்பதை தவிர்க்கவும். உங்கள் கைபேசி மூலம் நேரடி டோக்கன் பெறலாம், முன்பதிவு செய்யலாம் மற்றும் நேரலை வரிசை நிலையைக் கண்காணிக்கலாம்.",
      both: "Eliminating long waiting queues at the Taluk Office. கைபேசி மூலம் நேரடி டோக்கன் பெறலாம் மற்றும் வரிசையைக் கண்காணிக்கலாம்.",
    },
    btnGenerate: {
      en: "Generate Walk-in Token",
      ta: "நேரடி டோக்கன் பெறுக",
      both: "Generate Walk-in Token • டோக்கன் பெறுக",
    },
    btnBook: {
      en: "Book Appointment",
      ta: "முன்பதிவு செய்க",
      both: "Book Appointment • முன்பதிவு செய்க",
    },
    btnDisplay: {
      en: "Live Waiting Hall Display",
      ta: "காத்திருப்பு அறை நேரலை திரை",
      both: "Live Hall Display • நேரலை திரை",
    },
    howItWorksTitle: {
      en: "How The Smart Queue System Works",
      ta: "ஸ்மார்ட் வரிசை அமைப்பு செயல்படும் விதம்",
      both: "How The System Works • செயல்படும் விதம்",
    },
    howItWorksSubtitle: {
      en: "Simple, paperless, and time-saving for every citizen",
      ta: "ஒவ்வொரு குடிமகனுக்கும் எளிய, காகிதமற்ற, நேரம் சேமிக்கும் மக்கள் சேவை",
      both: "Simple, paperless, and time-saving for every citizen • எளிய மக்கள் சேவை",
    },
    step1Title: {
      en: "Select Service",
      ta: "சேவையைத் தேர்ந்தெடுக்கவும்",
      both: "1. Select Service • சேவையைத் தேர்வு செய்க",
    },
    step1Desc: {
      en: "Choose your administrative department (Revenue, Welfare, Certificates) and the specific service needed.",
      ta: "உங்கள் அரசுத் துறை (வருவாய், சமூக நலம், சான்றிதழ்கள்) மற்றும் தேவையான சேவையை எளிதாகத் தேர்ந்தெடுக்கவும்.",
      both: "Choose department and specific service needed • துறை மற்றும் சேவையைத் தேர்ந்தெடுக்கவும்.",
    },
    step2Title: {
      en: "Get Digital Token",
      ta: "மின்னணு டோக்கன் பெறுக",
      both: "2. Get Digital Token • டோக்கன் பெறுக",
    },
    step2Desc: {
      en: "Receive your unique Token Number along with your live queue position and estimated wait time.",
      ta: "உங்களின் தனித்துவமான டோக்கன் எண், நேரலை வரிசை நிலை மற்றும் உத்தேச காத்திருப்பு நேரத்தைப் பெறவும்.",
      both: "Receive your unique Token Number with live position • டோக்கன் எண் மற்றும் காத்திருப்பு நேரம் பெறவும்.",
    },
    step3Title: {
      en: "Attend Counter",
      ta: "கவுண்டருக்கு செல்லவும்",
      both: "3. Attend Counter • கவுண்டருக்கு செல்லவும்",
    },
    step3Desc: {
      en: "When your token is announced on the public audio/screen system, proceed directly to your assigned counter.",
      ta: "ஒலி மற்றும் திரை பலகையில் உங்கள் டோக்கன் அழைக்கப்படும் போது நேரடியாக குறித்த கவுண்டருக்கு செல்லவும்.",
      both: "When announced on audio/screen, proceed to assigned counter • அழைக்கும் போது கவுண்டருக்கு செல்லவும்.",
    },
    deptSectionTitle: {
      en: "Taluk Office Departments",
      ta: "வட்டாட்சியர் அலுவலகத் துறைகள்",
      both: "Taluk Office Departments • துறைகள்",
    },
    deptSectionSubtitle: {
      en: "Active counters and service desks serving citizens today",
      ta: "இன்று மக்களுக்கு சேவை வழங்கும் இயங்கும் கவுண்டர்கள் மற்றும் துறைகள்",
      both: "Active counters and service desks serving citizens today • இயங்கும் கவுண்டர்கள்",
    },
    viewAllServices: {
      en: "View All Services",
      ta: "அனைத்து சேவைகளையும் காண்க",
      both: "View All Services • அனைத்து சேவைகளும்",
    },
    counterActive: {
      en: "Counter Active",
      ta: "கவுண்டர் செயல்பாட்டில்",
      both: "Counter Active • கவுண்டர் செயல்பாட்டில்",
    },
    viewQueue: {
      en: "View Queue →",
      ta: "வரிசையைக் காண்க →",
      both: "View Queue → • வரிசை",
    },
    staffBannerTitle: {
      en: "Government Officers & Staff Portal",
      ta: "அரசு அலுவலர்கள் & பணியாளர் போர்டல்",
      both: "Government Officers & Staff Portal • அலுவலர் போர்டல்",
    },
    staffBannerDesc: {
      en: "Authorized Revenue Officers and Taluk Administrators can log in to manage counter queues and service workflows.",
      ta: "கவுண்டர் வரிசை மற்றும் மக்கள் சேவை பணிகளை நிர்வகிக்க அரசு அலுவலர்கள் உள்நுழையலாம்.",
      both: "Authorized Revenue Officers and Staff can log in • அலுவலர்கள் உள்நுழையலாம்.",
    },
    staffLoginBtn: {
      en: "Staff Login",
      ta: "பணியாளர் உள்நுழைவு",
      both: "Staff Login • பணியாளர் உள்நுழைவு",
    },
  },

  // Footer Component
  footer: {
    officeName: {
      en: "Taluk Administrative Office",
      ta: "வட்டார வட்டாட்சியர் அலுவலகம்",
      both: "Taluk Administrative Office • வட்டாட்சியர் அலுவலகம்",
    },
    officeDesc: {
      en: "Official smart token and appointment management service for public governance, revenue, and welfare services.",
      ta: "பொது நிர்வாகம், வருவாய் மற்றும் சமூக நல சேவைகளுக்கான அதிகாரப்பூர்வ மின்னணு வரிசை மற்றும் முன்பதிவு தளம்.",
      both: "Official smart token and appointment management service • அதிகாரப்பூர்வ மின்னணு வரிசை தளம்.",
    },
    verifiedPortal: {
      en: "Verified Government Portal",
      ta: "அங்கீகரிக்கப்பட்ட அரசு தளம்",
      both: "Verified Government Portal • அரசு தளம்",
    },
    citizenServicesTitle: {
      en: "Citizen Services",
      ta: "குடிமக்கள் சேவைகள்",
      both: "Citizen Services • குடிமக்கள் சேவைகள்",
    },
    service1: {
      en: "Revenue & Patta Services",
      ta: "வருவாய் & பட்டா சேவைகள்",
      both: "Revenue & Patta Services • பட்டா சேவைகள்",
    },
    service2: {
      en: "Community & Income Certificates",
      ta: "சாதி & வருமானச் சான்றிதழ்கள்",
      both: "Community & Income Certificates • சான்றிதழ்கள்",
    },
    service3: {
      en: "Nativity & Residence Certificates",
      ta: "இருப்பிடச் சான்றிதழ்கள்",
      both: "Nativity & Residence Certificates • இருப்பிடச் சான்றிதழ்",
    },
    service4: {
      en: "Social Welfare & Pensions",
      ta: "சமூக நலம் & உதவித்தொகைகள்",
      both: "Social Welfare & Pensions • உதவித்தொகைகள்",
    },
    service5: {
      en: "Public Grievance Redressal",
      ta: "மக்கள் குறைதீர்ப்பு மனுக்கள்",
      both: "Public Grievance Redressal • குறைதீர்ப்பு மனு",
    },
    workingHoursTitle: {
      en: "Working Hours",
      ta: "அலுவலக வேலை நேரம்",
      both: "Working Hours • வேலை நேரம்",
    },
    workingHoursDays: {
      en: "Monday – Friday: 10:00 AM – 5:45 PM",
      ta: "திங்கள் – வெள்ளி: காலை 10:00 – மாலை 5:45",
      both: "Mon – Fri: 10:00 AM – 5:45 PM • திங்கள் – வெள்ளி",
    },
    counterCloses: {
      en: "Token Counter Closes: 4:30 PM",
      ta: "டோக்கன் வழங்கும் நேரம் முடிவு: மாலை 4:30",
      both: "Token Closes: 4:30 PM • டோக்கன் முடிவு மாலை 4:30",
    },
    holiday: {
      en: "Saturday / Sunday: Official Holiday",
      ta: "சனி / ஞாயிறு: அரசு விடுமுறை",
      both: "Sat / Sun: Official Holiday • சனி / ஞாயிறு விடுமுறை",
    },
    lunch: {
      en: "Lunch Recess: 1:30 PM – 2:00 PM",
      ta: "மதிய உணவு இடைவேளை: 1:30 – 2:00",
      both: "Lunch: 1:30 PM – 2:00 PM • மதிய உணவு இடைவேளை",
    },
    helplineTitle: {
      en: "Citizen Helpline",
      ta: "குடிமக்கள் உதவி எண்கள்",
      both: "Citizen Helpline • உதவி எண்கள்",
    },
    tollFree: {
      en: "Toll-Free: 1800-425-1001",
      ta: "கட்டணமில்லா உதவி எண்: 1800-425-1001",
      both: "Toll-Free: 1800-425-1001",
    },
    emailHelpline: {
      en: "helpdesk@talukoffice.gov.in",
      ta: "helpdesk@talukoffice.gov.in",
      both: "helpdesk@talukoffice.gov.in",
    },
    address: {
      en: "Taluk Headquarters, Civil Station Road",
      ta: "வட்டாட்சியர் வளாகம், தாலுகா அலுவலக சாலை",
      both: "Taluk Headquarters, Civil Station Road • வட்டாட்சியர் வளாகம்",
    },
    allRightsReserved: {
      en: "Taluk Administrative Office. All Rights Reserved.",
      ta: "வட்டார வட்டாட்சியர் அலுவலகம். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
      both: "Taluk Administrative Office • அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
    },
    privacyPolicy: {
      en: "Privacy Policy",
      ta: "தனியுரிமைக் கொள்கை",
      both: "Privacy Policy • தனியுரிமை",
    },
    termsOfService: {
      en: "Terms of Service",
      ta: "பயன்பாட்டு விதிமுறைகள்",
      both: "Terms of Service • விதிமுறைகள்",
    },
    accessibility: {
      en: "Accessibility",
      ta: "அணுகல்தன்மை",
      both: "Accessibility • அணுகல்தன்மை",
    },
  },

  // Public Queue Display Screen
  display: {
    govtOfTamilNadu: {
      en: "GOVERNMENT OF TAMIL NADU",
      ta: "தமிழ்நாடு அரசு",
      both: "GOVERNMENT OF TAMIL NADU • தமிழ்நாடு அரசு",
    },
    revDepartment: {
      en: "DEPARTMENT OF REVENUE & DISASTER MANAGEMENT",
      ta: "வருவாய் மற்றும் பேரிடர் மேலாண்மைத் துறை",
      both: "DEPARTMENT OF REVENUE & DISASTER MANAGEMENT • வருவாய்த்துறை",
    },
    displayTitle: {
      en: "TALUK ADMINISTRATIVE HEADQUARTERS • DIGITAL QUEUE DISPLAY",
      ta: "வட்டார வட்டாட்சியர் அலுவலகம் • மத்திய மின்னணு வரிசை அறிவிப்பு பலகை",
      both: "TALUK HEADQUARTERS • வட்டாட்சியர் அலுவலகம் மின்னணு வரிசை பலகை",
    },
    subTitle: {
      en: "Taluk Office • Central Electronic Queue Information Board",
      ta: "வட்டாட்சியர் அலுவலகம் • மத்திய மின்னணு வரிசை அறிவிப்பு பலகை",
      both: "வட்டாட்சியர் அலுவலகம் • மத்திய மின்னணு வரிசை அறிவிப்பு பலகை",
    },
    waitingCount: {
      en: "WAITING CITIZENS",
      ta: "காத்திருக்கும் குடிமக்கள்",
      both: "WAITING CITIZENS • காத்திருப்போர்",
    },
    avgWaitTime: {
      en: "AVG. WAIT TIME",
      ta: "உத்தேச காத்திருப்பு நேரம்",
      both: "AVG. WAIT TIME • உத்தேச நேரம்",
    },
    activeDesks: {
      en: "ACTIVE SERVICE COUNTERS",
      ta: "செயல்படும் கவுண்டர்கள்",
      both: "ACTIVE DESKS • செயல்படும் மேஜைகள்",
    },
    systemStatus: {
      en: "CENTRAL SYSTEM STATUS",
      ta: "மத்திய அமைப்பு நிலை",
      both: "CENTRAL SYSTEM • அமைப்பு நிலை",
    },
    nowServing: {
      en: "NOW SERVING",
      ta: "தற்போது அழைக்கப்படுபவர்",
      both: "NOW SERVING • தற்போது அழைக்கப்படுபவர்",
    },
    proceedToCounter: {
      en: "PROCEED TO COUNTER",
      ta: "கவுண்டருக்கு செல்லவும்",
      both: "PROCEED TO COUNTER • கவுண்டருக்கு செல்லவும்",
    },
    waitingForCall: {
      en: "WAITING FOR OFFICER CALL",
      ta: "அதிகாரியின் அழைப்பிற்காக காத்திருப்பு",
      both: "WAITING FOR OFFICER CALL • காத்திருப்பு",
    },
    allCounters: {
      en: "All Counters & Desks",
      ta: "அனைத்து கவுண்டர்கள் & மேஜைகள்",
      both: "All Counters • அனைத்து கவுண்டர்கள்",
    },
    nextInLine: {
      en: "NEXT IN LINE",
      ta: "அடுத்த வரிசை டோக்கன்கள்",
      both: "NEXT IN LINE • அடுத்த வரிசை",
    },
    nextNotice: {
      en: "Citizens with the following token numbers are requested to keep original documents ready:",
      ta: "கீழ்க்கண்ட டோக்கன் எண் கொண்ட குடிமக்கள் தங்கள் அசல் ஆவணங்களை தயாராக வைத்திருக்கவும்:",
      both: "Citizens with the following tokens keep original documents ready • அசல் ஆவணங்களை தயாராக வைத்திருக்கவும்:",
    },
    noUpcoming: {
      en: "No upcoming tokens in queue.",
      ta: "வரிசையில் அடுத்து டோக்கன்கள் இல்லை.",
      both: "No upcoming tokens • வரிசையில் டோக்கன்கள் இல்லை.",
    },
    docChecklist: {
      en: "CITIZEN DOCUMENT CHECKLIST",
      ta: "தேவையான ஆவணங்கள் சரிபார்ப்பு",
      both: "DOCUMENT CHECKLIST • தேவையான ஆவணங்கள்",
    },
    docChecklistNotice: {
      en: "Please keep your original Aadhaar Card, Smart Family Ration Card, and Patta/Chitta copies ready.",
      ta: "தயவுசெய்து உங்கள் அசல் ஆதார் அட்டை, ஸ்மார்ட் குடும்ப அட்டை, மற்றும் பட்டா/சிட்டா நகல்களை தயாராக வைத்திருக்கவும்.",
      both: "Keep Aadhaar, Ration Card & Patta ready • ஆதார், குடும்ப அட்டை, பட்டா நகல்களை தயாராக வைக்கவும்.",
    },
    officialNotices: {
      en: "OFFICIAL NOTICES",
      ta: "அரசு அறிவிப்புகள்",
      both: "OFFICIAL NOTICES • அரசு அறிவிப்புகள்",
    },
    counter: {
      en: "Counter",
      ta: "கவுண்டர்",
      both: "Counter • கவுண்டர்",
    },
    deskOfficer: {
      en: "Desk Officer",
      ta: "மேஜை அதிகாரி",
      both: "Desk Officer • அதிகாரி",
    },
    statusServing: {
      en: "Serving Now",
      ta: "சேவை வழங்கப்படுகிறது",
      both: "Serving • சேவையில்",
    },
    statusAvailable: {
      en: "Ready for Next",
      ta: "அடுத்த நபருக்கு தயார்",
      both: "Ready • தயார்",
    },
    statusClosed: {
      en: "Counter Closed",
      ta: "கவுண்டர் மூடப்பட்டது",
      both: "Closed • மூடப்பட்டது",
    },
    testAnnouncement: {
      en: "Test Voice Call",
      ta: "அறிவிப்பு ஒலி சோதனை",
      both: "Test Voice • ஒலி சோதனை",
    },
  },

  // Token Issuance / Take Token Page
  takeToken: {
    breadcrumbDesk: {
      en: "Citizen Desk",
      ta: "குடிமக்கள் மேஜை",
      both: "Citizen Desk • குடிமக்கள் மேஜை",
    },
    breadcrumbTake: {
      en: "Take Token",
      ta: "டோக்கன் பெற",
      both: "Take Token • டோக்கன் பெற",
    },
    pageTitle: {
      en: "Generate Walk-in Token",
      ta: "நேரடி டோக்கன் பெறுதல்",
      both: "Generate Walk-in Token • நேரடி டோக்கன் பெறுதல்",
    },
    pageSubtitle: {
      en: "Select the government department and required service to join today's digital queue",
      ta: "இன்றைய மின்னணு வரிசையில் இணைய அரசுத் துறை மற்றும் தேவையான சேவையைத் தேர்ந்தெடுக்கவும்",
      both: "Select department and service to join queue • வரிசையில் இணைய துறை மற்றும் சேவையைத் தேர்ந்தெடுக்கவும்",
    },
    backToDesk: {
      en: "Back to Desk",
      ta: "பின்னே செல்ல",
      both: "Back • பின்னே",
    },
    step1Title: {
      en: "1. Select Taluk Department",
      ta: "1. வட்டாட்சியர் துறையைத் தேர்ந்தெடுக்கவும்",
      both: "1. Select Department • துறையைத் தேர்ந்தெடுக்கவும்",
    },
    step2Title: {
      en: "2. Select Service under",
      ta: "2. இதன் கீழ் சேவையைத் தேர்ந்தெடுக்கவும்:",
      both: "2. Select Service • சேவையைத் தேர்ந்தெடுக்கவும்:",
    },
    step3Ready: {
      en: "Ready to Issue Token",
      ta: "டோக்கன் பெற தயாராக உள்ளது",
      both: "Ready to Issue Token • டோக்கன் பெற தயார்",
    },
    estTime: {
      en: "Estimated average service duration",
      ta: "உத்தேச சராசரி சேவை நேரம்",
      both: "Estimated service duration • சராசரி சேவை நேரம்",
    },
    issueBtn: {
      en: "Issue Walk-in Token",
      ta: "டோக்கன் பெற கிளிக் செய்க",
      both: "Issue Walk-in Token • டோக்கன் பெறுக",
    },
    tokenIssuedSuccess: {
      en: "Token Issued Successfully",
      ta: "டோக்கன் வெற்றிகரமாக வழங்கப்பட்டது",
      both: "Token Issued Successfully • டோக்கன் வெற்றிகரமாக வழங்கப்பட்டது",
    },
    tokenQueueDate: {
      en: "Queue Date",
      ta: "வரிசை தேதி",
      both: "Queue Date • வரிசை தேதி",
    },
    departmentLabel: {
      en: "Department",
      ta: "துறை",
      both: "Department • துறை",
    },
    serviceLabel: {
      en: "Service Requested",
      ta: "கோரப்பட்ட சேவை",
      both: "Service • சேவை",
    },
    queueStatusLabel: {
      en: "Queue Status",
      ta: "வரிசை நிலை",
      both: "Queue Status • வரிசை நிலை",
    },
    avgServiceTimeLabel: {
      en: "Avg. Service Time",
      ta: "சராசரி சேவை நேரம்",
      both: "Avg. Service Time • சராசரி நேரம்",
    },
    viewLivePosition: {
      en: "View Live Queue Position",
      ta: "நேரலை வரிசை நிலையைக் காண்க",
      both: "View Live Position • நேரலை நிலையைக் காண்க",
    },
    printTokenSlip: {
      en: "Print Token Slip",
      ta: "டோக்கன் சீட்டு அச்சிடுக",
      both: "Print Slip • சீட்டு அச்சிடுக",
    },
  },

  // Citizen Dashboard
  citizen: {
    deskTitle: {
      en: "Citizen Service Desk",
      ta: "குடிமக்கள் சேவை மையம்",
      both: "Citizen Service Desk • குடிமக்கள் சேவை",
    },
    deskSubtitle: {
      en: "Track your active tokens, appointments, and live taluk queue position",
      ta: "உங்கள் டோக்கன், முன்பதிவுகள் மற்றும் நேரலை வரிசை நிலையைக் கண்காணிக்கவும்",
      both: "Track your tokens and queue position • வரிசை நிலையைக் கண்காணிக்கவும்",
    },
    activeTokenTitle: {
      en: "Your Active Token",
      ta: "உங்கள் தற்போதைய டோக்கன்",
      both: "Active Token • தற்போதைய டோக்கன்",
    },
    noActiveTokenTitle: {
      en: "No Active Token",
      ta: "தற்போது டோக்கன் எதுவும் இல்லை",
      both: "No Active Token • டோக்கன் இல்லை",
    },
    noActiveTokenDesc: {
      en: "You don't have an active walk-in token for today. Generate one now to join the queue.",
      ta: "இன்றைய தினத்திற்கான நேரடி டோக்கன் எதுவும் உங்களிடம் இல்லை. புதிய டோக்கன் பெற கீழே கிளிக் செய்யவும்.",
      both: "You don't have an active token • புதிய டோக்கன் பெறவும்.",
    },
    generateTokenBtn: {
      en: "Generate Walk-in Token",
      ta: "புதிய டோக்கன் பெறுக",
      both: "Generate Walk-in Token • டோக்கன் பெறுக",
    },
    queuePosition: {
      en: "Queue Position",
      ta: "வரிசை நிலை",
      both: "Queue Position • வரிசை நிலை",
    },
    peopleAhead: {
      en: "citizens ahead of you",
      ta: "நபர்கள் உங்களுக்கு முன் காத்திருக்கின்றனர்",
      both: "citizens ahead • நபர்கள் காத்திருக்கின்றனர்",
    },
    estWaitTime: {
      en: "Estimated Wait Time",
      ta: "உத்தேச காத்திருப்பு நேரம்",
      both: "Estimated Wait • காத்திருப்பு நேரம்",
    },
    minutes: {
      en: "minutes",
      ta: "நிமிடங்கள்",
      both: "mins • நிமிடம்",
    },
    assignedCounter: {
      en: "Assigned Counter",
      ta: "குறிக்கப்பட்ட கவுண்டர்",
      both: "Counter • கவுண்டர்",
    },
    tokenStatus: {
      en: "Status",
      ta: "நிலை",
      both: "Status • நிலை",
    },
    refreshBtn: {
      en: "Refresh Status",
      ta: "புதுப்பிக்கவும்",
      both: "Refresh • புதுப்பி",
    },
    cancelTokenBtn: {
      en: "Cancel Token",
      ta: "டோக்கனை ரத்து செய்க",
      both: "Cancel • ரத்து செய்",
    },
    upcomingApptsTitle: {
      en: "Upcoming Appointments",
      ta: "வரவிருக்கும் முன்பதிவுகள்",
      both: "Upcoming Appointments • முன்பதிவுகள்",
    },
    bookApptBtn: {
      en: "Book New Appointment",
      ta: "புதிய முன்பதிவு செய்க",
      both: "Book Appointment • முன்பதிவு செய்க",
    },
    noApptsDesc: {
      en: "No upcoming appointments scheduled.",
      ta: "வரவிருக்கும் முன்பதிவுகள் எதுவும் இல்லை.",
      both: "No appointments • முன்பதிவுகள் இல்லை.",
    },
    activeLiveToken: {
      en: "Active Live Token",
      ta: "தற்போதைய நேரலை டோக்கன்",
      both: "Active Live Token • நேரலை டோக்கன்",
    },
    tokenNumPrefix: {
      en: "Token #",
      ta: "டோக்கன் எண் #",
      both: "Token # • டோக்கன் #",
    },
    waitingTokens: {
      en: "waiting tokens",
      ta: "காத்திருக்கும் டோக்கன்கள்",
      both: "waiting tokens • காத்திருப்போர்",
    },
    approximate: {
      en: "approximate",
      ta: "தோராயமாக",
      both: "approximate • தோராயமாக",
    },
    calloutProceed: {
      en: "🔔 Please proceed immediately to your assigned counter!",
      ta: "🔔 தயவுசெய்து உடனடியாக உங்கள் கவுண்டருக்கு செல்லவும்!",
      both: "🔔 Proceed to assigned counter • உடனடியாக கவுண்டருக்கு செல்லவும்!",
    },
    calloutServing: {
      en: "💼 You are currently being served at the counter.",
      ta: "💼 கவுண்டரில் தற்போது உங்களுக்கு சேவை வழங்கப்படுகிறது.",
      both: "💼 Currently being served • சேவை வழங்கப்படுகிறது.",
    },
    calloutWaiting: {
      en: "Please remain seated in the waiting hall. Your token will be announced on the screen when ready.",
      ta: "காத்திருப்பு அறையில் அமர்ந்திருக்கவும். முறை வரும் போது திரையில் அறிவிக்கப்படும்.",
      both: "Please remain seated in the waiting hall • காத்திருப்பு அறையில் அமர்ந்திருக்கவும்.",
    },
    viewDeptHallScreen: {
      en: "View Department Hall Screen",
      ta: "துறை நேரலை திரையைக் காண்க",
      both: "View Hall Screen • துறை திரை",
    },
    takeNewToken: {
      en: "Take New Token",
      ta: "புதிய டோக்கன் பெறுக",
      both: "Take New Token • புதிய டோக்கன்",
    },
    walkInCardTitle: {
      en: "Walk-in Token",
      ta: "நேரடி டோக்கன்",
      both: "Walk-in Token • நேரடி டோக்கன்",
    },
    walkInCardDesc: {
      en: "Generate an instant queue token for same-day taluk office services without standing in physical queues.",
      ta: "நேரில் வரிசையில் நிற்காமல் இன்றைய பணிகளுக்கு உடனடி டோக்கன் பெறலாம்.",
      both: "Instant token for same-day services • உடனடி டோக்கன் பெறலாம்.",
    },
    walkInCardBtn: {
      en: "Take Token Now",
      ta: "டோக்கன் பெறுக",
      both: "Take Token Now • டோக்கன் பெறுக",
    },
    bookCardTitle: {
      en: "Book Appointment",
      ta: "முன்பதிவு செய்க",
      both: "Book Appointment • முன்பதிவு செய்க",
    },
    bookCardDesc: {
      en: "Schedule your visit for upcoming dates. Avoid morning rushes and get priority check-in directly to the queue.",
      ta: "வருங்கால தேதிகளுக்கு உங்கள் வருகையை திட்டமிடுங்கள். நெரிசலைத் தவிர்த்து முன்னுரிமை பெறலாம்.",
      both: "Schedule visit for upcoming dates • முன்பதிவு செய்யலாம்.",
    },
    bookCardBtn: {
      en: "Book Visit Slot",
      ta: "தேதியை பதிவு செய்க",
      both: "Book Visit Slot • தேதியை பதிவு செய்க",
    },
    liveMonitorCardTitle: {
      en: "Live Queue Monitor",
      ta: "நேரலை வரிசை பலகை",
      both: "Live Queue Monitor • நேரலை வரிசை",
    },
    liveMonitorCardDesc: {
      en: "View current tokens being served across Revenue, Certificates, Welfare, and Admin counters in real-time.",
      ta: "வருவாய், சான்றிதழ், சமூக நலம் மற்றும் நிர்வாக கவுண்டர்களில் சேவையை உடனுக்குடன் கண்காணிக்கலாம்.",
      both: "View current tokens being served • சேவையை உடனுக்குடன் கண்காணிக்கலாம்.",
    },
    liveMonitorCardBtn: {
      en: "View Department Queues",
      ta: "துறை வரிசையைக் காண்க",
      both: "View Department Queues • துறை வரிசை",
    },
    manageAll: {
      en: "Manage All →",
      ta: "அனைத்தையும் நிர்வகிக்க →",
      both: "Manage All → • அனைத்தும்",
    },
    checkInToQueue: {
      en: "Check In to Queue",
      ta: "வரிசையில் இணையவும்",
      both: "Check In • செக்-இன்",
    },
    loadingDesk: {
      en: "Loading your token & appointments...",
      ta: "டோக்கன் & முன்பதிவு விபரங்கள் ஏற்றப்படுகிறது...",
      both: "Loading... • ஏற்றப்படுகிறது...",
    },
    dismiss: {
      en: "Dismiss",
      ta: "மூடுக",
      both: "Dismiss • மூடுக",
    },
  },

  // Live Queue Page
  liveQueue: {
    pageTitle: {
      en: "Live Taluk Queue Tracker",
      ta: "நேரலை வட்டாட்சியர் வரிசை கண்காணிப்பு",
      both: "Live Taluk Queue • நேரலை வரிசை கண்காணிப்பு",
    },
    pageSubtitle: {
      en: "Real-time queue tracking across all departments and counters",
      ta: "அனைத்து துறைகள் மற்றும் கவுண்டர்களின் நிகழ்நேர வரிசை கண்காணிப்பு",
      both: "Real-time tracking across all departments • அனைத்து துறைகள் நேரலை",
    },
    selectDepartment: {
      en: "Select Department",
      ta: "துறையைத் தேர்ந்தெடுக்கவும்",
      both: "Select Department • துறையைத் தேர்வு செய்க",
    },
    allDepartments: {
      en: "All Departments",
      ta: "அனைத்து துறைகளும்",
      both: "All Departments • அனைத்து துறைகளும்",
    },
    currentlyServing: {
      en: "Currently Serving Token",
      ta: "தற்போது அழைக்கப்படும் டோக்கன்",
      both: "Currently Serving • அழைக்கப்படுபவர்",
    },
    waitingQueue: {
      en: "Waiting in Queue",
      ta: "வரிசையில் காத்திருப்போர்",
      both: "Waiting Queue • காத்திருப்போர்",
    },
    noWaiting: {
      en: "No citizens currently waiting in this queue.",
      ta: "இந்த வரிசையில் தற்போது எவரும் காத்திருக்கவில்லை.",
      both: "No citizens waiting • காத்திருப்போர் இல்லை.",
    },
    nowCalled: {
      en: "Now Called",
      ta: "தற்போது அழைக்கப்படுபவர்",
      both: "Now Called • அழைக்கப்படுபவர்",
    },
    noServingToken: {
      en: "No token currently serving",
      ta: "தற்போது சேவையில் டோக்கன் இல்லை",
      both: "No token serving • டோக்கன் இல்லை",
    },
    noCalledToken: {
      en: "No token called right now",
      ta: "தற்போது அழைக்கப்பட்ட டோக்கன் இல்லை",
      both: "No token called • டோக்கன் இல்லை",
    },
    proceedToPrefix: {
      en: "Proceed to",
      ta: "செல்ல வேண்டிய கவுண்டர்:",
      both: "Proceed to • கவுண்டர்:",
    },
    activeCitizensWaiting: {
      en: "Active citizens waiting for service",
      ta: "சேவைக்காக காத்திருக்கும் குடிமக்கள்",
      both: "Active citizens waiting • காத்திருப்போர்",
    },
    activeTokensList: {
      en: "Active Tokens List",
      ta: "செயலில் உள்ள டோக்கன்கள் பட்டியல்",
      both: "Active Tokens List • டோக்கன்கள் பட்டியல்",
    },
    liveStreamConnected: {
      en: "Live Stream Connected 🟢",
      ta: "நேரலை இணைப்பு செயல்பாட்டில் 🟢",
      both: "Live Connected 🟢 • நேரலை 🟢",
    },
    colToken: {
      en: "Token",
      ta: "டோக்கன்",
      both: "Token • டோக்கன்",
    },
    colService: {
      en: "Service",
      ta: "சேவை",
      both: "Service • சேவை",
    },
    colCounter: {
      en: "Counter",
      ta: "கவுண்டர்",
      both: "Counter • கவுண்டர்",
    },
    colStatus: {
      en: "Status",
      ta: "நிலை",
      both: "Status • நிலை",
    },
    colCitizenName: {
      en: "Citizen Name",
      ta: "குடிமக்கள் பெயர்",
      both: "Citizen Name • குடிமக்கள் பெயர்",
    },
  },

  // Appointments
  appointments: {
    pageTitle: {
      en: "Taluk Office Appointments",
      ta: "வட்டாட்சியர் அலுவலக முன்பதிவுகள்",
      both: "Taluk Office Appointments • முன்பதிவுகள்",
    },
    pageSubtitle: {
      en: "Book upcoming visit slots or check in to join the queue on your scheduled date",
      ta: "அலுவலக வருகைக்கான நேரத்தை முன்பதிவு செய்யுங்கள் அல்லது குறித்த நாளில் வரிசையில் இணையுங்கள்",
      both: "Book slots or check in • முன்பதிவு செய்து வரிசையில் இணையுங்கள்",
    },
    myTab: {
      en: "My Appointments",
      ta: "என் முன்பதிவுகள்",
      both: "My Appointments • என் முன்பதிவுகள்",
    },
    bookTab: {
      en: "Book New",
      ta: "புதிய முன்பதிவு",
      both: "Book New • புதிய முன்பதிவு",
    },
    scheduleTitle: {
      en: "Schedule Advance Office Visit",
      ta: "அலுவலக வருகைக்கான முன்பதிவு",
      both: "Schedule Visit • முன்பதிவு",
    },
    scheduleDesc: {
      en: "Appointments allow priority check-in on the selected date without early morning walk-in rush.",
      ta: "முன்பதிவு செய்வதன் மூலம் காலை நேர நெரிசலின்றி குறித்த நாளில் எளிதாக சேவை பெறலாம்.",
      both: "Appointments allow priority check-in • முன்னுரிமை முன்பதிவு",
    },
    selectDept: {
      en: "Select Department *",
      ta: "துறையைத் தேர்ந்தெடுக்கவும் *",
      both: "Select Department * • துறை *",
    },
    chooseDeptPrompt: {
      en: "-- Choose Department --",
      ta: "-- துறையைத் தேர்வு செய்க --",
      both: "-- Choose Department --",
    },
    selectService: {
      en: "Select Service *",
      ta: "சேவையைத் தேர்ந்தெடுக்கவும் *",
      both: "Select Service * • சேவை *",
    },
    chooseServicePrompt: {
      en: "-- Choose Service --",
      ta: "-- சேவையைத் தேர்வு செய்க --",
      both: "-- Choose Service --",
    },
    selectDeptFirst: {
      en: "-- Select a Department First --",
      ta: "-- முதலில் துறையைத் தேர்ந்தெடுக்கவும் --",
      both: "-- Select Department First --",
    },
    apptDate: {
      en: "Appointment Date *",
      ta: "முன்பதிவு தேதி *",
      both: "Appointment Date * • தேதி *",
    },
    timeSlot: {
      en: "Time Slot *",
      ta: "நேர இடைவெளி *",
      both: "Time Slot * • நேரம் *",
    },
    purposeLabel: {
      en: "Purpose / Application Notes (Optional)",
      ta: "நோக்கம் / குறிப்புகள் (விருப்பத்தேர்வு)",
      both: "Purpose / Notes • நோக்கம்",
    },
    purposePlaceholder: {
      en: "e.g. Document verification for certificate application...",
      ta: "எ.கா: சான்றிதழ் ஆவண சரிபார்ப்பு...",
      both: "e.g. Document verification...",
    },
    confirmBooking: {
      en: "Confirm Booking",
      ta: "முன்பதிவை உறுதிசெய்க",
      both: "Confirm Booking • உறுதிசெய்க",
    },
    cancelBtn: {
      en: "Cancel",
      ta: "ரத்து செய்",
      both: "Cancel • ரத்து",
    },
    noApptsFound: {
      en: "No Appointments Found",
      ta: "முன்பதிவுகள் எதுவும் இல்லை",
      both: "No Appointments • முன்பதிவுகள் இல்லை",
    },
    noApptsSubtitle: {
      en: "Schedule your visit in advance to avoid waiting hall congestion and get priority check-in.",
      ta: "நெரிசலைத் தவிர்க்கவும் முன்னுரிமை பெறவும் முன்கூட்டியே பதிவு செய்யவும்.",
      both: "Schedule your visit in advance • முன்கூட்டியே பதிவு செய்யவும்",
    },
    bookFirstAppt: {
      en: "Book Your First Appointment",
      ta: "முதல் முன்பதிவை மேற்கொள்ளவும்",
      both: "Book Appointment • முன்பதிவு செய்க",
    },
    checkInToQueue: {
      en: "Check-in to Queue",
      ta: "வரிசையில் இணையவும்",
      both: "Check-in • வரிசையில் இணை",
    },
    tokenActive: {
      en: "Token Active",
      ta: "டோக்கன் செயலில் உள்ளது",
      both: "Token Active • டோக்கன் தயார்",
    },
    confirmCancelPrompt: {
      en: "Are you sure you want to cancel this appointment?",
      ta: "இந்த முன்பதிவை நிச்சயமாக ரத்து செய்ய விரும்புகிறீர்களா?",
      both: "Cancel this appointment? • ரத்து செய்யவா?",
    },
    minsSuffix: {
      en: "mins",
      ta: "நிமிடங்கள்",
      both: "mins • நிமிடம்",
    },
  },

  // Auth (Login & Register)
  auth: {
    loginTitle: {
      en: "Portal Login",
      ta: "போர்டல் உள்நுழைவு",
      both: "Portal Login • உள்நுழைவு",
    },
    loginSubtitle: {
      en: "Enter your registered email and password to access services",
      ta: "சேவைகளை அணுக உங்கள் மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்",
      both: "Enter email & password • மின்னஞ்சல் & கடவுச்சொல் உள்ளிடவும்",
    },
    registerTitle: {
      en: "Citizen Registration",
      ta: "புதிய குடிமக்கள் பதிவு",
      both: "Citizen Registration • குடிமக்கள் பதிவு",
    },
    registerSubtitle: {
      en: "Create your account for fast e-Seva tokens and appointment booking",
      ta: "விரைவான டோக்கன் மற்றும் முன்பதிவு பெற புதிய கணக்கை உருவாக்கவும்",
      both: "Create account for e-Seva • புதிய கணக்கு உருவாக்கவும்",
    },
    emailLabel: {
      en: "Email Address",
      ta: "மின்னஞ்சல் முகவரி",
      both: "Email Address • மின்னஞ்சல்",
    },
    passwordLabel: {
      en: "Password",
      ta: "கடவுச்சொல்",
      both: "Password • கடவுச்சொல்",
    },
    fullNameLabel: {
      en: "Full Name",
      ta: "முழு பெயர்",
      both: "Full Name • முழு பெயர்",
    },
    phoneLabel: {
      en: "Phone Number",
      ta: "கைபேசி எண்",
      both: "Phone Number • கைபேசி எண்",
    },
    submitLogin: {
      en: "Sign In",
      ta: "உள்நுழைக",
      both: "Sign In • உள்நுழைக",
    },
    submitRegister: {
      en: "Create Account",
      ta: "கணக்கை உருவாக்குக",
      both: "Create Account • கணக்கை உருவாக்குக",
    },
    dontHaveAccount: {
      en: "Don't have an account?",
      ta: "கணக்கு இல்லையா?",
      both: "Don't have an account? • கணக்கு இல்லையா?",
    },
    alreadyHaveAccount: {
      en: "Already have an account?",
      ta: "ஏற்கனவே கணக்கு உள்ளதா?",
      both: "Already have an account? • கணக்கு உள்ளதா?",
    },
    confirmPasswordLabel: {
      en: "Confirm Password",
      ta: "கடவுச்சொல்லை உறுதிசெய்க",
      both: "Confirm Password • உறுதிசெய்க",
    },
    registerHere: {
      en: "Register here",
      ta: "இங்கு பதிவு செய்க",
      both: "Register here • பதிவு செய்க",
    },
    signInHere: {
      en: "Sign In",
      ta: "உள்நுழைக",
      both: "Sign In • உள்நுழைக",
    },
    roleCitizen: {
      en: "Citizen",
      ta: "குடிமகன்",
      both: "Citizen • குடிமகன்",
    },
    roleOfficer: {
      en: "Officer",
      ta: "அலுவலர்",
      both: "Officer • அலுவலர்",
    },
    roleAdmin: {
      en: "Admin",
      ta: "நிர்வாகி",
      both: "Admin • நிர்வாகி",
    },
    demoBadge: {
      en: "Demo",
      ta: "மாதிரி",
      both: "Demo • மாதிரி",
    },
  },

  // Officer Dashboard
  officer: {
    deskTitle: {
      en: "Officer Service Desk",
      ta: "அலுவலர் சேவை மேஜை",
      both: "Officer Service Desk • அலுவலர் மேஜை",
    },
    deskSubtitle: {
      en: "Manage citizen token calls, service processing, and desk status",
      ta: "டோக்கன் அழைப்பு, மக்கள் சேவை மற்றும் மேஜை நிலையை நிர்வகிக்கவும்",
      both: "Manage token calls & service • மக்கள் சேவையை நிர்வகிக்கவும்",
    },
    callNextBtn: {
      en: "Call Next Token",
      ta: "அடுத்த டோக்கனை அழைக்கவும்",
      both: "Call Next Token • அடுத்த டோக்கன்",
    },
    startServiceBtn: {
      en: "Start Service",
      ta: "சேவையைத் தொடங்கவும்",
      both: "Start Service • சேவையைத் தொடங்கு",
    },
    completeServiceBtn: {
      en: "Complete Service",
      ta: "சேவையை முடிக்கவும்",
      both: "Complete Service • சேவையை முடி",
    },
    skipBtn: {
      en: "Skip / No-Show",
      ta: "தவிர்க்கவும் (வரவில்லை)",
      both: "Skip • தவிர்க்கவும்",
    },
    transferBtn: {
      en: "Transfer Token",
      ta: "டோக்கனை மாற்றவும்",
      both: "Transfer • மாற்றுக",
    },
    counterOpen: {
      en: "Counter is Open",
      ta: "கவுண்டர் திறக்கப்பட்டுள்ளது",
      both: "Open • திறக்கப்பட்டுள்ளது",
    },
    counterClosed: {
      en: "Counter is Closed",
      ta: "கவுண்டர் மூடப்பட்டுள்ளது",
      both: "Closed • மூடப்பட்டுள்ளது",
    },
    waitingInDept: {
      en: "Waiting in Department",
      ta: "துறையில் காத்திருப்போர்",
      both: "Waiting in Dept • காத்திருப்போர்",
    },
    completedToday: {
      en: "Completed Today",
      ta: "இன்று முடிக்கப்பட்டவை",
      both: "Completed Today • முடிக்கப்பட்டவை",
    },
    counterAssignment: {
      en: "Counter Assignment",
      ta: "ஒதுக்கப்பட்ட கவுண்டர்",
      both: "Counter Assignment • கவுண்டர்",
    },
    unassignedCounter: {
      en: "Unassigned",
      ta: "ஒதுக்கப்படவில்லை",
      both: "Unassigned • ஒதுக்கப்படவில்லை",
    },
    currentActiveTokenTitle: {
      en: "Current Active Token at Desk",
      ta: "தற்போது மேஜையில் உள்ள டோக்கன்",
      both: "Current Active Token • மேஜை டோக்கன்",
    },
    officerActionControls: {
      en: "Officer Action Controls",
      ta: "அலுவலர் செயல்முறைகள்",
      both: "Action Controls • செயல்முறைகள்",
    },
    deskReadyTitle: {
      en: "Desk Ready For Next Citizen",
      ta: "அடுத்த நபரை அழைக்க மேஜை தயார்",
      both: "Desk Ready • மேஜை தயார்",
    },
    noWaitingInDept: {
      en: "No waiting tokens in your department right now.",
      ta: "தற்போது உங்கள் துறையில் காத்திருப்போர் எவருமில்லை.",
      both: "No waiting tokens • காத்திருப்போர் இல்லை",
    },
    deptWaitingQueue: {
      en: "Department Waiting Queue",
      ta: "துறை காத்திருப்பு வரிசை",
      both: "Department Waiting Queue • துறை வரிசை",
    },
    queueEmptyDept: {
      en: "Queue is empty. No active tokens in department.",
      ta: "வரிசை காலியாக உள்ளது. செயலில் உள்ள டோக்கன்கள் எதுவும் இல்லை.",
      both: "Queue empty • வரிசை காலியாக உள்ளது",
    },
    availableStatus: {
      en: "Status: AVAILABLE",
      ta: "நிலை: பணியில் உள்ளார்",
      both: "Status: AVAILABLE • பணியில்",
    },
    unavailableStatus: {
      en: "Status: UNAVAILABLE",
      ta: "நிலை: இடைவேளையில்",
      both: "Status: UNAVAILABLE • இடைவேளை",
    },
    noCounterWarning: {
      en: "No active counter currently assigned to you! You cannot call tokens until an Administrator assigns your profile to a Counter.",
      ta: "உங்களுக்கு கவுண்டர் ஒதுக்கப்படவில்லை! நிர்வாகி கவுண்டரை ஒதுக்கும் வரை நீங்கள் டோக்கன்களை அழைக்க முடியாது.",
      both: "No counter assigned • கவுண்டர் ஒதுக்கப்படவில்லை",
    },
  },

  // Common Departments
  departments: {
    Revenue: {
      en: "Revenue Department",
      ta: "வருவாய்த்துறை",
      both: "Revenue • வருவாய்த்துறை",
      desc: {
        en: "Handles land records, patta, income and community certificates, and revenue disputes",
        ta: "நில ஆவணங்கள், பட்டா மாறுதல், வருமானம் & சாதி சான்றிதழ்கள், நில வருவாய் விவகாரங்கள்",
        both: "Land records, patta & certificates • பட்டா மாறுதல் மற்றும் சான்றிதழ்கள்",
      },
    },
    "Taluk Administration": {
      en: "Taluk Administration",
      ta: "வட்டாட்சியர் நிர்வாகம்",
      both: "Taluk Admin • வட்டாட்சியர் நிர்வாகம்",
      desc: {
        en: "General taluk administration, public petitions, elections and grievance redressal",
        ta: "பொது நிர்வாகம், மக்கள் மனுக்கள், தேர்தல் மற்றும் குறைதீர்ப்பு நடவடிக்கைகள்",
        both: "General administration & petitions • பொது நிர்வாகம் & மக்கள் மனுக்கள்",
      },
    },
    "Social Welfare": {
      en: "Social Welfare",
      ta: "சமூக நலத்துறை",
      both: "Social Welfare • சமூக நலத்துறை",
      desc: {
        en: "Senior citizen pensions, disability assistance, scholarships and welfare schemes",
        ta: "முதியோர் உதவித்தொகை, மாற்றுத்திறனாளிகள் நலன், அரசு உதவித்தொகை திட்டங்கள்",
        both: "Pensions & welfare assistance • முதியோர் மற்றும் மாற்றுத்திறனாளிகள் நலன்",
      },
    },
    Certificates: {
      en: "Certificates & e-Seva",
      ta: "சான்றிதழ் பிரிவு",
      both: "Certificates • சான்றிதழ் பிரிவு",
      desc: {
        en: "Issuance of nativity, residence, legal heir, first graduate and community certificates",
        ta: "இருப்பிடம், வாரிசு, முதல் பட்டதாரி மற்றும் இதர அரசு சான்றிதழ்கள் வழங்கல்",
        both: "Nativity, legal heir & certificates • இருப்பிடம் மற்றும் வாரிசு சான்றிதழ்கள்",
      },
    },
    "Aadhaar Services": {
      en: "Aadhaar Services",
      ta: "ஆதார் சேவைகள்",
      both: "Aadhaar Services • ஆதார் சேவைகள்",
      desc: {
        en: "UIDAI Aadhaar new enrollment, mobile/address update, biometric and demographic corrections",
        ta: "புதிய ஆதார் பதிவு, கைபேசி/முகவரி மாற்றம், பயோமெட்ரிக் மற்றும் பெயர்/பிறந்ததேதி திருத்தம்",
        both: "New enrollment, update & correction • புதிய ஆதார், முகவரி மாற்றம் & திருத்தம்",
      },
    },
  },

  // Common Services
  services: {
    "Aadhaar Apply": {
      en: "Aadhaar Apply (New Enrollment)",
      ta: "புதிய ஆதார் பதிவு",
      both: "Aadhaar Apply • புதிய ஆதார் பதிவு",
    },
    "Aadhaar Update": {
      en: "Aadhaar Update (Address/Mobile/Biometrics)",
      ta: "ஆதார் விவர புதுப்பித்தல்",
      both: "Aadhaar Update • ஆதார் புதுப்பித்தல்",
    },
    "Aadhaar Correction": {
      en: "Aadhaar Correction (Name/DOB/Gender)",
      ta: "ஆதார் பிழை திருத்தம்",
      both: "Aadhaar Correction • ஆதார் திருத்தம்",
    },
    "Patta Related Service": {
      en: "Patta Related Service",
      ta: "பட்டா தொடர்பான சேவை",
      both: "Patta Related Service • பட்டா சேவை",
    },
    "Patta Transfer": {
      en: "Patta Transfer",
      ta: "பட்டா மாறுதல்",
      both: "Patta Transfer • பட்டா மாறுதல்",
    },
    "Income Certificate": {
      en: "Income Certificate",
      ta: "வருமானச் சான்றிதழ்",
      both: "Income Certificate • வருமானச் சான்றிதழ்",
    },
    "Revenue Petition": {
      en: "Revenue Petition",
      ta: "வருவாய் மனு",
      both: "Revenue Petition • வருவாய் மனு",
    },
    "Residence Certificate": {
      en: "Residence Certificate",
      ta: "குடியிருப்பு சான்றிதழ்",
      both: "Residence Certificate • குடியிருப்பு சான்றிதழ்",
    },
    "Old Age Pension Scheme": {
      en: "Old Age Pension Scheme",
      ta: "முதியோர் உதவித்தொகை திட்டம்",
      both: "Old Age Pension • முதியோர் உதவித்தொகை",
    },
    "Grievance Redressal": {
      en: "Grievance Redressal",
      ta: "மக்கள் குறைதீர்ப்பு மனு",
      both: "Grievance Redressal • மக்கள் குறைதீர்ப்பு",
    },
    "Other Government Services": {
      en: "Other Government Services",
      ta: "இதர அரசு சேவைகள்",
      both: "Other Gov Services • இதர அரசு சேவைகள்",
    },
    "Community Certificate": {
      en: "Community Certificate",
      ta: "சாதிச் சான்றிதழ்",
      both: "Community Certificate • சாதிச் சான்றிதழ்",
    },
    "Nativity Certificate": {
      en: "Nativity Certificate",
      ta: "இருப்பிடச் சான்றிதழ்",
      both: "Nativity Certificate • இருப்பிடச் சான்றிதழ்",
    },
    "Legal Heir Certificate": {
      en: "Legal Heir Certificate",
      ta: "வாரிசுச் சான்றிதழ்",
      both: "Legal Heir • வாரிசுச் சான்றிதழ்",
    },
    "Old Age Pension (OAP)": {
      en: "Old Age Pension (OAP)",
      ta: "முதியோர் உதவித்தொகை",
      both: "Old Age Pension • முதியோர் உதவித்தொகை",
    },
    "Disability Welfare Assistance": {
      en: "Disability Welfare Assistance",
      ta: "மாற்றுத்திறனாளிகள் உதவித்தொகை",
      both: "Disability Welfare • மாற்றுத்திறனாளிகள் உதவி",
    },
    "Public Grievance Redressal": {
      en: "Public Grievance Redressal",
      ta: "மக்கள் குறைதீர்ப்பு மனு",
      both: "Grievance Redressal • மக்கள் குறைதீர்ப்பு",
    },
    "First Graduate Certificate": {
      en: "First Graduate Certificate",
      ta: "முதல் பட்டதாரி சான்றிதழ்",
      both: "First Graduate • முதல் பட்டதாரி",
    },
  },

  // Common Statuses
  status: {
    waiting: {
      en: "Waiting",
      ta: "காத்திருப்பில்",
      both: "Waiting • காத்திருப்பில்",
    },
    called: {
      en: "Called",
      ta: "அழைக்கப்பட்டது",
      both: "Called • அழைக்கப்பட்டது",
    },
    serving: {
      en: "Serving",
      ta: "சேவையில்",
      both: "Serving • சேவையில்",
    },
    completed: {
      en: "Completed",
      ta: "முடிந்தது",
      both: "Completed • முடிந்தது",
    },
    cancelled: {
      en: "Cancelled",
      ta: "ரத்து செய்யப்பட்டது",
      both: "Cancelled • ரத்து",
    },
    booked: {
      en: "Booked",
      ta: "முன்பதிவு செய்யப்பட்டது",
      both: "Booked • முன்பதிவு",
    },
  },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  // Saved language preference: "both", "ta", or "en"
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("taluk_queue_language") || "both";
  });

  useEffect(() => {
    localStorage.setItem("taluk_queue_language", language);
  }, [language]);

  // Main translation resolver: strictly returns Tamil if ta, English if en, both if both
  const t = (section, key) => {
    if (!translations[section]) return key;
    const entry = translations[section][key];
    if (!entry) return key;

    if (typeof entry === "string") return entry;
    if (language === "ta") {
      return entry.ta || entry.both || entry.en || key;
    }
    if (language === "en") {
      return entry.en || entry.both || key;
    }
    return entry.both || entry.en || entry.ta || key;
  };

  // Helper for department name
  const tDeptName = (name) => {
    if (!name) return "";
    const found = translations.departments[name];
    if (!found) return name;
    if (language === "ta") return found.ta || found.both || found.en || name;
    if (language === "en") return found.en || found.both || name;
    return found.both || found.en || name;
  };

  // Helper for department description
  const tDeptDesc = (name, fallback) => {
    const found = translations.departments[name];
    if (!found?.desc) return fallback || "";
    if (language === "ta") return found.desc.ta || found.desc.both || found.desc.en || fallback;
    if (language === "en") return found.desc.en || found.desc.both || fallback;
    return found.desc.both || found.desc.en || fallback;
  };

  // Helper for service name
  const tServiceName = (name) => {
    if (!name) return "";
    const found = translations.services[name];
    if (!found) return name;
    if (language === "ta") return found.ta || found.both || found.en || name;
    if (language === "en") return found.en || found.both || name;
    return found.both || found.en || name;
  };

  // Helper for status label
  const tStatus = (statusKey) => {
    if (!statusKey) return "";
    const key = String(statusKey).toLowerCase();
    const found = translations.status[key];
    if (!found) return statusKey;
    if (language === "ta") return found.ta || found.both || found.en || statusKey;
    if (language === "en") return found.en || found.both || statusKey;
    return found.both || found.en || statusKey;
  };

  // Quick switch cycling or direct switch
  const cycleLanguage = () => {
    setLanguage((prev) => {
      if (prev === "both") return "ta";
      if (prev === "ta") return "en";
      return "both";
    });
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        cycleLanguage,
        t,
        tDeptName,
        tDeptDesc,
        tServiceName,
        tStatus,
        isTamil: language === "ta",
        isEnglish: language === "en",
        isBoth: language === "both",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
