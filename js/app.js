/* ==========================================================================
   Flora's Guest House · Kimolos — app.js
   Vanilla JS, no dependencies (Leaflet is loaded separately for the map).
   Modules: config · i18n · header/nav · lightbox · booking · map · misc
   ========================================================================== */
(() => {
  'use strict';

  /* ------------------------------------------------------------------ CONFIG
     inquiryEndpoint: where the Direct Booking Inquiry is POSTed as JSON.
     Leave empty to run in demo mode (validation + confirmation modal only,
     nothing is sent). Works with e.g. Formspree ("https://formspree.io/f/xxxx"),
     a Cloudflare Pages Function ("/api/inquiry"), Getform, Basin, etc.          */
  const CONFIG = {
    inquiryEndpoint: '',
    maxNights: 60,
    storageKey: 'floras-lang',
    map: {
      center: [36.7925, 24.5750],
      /* CARTO Voyager tiles need a free API key (no account; request one at
         https://carto.com/basemaps/apikey — free up to 1M tiles/month for businesses).
         Paste it here. Without a key, CARTO serves "API KEY REQUIRED" tiles,
         so the map falls back to standard OpenStreetMap tiles instead. */
      cartoKey: '',
      cartoTiles: 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key={key}',
      cartoAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      osmTiles: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      osmAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    // Approximate coordinates — adjust if you want pixel-perfect pins.
    places: {
      home:    { latlng: [36.7925, 24.5750], zoom: 17 },
      square:  { latlng: [36.7921, 24.5741], zoom: 17 },
      kastro:  { latlng: [36.7934, 24.5743], zoom: 17 },
      psathi:  { latlng: [36.7866, 24.5826], zoom: 15 },
      bonatsa: { latlng: [36.7782, 24.5668], zoom: 15 },
      prassa:  { latlng: [36.8178, 24.5962], zoom: 15 }
    }
  };

  /* -------------------------------------------------------------------- I18N */
  const I18N = {
    en: {
      'meta.title': "Flora's Guest House · Chorio, Kimolos – Cycladic Apartment",
      'skip': 'Skip to content',
      'brand.place': '· Kimolos',
      'nav.house': 'The House',
      'nav.amenities': 'Amenities',
      'nav.location': 'Location',
      'nav.host': 'Host',
      'nav.book': 'Book Direct',
      'nav.open': 'Open menu',
      'nav.close': 'Close menu',

      'hero.alt': 'Whitewashed Cycladic houses on a hillside above the Aegean',
      'hero.badge': 'Top 10% Guest Favorite · Chorio, Kimolos',
      'hero.title': 'A quiet Cycladic home in the heart of Chorio',
      'hero.subtitle': 'A 48 m² first-floor apartment with a private balcony over whitewashed alleys — steps from the tavernas, the Kastro and the road down to the port.',
      'avail.label': 'Quick availability',
      'avail.submit': 'Check Availability',

      'field.checkin': 'Check-in',
      'field.checkout': 'Check-out',
      'field.guests': 'Guests',
      'field.name': 'Full name',
      'field.email': 'Email',
      'field.message': 'Message (optional)',
      'field.messagePh': 'Arrival ferry, questions, special requests…',
      'guests.1': '1 guest',
      'guests.2': '2 guests',
      'guests.3': '3 guests',

      'gallery.eyebrow': 'Gallery',
      'gallery.title': "Inside Flora's",
      'gallery.all': 'View all 5 photos',
      'cap.living': 'Living room',
      'cap.bedroom': 'Bedroom',
      'cap.kitchen': 'Fully equipped kitchen',
      'cap.balcony': 'Balcony view over Chorio',
      'cap.streets': 'The alleys of Chorio',

      'house.eyebrow': 'The House',
      'house.title': 'Authentic island living, one floor above the lanes of Chorio',
      'house.p1': "Flora's Guest House is a bright 48 m² apartment on the first floor of a traditional house in Chorio, the whitewashed capital of Kimolos. Thick Cycladic walls keep it cool through the summer heat, and the private balcony opens onto quiet lanes where life still moves at island pace.",
      'house.p2': 'Inside there is a bedroom with two beds for up to three guests, a full kitchen for slow breakfasts with local produce, a bathroom with shower, two air-conditioning units and fast Wi-Fi. Everything else — the tavernas, the cafés, the village square — is a short stroll away.',
      'pill.guests': '3 Guests',
      'pill.bedroom': '1 Bedroom',
      'pill.beds': '2 Beds',
      'pill.bath': '1 Bathroom',
      'pill.floor': '1st floor',
      'highlights.title': 'Why guests love it',
      'hl.1.title': 'Top 10% Rated Stay',
      'hl.1.text': 'Recognized for guest satisfaction, cleanliness, and reliability.',
      'hl.2.title': 'Heart of Chorio',
      'hl.2.text': 'Walking distance to tavernas, cafés and the central square, with easy access to the port.',
      'hl.3.title': 'Private Balcony with Village Views',
      'hl.3.text': 'Ideal for morning coffee or evening drinks overlooking traditional Cycladic alleys.',
      'hl.4.title': 'Warm Local Hospitality',
      'hl.4.text': 'An attentive host who helps with ferry and port transfers and shares her best island tips.',

      'book.title': 'Book your stay',
      'book.badge': 'Zero platform fees',
      'book.intro': "Send Flora a direct inquiry and she'll reply personally with availability and her best rate.",
      'book.submit': 'Send Inquiry',
      'book.sending': 'Sending…',
      'book.or': 'or',
      'book.airbnb': 'View & Book on Airbnb',
      'book.note': 'An inquiry is not a confirmed booking until Flora replies.',
      'summary': '{nights} · {guests}',
      'nights.one': '{n} night',
      'nights.other': '{n} nights',

      'err.required': 'This field is required.',
      'err.email': 'Please enter a valid email address.',
      'err.past': "Check-in can't be in the past.",
      'err.order': 'Check-out must be after check-in.',
      'err.long': 'Inquiries are limited to {max} nights — message Flora for longer stays.',
      'err.send': 'Sorry, the inquiry could not be sent. Please try again, or contact Flora via Airbnb.',

      'modal.title': 'Thank you — inquiry sent!',
      'modal.text': "Thanks, {name}. Flora will reply to {email} with availability and her best direct rate.",
      'modal.nights': 'Nights',
      'modal.close': 'Close',

      'amen.eyebrow': 'Amenities',
      'amen.title': 'Everything you need for a slow island stay',
      'amen.ac': '2 Air-Conditioning Units',
      'amen.ac.t': 'Stay cool through the Cycladic summer',
      'amen.kitchen': 'Full Kitchen',
      'amen.kitchen.t': 'Refrigerator & electric cooker',
      'amen.washer': 'Free In-Unit Washer',
      'amen.washer.t': 'Pack light, stay longer',
      'amen.wifi': 'Free High-Speed Wi-Fi',
      'amen.wifi.t': "Stream, work, or plan tomorrow's beach",
      'amen.balcony': 'Private Balcony',
      'amen.balcony.t': 'Village views over Chorio',
      'amen.tv': '32" HDTV',
      'amen.tv.t': 'For quiet evenings in',
      'amen.parking': 'Free Street Parking',
      'amen.parking.t': 'Nearby, at no extra cost',
      'amen.bath': 'Bathroom with Shower',
      'amen.bath.t': 'Private WC with shower',

      'loc.eyebrow': 'Location',
      'loc.title': 'Exploring Kimolos from Chorio',
      'loc.lead': "Kimolos is a small, unhurried island just across from Milos, reached by ferry to Psathi port or the short hop from Pollonia. From the house you can walk everywhere in Chorio, and the island's beaches are a short drive or a scenic hike away.",
      'loc.mapLabel': 'Map of Chorio, Kimolos',
      'loc.loading': 'Loading map…',
      'loc.mapError': 'The map could not be loaded. Flora\'s Guest House is in Chorio, Kimolos — about 1 km above Psathi port.',
      'loc.note': 'Distances and times are approximate.',
      'poi.home': "Flora's Guest House",
      'poi.home.d': 'Chorio, Kimolos',
      'poi.square': 'Chorio Square',
      'poi.square.d': '2 min walk',
      'poi.kastro': 'Medieval Kastro',
      'poi.kastro.d': '3 min walk',
      'poi.psathi': 'Psathi Port',
      'poi.psathi.d': '~1 km · 15 min walk',
      'poi.bonatsa': 'Bonatsa Beach',
      'poi.bonatsa.d': '~2.5 km · 5 min drive',
      'poi.prassa': 'Prassa Beach',
      'poi.prassa.d': '~6 km · 12 min drive',

      'host.badge': 'Top 10%',
      'host.eyebrow': 'Your Host',
      'host.title': 'Meet Flora Ninou',
      'host.bio': 'Flora has been welcoming guests to Chorio for more than seven years. Expect a warm welcome, honest tips on the quietest beaches and the best tavernas, and help arranging your transfer to and from Psathi port — so your Kimolos holiday starts the moment you step off the ferry.',
      'host.f1': '7+ years hosting',
      'host.f2': 'Top 10% of homes',
      'host.f3': 'Port transfer assistance',
      'host.message': 'Message Flora',
      'host.airbnb': 'Contact via Airbnb',

      'footer.tagline': 'A Cycladic home in Chorio, Kimolos.',
      'footer.address': 'Chorio, Kimolos 840 04, Cyclades, Greece',
      'footer.nav': 'Footer',
      'footer.explore': 'Explore',
      'footer.book': 'Book',
      'footer.airbnb': 'Airbnb listing',
      'footer.reg': 'Registration',
      'footer.ama': 'AMA',
      'footer.rights': 'All rights reserved.',
      'footer.top': 'Back to top ↑',

      'lb.label': 'Photo gallery',
      'lb.close': 'Close',
      'lb.prev': 'Previous photo',
      'lb.next': 'Next photo'
    },

    el: {
      'meta.title': 'Flora\'s Guest House · Χωριό, Κίμωλος – Κυκλαδίτικο Διαμέρισμα',
      'skip': 'Μετάβαση στο περιεχόμενο',
      'brand.place': '· Κίμωλος',
      'nav.house': 'Το Σπίτι',
      'nav.amenities': 'Παροχές',
      'nav.location': 'Τοποθεσία',
      'nav.host': 'Οικοδέσποινα',
      'nav.book': 'Άμεση Κράτηση',
      'nav.open': 'Άνοιγμα μενού',
      'nav.close': 'Κλείσιμο μενού',

      'hero.alt': 'Ασβεστωμένα κυκλαδίτικα σπίτια σε πλαγιά πάνω από το Αιγαίο',
      'hero.badge': 'Στο κορυφαίο 10% · Χωριό, Κίμωλος',
      'hero.title': 'Ένα ήσυχο κυκλαδίτικο σπίτι στην καρδιά του Χωριού',
      'hero.subtitle': 'Διαμέρισμα 48 m² στον πρώτο όροφο με ιδιωτικό μπαλκόνι πάνω από τα ασβεστωμένα σοκάκια — λίγα βήματα από τις ταβέρνες, το Κάστρο και τον δρόμο για το λιμάνι.',
      'avail.label': 'Γρήγορος έλεγχος διαθεσιμότητας',
      'avail.submit': 'Έλεγχος Διαθεσιμότητας',

      'field.checkin': 'Άφιξη',
      'field.checkout': 'Αναχώρηση',
      'field.guests': 'Επισκέπτες',
      'field.name': 'Ονοματεπώνυμο',
      'field.email': 'Email',
      'field.message': 'Μήνυμα (προαιρετικό)',
      'field.messagePh': 'Πλοίο άφιξης, ερωτήσεις, ειδικά αιτήματα…',
      'guests.1': '1 επισκέπτης',
      'guests.2': '2 επισκέπτες',
      'guests.3': '3 επισκέπτες',

      'gallery.eyebrow': 'Φωτογραφίες',
      'gallery.title': 'Μέσα στο σπίτι της Φλώρας',
      'gallery.all': 'Όλες οι φωτογραφίες (5)',
      'cap.living': 'Σαλόνι',
      'cap.bedroom': 'Υπνοδωμάτιο',
      'cap.kitchen': 'Πλήρως εξοπλισμένη κουζίνα',
      'cap.balcony': 'Θέα από το μπαλκόνι στο Χωριό',
      'cap.streets': 'Τα σοκάκια του Χωριού',

      'house.eyebrow': 'Το Σπίτι',
      'house.title': 'Αυθεντική νησιώτικη ζωή, έναν όροφο πάνω από τα σοκάκια του Χωριού',
      'house.p1': 'Το Flora\'s Guest House είναι ένα φωτεινό διαμέρισμα 48 m² στον πρώτο όροφο ενός παραδοσιακού σπιτιού στο Χωριό, την ασβεστωμένη πρωτεύουσα της Κιμώλου. Οι χοντροί κυκλαδίτικοι τοίχοι το κρατούν δροσερό το καλοκαίρι, και το ιδιωτικό μπαλκόνι ανοίγει σε ήσυχα σοκάκια όπου η ζωή κυλά ακόμα με νησιώτικο ρυθμό.',
      'house.p2': 'Μέσα θα βρείτε υπνοδωμάτιο με δύο κρεβάτια για έως τρία άτομα, πλήρη κουζίνα για χαλαρά πρωινά με τοπικά προϊόντα, μπάνιο με ντουζιέρα, δύο κλιματιστικά και γρήγορο Wi-Fi. Όλα τα υπόλοιπα — οι ταβέρνες, τα καφέ, η πλατεία του χωριού — είναι λίγα βήματα μακριά.',
      'pill.guests': '3 Επισκέπτες',
      'pill.bedroom': '1 Υπνοδωμάτιο',
      'pill.beds': '2 Κρεβάτια',
      'pill.bath': '1 Μπάνιο',
      'pill.floor': '1ος όροφος',
      'highlights.title': 'Γιατί το αγαπούν οι επισκέπτες',
      'hl.1.title': 'Στο κορυφαίο 10% των καταλυμάτων',
      'hl.1.text': 'Αναγνωρισμένο για την ικανοποίηση των επισκεπτών, την καθαριότητα και την αξιοπιστία.',
      'hl.2.title': 'Στην καρδιά του Χωριού',
      'hl.2.text': 'Με τα πόδια σε ταβέρνες, καφέ και την κεντρική πλατεία, με εύκολη πρόσβαση στο λιμάνι.',
      'hl.3.title': 'Ιδιωτικό μπαλκόνι με θέα στο χωριό',
      'hl.3.text': 'Ιδανικό για πρωινό καφέ ή βραδινό ποτό με θέα στα παραδοσιακά κυκλαδίτικα σοκάκια.',
      'hl.4.title': 'Ζεστή τοπική φιλοξενία',
      'hl.4.text': 'Μια πρόθυμη οικοδέσποινα που βοηθά με τη μεταφορά από και προς το λιμάνι και μοιράζεται τις καλύτερες συμβουλές για το νησί.',

      'book.title': 'Κλείστε τη διαμονή σας',
      'book.badge': 'Χωρίς χρεώσεις πλατφόρμας',
      'book.intro': 'Στείλτε απευθείας ερώτημα στη Φλώρα και θα σας απαντήσει προσωπικά για διαθεσιμότητα και την καλύτερη τιμή.',
      'book.submit': 'Αποστολή Ερωτήματος',
      'book.sending': 'Αποστολή…',
      'book.or': 'ή',
      'book.airbnb': 'Δείτε & Κλείστε στο Airbnb',
      'book.note': 'Το ερώτημα δεν αποτελεί επιβεβαιωμένη κράτηση μέχρι να απαντήσει η Φλώρα.',
      'summary': '{nights} · {guests}',
      'nights.one': '{n} νύχτα',
      'nights.other': '{n} νύχτες',

      'err.required': 'Το πεδίο είναι υποχρεωτικό.',
      'err.email': 'Εισαγάγετε μια έγκυρη διεύθυνση email.',
      'err.past': 'Η άφιξη δεν μπορεί να είναι σε παρελθοντική ημερομηνία.',
      'err.order': 'Η αναχώρηση πρέπει να είναι μετά την άφιξη.',
      'err.long': 'Τα ερωτήματα αφορούν έως {max} νύχτες — για μεγαλύτερη διαμονή επικοινωνήστε με τη Φλώρα.',
      'err.send': 'Δυστυχώς το ερώτημα δεν στάλθηκε. Δοκιμάστε ξανά ή επικοινωνήστε με τη Φλώρα μέσω Airbnb.',

      'modal.title': 'Ευχαριστούμε — το ερώτημα στάλθηκε!',
      'modal.text': 'Ευχαριστούμε, {name}. Η Φλώρα θα απαντήσει στο {email} για τη διαθεσιμότητα και την καλύτερη τιμή απευθείας.',
      'modal.nights': 'Νύχτες',
      'modal.close': 'Κλείσιμο',

      'amen.eyebrow': 'Παροχές',
      'amen.title': 'Ό,τι χρειάζεστε για χαλαρές διακοπές στο νησί',
      'amen.ac': '2 Κλιματιστικά',
      'amen.ac.t': 'Δροσιά όλο το κυκλαδίτικο καλοκαίρι',
      'amen.kitchen': 'Πλήρης Κουζίνα',
      'amen.kitchen.t': 'Ψυγείο & ηλεκτρική κουζίνα',
      'amen.washer': 'Δωρεάν Πλυντήριο Ρούχων',
      'amen.washer.t': 'Ταξιδέψτε ελαφριά, μείνετε περισσότερο',
      'amen.wifi': 'Δωρεάν Γρήγορο Wi-Fi',
      'amen.wifi.t': 'Για streaming, δουλειά ή την αυριανή παραλία',
      'amen.balcony': 'Ιδιωτικό Μπαλκόνι',
      'amen.balcony.t': 'Θέα στο Χωριό',
      'amen.tv': 'Τηλεόραση HD 32"',
      'amen.tv.t': 'Για ήσυχα βράδια στο σπίτι',
      'amen.parking': 'Δωρεάν Στάθμευση',
      'amen.parking.t': 'Στον δρόμο, κοντά στο σπίτι',
      'amen.bath': 'Μπάνιο με Ντουζιέρα',
      'amen.bath.t': 'Ιδιωτικό WC με ντουζιέρα',

      'loc.eyebrow': 'Τοποθεσία',
      'loc.title': 'Εξερευνώντας την Κίμωλο από το Χωριό',
      'loc.lead': 'Η Κίμωλος είναι ένα μικρό, ήρεμο νησί απέναντι από τη Μήλο, με πλοίο στο λιμάνι της Ψάθης ή με το σύντομο πέρασμα από την Πολλώνια. Από το σπίτι πηγαίνετε παντού στο Χωριό με τα πόδια, ενώ οι παραλίες του νησιού απέχουν λίγα λεπτά με το αυτοκίνητο ή μια όμορφη πεζοπορία.',
      'loc.mapLabel': 'Χάρτης του Χωριού, Κίμωλος',
      'loc.loading': 'Φόρτωση χάρτη…',
      'loc.mapError': 'Ο χάρτης δεν φορτώθηκε. Το Flora\'s Guest House βρίσκεται στο Χωριό της Κιμώλου — περίπου 1 χλμ. πάνω από το λιμάνι της Ψάθης.',
      'loc.note': 'Οι αποστάσεις και οι χρόνοι είναι κατά προσέγγιση.',
      'poi.home': 'Flora\'s Guest House',
      'poi.home.d': 'Χωριό, Κίμωλος',
      'poi.square': 'Πλατεία Χωριού',
      'poi.square.d': '2΄ με τα πόδια',
      'poi.kastro': 'Μεσαιωνικό Κάστρο',
      'poi.kastro.d': '3΄ με τα πόδια',
      'poi.psathi': 'Λιμάνι Ψάθης',
      'poi.psathi.d': '~1 χλμ. · 15΄ με τα πόδια',
      'poi.bonatsa': 'Παραλία Μπονάτσα',
      'poi.bonatsa.d': '~2,5 χλμ. · 5΄ με αυτοκίνητο',
      'poi.prassa': 'Παραλία Πράσσα',
      'poi.prassa.d': '~6 χλμ. · 12΄ με αυτοκίνητο',

      'host.badge': 'Κορυφαίο 10%',
      'host.eyebrow': 'Η οικοδέσποινά σας',
      'host.title': 'Γνωρίστε τη Φλώρα Νίνου',
      'host.bio': 'Η Φλώρα καλωσορίζει επισκέπτες στο Χωριό εδώ και πάνω από επτά χρόνια. Θα σας υποδεχτεί θερμά, θα σας προτείνει τις πιο ήσυχες παραλίες και τις καλύτερες ταβέρνες, και θα σας βοηθήσει με τη μεταφορά από και προς το λιμάνι της Ψάθης — ώστε οι διακοπές σας στην Κίμωλο να ξεκινούν μόλις κατεβείτε από το πλοίο.',
      'host.f1': '7+ χρόνια φιλοξενίας',
      'host.f2': 'Στο κορυφαίο 10% των καταλυμάτων',
      'host.f3': 'Βοήθεια με τη μεταφορά από το λιμάνι',
      'host.message': 'Μήνυμα στη Φλώρα',
      'host.airbnb': 'Επικοινωνία μέσω Airbnb',

      'footer.tagline': 'Ένα κυκλαδίτικο σπίτι στο Χωριό της Κιμώλου.',
      'footer.address': 'Χωριό, Κίμωλος 840 04, Κυκλάδες',
      'footer.nav': 'Υποσέλιδο',
      'footer.explore': 'Περιήγηση',
      'footer.book': 'Κράτηση',
      'footer.airbnb': 'Καταχώριση στο Airbnb',
      'footer.reg': 'Αριθμός Μητρώου',
      'footer.ama': 'ΑΜΑ',
      'footer.rights': 'Με επιφύλαξη παντός δικαιώματος.',
      'footer.top': 'Επιστροφή επάνω ↑',

      'lb.label': 'Συλλογή φωτογραφιών',
      'lb.close': 'Κλείσιμο',
      'lb.prev': 'Προηγούμενη φωτογραφία',
      'lb.next': 'Επόμενη φωτογραφία'
    }
  };

  /* ------------------------------------------------------------- utilities */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = reducedMotion ? 'auto' : 'smooth';

  const storage = {
    get(key) { try { return window.localStorage.getItem(key); } catch (_) { return null; } },
    set(key, val) { try { window.localStorage.setItem(key, val); } catch (_) { /* private mode */ } }
  };

  let lang = storage.get(CONFIG.storageKey) === 'el' ? 'el' : 'en';
  const langListeners = [];

  function t(key, vars) {
    const str = (I18N[lang] && I18N[lang][key]) ?? I18N.en[key] ?? key;
    return vars ? str.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : str;
  }

  const pad = (n) => String(n).padStart(2, '0');
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  function parseISO(str) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str || '')) return null;
    const [y, m, d] = str.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.getMonth() === m - 1 ? date : null;
  }
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const nightsBetween = (a, b) => Math.round((b - a) / 86400000);
  const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  const nightsLabel = (n) => t(n === 1 ? 'nights.one' : 'nights.other', { n });
  const formatDate = (d) => new Intl.DateTimeFormat(lang === 'el' ? 'el-GR' : 'en-GB',
    { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(d);

  function lockScroll(lock) { document.body.classList.toggle('is-locked', lock); }

  /* ---------------------------------------------------------------- i18n UI */
  function applyLanguage(next) {
    lang = I18N[next] ? next : 'en';
    document.documentElement.lang = lang;
    document.title = t('meta.title');

    $$('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (I18N[lang][key] !== undefined) el.textContent = I18N[lang][key];
    });
    $$('[data-i18n-attr]').forEach((el) => {
      el.dataset.i18nAttr.split(';').forEach((pair) => {
        const [attr, key] = pair.split(':').map((s) => s.trim());
        if (attr && key && I18N[lang][key] !== undefined) el.setAttribute(attr, I18N[lang][key]);
      });
    });
    $$('.lang-toggle__btn').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
    });

    storage.set(CONFIG.storageKey, lang);
    langListeners.forEach((fn) => fn(lang));
  }

  function initLanguage() {
    $$('.lang-toggle__btn').forEach((btn) => {
      btn.addEventListener('click', () => { if (btn.dataset.lang !== lang) applyLanguage(btn.dataset.lang); });
    });
    applyLanguage(lang);
  }

  /* ---------------------------------------------------------- header / nav */
  function initHeader() {
    const header = $('.site-header');
    const nav = $('#site-nav');
    const toggle = $('.nav-toggle');
    const desktop = window.matchMedia('(min-width: 961px)');

    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', t(open ? 'nav.close' : 'nav.open'));
    };
    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

    toggle.addEventListener('click', () => setOpen(!isOpen()));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('click', (e) => {
      if (isOpen() && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    desktop.addEventListener('change', (e) => { if (e.matches) setOpen(false); });
    langListeners.push(() => toggle.setAttribute('aria-label', t(isOpen() ? 'nav.close' : 'nav.open')));

    // Shadow once scrolled
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Active section highlighting
    if ('IntersectionObserver' in window) {
      const links = new Map($$('.nav__link').map((a) => [a.getAttribute('href').slice(1), a]));
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) => a.classList.remove('is-active'));
          const link = links.get(entry.target.id);
          if (link) link.classList.add('is-active');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      links.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
    }
  }

  /* --------------------------------------------------------------- lightbox */
  function initLightbox() {
    const dialog = $('#lightbox');
    const img = $('#lightbox-img');
    const caption = $('#lightbox-caption');
    const counter = $('#lightbox-counter');
    const triggers = $$('[data-gallery-index]');
    const items = triggers.map((btn) => ({ src: btn.dataset.full, key: btn.dataset.captionKey }));
    if (!dialog || !items.length) return;

    let index = 0;
    let returnFocus = null;

    const preload = (i) => { const im = new Image(); im.src = items[(i + items.length) % items.length].src; };

    function render() {
      const item = items[index];
      img.classList.add('is-loading');
      img.src = item.src;
      img.alt = t(item.key);
      caption.textContent = t(item.key);
      counter.textContent = `${index + 1} / ${items.length}`;
      preload(index + 1);
      preload(index - 1);
    }
    img.addEventListener('load', () => img.classList.remove('is-loading'));
    img.addEventListener('error', () => img.classList.remove('is-loading'));

    const go = (delta) => { index = (index + delta + items.length) % items.length; render(); };

    function open(i, trigger) {
      index = i;
      returnFocus = trigger || document.activeElement;
      render();
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      lockScroll(true);
    }
    function close() {
      if (dialog.open && typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    }

    triggers.forEach((btn) => btn.addEventListener('click', () => open(Number(btn.dataset.galleryIndex), btn)));
    $$('[data-gallery-open]').forEach((btn) => btn.addEventListener('click', () => open(Number(btn.dataset.galleryOpen), btn)));

    $('[data-lb-prev]', dialog).addEventListener('click', () => go(-1));
    $('[data-lb-next]', dialog).addEventListener('click', () => go(1));
    $('[data-lb-close]', dialog).addEventListener('click', close);

    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
    });
    // Click on the dark backdrop / empty space closes
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog || e.target.classList.contains('lightbox__inner') || e.target.classList.contains('lightbox__figure')) close();
    });
    dialog.addEventListener('close', () => {
      lockScroll(false);
      if (returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus({ preventScroll: true });
    });

    // Touch swipe
    let startX = null;
    dialog.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].clientX; }, { passive: true });
    dialog.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      startX = null;
    }, { passive: true });

    langListeners.push(() => { if (dialog.open) { img.alt = t(items[index].key); caption.textContent = t(items[index].key); } });
  }

  /* ---------------------------------------------------------------- booking */
  function initBooking() {
    const form = $('#booking-form');
    const card = $('.booking-card');
    const quick = $('#quick-bar');
    const modal = $('#confirm-modal');
    if (!form) return;

    const f = {
      checkin: $('#bf-checkin'),
      checkout: $('#bf-checkout'),
      guests: $('#bf-guests'),
      name: $('#bf-name'),
      email: $('#bf-email'),
      message: $('#bf-message')
    };
    const summary = $('#bf-summary');
    const status = $('#bf-status');
    const submitBtn = $('#bf-submit');
    const submitLabel = $('span', submitBtn);
    let attempted = false;

    // Keep date pickers sane: min = today, checkout min = checkin + 1
    function linkDates(inEl, outEl) {
      const todayISO = toISO(today());
      inEl.min = todayISO;
      outEl.min = toISO(addDays(today(), 1));
      inEl.addEventListener('change', () => {
        const ci = parseISO(inEl.value);
        if (!ci) return;
        const minOut = addDays(ci, 1);
        outEl.min = toISO(minOut);
        const co = parseISO(outEl.value);
        if (!co || co <= ci) outEl.value = toISO(minOut);
      });
    }
    linkDates(f.checkin, f.checkout);
    if (quick) linkDates($('#qb-checkin'), $('#qb-checkout'));

    function validate(onlyDates = false) {
      const errors = {};
      const ci = parseISO(f.checkin.value);
      const co = parseISO(f.checkout.value);

      if (!ci) errors.checkin = t('err.required');
      else if (ci < today()) errors.checkin = t('err.past');

      if (!co) errors.checkout = t('err.required');
      else if (ci && co <= ci) errors.checkout = t('err.order');
      else if (ci && nightsBetween(ci, co) > CONFIG.maxNights) errors.checkout = t('err.long', { max: CONFIG.maxNights });

      if (!onlyDates) {
        if (!f.name.value.trim()) errors.name = t('err.required');
        const email = f.email.value.trim();
        if (!email) errors.email = t('err.required');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = t('err.email');
      }
      return errors;
    }

    function showErrors(errors, fields) {
      fields.forEach((name) => {
        const input = f[name];
        const out = document.getElementById(`bf-${name}-err`);
        const msg = errors[name] || '';
        if (out) out.textContent = msg;
        if (msg) input.setAttribute('aria-invalid', 'true');
        else input.removeAttribute('aria-invalid');
      });
    }

    function updateSummary() {
      const ci = parseISO(f.checkin.value);
      const co = parseISO(f.checkout.value);
      if (ci && co && co > ci && ci >= today()) {
        summary.textContent = t('summary', {
          nights: nightsLabel(nightsBetween(ci, co)),
          guests: t(`guests.${f.guests.value}`)
        });
      } else {
        summary.textContent = '';
      }
    }

    ['checkin', 'checkout', 'guests', 'name', 'email'].forEach((name) => {
      const ev = f[name].tagName === 'SELECT' || f[name].type === 'date' ? 'change' : 'input';
      f[name].addEventListener(ev, () => {
        updateSummary();
        if (attempted) showErrors(validate(), ['checkin', 'checkout', 'name', 'email']);
        else if (f[name].type === 'date' && f.checkin.value && f.checkout.value) {
          showErrors(validate(true), ['checkin', 'checkout']);
        }
      });
    });

    function highlightCard() {
      card.classList.remove('is-highlighted');
      void card.offsetWidth; // restart animation
      card.classList.add('is-highlighted');
    }

    function goToBooking(focusEl) {
      $('#booking').scrollIntoView({ behavior: scrollBehavior, block: 'start' });
      highlightCard();
      // Focus after the smooth scroll begins without fighting it
      window.setTimeout(() => focusEl.focus({ preventScroll: true }), reducedMotion ? 0 : 450);
    }

    // Hero quick bar → pre-fill booking card
    if (quick) {
      quick.addEventListener('submit', (e) => {
        e.preventDefault();
        const qi = $('#qb-checkin').value;
        const qo = $('#qb-checkout').value;
        if (qi) { f.checkin.value = qi; f.checkout.min = toISO(addDays(parseISO(qi) || today(), 1)); }
        if (qo) f.checkout.value = qo;
        f.guests.value = $('#qb-guests').value;
        updateSummary();

        if (qi || qo) {
          const errs = validate(true);
          showErrors(errs, ['checkin', 'checkout']);
          if (errs.checkin) return goToBooking(f.checkin);
          if (errs.checkout) return goToBooking(f.checkout);
          return goToBooking(f.name);
        }
        goToBooking(f.checkin);
      });
    }

    // "Message Flora" from the host card
    $$('[data-contact-host]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      goToBooking(f.checkin.value && f.checkout.value ? f.message : f.checkin);
    }));

    async function send(payload) {
      if (!CONFIG.inquiryEndpoint) return true; // demo mode
      const res = await fetch(CONFIG.inquiryEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      return res.ok;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      attempted = true;
      status.textContent = '';
      const errors = validate();
      showErrors(errors, ['checkin', 'checkout', 'name', 'email']);
      const firstInvalid = ['checkin', 'checkout', 'name', 'email'].find((k) => errors[k]);
      if (firstInvalid) { f[firstInvalid].focus(); return; }

      const ci = parseISO(f.checkin.value);
      const co = parseISO(f.checkout.value);
      const nights = nightsBetween(ci, co);
      const payload = {
        property: "Flora's Guest House",
        checkin: f.checkin.value,
        checkout: f.checkout.value,
        nights,
        guests: Number(f.guests.value),
        name: f.name.value.trim(),
        email: f.email.value.trim(),
        message: f.message.value.trim(),
        language: lang
      };

      submitBtn.disabled = true;
      submitLabel.textContent = t('book.sending');
      let ok = false;
      try { ok = await send(payload); } catch (_) { ok = false; }
      submitBtn.disabled = false;
      submitLabel.textContent = t('book.submit');

      if (!ok) { status.textContent = t('err.send'); return; }

      $('#confirm-text').textContent = t('modal.text', { name: payload.name.split(' ')[0], email: payload.email });
      $('#cm-checkin').textContent = formatDate(ci);
      $('#cm-checkout').textContent = formatDate(co);
      $('#cm-nights').textContent = String(nights);
      $('#cm-guests').textContent = String(payload.guests);

      if (typeof modal.showModal === 'function') modal.showModal();
      else modal.setAttribute('open', '');
      lockScroll(true);

      form.reset();
      attempted = false;
      showErrors({}, ['checkin', 'checkout', 'name', 'email']);
      updateSummary();
    });

    modal.addEventListener('close', () => { lockScroll(false); submitBtn.focus({ preventScroll: true }); });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

    langListeners.push(() => {
      updateSummary();
      if (attempted) showErrors(validate(), ['checkin', 'checkout', 'name', 'email']);
      if (!submitBtn.disabled) submitLabel.textContent = t('book.submit');
    });
  }

  /* -------------------------------------------------------------------- map */
  function initMap() {
    const el = $('#map');
    if (!el) return;
    let map = null;
    const markers = {};

    const popupHTML = (id) =>
      `<span class="map-popup__title">${t(`poi.${id}`)}</span><span class="map-popup__meta">${t(`poi.${id}.d`)}</span>`;

    function build() {
      if (map) return map;
      if (typeof window.L === 'undefined') {
        const p = $('.location__map-fallback', el);
        if (p) { p.dataset.i18n = 'loc.mapError'; p.textContent = t('loc.mapError'); }
        return null;
      }
      const L = window.L;
      el.textContent = '';
      map = L.map(el, { scrollWheelZoom: false, tap: false }).setView(CONFIG.map.center, 15);
      const useCarto = Boolean(CONFIG.map.cartoKey);
      L.tileLayer(useCarto ? CONFIG.map.cartoTiles : CONFIG.map.osmTiles, {
        attribution: useCarto ? CONFIG.map.cartoAttribution : CONFIG.map.osmAttribution,
        key: encodeURIComponent(CONFIG.map.cartoKey),
        maxZoom: 19
      }).addTo(map);

      Object.entries(CONFIG.places).forEach(([id, place]) => {
        const home = id === 'home';
        const icon = L.divIcon({
          className: `map-pin${home ? ' map-pin--home' : ''}`,
          html: '<span class="map-pin__dot"></span>',
          iconSize: home ? [40, 40] : [30, 30],
          iconAnchor: home ? [20, 46] : [15, 35],
          popupAnchor: [0, home ? -44 : -34]
        });
        markers[id] = L.marker(place.latlng, { icon, title: t(`poi.${id}`), zIndexOffset: home ? 1000 : 0 })
          .addTo(map)
          .bindPopup(popupHTML(id));
      });

      const bounds = L.latLngBounds(Object.values(CONFIG.places).map((p) => p.latlng));
      map.fitBounds(bounds, { padding: [36, 36] });
      markers.home.openPopup();

      // Enable wheel zoom only after the user interacts with the map
      map.once('focus click', () => map.scrollWheelZoom.enable());
      return map;
    }

    // Lazy-initialise when the section approaches the viewport
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { build(); io.disconnect(); }
      }, { rootMargin: '300px 0px' });
      io.observe(el);
    } else {
      build();
    }

    $$('.place').forEach((btn) => btn.addEventListener('click', () => {
      const m = build();
      if (!m) return;
      const id = btn.dataset.place;
      const place = CONFIG.places[id];
      $$('.place').forEach((b) => b.classList.toggle('is-active', b === btn));
      m.flyTo(place.latlng, place.zoom, { duration: reducedMotion ? 0 : 0.8 });
      markers[id].openPopup();

      const r = el.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) {
        el.scrollIntoView({ behavior: scrollBehavior, block: 'center' });
      }
    }));

    langListeners.push(() => {
      if (!map) return;
      Object.keys(markers).forEach((id) => markers[id].setPopupContent(popupHTML(id)));
    });
  }

  /* ------------------------------------------------------------------- misc */
  function initMisc() {
    const year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());

    // Hide broken images gracefully (container keeps its sand background + aspect ratio)
    document.addEventListener('error', (e) => {
      const el = e.target;
      if (el instanceof HTMLImageElement && el.id !== 'lightbox-img') el.classList.add('img-missing');
    }, true);
  }

  /* ------------------------------------------------------------------- boot */
  initMisc();
  initHeader();
  initLightbox();
  initBooking();
  initMap();
  initLanguage(); // last: listeners above are registered, then the stored language is applied
})();
