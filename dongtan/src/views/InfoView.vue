<template>
  <div class="apple-page">
    <header class="hero-section">
      <h1 class="hero-title">{{ t.title }}</h1>
      <p class="hero-subtitle">{{ t.desc }}</p>
    </header>

    <section class="content-section">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>
      
      <div v-else-if="posts.length === 0" class="empty-state">
        <p>{{ currentLang === 'ko' ? '새로운 정보가 곧 업데이트될 예정입니다.' : 'New information will be updated soon.' }}</p>
      </div>

      <div v-else class="blog-grid">
        <article v-for="post in posts" :key="post.id" class="blog-card" @click="viewPost(post.id)">
          <div class="card-image" :style="post.image_url ? { backgroundImage: `url(${post.image_url})` } : {}">
            <div v-if="!post.image_url" class="placeholder-image">✨</div>
          </div>
          <div class="card-body">
            <span class="card-date">{{ formatDate(post.created_at) }}</span>
            <h3 class="card-title">{{ post.title }}</h3>
            <p class="card-excerpt">{{ post.excerpt || post.content.substring(0, 100) + '...' }}</p>
            <div class="card-footer">
              <span class="read-more">{{ currentLang === 'ko' ? '자세히 보기' : 'Read More' }} →</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, inject, onMounted } from 'vue';

const TRANSLATIONS = {
  ko: {
    title: '정보 광장',
    desc: '동탄 생활에 도움이 되는 유용한 정보와 소식을 전해드립니다.',
  },
  en: {
    title: 'Info Hub',
    desc: 'Useful information and news for life in Dongtan.',
  }
};

export default {
  name: 'InfoView',
  setup() {
    const currentLang = inject('currentLang', ref('ko'));
    const posts = ref([]);
    const loading = ref(true);

    const t = computed(() => TRANSLATIONS[currentLang.value] || TRANSLATIONS['ko']);

    const fetchPosts = async () => {
      loading.value = true;
      try {
        const response = await fetch('https://dongtan-api.infiniblue.workers.dev/api/posts');
        if (!response.ok) throw new Error('Network response was not ok');
        posts.value = await response.json();
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString(currentLang.value === 'ko' ? 'ko-KR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const viewPost = (id) => {
      console.log('View post:', id);
      // 상세 페이지 이동 로직 추가 예정
    };

    onMounted(fetchPosts);

    return { currentLang, t, posts, loading, formatDate, viewPost };
  }
}
</script>

<style scoped>
.hero-section {
  padding: 80px 22px 40px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: var(--text-secondary);
}

.content-section {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 22px 100px;
}

.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}

.blog-card {
  background: var(--card-bg);
  border-radius: 22px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.blog-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.card-image {
  height: 200px;
  background-size: cover;
  background-position: center;
  background-color: #e5e5e7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-image {
  font-size: 3rem;
}

.card-body {
  padding: 24px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
  display: block;
}

.card-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 1.3;
}

.card-excerpt {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.card-footer {
  margin-top: auto;
}

.read-more {
  color: var(--accent);
  font-weight: 600;
  font-size: 0.9rem;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 100px 0;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  border-top-color: var(--accent);
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 734px) {
  .hero-title { font-size: 2.5rem; }
  .hero-subtitle { font-size: 1.2rem; }
}
</style>
