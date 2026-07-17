/* ===== AI CHATBOT — Julio Agung Portfolio =====
   Supports: Google Gemini API
   Fallback: Local knowledge base
   To activate: set GEMINI_API_KEY below
   ================================================ */

const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'; // Ganti dengan API key kamu
const USE_AI = GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY';

// ---- Knowledge Base (fallback & context) ----
const JULIO_CONTEXT = `
Kamu adalah AI Assistant pribadi milik Julio Agung, seorang Full-Stack Web Developer.
Jawab pertanyaan tentang Julio dengan bahasa yang ramah, informatif, dan profesional.
Jika tidak tahu, arahkan pengguna untuk menghubungi Julio langsung.

PROFIL JULIO AGUNG:
- Nama: Julio Agung
- Profesi: Full-Stack Web Developer
- Pendidikan: S1 Teknik Informatika, Universitas Dinamika Bangsa — Lulus Cumlaude (Pujian)
- Penghargaan: Best Capstone Project — Program Dicoding ASAH 2025

SKILL TEKNIS:
- Languages: JavaScript, PHP, HTML, CSS
- Framework: React.js, Node.js, Express.js, Laravel, Bootstrap
- Database: MongoDB, MySQL
- Tools: Git, GitHub, Postman, VS Code, Figma, Firebase, Swagger/OpenAPI

PENGALAMAN:
1. Front End & Back End With AI — Dicoding ASAH (Okt 2025 - Jan 2026): Membangun aplikasi CostTrack, meraih Best Capstone Project
2. Frontliner → Co-Head Floor — Seduh.an (Apr 2026 - Jul 2026): Dipromosikan dalam 1 bulan, admin sosmed & content creator, live report harian
3. Staf Kominfo — BEM Universitas Dinamika Bangsa (Jun 2025 - Jun 2026): Kelola media sosial, publikasi & dokumentasi
4. Talent & Model KOL — Darikami Official (Apr 2025 - Sekarang): Kampanye digital & konten promosi berbagai brand

PROYEK UNGGULAN:
- CostTrack: Aplikasi web full-stack untuk menghitung HPE berdasarkan BOM, riwayat pengadaan, dan kurs JISDOR.
  Tech: React.js, Node.js, Express.js, MongoDB, REST API
- Jasanugas Kamu: Platform jasa tugas premium yang menghubungkan mahasiswa dengan tenaga pengerjaan tugas profesional.
  Fitur: sistem order, manajemen tugas, dashboard admin.

SOFT SKILLS: Problem Solving, Team Collaboration, Communication, Leadership, Time Management, Customer Service
INSTAGRAM: @julio_agung (https://instagram.com/julio_agung)
GITHUB: github.com/julioagung
EMAIL: jloagung267@gmail.com
`;

const LOCAL_QA = [
  { q: ['halo', 'hai', 'hello', 'hi', 'hey'], a: 'Halo! Saya AI Assistant Julio Agung 👋 Ada yang ingin kamu tanyakan tentang Julio? Skill, pengalaman, atau proyeknya?' },
  { q: ['siapa', 'who', 'profil', 'tentang julio', 'about'], a: 'Julio Agung adalah Full-Stack Web Developer yang lulus Cumlaude dari Universitas Dinamika Bangsa. Ia meraih penghargaan Best Capstone Project di program Dicoding ASAH 2025 dengan membangun aplikasi CostTrack 🏆' },
  { q: ['skill', 'kemampuan', 'bisa apa', 'teknologi', 'tech', 'stack'], a: 'Julio menguasai:\n\n💻 Languages: JavaScript, PHP, HTML, CSS\n⚡ Frameworks: React.js, Node.js, Express.js, Laravel\n🗄️ Database: MongoDB, MySQL\n🛠️ Tools: Git, Firebase, Figma, Postman, Swagger\n\nJago full-stack dari frontend React sampai backend Node.js + Express!' },
  { q: ['project', 'proyek', 'portofolio', 'costtrack', 'karya'], a: 'Proyek unggulan Julio adalah CostTrack — aplikasi web full-stack untuk menghitung Harga Perkiraan Estimasi (HPE) berdasarkan Bill of Material (BOM), riwayat pengadaan, dan kurs JISDOR. Dibangun dengan React.js, Node.js, Express.js & MongoDB. Proyek ini meraih Best Capstone Project di Dicoding ASAH 2025! 🚀' },
  { q: ['pengalaman', 'kerja', 'experience', 'riwayat'], a: 'Pengalaman Julio:\n\n🏆 Dicoding ASAH (2025) — Full-Stack Dev, Best Capstone\n📱 Seduahan — Frontliner → dipromosikan Co-Head Floor dalam 1 bulan!\n🎓 BEM Univ. Dinamika Bangsa — Staf Kominfo\n📸 Darikami Official — Talent & Model KOL\n\nDiversified banget — dari dev sampai dunia kreatif!' },
  { q: ['pendidikan', 'kuliah', 'universitas', 'education', 'degree'], a: 'Julio lulus S1 Teknik Informatika dari Universitas Dinamika Bangsa dengan predikat Cumlaude (Pujian) 🎓' },
  { q: ['kontak', 'contact', 'hubungi', 'hire', 'rekrut', 'reach'], a: 'Untuk menghubungi Julio:\n\n📧 Email: Cek section Contact di website ini\n💼 LinkedIn: Tersedia di section Contact\n🐙 GitHub: Tersedia di section Contact\n\nAtau langsung isi form Contact di bawah halaman ini! 🤝' },
  { q: ['react', 'node', 'express', 'laravel', 'mongodb', 'php', 'javascript'], a: 'Julio solid di stack ini! Sudah pakai React.js dan Node.js/Express.js untuk CostTrack — aplikasi full-stack yang cukup kompleks 💪' },
  { q: ['available', 'open work', 'lowongan', 'kerja', 'magang', 'freelance'], a: 'Julio saat ini terbuka untuk peluang kerja, freelance, maupun kolaborasi! Hubungi melalui form Contact ya 🚀' },
  { q: ['cumlaude', 'prestasi', 'award', 'penghargaan', 'best'], a: 'Dua pencapaian besar Julio:\n\n🏆 Best Capstone Project — Dicoding ASAH 2025\n🎓 Cumlaude — S1 Teknik Informatika, Universitas Dinamika Bangsa' },
];

// ---- UI Elements ----
const chatWidget = document.getElementById('chat-widget');
const chatToggle = document.getElementById('chat-toggle');
const chatClose = document.getElementById('chat-close');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');

chatToggle.addEventListener('click', () => {
  chatWidget.classList.toggle('open');
  if (chatWidget.classList.contains('open')) chatInput.focus();
});
chatClose.addEventListener('click', () => chatWidget.classList.remove('open'));

function appendMessage(text, role) {
  const div = document.createElement('div');
  div.className = 'chat-msg ' + role;
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = text.replace(/\n/g, '<br>');
  div.appendChild(bubble);
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'chat-msg bot msg-typing';
  div.innerHTML = '<div class="msg-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

function localReply(userMsg) {
  const lower = userMsg.toLowerCase();
  for (const item of LOCAL_QA) {
    if (item.q.some(k => lower.includes(k))) return item.a;
  }
  return 'Pertanyaan menarik! Untuk info lebih lengkap tentang Julio, silakan hubungi langsung melalui section Contact ya 😊';
}

async function geminiReply(userMsg) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [{ parts: [{ text: JULIO_CONTEXT + '\n\nPertanyaan pengguna: ' + userMsg }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
  };
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('API error');
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || localReply(userMsg);
}

async function handleSend() {
  const msg = chatInput.value.trim();
  if (!msg) return;
  chatInput.value = '';
  appendMessage(msg, 'user');
  const typing = showTyping();

  try {
    let reply;
    if (USE_AI) {
      reply = await geminiReply(msg);
    } else {
      await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
      reply = localReply(msg);
    }
    typing.remove();
    appendMessage(reply, 'bot');
  } catch {
    typing.remove();
    appendMessage('Maaf, ada gangguan teknis. Silakan hubungi Julio langsung ya! 🙏', 'bot');
  }
}

chatSend.addEventListener('click', handleSend);
chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });
