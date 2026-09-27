export const marketingFeatures = [
  {
    iconClass: 'bi bi-lightning-charge-fill',
    title: 'Real-time delivery',
    desc: 'Sub-50ms message latency with WebSocket events and instant update streams.',
    accent: '#2dd4bf',
  },
  {
    iconClass: 'bi bi-shield-lock-fill',
    title: 'Secure JWT sessions',
    desc: 'Token-based authentication and protected routes keep chat access safe and reliable.',
    accent: '#8b5cf6',
  },
  {
    iconClass: 'bi bi-people-fill',
    title: 'Group channels',
    desc: 'General room chat plus direct 1-to-1 threads for focused conversation.',
    accent: '#f472b6',
  },
  {
    iconClass: 'bi bi-camera-video-fill',
    title: 'HD video calling',
    desc: 'WebRTC-based direct video calls with mute, camera toggle, and call state handling.',
    accent: '#38bdf8',
  },
  {
    iconClass: 'bi bi-check2-all',
    title: 'Read receipts',
    desc: 'Delivered and read statuses update in real time for every direct message.',
    accent: '#10b981',
  },
  {
    iconClass: 'bi bi-search',
    title: 'Search everywhere',
    desc: 'Filter users and messages instantly from the sidebar and active thread.',
    accent: '#60a5fa',
  },
];

export const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    badge: 'For individuals',
    features: ['Realtime chat', 'Direct + group channels', 'Read receipts', '1:1 calling'],
  },
  {
    name: 'Team',
    price: '$12',
    period: '/seat',
    badge: 'Fastest growth',
    features: ['Everything in Free', 'Workspace admin controls', 'Priority call quality', 'Team analytics'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    badge: 'Scale securely',
    features: ['SAML/SSO options', 'Dedicated support', 'Advanced compliance', 'Custom onboarding'],
  },
];

export const docsSections = [
  {
    title: 'Realtime Core',
    points: [
      'Socket.IO events and rooms',
      'Presence and typing lifecycle',
      'Delivery and read status updates',
    ],
  },
  {
    title: 'Calling Stack',
    points: [
      'WebRTC offer/answer flow',
      'ICE candidate relay handling',
      'Audio and video call mode support',
    ],
  },
  {
    title: 'API and Auth',
    points: [
      'JWT session and protected routes',
      'Message history and user APIs',
      'Server-side recipient validation',
    ],
  },
];

export const blogPosts = [
  {
    title: 'Audio + Video Calling Unified',
    summary: 'A single signaling flow now powers both voice and video calls with cleaner UX controls.',
    tag: 'Release',
    date: 'Mar 2026',
  },
  {
    title: 'Reducing Chat Latency',
    summary: 'How event batching and status updates improved perceived speed in active conversations.',
    tag: 'Engineering',
    date: 'Mar 2026',
  },
  {
    title: 'Designing Echo Theme',
    summary: 'Color, glass layers, and typography decisions behind the Echo visual language.',
    tag: 'Design',
    date: 'Mar 2026',
  },
  {
    title: 'Search and Unread Patterns',
    summary: 'Building thread-level preview states that stay consistent while messages stream in.',
    tag: 'Product',
    date: 'Mar 2026',
  },
];
