import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ລະບົບແຈ້ງເຕືອນປະຊຸມ (EDL Meeting Notice)',
    short_name: 'MeetingNotice',
    description: 'ລະບົບແຈ້ງເຕືອນ ແລະ ຕິດຕາມເອກະສານກອງປະຊຸມ EDL',
    start_url: './',
    scope: './',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0f172a',
    theme_color: '#1e3a8a',
    icons: [
      {
        src: 'icons/icon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: 'icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: 'icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        src: 'icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'icons/icon-maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['productivity', 'business', 'utilities'],
    shortcuts: [
      {
        name: 'ກອງປະຊຸມ (Meeting Docs)',
        short_name: 'Meeting Docs',
        description: 'ເບິ່ງລາຍການເອກະສານກອງປະຊຸມ',
        url: './meetingdoc',
        icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'ປະຕິທິນ (Calendar)',
        short_name: 'Calendar',
        description: 'ເບິ່ງປະຕິທິນກອງປະຊຸມ',
        url: './calendar',
        icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'ໜ້າຫຼັກສະຫຼຸບຂໍ້ມູນ',
        url: './dashboard',
        icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }],
      },
    ],
  };
}
