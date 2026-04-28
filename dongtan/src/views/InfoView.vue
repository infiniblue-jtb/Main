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

    const STATIC_POSTS = {
      ko: [
        {
          id: 'guide-1',
          title: '동탄호수공원 주말 나들이 완벽 가이드',
          excerpt: '주차 팁부터 피크닉 명소, 그리고 아이와 함께 가기 좋은 근처 카페까지 동탄호수공원을 제대로 즐기는 방법을 소개합니다.',
          content: '동탄호수공원은 동탄2신도시의 랜드마크로, 가족 단위 나들이객에게 최고의 장소입니다. 주말에는 주차가 어려울 수 있으니 레이크꼬모나 지하 주차장을 일찍 이용하시는 것을 추천드립니다. 또한, 루나쇼 일정에 맞춰 방문하시면 야간의 아름다운 분수쇼도 감상하실 수 있습니다.',
          created_at: '2026-04-20',
          image_url: 'https://images.unsplash.com/photo-1590604537905-1a84f4705030?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 'guide-2',
          title: '동탄 어린이 병원 및 야간 진료 약국 총정리',
          excerpt: '아이가 갑자기 아플 때 당황하지 마세요. 동탄 내 달빛어린이병원과 연중무휴 야간 운영 약국 리스트를 정리해 드립니다.',
          content: '동탄에는 베스트아이들병원과 같은 달빛어린이병원이 있어 야간에도 안심하고 진료를 볼 수 있습니다. 365일 운영되는 약국 위치를 미리 파악해 두시면 비상 상황에서 큰 도움이 됩니다. 본 사이트의 병원/약국 메뉴에서도 실시간 정보를 확인하실 수 있습니다.',
          created_at: '2026-04-22',
          image_url: 'https://images.unsplash.com/photo-1586773860418-d3b97978c65a?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 'guide-3',
          title: '동탄에서 아이와 함께 가기 좋은 카페 BEST 5',
          excerpt: '노키즈존 걱정 없는, 넓은 잔디밭이나 놀이 공간이 마련된 동탄 인근 대형 카페들을 엄선했습니다.',
          content: '어반리st, 테라로사 동탄호수점 등 아이와 함께 방문해도 부담 없는 대형 카페들이 동탄에는 많습니다. 특히 유모차 이동이 편리한 경사로와 수유실 인근 시설을 갖춘 곳들을 위주로 방문해 보세요. 주말 오후에는 대기 시간이 길 수 있으니 오전 방문을 추천합니다.',
          created_at: '2026-04-25',
          image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80'
        }
      ],
      en: [
        {
          id: 'guide-1',
          title: 'Dongtan Lake Park Weekend Guide',
          excerpt: 'Learn about parking tips, picnic spots, and kid-friendly cafes near Dongtan Lake Park.',
          content: 'Dongtan Lake Park is the landmark of Dongtan 2 City. We recommend arriving early for parking. Don\'t miss the Luna Show (fountain show) at night!',
          created_at: '2026-04-20',
          image_url: 'https://images.unsplash.com/photo-1590604537905-1a84f4705030?auto=format&fit=crop&w=800&q=80'
        }
      ]
    };

    const fetchPosts = async () => {
      loading.value = true;
      try {
        const response = await fetch('https://dongtan-api.infiniblue.workers.dev/api/posts');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        // Combine static and dynamic posts, or use static if dynamic is empty
        if (data && data.length > 0) {
          posts.value = [...data, ...(STATIC_POSTS[currentLang.value] || [])];
        } else {
          posts.value = STATIC_POSTS[currentLang.value] || STATIC_POSTS['ko'];
        }
      } catch (error) {
        console.error('Failed to fetch posts, using static content:', error);
        posts.value = STATIC_POSTS[currentLang.value] || STATIC_POSTS['ko'];
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
