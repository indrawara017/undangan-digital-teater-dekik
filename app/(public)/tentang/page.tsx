import { supabase } from '@/lib/supabase';
import { TentangClient } from '@/app/(public)/tentang/tentang-client';
import { getGlobalHistory } from '@/lib/config';

export const revalidate = 0;

export const metadata = {
  title: 'Tentang Kami — Teater Dekik',
  description: 'Kenali lebih dekat Teater Dekik — sejarah, visi misi, dan anggota-anggota yang menjaga semangat panggung tetap hidup.',
};

export default async function TentangPage() {
  // Ambil histori / linimasa pementasan terpadu
  const timelineEvents = await getGlobalHistory();

  // Ambil master anggota panggung
  let { data: members } = await supabase
    .from('members')
    .select('*')
    .order('name', { ascending: true });

  if (!members || members.length === 0) {
    try {
      const { data: globalData } = await supabase.storage
        .from('assets')
        .download('global/cast_members.json');
      if (globalData) {
        const parsed = JSON.parse(await globalData.text());
        if (Array.isArray(parsed) && parsed.length > 0) {
          members = parsed.map((m: any) => ({
            id: m.id || m.name,
            name: m.name,
            position: m.role || 'Anggota Teater Dekik',
            photo_url: m.photoUrl || '',
          }));
        }
      }
    } catch (e) {}
  }

  return <TentangClient members={members || []} timelineEvents={timelineEvents} />;
}
