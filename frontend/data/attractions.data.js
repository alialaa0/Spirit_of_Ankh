// =============================================================================
// Spirit of Ankh — data/attractions.data.js
// -----------------------------------------------------------------------------
// PURPOSE: Master data array for all 45 Egyptian tourism attractions.
//          Each object contains: id, name, city, governorate, category,
//          GPS coordinates, capacity, current visitors, ticket price,
//          opening hours, best visit time, rating, description,
//          weather object, facilities object, image path, and nearby list.
//
//          This file is loaded first — all other modules depend on the
//          global `attractionsData` array defined here.
// =============================================================================

const attractionsData = [
  {
    "id": "egyptian-museum",
    "name": "The Egyptian Museum",
    "city": "Cairo",
    "governorate": "Cairo",
    "category": "Museum",
    "coordinates": [
      30.0478,
      31.2336
    ],
    "capacity": 6000,
    "currentVisitors": 2400,
    "ticketPrice": 450,
    "openingHours": "09:00 - 17:00",
    "bestTimeToVisit": "Year-round, Weekday mornings",
    "rating": 4.7,
    "description": "Located in Tahrir Square, this iconic red neoclassical building houses the oldest and most extensive collection of pharaonic antiquities in the world, with treasures spanning over 5,000 years of history.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": false,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/egyptian_museum.png",
    "nearby": [
      "Citadel of Saladin",
      "Khan El Khalili",
      "National Museum of Egyptian Civilization (NMEC)"
    ]
  },
  {
    "id": "nmec",
    "name": "National Museum of Egyptian Civilization (NMEC)",
    "city": "Cairo",
    "governorate": "Cairo",
    "category": "Museum",
    "coordinates": [
      30.0061,
      31.2485
    ],
    "capacity": 5000,
    "currentVisitors": 2000,
    "ticketPrice": 500,
    "openingHours": "09:00 - 17:00, 18:00 - 21:00 (Fri)",
    "bestTimeToVisit": "Year-round, Evening hours",
    "rating": 4.8,
    "description": "NMEC is the first museum in the Arab world focusing on the earliest civilization in history. Its primary attraction is the Royal Mummies Hall, displaying 22 mummies of ancient Egyptian kings and queens.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/nmec.jpg",
    "nearby": [
      "The Egyptian Museum",
      "Citadel of Saladin",
      "Khan El Khalili"
    ]
  },
  {
    "id": "citadel-saladin",
    "name": "Citadel of Saladin",
    "city": "Cairo",
    "governorate": "Cairo",
    "category": "Historical",
    "coordinates": [
      30.0299,
      31.2615
    ],
    "capacity": 7000,
    "currentVisitors": 2800,
    "ticketPrice": 350,
    "openingHours": "08:00 - 17:00",
    "bestTimeToVisit": "November to March, 10:00 - 13:00",
    "rating": 4.7,
    "description": "A medieval Islamic-era fortification built by Salah ad-Din. The Citadel is famous for its commanding views over Cairo and contains the majestic Mosque of Muhammad Ali with its towering minarets.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/citadel_saladin.jpg",
    "nearby": [
      "Khan El Khalili",
      "The Egyptian Museum",
      "National Museum of Egyptian Civilization (NMEC)"
    ]
  },
  {
    "id": "khan-el-khalili",
    "name": "Khan El Khalili",
    "city": "Cairo",
    "governorate": "Cairo",
    "category": "Adventure",
    "coordinates": [
      30.0478,
      31.2625
    ],
    "capacity": 10000,
    "currentVisitors": 4000,
    "ticketPrice": 0,
    "openingHours": "09:00 - Midnight",
    "bestTimeToVisit": "Year-round, Sunset and Night",
    "rating": 4.8,
    "description": "A famous bazaar and souq in the historic center of Cairo. Packed with colorful lanterns, spices, brass, silver, perfume, and traditional souvenirs, it is a bustling maze of Egyptian culture and commerce.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": false,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/khan_el_khalili.png",
    "nearby": [
      "Citadel of Saladin",
      "The Egyptian Museum",
      "National Museum of Egyptian Civilization (NMEC)"
    ]
  },
  {
    "id": "al-muizz-street",
    "name": "Al Muizz Street",
    "city": "Cairo",
    "governorate": "Cairo",
    "category": "Historical",
    "coordinates": [
      30.0524,
      31.262
    ],
    "capacity": 9000,
    "currentVisitors": 3600,
    "ticketPrice": 0,
    "openingHours": "08:00 - 23:00",
    "bestTimeToVisit": "Year-round, Evening walks",
    "rating": 4.8,
    "description": "One of the oldest streets in Cairo, Al-Muizz li-Din Allah al-Fatimi Street is an open-air museum of Islamic architecture. It contains a high concentration of medieval Islamic treasures, including mosques, madrasas, and mausoleums.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": false,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/al_muizz_street.jpg",
    "nearby": [
      "Khan El Khalili",
      "The Egyptian Museum",
      "Citadel of Saladin"
    ]
  },
  {
    "id": "cairo-tower",
    "name": "Cairo Tower",
    "city": "Cairo",
    "governorate": "Cairo",
    "category": "Adventure",
    "coordinates": [
      30.0459,
      31.2243
    ],
    "capacity": 5000,
    "currentVisitors": 2000,
    "ticketPrice": 250,
    "openingHours": "09:00 - 01:00",
    "bestTimeToVisit": "Year-round, Sunset",
    "rating": 4.6,
    "description": "Standing at 187 meters on Gezira Island, the Cairo Tower is Cairo's famous concrete tower. It offers breathtaking 360-degree panoramic views of the city, the Nile, and even the Pyramids on a clear day.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": false,
      "cafes": true
    },
    "image": "images/cairo_tower.jpg",
    "nearby": [
      "The Egyptian Museum",
      "Khan El Khalili"
    ]
  },
  {
    "id": "al-azhar-park",
    "name": "Al Azhar Park",
    "city": "Cairo",
    "governorate": "Cairo",
    "category": "Nature",
    "coordinates": [
      30.04,
      31.2688
    ],
    "capacity": 7000,
    "currentVisitors": 2800,
    "ticketPrice": 40,
    "openingHours": "09:00 - 22:00",
    "bestTimeToVisit": "Spring and Autumn, Sunset",
    "rating": 4.7,
    "description": "Listed as one of the world's sixty great public spaces, Al-Azhar Park is a 74-acre green oasis in historic Cairo. It features manicured gardens, fountains, and panoramic views of the Citadel and city skyline.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": false,
      "cafes": true
    },
    "image": "images/al_azhar_park.jpg",
    "nearby": [
      "Citadel of Saladin",
      "Khan El Khalili"
    ]
  },
  {
    "id": "giza-pyramids",
    "name": "Pyramids of Giza",
    "city": "Giza",
    "governorate": "Giza",
    "category": "Historical",
    "coordinates": [
      29.9792,
      31.1342
    ],
    "capacity": 12000,
    "currentVisitors": 4800,
    "ticketPrice": 500,
    "openingHours": "08:00 - 17:00",
    "bestTimeToVisit": "October to April, 08:00 - 10:00",
    "rating": 4.9,
    "description": "The Great Pyramids of Giza, including Khufu, Khafre, and Menkaure, are the last remaining wonder of the ancient world. Built during the Fourth Dynasty of the Old Kingdom, they stand as a monumental testament to ancient Egyptian engineering and royal ambition.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/giza_pyramids.png",
    "nearby": [
      "Grand Egyptian Museum",
      "Saqqara & Step Pyramid",
      "Citadel of Saladin"
    ]
  },
  {
    "id": "great-sphinx",
    "name": "Great Sphinx of Giza",
    "city": "Giza",
    "governorate": "Giza",
    "category": "Historical",
    "coordinates": [
      29.9753,
      31.1376
    ],
    "capacity": 10000,
    "currentVisitors": 4000,
    "ticketPrice": 500,
    "openingHours": "08:00 - 17:00",
    "bestTimeToVisit": "October to April, 08:00 - 10:00",
    "rating": 4.9,
    "description": "Carved from a single ridge of limestone, the Great Sphinx of Giza represents a mythical creature with a lion's body and a human head, widely believed to represent Pharaoh Khafre. It stands sentinel near the Pyramids.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/great_sphinx.jpg",
    "nearby": [
      "Pyramids of Giza",
      "Grand Egyptian Museum"
    ]
  },
  {
    "id": "grand-egyptian-museum",
    "name": "Grand Egyptian Museum (GEM)",
    "city": "Giza",
    "governorate": "Giza",
    "category": "Museum",
    "coordinates": [
      29.9884,
      31.1307
    ],
    "capacity": 15000,
    "currentVisitors": 6000,
    "ticketPrice": 1200,
    "openingHours": "09:00 - 18:00",
    "bestTimeToVisit": "November to March, 13:00 - 16:00",
    "rating": 4.8,
    "description": "Also known as the Giza Museum, GEM is the largest archaeological museum in the world dedicated to a single civilization. It houses the complete Tutankhamun collection, many pieces displayed for the first time, and overlooks the Pyramids.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/grand_egyptian_museum.png",
    "nearby": [
      "Pyramids of Giza",
      "Saqqara & Step Pyramid",
      "The Egyptian Museum"
    ]
  },
  {
    "id": "saqqara",
    "name": "Saqqara & Step Pyramid",
    "city": "Giza",
    "governorate": "Giza",
    "category": "Historical",
    "coordinates": [
      29.8711,
      31.2165
    ],
    "capacity": 5000,
    "currentVisitors": 2000,
    "ticketPrice": 300,
    "openingHours": "08:00 - 16:00",
    "bestTimeToVisit": "October to April, 09:00 - 11:00",
    "rating": 4.7,
    "description": "Saqqara features the famous Step Pyramid of Djoser, the oldest complete stone building complex known in history, designed by the legendary architect Imhotep. It contains vast burial grounds and beautiful mastaba tombs.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": false,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/saqqara_pyramid.png",
    "nearby": [
      "Pyramids of Giza",
      "Grand Egyptian Museum (GEM)"
    ]
  },
  {
    "id": "dahshur-pyramids",
    "name": "Dahshur Pyramids",
    "city": "Giza",
    "governorate": "Giza",
    "category": "Historical",
    "coordinates": [
      29.8017,
      31.2056
    ],
    "capacity": 3000,
    "currentVisitors": 1200,
    "ticketPrice": 150,
    "openingHours": "08:00 - 16:00",
    "bestTimeToVisit": "November to February, Morning",
    "rating": 4.7,
    "description": "Located in the desert south of Saqqara, Dahshur is home to the Bent Pyramid and the Red Pyramid, built by Pharaoh Sneferu. These pyramids represent key evolutionary steps in true smooth-sided pyramid design.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": false,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": false,
      "cafes": false
    },
    "image": "images/dahshur_pyramids.jpg",
    "nearby": [
      "Saqqara & Step Pyramid"
    ]
  },
  {
    "id": "bibliotheca-alexandrina",
    "name": "Bibliotheca Alexandrina",
    "city": "Alexandria",
    "governorate": "Alexandria",
    "category": "Religious",
    "coordinates": [
      31.2089,
      29.9092
    ],
    "capacity": 7000,
    "currentVisitors": 2800,
    "ticketPrice": 150,
    "openingHours": "09:00 - 19:00",
    "bestTimeToVisit": "September to May, Afternoon",
    "rating": 4.8,
    "description": "A commemoration of the Great Library of Alexandria, this modern library, museum, and cultural center is built on a magnificent scale with room for eight million books. Its unique design resembles a tilted sun disc.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/bibliotheca_alexandrina.png",
    "nearby": [
      "Qaitbay Citadel"
    ]
  },
  {
    "id": "qaitbay-citadel",
    "name": "Qaitbay Citadel",
    "city": "Alexandria",
    "governorate": "Alexandria",
    "category": "Historical",
    "coordinates": [
      31.2136,
      29.8853
    ],
    "capacity": 6000,
    "currentVisitors": 2400,
    "ticketPrice": 150,
    "openingHours": "08:00 - 18:00",
    "bestTimeToVisit": "September to May, Late afternoon",
    "rating": 4.8,
    "description": "Built in the 15th century by Sultan Qaitbay on the Mediterranean coast, this defensive fortress occupies the exact site of the legendary Pharos Lighthouse of Alexandria, utilizing its fallen stones.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": false,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/qaitbay_citadel.jpg",
    "nearby": [
      "Bibliotheca Alexandrina"
    ]
  },
  {
    "id": "catacombs-kom-el-shoqafa",
    "name": "Catacombs of Kom El Shoqafa",
    "city": "Alexandria",
    "governorate": "Alexandria",
    "category": "Historical",
    "coordinates": [
      31.182,
      29.89
    ],
    "capacity": 3000,
    "currentVisitors": 1200,
    "ticketPrice": 120,
    "openingHours": "09:00 - 17:00",
    "bestTimeToVisit": "Year-round, Morning",
    "rating": 4.6,
    "description": "A historical archaeological site and one of the Seven Wonders of the Middle Ages, these Roman-era catacombs feature a three-level spiral burial chamber blending Pharaonic, Greek, and Roman artistic styles.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": false,
      "restaurants": false,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": false,
      "cafes": false
    },
    "image": "images/catacombs_kom_el_shoqafa.jpg",
    "nearby": [
      "Qaitbay Citadel",
      "Bibliotheca Alexandrina"
    ]
  },
  {
    "id": "montaza-palace",
    "name": "Montaza Palace Gardens",
    "city": "Alexandria",
    "governorate": "Alexandria",
    "category": "Nature",
    "coordinates": [
      31.285,
      30.017
    ],
    "capacity": 10000,
    "currentVisitors": 4000,
    "ticketPrice": 25,
    "openingHours": "08:00 - 22:00",
    "bestTimeToVisit": "Spring and Autumn, Sunset",
    "rating": 4.7,
    "description": "Surrounding the historic Montaza Palace, these expansive royal gardens feature lush lawns, palm trees, pine woods, and beaches, offering a serene escape along the Mediterranean shore of Alexandria.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": false,
      "cafes": true
    },
    "image": "images/montaza_palace.jpg",
    "nearby": [
      "Stanley Bridge"
    ]
  },
  {
    "id": "stanley-bridge",
    "name": "Stanley Bridge",
    "city": "Alexandria",
    "governorate": "Alexandria",
    "category": "Adventure",
    "coordinates": [
      31.2456,
      29.9668
    ],
    "capacity": 12000,
    "currentVisitors": 4800,
    "ticketPrice": 0,
    "openingHours": "24 Hours",
    "bestTimeToVisit": "Summer evenings, Sunset",
    "rating": 4.6,
    "description": "Alexandria's iconic Stanley Bridge is a landmark 400-meter-long bridge built across Stanley Bay. It features elegant Islamic-style towers and offers panoramic sea views, popular for evening walks.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": false,
      "wheelchair": true,
      "giftShop": false,
      "cafes": true
    },
    "image": "images/stanley_bridge.jpg",
    "nearby": [
      "Montaza Palace Gardens"
    ]
  },
  {
    "id": "karnak-temple",
    "name": "Karnak Temple Complex",
    "city": "Luxor",
    "governorate": "Luxor",
    "category": "Historical",
    "coordinates": [
      25.7188,
      32.6573
    ],
    "capacity": 8000,
    "currentVisitors": 3200,
    "ticketPrice": 450,
    "openingHours": "06:00 - 17:30",
    "bestTimeToVisit": "October to April, 07:00 - 09:30",
    "rating": 4.9,
    "description": "Karnak is the largest religious complex ever constructed, developed over more than 1,500 years. Its centerpiece is the Great Hypostyle Hall, containing 134 massive sandstone columns arranged in 16 rows.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/karnak_temple.png",
    "nearby": [
      "Luxor Temple",
      "Valley of the Kings"
    ]
  },
  {
    "id": "luxor-temple",
    "name": "Luxor Temple",
    "city": "Luxor",
    "governorate": "Luxor",
    "category": "Historical",
    "coordinates": [
      25.6996,
      32.6396
    ],
    "capacity": 7000,
    "currentVisitors": 2800,
    "ticketPrice": 400,
    "openingHours": "06:00 - 22:00",
    "bestTimeToVisit": "December to February, Sunset (17:30 - 19:30)",
    "rating": 4.9,
    "description": "Located on the east bank of the Nile River, Luxor Temple was founded in 1400 BCE. Unlike most temples in Thebes, it was not dedicated to a god or a deified king, but rather to the rejuvenation of kingship.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/luxor_temple.png",
    "nearby": [
      "Karnak Temple Complex",
      "Valley of the Kings",
      "Philae Temple"
    ]
  },
  {
    "id": "valley-of-the-kings",
    "name": "Valley of the Kings",
    "city": "Luxor",
    "governorate": "Luxor",
    "category": "Historical",
    "coordinates": [
      25.7402,
      32.6014
    ],
    "capacity": 9000,
    "currentVisitors": 3600,
    "ticketPrice": 600,
    "openingHours": "06:00 - 16:00",
    "bestTimeToVisit": "November to February, 06:00 - 08:30",
    "rating": 4.9,
    "description": "For nearly 500 years from the 16th to 11th century BCE, tombs were excavated for the pharaohs and powerful nobles of the New Kingdom. The valley contains 63 tombs, including Tutankhamun and Ramesses II.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": false,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/valley_of_the_kings.png",
    "nearby": [
      "Luxor Temple",
      "Karnak Temple Complex"
    ]
  },
  {
    "id": "hatshepsut-temple",
    "name": "Hatshepsut Temple",
    "city": "Luxor",
    "governorate": "Luxor",
    "category": "Historical",
    "coordinates": [
      25.7382,
      32.6067
    ],
    "capacity": 7000,
    "currentVisitors": 2800,
    "ticketPrice": 360,
    "openingHours": "06:00 - 17:00",
    "bestTimeToVisit": "October to April, 06:00 - 08:00",
    "rating": 4.9,
    "description": "The Mortuary Temple of Queen Hatshepsut, located at Deir el-Bahari, is a masterpiece of ancient architecture. Its three colonnaded terraces rise dramatically from the desert floor beneath towering cliffs.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/hatshepsut_temple.jpg",
    "nearby": [
      "Valley of the Kings",
      "Luxor Temple"
    ]
  },
  {
    "id": "valley-of-the-queens",
    "name": "Valley of the Queens",
    "city": "Luxor",
    "governorate": "Luxor",
    "category": "Historical",
    "coordinates": [
      25.7277,
      32.5945
    ],
    "capacity": 4000,
    "currentVisitors": 1600,
    "ticketPrice": 150,
    "openingHours": "06:00 - 17:00",
    "bestTimeToVisit": "November to February, Morning",
    "rating": 4.8,
    "description": "A burial site in ancient Egypt where wives of Pharaohs and royal children were buried. It contains the spectacular Tomb of Queen Nefertari, renowned for its pristine, vibrant colorful wall paintings.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": false,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": false,
      "cafes": true
    },
    "image": "images/valley_of_the_queens.jpg",
    "nearby": [
      "Valley of the Kings",
      "Hatshepsut Temple"
    ]
  },
  {
    "id": "luxor-museum",
    "name": "Luxor Museum",
    "city": "Luxor",
    "governorate": "Luxor",
    "category": "Museum",
    "coordinates": [
      25.7077,
      32.6396
    ],
    "capacity": 2500,
    "currentVisitors": 1000,
    "ticketPrice": 300,
    "openingHours": "09:00 - 14:00, 17:00 - 22:00",
    "bestTimeToVisit": "Year-round, Evening hours",
    "rating": 4.7,
    "description": "Overlooking the Nile, the Luxor Museum houses a small but exceptionally high-quality collection of antiquities from the ancient city of Thebes, including royal mummies and golden statues.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": false,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": true,
      "cafes": false
    },
    "image": "images/luxor_museum.jpg",
    "nearby": [
      "Luxor Temple",
      "Karnak Temple Complex"
    ]
  },
  {
    "id": "abu-simbel",
    "name": "Abu Simbel Temples",
    "city": "Aswan",
    "governorate": "Aswan",
    "category": "Historical",
    "coordinates": [
      22.3372,
      31.6258
    ],
    "capacity": 7000,
    "currentVisitors": 2800,
    "ticketPrice": 500,
    "openingHours": "05:00 - 18:00",
    "bestTimeToVisit": "Sun Festival (Feb 22 & Oct 22), 05:30 - 08:00",
    "rating": 5.0,
    "description": "Two massive rock-cut temples carved out of the mountainside during the reign of Pharaoh Ramesses II in the 13th century BCE. Famously relocated in their entirety in 1968 to avoid being submerged by Lake Nasser.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/abu_simbel.png",
    "nearby": [
      "Philae Temple"
    ]
  },
  {
    "id": "philae-temple",
    "name": "Philae Temple",
    "city": "Aswan",
    "governorate": "Aswan",
    "category": "Historical",
    "coordinates": [
      24.0258,
      32.8841
    ],
    "capacity": 6000,
    "currentVisitors": 2400,
    "ticketPrice": 350,
    "openingHours": "07:00 - 16:00",
    "bestTimeToVisit": "October to May, Sunset Sound & Light Show",
    "rating": 4.9,
    "description": "Dedicated to the goddess Isis, this majestic temple complex was located on Philae Island but relocated to Agilkia Island under a UNESCO project due to rising waters. Accessible only by a scenic motorboat ride.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": false,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/philae_temple.jpg",
    "nearby": [
      "Abu Simbel Temples",
      "Luxor Temple"
    ]
  },
  {
    "id": "nubian-village",
    "name": "Nubian Village",
    "city": "Aswan",
    "governorate": "Aswan",
    "category": "Adventure",
    "coordinates": [
      24.0889,
      32.8998
    ],
    "capacity": 3000,
    "currentVisitors": 1200,
    "ticketPrice": 0,
    "openingHours": "08:00 - 20:00",
    "bestTimeToVisit": "November to March, Afternoon",
    "rating": 4.8,
    "description": "Located on the West Bank of the Nile, this colorful traditional Nubian Village features houses painted in vibrant geometric patterns, friendly locals, local crafts, and camel rides.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": false,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/nubian_village.jpg",
    "nearby": [
      "Philae Temple",
      "Nubian Museum"
    ]
  },
  {
    "id": "nubian-museum",
    "name": "Nubian Museum",
    "city": "Aswan",
    "governorate": "Aswan",
    "category": "Museum",
    "coordinates": [
      24.0822,
      32.8872
    ],
    "capacity": 2500,
    "currentVisitors": 1000,
    "ticketPrice": 200,
    "openingHours": "09:00 - 13:00, 17:00 - 21:00",
    "bestTimeToVisit": "Year-round, Evening",
    "rating": 4.7,
    "description": "A museum dedicated to Nubian history and culture, from prehistory to the construction of the Aswan High Dam. It houses thousands of artifacts saved from the rising waters of Lake Nasser.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": false,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/nubian_museum.jpg",
    "nearby": [
      "Philae Temple",
      "Nubian Village"
    ]
  },
  {
    "id": "unfinished-obelisk",
    "name": "Unfinished Obelisk",
    "city": "Aswan",
    "governorate": "Aswan",
    "category": "Historical",
    "coordinates": [
      24.0767,
      32.899
    ],
    "capacity": 3000,
    "currentVisitors": 1200,
    "ticketPrice": 120,
    "openingHours": "07:00 - 17:00",
    "bestTimeToVisit": "November to February, Early Morning",
    "rating": 4.5,
    "description": "Located in the northern quarries of Aswan, this giant obelisk was ordered by Queen Hatshepsut but abandoned after cracks appeared. It provides unique insights into ancient stone-carving techniques.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": false,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": true,
      "cafes": false
    },
    "image": "images/unfinished_obelisk.jpg",
    "nearby": [
      "Nubian Museum",
      "Philae Temple"
    ]
  },
  {
    "id": "ras-mohammed",
    "name": "Ras Mohammed National Park",
    "city": "Sharm El Sheikh",
    "governorate": "South Sinai",
    "category": "Nature",
    "coordinates": [
      27.7244,
      34.2583
    ],
    "capacity": 5000,
    "currentVisitors": 2000,
    "ticketPrice": 250,
    "openingHours": "08:00 - 17:00",
    "bestTimeToVisit": "March to November, 09:00 - 14:00 (for diving)",
    "rating": 4.9,
    "description": "A marine national park at the southern tip of the Sinai Peninsula. Renowned by divers worldwide for its spectacular coral reefs, diverse marine life (including over 1,000 fish species), mangrove forests, and salt lake.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": false,
      "cafes": true
    },
    "image": "images/ras_mohammed.png",
    "nearby": [
      "Naama Bay",
      "Saint Catherine Monastery"
    ]
  },
  {
    "id": "soho-square",
    "name": "SOHO Square",
    "city": "Sharm El Sheikh",
    "governorate": "South Sinai",
    "category": "Adventure",
    "coordinates": [
      27.9773,
      34.3947
    ],
    "capacity": 8000,
    "currentVisitors": 3200,
    "ticketPrice": 0,
    "openingHours": "10:00 - 02:00",
    "bestTimeToVisit": "Year-round, Evening from 20:00",
    "rating": 4.6,
    "description": "A premium entertainment, shopping, and dining complex in Sharm El Sheikh. It features a musical fountain, ice skating rink, bowling alley, and fine dining restaurants under spectacular light installations.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/soho_square.jpg",
    "nearby": [
      "Naama Bay"
    ]
  },
  {
    "id": "naama-bay",
    "name": "Naama Bay",
    "city": "Sharm El Sheikh",
    "governorate": "South Sinai",
    "category": "Beach",
    "coordinates": [
      27.9158,
      34.3299
    ],
    "capacity": 12000,
    "currentVisitors": 4800,
    "ticketPrice": 0,
    "openingHours": "24 Hours",
    "bestTimeToVisit": "March to May, October to November",
    "rating": 4.8,
    "description": "The central tourist hub of Sharm El Sheikh, Naama Bay is a natural bay famous for its fine sandy beach, luxury resorts, pedestrian promenade, lively cafes, diving centers, and vibrant shopping streets.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/naama_bay.jpg",
    "nearby": [
      "Ras Mohammed National Park",
      "SOHO Square"
    ]
  },
  {
    "id": "sharks-bay",
    "name": "Sharks Bay",
    "city": "Sharm El Sheikh",
    "governorate": "South Sinai",
    "category": "Beach",
    "coordinates": [
      27.963,
      34.3965
    ],
    "capacity": 4000,
    "currentVisitors": 1600,
    "ticketPrice": 0,
    "openingHours": "06:00 - 18:00",
    "bestTimeToVisit": "April to November, Daytime",
    "rating": 4.7,
    "description": "A popular bay in Sharm El Sheikh known for its crystal-clear water, excellent house reefs for snorkeling, and water sports, overlooking the beautiful Tiran Island.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": false,
      "cafes": true
    },
    "image": "images/sharks_bay.jpg",
    "nearby": [
      "SOHO Square",
      "Naama Bay"
    ]
  },
  {
    "id": "old-market-sharm",
    "name": "Old Market",
    "city": "Sharm El Sheikh",
    "governorate": "South Sinai",
    "category": "Adventure",
    "coordinates": [
      27.8605,
      34.3048
    ],
    "capacity": 6000,
    "currentVisitors": 2400,
    "ticketPrice": 0,
    "openingHours": "09:00 - 23:00",
    "bestTimeToVisit": "Year-round, Evening",
    "rating": 4.7,
    "description": "Also known as Old Sharm, this historic commercial bazaar features local spice shops, souqs, and the magnificent, newly built Al Sahaba Mosque with its stunning architectural design.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/old_market_sharm.jpg",
    "nearby": [
      "Naama Bay",
      "Ras Mohammed"
    ]
  },
  {
    "id": "blue-hole",
    "name": "Blue Hole",
    "city": "Dahab",
    "governorate": "South Sinai",
    "category": "Nature",
    "coordinates": [
      28.5729,
      34.5362
    ],
    "capacity": 5000,
    "currentVisitors": 2000,
    "ticketPrice": 0,
    "openingHours": "06:00 - 18:00",
    "bestTimeToVisit": "April to November, Mid-day",
    "rating": 4.9,
    "description": "A world-famous marine sinkhole north of Dahab, descending to over 100 meters. Extremely popular for freediving, scuba diving, and snorkeling due to its deep blue water and dramatic coral drop-offs.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": false,
      "cafes": true
    },
    "image": "images/blue_hole.png",
    "nearby": [
      "Dahab Lagoon",
      "Lighthouse Reef"
    ]
  },
  {
    "id": "dahab-lagoon",
    "name": "Dahab Lagoon",
    "city": "Dahab",
    "governorate": "South Sinai",
    "category": "Beach",
    "coordinates": [
      28.4622,
      34.5
    ],
    "capacity": 3500,
    "currentVisitors": 1400,
    "ticketPrice": 0,
    "openingHours": "24 Hours",
    "bestTimeToVisit": "April to October, Windsurfing hours",
    "rating": 4.8,
    "description": "A beautiful sandy curved spit in Dahab creating a sheltered shallow lagoon. It is a world-class destination for windsurfing and kitesurfing, offering flat water and constant winds.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": false,
      "cafes": true
    },
    "image": "images/dahab_lagoon.jpg",
    "nearby": [
      "Blue Hole",
      "Lighthouse Reef"
    ]
  },
  {
    "id": "lighthouse-reef",
    "name": "Lighthouse Reef",
    "city": "Dahab",
    "governorate": "South Sinai",
    "category": "Nature",
    "coordinates": [
      28.495,
      34.5168
    ],
    "capacity": 3000,
    "currentVisitors": 1200,
    "ticketPrice": 0,
    "openingHours": "24 Hours",
    "bestTimeToVisit": "Year-round, Snorkeling at high tide",
    "rating": 4.7,
    "description": "Located right in Dahab bay, Lighthouse Reef is a very popular diving and snorkeling site with easy entry, vibrant marine life, and a spectacular drop-off reef wall, perfect for night dives.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": false,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": false,
      "cafes": true
    },
    "image": "images/lighthouse_reef.jpg",
    "nearby": [
      "Dahab Lagoon",
      "Blue Hole"
    ]
  },
  {
    "id": "three-pools",
    "name": "Three Pools",
    "city": "Dahab",
    "governorate": "South Sinai",
    "category": "Nature",
    "coordinates": [
      28.43,
      34.5
    ],
    "capacity": 2000,
    "currentVisitors": 800,
    "ticketPrice": 0,
    "openingHours": "06:00 - 18:00",
    "bestTimeToVisit": "September to May, Snorkeling",
    "rating": 4.5,
    "description": "A shallow diving and snorkeling site in southern Dahab consisting of three natural sandy pools cut into the reef flat, surrounded by coral gardens, popular for quad bike safaris.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": false,
      "cafes": true
    },
    "image": "images/three_pools_dahab.jpg",
    "nearby": [
      "Dahab Lagoon"
    ]
  },
  {
    "id": "giftun-island",
    "name": "Giftun Island",
    "city": "Hurghada",
    "governorate": "Red Sea",
    "category": "Beach",
    "coordinates": [
      27.227,
      33.9214
    ],
    "capacity": 6000,
    "currentVisitors": 2400,
    "ticketPrice": 150,
    "openingHours": "08:00 - 17:00",
    "bestTimeToVisit": "April to November, Day trips",
    "rating": 4.8,
    "description": "A stunning marine protectorate island off Hurghada. It features pristine white sand beaches like Orange Bay and Paradise Beach, crystal-clear turquoise waters, and shallow coral snorkeling reefs.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": false,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": false,
      "cafes": true
    },
    "image": "images/hurghada.png",
    "nearby": [
      "Hurghada Marina",
      "Mahmya Island"
    ]
  },
  {
    "id": "hurghada-marina",
    "name": "Hurghada Marina",
    "city": "Hurghada",
    "governorate": "Red Sea",
    "category": "Beach",
    "coordinates": [
      27.2314,
      33.8417
    ],
    "capacity": 10000,
    "currentVisitors": 4000,
    "ticketPrice": 0,
    "openingHours": "24 Hours",
    "bestTimeToVisit": "April to June, September to November",
    "rating": 4.7,
    "description": "A chic seaside promenade and harbor in Hurghada. Lined with palm trees, luxury yachts, high-end shops, restaurants, and bars, it offers a relaxing walk and nightlife by the Red Sea.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/hurghada.png",
    "nearby": [
      "Giftun Island",
      "Mahmya Island"
    ]
  },
  {
    "id": "mahmya-island",
    "name": "Mahmya Island",
    "city": "Hurghada",
    "governorate": "Red Sea",
    "category": "Beach",
    "coordinates": [
      27.252,
      33.843
    ],
    "capacity": 3500,
    "currentVisitors": 1400,
    "ticketPrice": 150,
    "openingHours": "08:00 - 17:00",
    "bestTimeToVisit": "October to April, Daytime",
    "rating": 4.9,
    "description": "An eco-tourism haven on Giftun Island, Mahmya features pristine white sand, crystal-clear turquoise waters, and thriving marine reefs. Perfect for snorkeling, sunbathing, and beachside dining.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": false,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/mahmya_island.jpg",
    "nearby": [
      "Giftun Island",
      "Hurghada Marina"
    ]
  },
  {
    "id": "sand-city",
    "name": "Sand City Hurghada",
    "city": "Hurghada",
    "governorate": "Red Sea",
    "category": "Museum",
    "coordinates": [
      27.12,
      33.826
    ],
    "capacity": 2500,
    "currentVisitors": 1000,
    "ticketPrice": 200,
    "openingHours": "09:00 - 18:00",
    "bestTimeToVisit": "October to April, Morning",
    "rating": 4.2,
    "description": "An open-air sand sculpture museum in Hurghada featuring impressive, highly detailed historical and mythological sculptures carved from sand by international artists.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": true,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/sand_city_hurghada.jpg",
    "nearby": [
      "Hurghada Marina"
    ]
  },
  {
    "id": "wadi-el-hitan",
    "name": "Wadi El Hitan",
    "city": "Fayoum",
    "governorate": "Fayoum",
    "category": "Nature",
    "coordinates": [
      29.2715,
      30.1795
    ],
    "capacity": 4000,
    "currentVisitors": 1600,
    "ticketPrice": 200,
    "openingHours": "07:00 - 17:00",
    "bestTimeToVisit": "November to March, Sunset/Overnight Camping",
    "rating": 4.9,
    "description": "A spectacular UNESCO World Heritage site in Fayoum containing invaluable fossil remains of the earliest, and now extinct, suborder of whales (Archaeoceti). Explores whale evolution in a desert setting.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": false,
      "restrooms": false,
      "wheelchair": false,
      "giftShop": false,
      "cafes": false
    },
    "image": "images/wadi_el_hitan.png",
    "nearby": [
      "Lake Qarun",
      "Wadi El Rayan",
      "Tunis Village"
    ]
  },
  {
    "id": "tunis-village",
    "name": "Tunis Village",
    "city": "Fayoum",
    "governorate": "Fayoum",
    "category": "Adventure",
    "coordinates": [
      29.4336,
      30.6415
    ],
    "capacity": 2500,
    "currentVisitors": 1000,
    "ticketPrice": 0,
    "openingHours": "08:00 - 20:00",
    "bestTimeToVisit": "October to April, Sunset",
    "rating": 4.8,
    "description": "An artistic village in Fayoum overlooking Lake Qarun. Famous for its vibrant pottery workshops, galleries, eco-lodges, and beautiful rural charm, established by Swiss potter Evelyne Porret.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": true,
      "cafes": true
    },
    "image": "images/tunis_village.png",
    "nearby": [
      "Lake Qarun",
      "Wadi El Hitan"
    ]
  },
  {
    "id": "lake-qarun",
    "name": "Lake Qarun",
    "city": "Fayoum",
    "governorate": "Fayoum",
    "category": "Nature",
    "coordinates": [
      29.5,
      30.6
    ],
    "capacity": 5000,
    "currentVisitors": 2000,
    "ticketPrice": 0,
    "openingHours": "24 Hours",
    "bestTimeToVisit": "Winter months, Sunset boat trips",
    "rating": 4.5,
    "description": "One of the oldest natural lakes in the world, located in the Fayoum oasis. It is a prime birdwatching site, home to thousands of migratory birds, surrounded by archaeological ruins.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": false,
      "cafes": true
    },
    "image": "images/lake_qarun.jpg",
    "nearby": [
      "Tunis Village",
      "Wadi El Rayan"
    ]
  },
  {
    "id": "wadi-el-rayan",
    "name": "Wadi El Rayan",
    "city": "Fayoum",
    "governorate": "Fayoum",
    "category": "Nature",
    "coordinates": [
      29.2333,
      30.6167
    ],
    "capacity": 6000,
    "currentVisitors": 2400,
    "ticketPrice": 50,
    "openingHours": "07:00 - 17:00",
    "bestTimeToVisit": "November to March, Day trips",
    "rating": 4.8,
    "description": "A scenic valley in the Fayoum desert famous for its two large freshwater lakes connected by Egypt's only waterfalls. It features massive sand dunes popular for sandboarding.",
    "weather": {
      "temp": 30,
      "condition": "Sunny",
      "humidity": 45,
      "windSpeed": 12
    },
    "facilities": {
      "parking": true,
      "restaurants": true,
      "restrooms": true,
      "wheelchair": false,
      "giftShop": false,
      "cafes": true
    },
    "image": "images/wadi_el_rayan.jpg",
    "nearby": [
      "Wadi El Hitan",
      "Lake Qarun"
    ]
  }
];
