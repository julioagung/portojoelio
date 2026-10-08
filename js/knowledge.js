/* ===== KNOWLEDGE BASE — Julio Agung =====
   Single source of truth for the AI assistant.
   Loaded in the browser (window.JULIO_KB) and by the Netlify function (module.exports).
   ========================================== */

(function (root) {
  const KB = {
    name: 'Julio Agung',
    tagline: 'Creator × Fullstack Developer',
    summary: 'Content creator, talent KOL, owner warungpiksel.id, dan full-stack developer lulusan Cumlaude.',
    email: 'jloagung267@gmail.com',
    links: {
      instagram: 'https://instagram.com/julio_agung',
      tiktok: 'https://www.tiktok.com/@allaboutjuliooutfit',
      github: 'https://github.com/julioagung',
      warungpiksel: 'https://www.instagram.com/warungpiksel.id/',
      ratecard: 'https://ratecard-julio.netlify.app',
      costtrack: 'https://github.com/julioagung/CostTrack',
    },
    social: {
      instagram: { handle: '@julio_agung', followers: '2.023', content: ['brand campaign', 'talent & OOTD', 'keseharian', 'kampus'] },
      tiktok: { handle: '@allaboutjuliooutfit', followers: '694', content: ['outfit / OOTD', 'live report', 'promo brand', 'POV & trend', 'niche'] },
    },
    warungpiksel: {
      since: 'Oktober 2026',
      desc: 'Warung digital yang meracik website dan aplikasi sesuai kebutuhan usahamu, dengan harga ramah dan proses semudah pesan es teh.',
      offers: 'Website & aplikasi untuk usaha — dari landing page sampai sistem custom.',
    },
    rateCard: [
      { item: 'Story Review', price: 'mulai Rp35.000' },
      { item: 'Video Content', price: 'mulai Rp100.000' },
      { item: 'Brand Ambassador', price: 'mulai Rp800.000/bulan' },
    ],
    skills: {
      creator: ['Talent & model', 'Konsep & script', 'Live report', 'Konten editor'],
      dev: ['React & Node', 'Laravel & MySQL', 'Web developer'],
      craft: ['Barista'],
      stack: ['JavaScript', 'PHP', 'React.js', 'Node.js', 'Express.js', 'Laravel', 'MongoDB', 'MySQL', 'Firebase', 'REST API', 'Git', 'Figma'],
    },
    experience: [
      { period: 'Okt 2026 – sekarang', role: 'Owner', org: 'warungpiksel.id', desc: 'Meracik website & aplikasi untuk usaha — konsep, desain, pengembangan, sampai konten Instagram warung.' },
      { period: 'Jul 2026 – Nov 2026', role: 'Barista', org: 'Ejji Coffee District 28', desc: 'Menyiapkan minuman kopi di bar dan melayani pelanggan.' },
      { period: 'Apr 2026 – Jul 2026', role: 'Frontliner → Co-Head Floor', org: 'Seduh.an', desc: 'Dipromosikan dalam satu bulan; koordinasi operasional, layanan pelanggan, live report & media sosial.' },
      { period: 'Apr 2025 – sekarang', role: 'Talent & Model KOL', org: 'Darikami Official', desc: 'Kampanye pemasaran digital bersama berbagai brand dan pembuatan konten promosi.' },
      { period: 'Jun 2025 – Jun 2026', role: 'Staf Kominfo', org: 'BEM Universitas Dinamika Bangsa', desc: 'Media sosial, publikasi, dokumentasi, dan strategi komunikasi kampus.' },
      { period: 'Okt 2025 – Jan 2026', role: 'Front End & Back End with AI', org: 'Dicoding Indonesia — ASAH', desc: 'Membangun CostTrack dan meraih Best Capstone Project.' },
    ],
    education: { degree: 'S1 Teknik Informatika', school: 'Universitas Dinamika Bangsa', period: '2021 – 2025', gpa: '3.8', honor: 'Cumlaude' },
    projects: [
      { name: 'CostTrack', award: 'Best Capstone Project — Dicoding ASAH', desc: 'Menghitung Harga Perkiraan Estimasi (HPE) dari Bill of Material, riwayat pengadaan, dan kurs JISDOR.', stack: 'React.js, Node.js, Express.js, MongoDB, REST API' },
      { name: 'Inventara', desc: 'Sistem inventaris divisi umum: catat barang masuk/keluar, pantau stok real-time, dan buat laporan.' },
    ],
  };

  KB.systemPrompt = function () {
    const k = KB;
    return [
      `Kamu adalah "julio.ai", asisten AI di website portofolio ${k.name} (${k.tagline}).`,
      'Gaya: ramah, santai tapi profesional, singkat (maks ~120 kata), boleh sedikit nuansa game/quest. Jawab dalam bahasa yang dipakai pengunjung.',
      'Hanya jawab berdasarkan data di bawah. Jika tidak ada datanya, bilang jujur dan arahkan ke email. Jangan mengarang harga, angka, atau pengalaman.',
      'Untuk negosiasi harga, jadwal, atau order, arahkan ke email atau DM Instagram. Tulis link sebagai URL polos. Gunakan **tebal** seperlunya, tanpa heading.',
      '',
      'DATA:',
      JSON.stringify({
        ringkasan: k.summary, email: k.email, links: k.links, sosmed: k.social,
        warungpiksel: k.warungpiksel, rateCard: k.rateCard, skills: k.skills,
        pengalaman: k.experience, pendidikan: k.education, proyek: k.projects,
      }),
    ].join('\n');
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = KB;
  else root.JULIO_KB = KB;
})(typeof window !== 'undefined' ? window : globalThis);
