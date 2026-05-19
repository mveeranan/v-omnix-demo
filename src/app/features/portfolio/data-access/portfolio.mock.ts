import { Portfolio } from '../models/portfolio.model';

const PLACEHOLDER_COVER =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=80';
const PLACEHOLDER_LOGO =
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80';

export const MOCK_PORTFOLIOS: Portfolio[] = [
  {
    id: 'pf-1',
    slug: 'inkmasters',
    published: true,
    updatedAt: new Date().toISOString(),
    brand: {
      logoUrl: PLACEHOLDER_LOGO,
      businessName: 'Ink Masters Studio',
      tagline: 'Art that lives on skin',
      coverImageUrl: PLACEHOLDER_COVER
    },
    about: {
      enabled: true,
      description:
        'Award-winning tattoo studio specializing in custom designs, cover-ups, and fine-line artistry. Every piece tells your story.',
      experience: '12+ years crafting unique body art',
      achievements: ['Best Studio 2024', '5000+ clients', 'Featured in Ink Magazine'],
      certifications: ['Bloodborne Pathogen Certified', 'Health Dept. Licensed']
    },
    services: [
      {
        id: 's1',
        name: 'Custom Tattoo',
        duration: '2-4 hrs',
        price: 'From $200',
        category: 'Tattoo',
        featured: true,
        enabled: true
      },
      {
        id: 's2',
        name: 'Cover-up Consultation',
        duration: '30 min',
        price: 'Free',
        category: 'Consultation',
        featured: false,
        enabled: true
      },
      {
        id: 's3',
        name: 'Fine Line Session',
        duration: '1-2 hrs',
        price: 'From $150',
        category: 'Tattoo',
        featured: true,
        enabled: true
      }
    ],
    gallery: [
      {
        id: 'g1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc37?w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc37?w=400&q=80',
        category: 'Realism',
        featured: true,
        sortOrder: 0
      },
      {
        id: 'g2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1611501275019-9af3a4b2a37e?w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1611501275019-9af3a4b2a37e?w=400&q=80',
        category: 'Fine Line',
        featured: true,
        sortOrder: 1
      },
      {
        id: 'g3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1590246814883-9a3e9d6e267f?w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1590246814883-9a3e9d6e267f?w=400&q=80',
        category: 'Traditional',
        featured: false,
        sortOrder: 2
      },
      {
        id: 'g4',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1562962230-16e5323e6a0b?w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1562962230-16e5323e6a0b?w=400&q=80',
        category: 'Blackwork',
        featured: false,
        sortOrder: 3
      }
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Marcus T.',
        text: 'Absolutely incredible work. The attention to detail is unmatched.',
        rating: 5,
        avatarUrl: ''
      },
      {
        id: 'r2',
        author: 'Sarah L.',
        text: 'Professional, clean studio and amazing artists. Highly recommend!',
        rating: 5,
        avatarUrl: ''
      }
    ],
    social: {
      instagram: 'https://instagram.com/inkmasters',
      facebook: '',
      tiktok: 'https://tiktok.com/@inkmasters',
      whatsapp: '+15551234567',
      website: 'https://inkmasters.example.com',
      youtube: ''
    },
    team: {
      enabled: true,
      members: [
        {
          id: 't1',
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
          name: 'Alex Rivera',
          role: 'Lead Artist',
          specialization: 'Realism & Portraits',
          instagram: 'https://instagram.com/alexrivera'
        }
      ]
    },
    stats: {
      enabled: true,
      bookingsCompleted: 5200,
      yearsExperience: 12,
      happyCustomers: 4800
    },
    cta: {
      type: 'whatsapp',
      label: 'Book a session',
      target: '+15551234567'
    },
    contact: {
      enabled: false,
      email: 'hello@inkmasters.example.com',
      phone: '+1 (555) 123-4567',
      address: '142 Ink Street',
      city: 'Los Angeles, CA'
    },
    highlights: {
      enabled: true,
      title: 'Why clients trust us',
      items: [
        'Licensed & certified artists',
        'Premium sterile environment',
        'Custom designs, no templates',
        'Flexible booking & consultations'
      ]
    },
    theme: {
      presetId: 'tattoo-studio',
      primaryColor: '#111827',
      accentColor: '#ef4444',
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      borderRadius: '0.25rem',
      mode: 'dark'
    }
  },
  {
    id: 'pf-2',
    slug: 'luxesalon',
    published: true,
    updatedAt: new Date().toISOString(),
    brand: {
      logoUrl: PLACEHOLDER_LOGO,
      businessName: 'Luxe Salon & Spa',
      tagline: 'Where beauty meets tranquility',
      coverImageUrl:
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=80'
    },
    about: {
      enabled: true,
      description:
        'Premier salon offering luxury hair, skin, and wellness treatments in an elegant, relaxing environment.',
      experience: '15 years of excellence in beauty care',
      achievements: ['Top Salon Award 2023', 'Celebrity stylist team'],
      certifications: ['Licensed Cosmetologists', 'Organic Products Certified']
    },
    services: [
      {
        id: 's1',
        name: 'Signature Haircut & Style',
        duration: '60 min',
        price: '$85',
        category: 'Hair',
        featured: true,
        enabled: true
      },
      {
        id: 's2',
        name: 'Luxury Facial',
        duration: '75 min',
        price: '$120',
        category: 'Skin',
        featured: true,
        enabled: true
      }
    ],
    gallery: [
      {
        id: 'g1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80',
        category: 'Hair',
        featured: true,
        sortOrder: 0
      },
      {
        id: 'g2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&q=80',
        category: 'Spa',
        featured: true,
        sortOrder: 1
      }
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Emily R.',
        text: 'The most relaxing experience. My hair has never looked better!',
        rating: 5,
        avatarUrl: ''
      }
    ],
    social: {
      instagram: 'https://instagram.com/luxesalon',
      facebook: 'https://facebook.com/luxesalon',
      tiktok: '',
      whatsapp: '+15559876543',
      website: 'https://luxesalon.example.com',
      youtube: ''
    },
    team: { enabled: false, members: [] },
    stats: {
      enabled: true,
      bookingsCompleted: 12000,
      yearsExperience: 15,
      happyCustomers: 9800
    },
    cta: {
      type: 'customUrl',
      label: 'Book appointment',
      target: 'https://luxesalon.example.com/book'
    },
    contact: {
      enabled: false,
      email: 'book@luxesalon.example.com',
      phone: '+1 (555) 987-6543',
      address: '88 Elegance Avenue',
      city: 'Miami, FL'
    },
    highlights: {
      enabled: true,
      title: 'The Luxe experience',
      items: [
        'Celebrity-trained stylists',
        'Organic luxury products',
        'Private suite availability',
        'Same-day appointments'
      ]
    },
    theme: {
      presetId: 'salon-elegance',
      primaryColor: '#4a3728',
      accentColor: '#c9a89a',
      fontFamily: '"Palatino Linotype", Georgia, serif',
      borderRadius: '1rem',
      mode: 'light'
    }
  }
];

export const DEFAULT_TENANT_DRAFT_SLUG = 'my-portfolio';
