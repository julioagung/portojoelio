/* ===== AI CHAT — julio.ai =====
   1. Coba AI (Gemini) lewat /api/chat (Netlify function, key aman di server).
   2. Kalau AI tidak tersedia (lokal / offline / error), pakai "otak lokal":
      intent matching + ingatan topik untuk pertanyaan lanjutan.
   ================================ */

(function () {
  const KB = window.JULIO_KB;
  const API_URL = '/api/chat';
  const STORE_KEY = 'julio-chat-v2';
  const GREETING = 'Halo, traveler! 👋 Aku **julio.ai**, asisten Julio. Mau tanya soal collab & rate card, skill dev, warungpiksel.id, atau pengalaman Julio?';
  const DEFAULT_CHIPS = ['Rate card collab', 'Skill dev', 'Apa itu warungpiksel.id?', 'Pengalaman kerja', 'Cara kontak'];

  // ---------- local brain ----------
  const rupiahList = () => KB.rateCard.map(r => `• ${r.item} — **${r.price}**`).join('\n');
  const expList = (filter) => KB.experience.filter(filter || (() => true))
    .map(e => `• **${e.role}** — ${e.org} (${e.period})`).join('\n');

  const INTENTS = [
    {
      id: 'greet', keys: ['halo', 'hai', 'hi', 'hello', 'hey', 'pagi', 'siang', 'sore', 'malam', 'permisi', 'assalamualaikum'],
      reply: () => GREETING,
    },
    {
      id: 'thanks', keys: ['makasih', 'terima kasih', 'thanks', 'thank you', 'thx', 'mantap', 'oke sip'],
      reply: () => 'Sama-sama! 🙌 Kalau mau lanjut ngobrol serius, langsung email ke ' + KB.email + ' ya.',
      chips: ['Cara kontak'],
    },
    {
      id: 'about', keys: ['siapa', 'who', 'profil', 'tentang', 'about', 'kenalan', 'perkenalkan'],
      reply: () => `**${KB.name}** — ${KB.summary}\n\nSatu party, banyak skill: talent & content creator, owner warungpiksel.id, dan full-stack developer peraih **Best Capstone** Dicoding ASAH. 🎮`,
      chips: ['Pengalaman kerja', 'Skill dev', 'Rate card collab'],
    },
    {
      id: 'rate', keys: ['rate', 'harga', 'tarif', 'biaya', 'price', 'pricelist', 'budget', 'bayar', 'fee', 'paket', 'endorse', 'collab', 'kolab', 'kerjasama', 'kerja sama', 'promosi', 'promote', 'review', 'ambassador', 'paid promote'],
      reply: () => `Menu collab Julio (TikTok & Instagram):\n\n${rupiahList()}\n\nDetail lengkap: ${KB.links.ratecard}\nUntuk deal & jadwal: ${KB.email}`,
      followUp: () => `Harga di atas harga **mulai**. Final tergantung brief, jumlah konten & platform — kirim brief ke ${KB.email} biar dapat penawaran pas.`,
      chips: ['Statistik sosmed', 'Cara kontak'],
    },
    {
      id: 'social', keys: ['instagram', 'ig', 'tiktok', 'tt', 'follower', 'followers', 'sosmed', 'social', 'konten', 'content', 'creator', 'kreator', 'akun', 'ootd', 'outfit'],
      reply: () => {
        const { instagram: ig, tiktok: tt } = KB.social;
        return `Julio main di dua server:\n\n• **Instagram** ${ig.handle} — ${ig.followers} followers (${ig.content.join(', ')})\n  ${KB.links.instagram}\n• **TikTok** ${tt.handle} — ${tt.followers} followers (${tt.content.join(', ')})\n  ${KB.links.tiktok}`;
      },
      chips: ['Rate card collab', 'Pengalaman talent'],
    },
    {
      id: 'warung', keys: ['warung', 'piksel', 'pixel', 'warungpiksel', 'bisnis', 'usaha', 'jasa', 'bikin website', 'buat website', 'pesan website', 'order', 'aplikasi', 'landing page', 'owner'],
      reply: () => `**warungpiksel.id** — ${KB.warungpiksel.desc}\n\nJulio jadi owner sejak ${KB.warungpiksel.since}. ${KB.warungpiksel.offers}\n\nMampir: ${KB.links.warungpiksel}`,
      followUp: () => `Untuk pesan website/aplikasi, DM ${KB.links.warungpiksel} atau email ${KB.email} dengan kebutuhan usahamu — nanti diracikin penawarannya. ☕`,
      chips: ['Skill dev', 'Lihat proyek'],
    },
    {
      id: 'dev', keys: ['skill', 'kemampuan', 'stack', 'teknologi', 'tech', 'bahasa', 'programming', 'coding', 'ngoding', 'react', 'node', 'laravel', 'mysql', 'mongodb', 'php', 'javascript', 'js', 'express', 'firebase', 'developer', 'dev', 'fullstack', 'full stack', 'backend', 'frontend', 'web'],
      reply: () => `Side class: **full-stack developer** 💻\n\n• Frontend: React.js, JavaScript\n• Backend: Node.js, Express.js, Laravel, PHP, REST API\n• Database: MongoDB, MySQL, Firebase\n• Tools: Git, Figma\n\nDibuktikan lewat CostTrack (Best Capstone) dan Inventara.`,
      chips: ['Lihat proyek', 'Apa itu warungpiksel.id?'],
    },
    {
      id: 'project', keys: ['proyek', 'project', 'portfolio', 'portofolio', 'karya', 'costtrack', 'inventara', 'capstone', 'github', 'source', 'hpe', 'demo'],
      reply: () => KB.projects.map(p => `• **${p.name}**${p.award ? ' 🏆 ' + p.award : ''}\n  ${p.desc}${p.stack ? '\n  Stack: ' + p.stack : ''}`).join('\n\n') + `\n\nSource code CostTrack: ${KB.links.costtrack}`,
      chips: ['Skill dev', 'Pendidikan'],
    },
    {
      id: 'exp', keys: ['pengalaman', 'experience', 'riwayat', 'karir', 'karier', 'journey', 'cv', 'resume', 'jabatan'],
      reply: () => `Checkpoints Julio:\n\n${expList()}`,
      chips: ['Pengalaman talent', 'Barista?', 'Pendidikan'],
    },
    {
      id: 'talent', keys: ['talent', 'model', 'kol', 'darikami', 'brand', 'kampanye', 'campaign', 'pemotretan', 'photoshoot'],
      reply: () => {
        const e = KB.experience.find(x => x.org.includes('Darikami'));
        return `Julio aktif sebagai **${e.role}** di ${e.org} sejak Apr 2025 — ${e.desc}\n\nSkill creator: ${KB.skills.creator.join(', ')}.`;
      },
      chips: ['Rate card collab', 'Statistik sosmed'],
    },
    {
      id: 'coffee', keys: ['barista', 'kopi', 'coffee', 'ejji', 'seduh', 'seduhan', 'cafe', 'kafe', 'co-head', 'frontliner'],
      reply: () => `Julio juga punya class **craft** ☕\n\n${expList(e => /Ejji|Seduh/.test(e.org))}\n\nDi Seduh.an dia dipromosikan jadi Co-Head Floor cuma dalam satu bulan.`,
      chips: ['Pengalaman kerja'],
    },
    {
      id: 'edu', keys: ['pendidikan', 'kuliah', 'kampus', 'universitas', 'univ', 'education', 'ipk', 'gpa', 'cumlaude', 'lulus', 'sarjana', 's1', 'jurusan', 'bem', 'kominfo'],
      reply: () => {
        const ed = KB.education;
        return `🎓 **${ed.degree}** — ${ed.school} (${ed.period})\nLulus **${ed.honor}** dengan IPK ${ed.gpa}.\n\nDi kampus juga aktif sebagai Staf Kominfo BEM (Jun 2025 – Jun 2026).`;
      },
      chips: ['Lihat proyek', 'Pengalaman kerja'],
    },
    {
      id: 'award', keys: ['prestasi', 'award', 'penghargaan', 'juara', 'best', 'achievement'],
      reply: () => '🏆 **Best Capstone Project** — Dicoding ASAH (CostTrack)\n🎓 **Cumlaude** — S1 Teknik Informatika, IPK 3.8\n⚡ Promosi ke Co-Head Floor Seduh.an dalam 1 bulan',
      chips: ['Lihat proyek'],
    },
    {
      id: 'contact', keys: ['kontak', 'contact', 'hubungi', 'email', 'mail', 'dm', 'wa', 'whatsapp', 'hire', 'rekrut', 'recruit', 'lowongan', 'freelance', 'available', 'tersedia', 'open'],
      reply: () => `Press start to collab! 🎮\n\n📧 ${KB.email}\n📸 ${KB.links.instagram}\n🎵 ${KB.links.tiktok}\n🐙 ${KB.links.github}\n\nJulio terbuka untuk endorse, collab konten, pesanan warungpiksel.id, dan project web.`,
    },
  ];

  const CHIP_QUERIES = {
    'Statistik sosmed': 'instagram tiktok followers',
    'Pengalaman talent': 'talent model',
    'Barista?': 'barista',
    'Lihat proyek': 'proyek',
    'Pendidikan': 'pendidikan',
  };

  const FOLLOW_UP = /^(berapa|harga|terus|lalu|trus|detail|lebih|gimana|bagaimana|cara|link|kok|kenapa|oh|ok|oke|lagi|mau)/;

  function normalize(t) {
    return ' ' + t.toLowerCase().replace(/[^a-z0-9\s.-]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  }

  function scoreIntent(intent, text) {
    let score = 0;
    for (const k of intent.keys) {
      if (text.includes(' ' + k + ' ')) score += 2;              // whole word
      else if (k.length > 3 && text.includes(k)) score += 1;     // partial (e.g. "harganya")
    }
    return score;
  }

  let lastIntent = null;

  function localReply(raw) {
    const text = normalize(raw);
    const ranked = INTENTS.map(i => ({ i, s: scoreIntent(i, text) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s);

    // short follow-up question → continue the previous topic
    const short = text.trim().split(' ').length <= 5;
    const sameTopic = !ranked.length || ranked[0].i.id === lastIntent;
    if (lastIntent && short && sameTopic && FOLLOW_UP.test(text.trim())) {
      const prev = INTENTS.find(i => i.id === lastIntent);
      if (prev) return { text: prev.followUp ? prev.followUp() : prev.reply(), chips: prev.chips };
    }

    if (!ranked.length) {
      return {
        text: `Hmm, quest ini belum ada di data-ku 😅 Coba tanya soal collab, skill, warungpiksel.id, atau pengalaman Julio — atau langsung email ke ${KB.email}.`,
        chips: DEFAULT_CHIPS,
      };
    }

    // greeting only wins if nothing more specific matched
    const picks = ranked.filter(x => x.i.id !== 'greet' || ranked.length === 1);
    const top = picks[0];
    lastIntent = top.i.id;
    let out = top.i.reply();
    // combine a strong second intent ("harga collab dan skill dev?")
    const second = picks[1];
    if (second && second.s >= 2 && second.s >= top.s - 1) out += '\n\n—\n\n' + second.i.reply();
    return { text: out, chips: top.i.chips };
  }

  // ---------- remote AI ----------
  let aiAvailable = location.protocol !== 'file:';

  async function aiReply(history) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.map(m => ({ role: m.role, text: m.text })) }),
    });
    if (!res.ok) throw new Error('ai ' + res.status);
    const data = await res.json();
    if (!data.reply) throw new Error('empty');
    return data.reply;
  }

  // ---------- rendering ----------
  const els = {
    widget: document.getElementById('chat-widget'),
    toggles: document.querySelectorAll('[data-chat-open], #chat-toggle'),
    close: document.getElementById('chat-close'),
    reset: document.getElementById('chat-reset'),
    list: document.getElementById('chat-messages'),
    chips: document.getElementById('chat-chips'),
    input: document.getElementById('chat-input'),
    send: document.getElementById('chat-send'),
    mode: document.getElementById('chat-mode'),
  };

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function format(text) {
    return escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/(https?:\/\/[^\s<]+[^\s<.,)])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, '<a href="mailto:$1">$1</a>')
      .replace(/\n/g, '<br>');
  }

  function bubble(role) {
    const row = document.createElement('div');
    row.className = 'chat-msg ' + (role === 'user' ? 'user' : 'bot');
    const b = document.createElement('div');
    b.className = 'msg-bubble';
    row.appendChild(b);
    els.list.appendChild(row);
    return b;
  }

  function scrollDown() { els.list.scrollTop = els.list.scrollHeight; }

  function renderStatic(role, text) {
    bubble(role).innerHTML = role === 'user' ? escapeHtml(text) : format(text);
    scrollDown();
  }

  // typewriter: stream plain text, then swap in the formatted version
  function typeOut(text) {
    return new Promise(resolve => {
      const b = bubble('model');
      b.classList.add('typing');
      const plain = text.replace(/\*\*(.+?)\*\*/g, '$1');
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let i = 0;
      const step = Math.max(1, Math.round(plain.length / 120));
      (function tick() {
        i += step;
        if (reduce || i >= plain.length) {
          b.classList.remove('typing');
          b.innerHTML = format(text);
          scrollDown();
          return resolve();
        }
        b.textContent = plain.slice(0, i);
        scrollDown();
        setTimeout(tick, 12);
      })();
    });
  }

  function showThinking() {
    const b = bubble('model');
    b.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    scrollDown();
    return b.parentElement;
  }

  function setChips(list) {
    els.chips.innerHTML = '';
    (list && list.length ? list : DEFAULT_CHIPS).forEach(label => {
      const c = document.createElement('button');
      c.type = 'button';
      c.className = 'chat-chip';
      c.textContent = label;
      c.addEventListener('click', () => handleSend(label));
      els.chips.appendChild(c);
    });
  }

  function setMode() {
    if (els.mode) els.mode.textContent = aiAvailable ? 'online · AI' : 'online · mode cepat';
  }

  // ---------- state ----------
  let history = [];
  function save() { try { sessionStorage.setItem(STORE_KEY, JSON.stringify(history.slice(-30))); } catch {} }
  function load() { try { return JSON.parse(sessionStorage.getItem(STORE_KEY)) || []; } catch { return []; } }

  function start(fresh) {
    els.list.innerHTML = '';
    lastIntent = null;
    history = fresh ? [] : load();
    if (!history.length) history = [{ role: 'model', text: GREETING }];
    history.forEach(m => renderStatic(m.role, m.text));
    setChips(DEFAULT_CHIPS);
    save();
  }

  let busy = false;
  async function handleSend(preset) {
    const msg = (preset || els.input.value).trim();
    if (!msg || busy) return;
    busy = true;
    els.input.value = '';
    els.chips.innerHTML = '';
    renderStatic('user', msg);
    history.push({ role: 'user', text: msg });

    const thinking = showThinking();
    let reply, chips;
    if (aiAvailable) {
      try {
        reply = await aiReply(history);
      } catch {
        aiAvailable = false; // fall back for the rest of the session
        setMode();
      }
    }
    if (!reply) {
      await new Promise(r => setTimeout(r, 450 + Math.random() * 400));
      const local = localReply(CHIP_QUERIES[msg] || msg);
      reply = local.text;
      chips = local.chips;
    }
    thinking.remove();
    await typeOut(reply);
    history.push({ role: 'model', text: reply });
    save();
    setChips(chips);
    busy = false;
    els.input.focus();
  }

  // ---------- wire up ----------
  function open() {
    els.widget.classList.add('open');
    setTimeout(() => els.input.focus(), 150);
  }
  els.toggles.forEach(t => t.addEventListener('click', () => {
    els.widget.classList.contains('open') ? els.widget.classList.remove('open') : open();
  }));
  els.close.addEventListener('click', () => els.widget.classList.remove('open'));
  els.reset && els.reset.addEventListener('click', () => start(true));
  els.send.addEventListener('click', () => handleSend());
  els.input.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') els.widget.classList.remove('open'); });

  setMode();
  start(false);
})();
