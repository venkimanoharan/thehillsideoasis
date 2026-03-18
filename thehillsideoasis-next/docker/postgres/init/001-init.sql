CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  capacity TEXT NOT NULL,
  bed TEXT NOT NULL,
  view_label TEXT NOT NULL,
  description TEXT NOT NULL,
  amenities TEXT[] NOT NULL DEFAULT '{}',
  price_per_night INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('on_property', 'local_attraction')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_label TEXT,
  price_label TEXT,
  distance_label TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_items (
  id SERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_sections (
  id SERIAL PRIMARY KEY,
  section_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  trace_id UUID UNIQUE NOT NULL,
  checkin DATE NOT NULL,
  checkout DATE NOT NULL,
  room_slug TEXT NOT NULL,
  room_price INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  guests INTEGER NOT NULL,
  requests TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'cancelled', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO rooms (slug, name, capacity, bed, view_label, description, amenities, price_per_night, image_url, sort_order)
VALUES
  (
    'sky-suite',
    'Sky Suite',
    '2 Guests',
    'King Bed',
    'Mountain View',
    'Our most romantic accommodation featuring a modern suite with a panoramic deck overlooking the Western Ghats.',
    ARRAY['Private panoramic deck','King-size bed with premium linens','En-suite bathroom with hot water','Complimentary breakfast','Mini-fridge and coffee maker','Free WiFi'],
    4500,
    '/images/1.jpeg',
    1
  ),
  (
    'hillside-suite',
    'Hillside Suite',
    '2-3 Guests',
    'Queen Bed',
    'Garden View',
    'A spacious suite with private garden access and direct connection to the walking trails.',
    ARRAY['Separate living area','Private garden access','Queen-size bed','Work desk and seating area','Premium bathroom amenities','Complimentary breakfast','Free WiFi'],
    5200,
    '/images/2.jpeg',
    2
  ),
  (
    'family-cottage',
    'Family Cottage',
    '4-6 Guests',
    '2 Bedrooms',
    'Courtyard',
    'A two-bedroom cottage with a shared courtyard, ideal for families and groups.',
    ARRAY['Two separate bedrooms','Shared courtyard space','Family-friendly amenities','Two bathrooms','Common sitting area','Complimentary breakfast for all guests','Free WiFi'],
    7800,
    '/images/4.jpeg',
    3
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO activities (category, title, description, duration_label, price_label, distance_label, sort_order)
VALUES
  ('on_property','Guided Nature Walks','Explore our property and surrounding areas with expert naturalists.','1-2 hours','Complimentary',NULL,1),
  ('on_property','Farm Tours','Hands-on experience with organic farming and seasonal fruit picking.','1 hour','Complimentary',NULL,2),
  ('on_property','Carriage Rides','Scenic rides around the property at sunset.','30 minutes','INR 500 per ride',NULL,3),
  ('on_property','Birdwatching','Early-morning guided birding excursions.','2-3 hours','INR 300 per person',NULL,4),
  ('on_property','Sunrise Viewpoint','Guided sunrise walk with panoramic mountain views.','1 hour','Complimentary',NULL,5),
  ('on_property','Yoga and Meditation','Outdoor yoga sessions in the garden pavilion.','1 hour','INR 400 per session',NULL,6),
  ('local_attraction','Aliyar Dam','Scenic reservoir surrounded by hills, perfect for picnics and boat rides.','Half day',NULL,'15 km',7),
  ('local_attraction','Topslip Wildlife Sanctuary','Home to elephants, bison, and rich birdlife with guided safaris.','Full day',NULL,'35 km',8),
  ('local_attraction','Valparai Hill Station','Picturesque tea estates and cool mountain weather.','Full day',NULL,'50 km',9),
  ('local_attraction','Pollachi Market','Traditional local market with produce, spices, and crafts.','2-3 hours',NULL,'12 km',10),
  ('local_attraction','Parambikulam Tiger Reserve','Pristine rainforest reserve with trekking and safaris.','Full day',NULL,'40 km',11),
  ('local_attraction','Monkey Falls','Refreshing waterfall and natural pools.','Half day',NULL,'30 km',12)
ON CONFLICT DO NOTHING;

INSERT INTO gallery_items (image_url, alt_text, sort_order)
VALUES
  ('/images/1.jpeg','Misty Western Ghats mountain range view from The HillSide Oasis resort in Pollachi Tamil Nadu',1),
  ('/images/2.jpeg','Blue tiled swimming pool surrounded by coconut palm trees at HillSide Oasis farm resort Pollachi',2),
  ('/images/4.jpeg','Morning mist over green forested hills at Western Ghats nature retreat near Pollachi',3),
  ('/images/6.jpeg','Wild elephant in natural habitat at Topslip Wildlife Sanctuary near Pollachi Western Ghats',4),
  ('/images/7.jpeg','Ancient boulder rock formation amid green forest landscape at HillSide Oasis property Pollachi',5),
  ('/images/9.jpeg','Coconut palm tree framing Western Ghats mountain with waterfall during monsoon season Pollachi',6),
  ('/images/10.jpeg','Multiple seasonal waterfalls flowing down Western Ghats mountain slopes near Pollachi',7),
  ('/images/11.jpeg','Vibrant green coconut palm trees with misty Western Ghats mountain backdrop at HillSide Oasis',8),
  ('/images/13.jpeg','Fresh green coconuts growing on palm tree at The HillSide Oasis organic coconut farm in Pollachi',9),
  ('/images/15.jpeg','Tall coconut palm trees silhouetted against sunset sky at HillSide Oasis nature retreat Pollachi',10),
  ('/images/DSC_0072-PANO.jpg','Panoramic view of Western Ghats mountain range with lush valleys at The HillSide Oasis Pollachi',11)
ON CONFLICT DO NOTHING;

INSERT INTO site_sections (section_key, title, subtitle, body)
VALUES
  ('about_story','Our Story',NULL,'The HillSide Oasis began as a family dream to share the beauty of the Western Ghats with travelers seeking authentic experiences. What started as a humble mango and coconut farm has blossomed into a boutique retreat that honors our agricultural heritage while offering modern comforts.'),
  ('about_values','Our Values','Sustainability, hospitality, community, and authenticity','We practice responsible tourism that supports local livelihoods, protects nature, and creates memorable stays for families, couples, and groups.'),
  ('contact_main','Get in Touch','We are here to help plan your perfect mountain getaway','Reach us by phone, WhatsApp, or email for bookings, group rates, and personalized trip support.'),
  ('home_hero','Generations of joy where memories meet the mountains','A boutique nature retreat blending mango and coconut farms with elevated hospitality.','Stay in handcrafted cottages, host intimate events, or bring your group for a private escape in Pollachi.')
ON CONFLICT (section_key) DO NOTHING;
