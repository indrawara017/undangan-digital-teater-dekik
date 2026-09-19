import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import { Instagram, Youtube } from '@/app/components/icons/SocialIcons';
import { getGlobalConfig, type GlobalConfig } from '@/lib/config';

const footerLinks = [
  {
    title: 'Navigasi',
    links: [
      { label: 'Beranda', href: '/' },
      { label: 'Pementasan', href: '/events' },
      { label: 'Merchandise', href: '/merchandise' },
      { label: 'Tentang Kami', href: '/tentang' },
      { label: 'Galeri', href: '/galeri' },
    ],
  },
  {
    title: 'Bantuan',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Kontak', href: '/faq#kontak' },
      { label: 'Syarat & Ketentuan', href: '/faq#syarat' },
    ],
  },
];

export async function PublicFooter({ config: passedConfig }: { config?: GlobalConfig }) {
  const config = passedConfig || (await getGlobalConfig());

  const igHandle = (config.instagram || 'teaterdekik').replace(/^@/, '');
  const ytUrl = config.youtube
    ? config.youtube.startsWith('http')
      ? config.youtube
      : `https://youtube.com/@${config.youtube}`
    : 'https://youtube.com/@teaterdekik';
  const emailAddr = config.email || 'teaterdekik@gmail.com';
  const waNum = config.whatsapp || '6281234567890';

  const socialLinks = [
    { label: 'Instagram', href: `https://instagram.com/${igHandle}`, icon: Instagram },
    { label: 'YouTube', href: ytUrl, icon: Youtube },
    { label: 'WhatsApp', href: `https://wa.me/${waNum}`, icon: Phone },
    { label: 'Email', href: `mailto:${emailAddr}`, icon: Mail },
  ];

  return (
    <footer className="relative border-t border-white/[0.06] bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="font-cinzel text-xl font-bold text-white tracking-wide">
              Teater Dekik
            </h3>
            <p className="text-sm text-neutral-400 mt-3 max-w-sm leading-relaxed">
              Komunitas teater yang bergerak dalam seni pertunjukan, menjaga tradisi panggung, 
              dan menumbuhkan generasi seniman muda yang berani berkarya.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 mt-5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.1] transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Link Columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-widest mb-4">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-500 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} Teater Dekik. Seluruh hak cipta dilindungi.
          </p>
          <p className="text-xs text-neutral-600">
            Development by Indra Wardana
          </p>
        </div>
      </div>
    </footer>
  );
}
