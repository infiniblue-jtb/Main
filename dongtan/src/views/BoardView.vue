<template>
  <div class="apple-page">
    <header class="hero-section">
      <h1 class="hero-title">{{ t.title }}</h1>
      <p class="hero-subtitle">{{ t.desc }}</p>
    </header>

    <section class="content-section">
      <!-- Comments Section -->
      <div class="time-block">
        <div class="section-header">
          <h2 class="section-title">{{ t.commentTitle }}</h2>
        </div>
        <div class="glass-card comment-container">
          <div id="disqus_thread"></div>
        </div>
      </div>

      <!-- Contact Form -->
      <div id="contact-section" class="glass-card contact-container mt-80">
        <h2 class="card-title">{{ t.contactTitle }}</h2>
        <form action="https://formspree.io/f/mrerkyqp" method="POST" class="apple-form">
          <div class="form-group">
            <label for="company">{{ t.labelCompany }}</label>
            <input type="text" id="company" name="company" required :placeholder="t.placeholderCompany">
          </div>
          <div class="form-group">
            <label for="email">{{ t.labelEmail }}</label>
            <input type="email" id="email" name="_replyto" required placeholder="example@email.com">
          </div>
          <div class="form-group">
            <label for="message">{{ t.labelMessage }}</label>
            <textarea id="message" name="message" required :placeholder="t.placeholderMessage"></textarea>
          </div>
          <input type="text" name="_gotcha" style="display:none">
          <button type="submit" class="apple-button">{{ t.submitBtn }}</button>
        </form>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, inject, computed, onMounted } from 'vue';

const TRANSLATIONS = {
  ko: {
    title: "자유 게시판", 
    desc: "동탄 부모님들과 자유롭게 정보를 나누고 소통하는 공간입니다. 궁금한 점이 있다면 무엇이든 물어보세요.",
    contactTitle: "🤝 문의",
    commentTitle: "💬 자유 게시판",
    labelCompany: "이름 또는 업체명",
    labelEmail: "이메일 주소",
    labelMessage: "내용",
    placeholderCompany: "성함이나 업체명을 입력하세요",
    placeholderMessage: "문의하실 내용을 상세히 적어주세요",
    submitBtn: "보내기"
  },
  en: {
    title: "Open Board", desc: "",
    contactTitle: "🤝 Partnership & Report",
    commentTitle: "💬 Open Board",
    labelCompany: "Name or Company",
    labelEmail: "Email",
    labelMessage: "Message",
    placeholderCompany: "Enter your name or company",
    placeholderMessage: "Write your message here",
    submitBtn: "Submit"
  }
};

export default {
  name: 'BoardView',
  setup() {
    const currentLang = inject('currentLang', ref('ko'));
    const t = computed(() => {
      const lang = currentLang.value || 'ko';
      return TRANSLATIONS[lang] || TRANSLATIONS['ko'];
    });

    const initDisqus = () => {
      // Reset Disqus if already loaded
      if (window.DISQUS) {
        window.DISQUS.reset({
          reload: true,
          config: function () {
            this.page.url = window.location.href;
            this.page.identifier = 'happykids-board';
          }
        });
      } else {
        const d = document, s = d.createElement('script');
        s.src = 'https://infiniblue.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
      }
    };

    onMounted(() => {
      initDisqus();
    });

    return { t, currentLang };
  }
}
</script>

<style scoped>
.apple-page { padding-bottom: 100px; }
.hero-section { padding: 80px 22px 40px; text-align: center; max-width: 800px; margin: 0 auto; }
.hero-title { font-size: 3.5rem; font-weight: 700; letter-spacing: -0.015em; margin-bottom: 12px; }
.hero-subtitle { font-size: 1.5rem; color: var(--text-secondary); font-weight: 400; }

.content-section { max-width: 800px; margin: 0 auto; padding: 0 22px; }

.glass-card { 
  background: var(--card-bg); 
  border-radius: 28px; 
  padding: 40px; 
  box-shadow: 0 10px 30px rgba(0,0,0,0.05); 
}

.card-title { font-size: 1.8rem; font-weight: 600; margin-bottom: 30px; text-align: center; }

.apple-form { display: flex; flex-direction: column; gap: 20px; }

.form-group { display: flex; flex-direction: column; gap: 8px; }

.form-group label { font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); padding-left: 4px; }

.apple-form input, .apple-form textarea {
  background: var(--page-bg);
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 12px;
  padding: 14px;
  font-size: 1rem;
  color: var(--text-primary);
  font-family: inherit;
  transition: border-color 0.3s;
}

[data-theme="dark"] .apple-form input, [data-theme="dark"] .apple-form textarea {
  border: 1px solid rgba(255,255,255,0.1);
}

.apple-form input:focus, .apple-form textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.apple-button {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
  margin-top: 10px;
}

.apple-button:hover { opacity: 0.9; }

.section-header { margin-bottom: 30px; text-align: center; }
.section-title { font-size: 2rem; font-weight: 600; }
.mt-80 { margin-top: 80px; }

.comment-container { min-height: 400px; }

@media (max-width: 734px) {
  .hero-title { font-size: 2.5rem; }
  .hero-subtitle { font-size: 1.2rem; }
  .glass-card { padding: 25px; }
}
</style>
