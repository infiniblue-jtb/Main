<template>
  <div class="apple-page">
    <header class="hero-section">
      <h1 class="hero-title">{{ t.title }}</h1>
      <p class="hero-subtitle">{{ t.desc }}</p>
      
      <!-- 글쓰기 버튼 -->
      <div class="admin-controls">
        <button v-if="!showEditor" @click="openEditor()" class="write-btn">
          <span>✍️</span> {{ currentLang === 'ko' ? '글 작성하기' : 'Write Post' }}
        </button>
        <button v-else @click="closeEditor" class="cancel-btn">
          {{ currentLang === 'ko' ? '취소' : 'Cancel' }}
        </button>
      </div>
    </header>

    <section class="content-section">
      <!-- 글쓰기/수정 에디터 폼 -->
      <transition name="apple-fade">
        <div v-if="showEditor" class="editor-container glass-card">
          <h2>{{ isEditing ? (currentLang === 'ko' ? '정보 수정하기' : 'Edit Info') : (currentLang === 'ko' ? '새로운 정보 작성' : 'Write New Info') }}</h2>
          <form @submit.prevent="submitPost" class="apple-form">
            <div class="form-group">
              <label>{{ currentLang === 'ko' ? '제목' : 'Title' }}</label>
              <input v-model="newPost.title" required placeholder="글 제목을 입력하세요">
            </div>
            <div class="form-group">
              <label>{{ currentLang === 'ko' ? '요약' : 'Excerpt' }}</label>
              <input v-model="newPost.excerpt" placeholder="목록에 표시될 짧은 요약">
            </div>
            <div class="form-group">
              <label>{{ currentLang === 'ko' ? '이미지 URL' : 'Image URL' }}</label>
              <input v-model="newPost.image_url" placeholder="https://example.com/image.jpg">
            </div>
            <div class="form-group">
              <label>{{ currentLang === 'ko' ? '본문 내용' : 'Content' }}</label>
              <textarea v-model="newPost.content" required rows="10" placeholder="상세 내용을 입력하세요"></textarea>
            </div>
            <div class="form-group admin-key">
              <label>{{ currentLang === 'ko' ? '관리자 비밀번호' : 'Admin Key' }}</label>
              <input v-model="adminKey" type="password" required placeholder="API SECRET 입력 (저장 후 자동 삭제)">
            </div>
            <button type="submit" class="submit-btn" :disabled="submitting">
              {{ submitting ? (currentLang === 'ko' ? '처리 중...' : 'Processing...') : (currentLang === 'ko' ? '정보 저장' : 'Save Info') }}
            </button>
          </form>
        </div>
      </transition>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>
      
      <div v-else class="blog-grid">
        <article v-for="post in posts" :key="post.id" class="blog-card" @click="viewPost(post)">
          <div class="card-image" :style="post.image_url ? { backgroundImage: `url(${post.image_url})` } : {}">
            <div v-if="!post.image_url" class="placeholder-image">✨</div>
            <!-- 삭제 버튼 -->
            <button class="delete-icon-btn" @click.stop="confirmDelete(post.id, post.title)" :title="currentLang === 'ko' ? '삭제' : 'Delete'">
              ✕
            </button>
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

    <!-- 포스트 상세 모달 -->
    <transition name="apple-fade">
      <div v-if="selectedPost" class="modal-overlay" @click="selectedPost = null">
        <div class="modal-content glass-card" @click.stop>
          <button class="close-btn" @click="selectedPost = null">✕</button>
          <div v-if="selectedPost.image_url" class="modal-image" :style="{ backgroundImage: `url(${selectedPost.image_url})` }"></div>
          <div class="modal-body">
            <div class="modal-header">
              <span class="modal-date">{{ formatDate(selectedPost.created_at) }}</span>
              <div class="modal-admin-btns">
                <button class="edit-btn" @click="startEdit(selectedPost)">
                  {{ currentLang === 'ko' ? '수정하기' : 'Edit' }}
                </button>
                <button class="delete-pill-btn" @click="confirmDelete(selectedPost.id, selectedPost.title)">
                  {{ currentLang === 'ko' ? '삭제하기' : 'Delete' }}
                </button>
              </div>
            </div>
            <h1>{{ selectedPost.title }}</h1>
            <div class="modal-text">{{ selectedPost.content }}</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, inject, onMounted } from 'vue';

const TRANSLATIONS = {
  ko: {
    title: '정보 광장',
    desc: '동탄 생활에 도움이 되는 유용한 정보와 소식을 직접 공유하세요.',
  },
  en: {
    title: 'Info Hub',
    desc: 'Share and explore useful information for life in Dongtan.',
  }
};

export default {
  name: 'InfoView',
  setup() {
    const currentLang = inject('currentLang', ref('ko'));
    const posts = ref([]);
    const loading = ref(true);
    const showEditor = ref(false);
    const isEditing = ref(false);
    const editId = ref(null);
    const submitting = ref(false);
    const selectedPost = ref(null);
    const adminKey = ref('');

    const newPost = ref({
      title: '',
      excerpt: '',
      image_url: '',
      content: ''
    });

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

    const openEditor = () => {
      isEditing.value = false;
      newPost.value = { title: '', excerpt: '', image_url: '', content: '' };
      showEditor.value = true;
    };

    const closeEditor = () => {
      showEditor.value = false;
      isEditing.value = false;
      editId.value = null;
    };

    const startEdit = (post) => {
      isEditing.value = true;
      editId.value = post.id;
      newPost.value = { ...post };
      selectedPost.value = null;
      showEditor.value = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submitPost = async () => {
      submitting.value = true;
      const method = isEditing.value ? 'PUT' : 'POST';
      const url = isEditing.value 
        ? `https://dongtan-api.infiniblue.workers.dev/api/posts/${editId.value}`
        : 'https://dongtan-api.infiniblue.workers.dev/api/posts';
      
      try {
        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminKey.value}`
          },
          body: JSON.stringify(newPost.value)
        });

        if (response.ok) {
          alert(isEditing.value ? '수정되었습니다!' : '성공적으로 저장되었습니다!');
          newPost.value = { title: '', excerpt: '', image_url: '', content: '' };
          adminKey.value = ''; // 비밀번호 자동 삭제
          showEditor.value = false;
          isEditing.value = false;
          await fetchPosts();
        } else {
          const err = await response.json();
          alert('저장 실패: ' + (err.error || '비밀번호를 확인하세요.'));
        }
      } catch (error) {
        alert('네트워크 오류: ' + error.message);
      } finally {
        submitting.value = false;
      }
    };

    const confirmDelete = async (id, title) => {
      if (!adminKey.value) {
        const key = prompt('삭제를 위해 관리자 비밀번호를 입력해주세요:');
        if (!key) return;
        adminKey.value = key;
      }

      const ok = confirm(`'${title}' 글을 정말 삭제하시겠습니까?`);
      if (!ok) return;

      try {
        const response = await fetch(`https://dongtan-api.infiniblue.workers.dev/api/posts/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminKey.value}`
          }
        });

        if (response.ok) {
          alert('삭제되었습니다.');
          adminKey.value = ''; // 비밀번호 자동 삭제
          selectedPost.value = null;
          await fetchPosts();
        } else {
          const err = await response.json();
          alert('삭제 실패: ' + (err.error || '비밀번호를 확인하세요.'));
          adminKey.value = ''; // 실패 시에도 보안을 위해 삭제
        }
      } catch (error) {
        alert('삭제 중 오류 발생: ' + error.message);
      }
    };

    const formatDate = (dateStr) => {
      const date = dateStr ? new Date(dateStr) : new Date();
      return date.toLocaleDateString(currentLang.value === 'ko' ? 'ko-KR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const viewPost = (post) => {
      selectedPost.value = post;
    };

    onMounted(fetchPosts);

    return { 
      currentLang, t, posts, loading, formatDate, viewPost,
      showEditor, newPost, submitPost, submitting, adminKey, selectedPost, 
      confirmDelete, isEditing, startEdit, openEditor, closeEditor
    };
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
  margin-bottom: 30px;
}

.admin-controls {
  margin-top: 20px;
}

.write-btn, .cancel-btn {
  padding: 12px 24px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.write-btn {
  background: var(--accent);
  color: white;
}

.cancel-btn {
  background: var(--card-bg);
  color: var(--text-primary);
}

.editor-container {
  max-width: 800px;
  margin: 0 auto 60px;
  padding: 40px;
}

.apple-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.form-group input, .form-group textarea {
  padding: 14px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.1);
  background: var(--page-bg);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
}

.admin-key input {
  border: 1px solid var(--accent);
}

.submit-btn {
  background: var(--accent);
  color: white;
  padding: 16px;
  border-radius: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  margin-top: 10px;
}

.submit-btn:disabled {
  opacity: 0.5;
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
  position: relative;
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
  position: relative;
}

.delete-icon-btn {
  position: absolute;
  top: 12px; right: 12px;
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(0,0,0,0.3);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s;
  z-index: 10;
}

.blog-card:hover .delete-icon-btn {
  opacity: 1;
}

.delete-icon-btn:hover {
  background: #ff3b30;
  transform: scale(1.1);
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

.read-more {
  color: var(--accent);
  font-weight: 600;
  font-size: 0.9rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(5px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  background: var(--page-bg);
  padding: 0;
  border-radius: 28px;
}

.close-btn {
  position: absolute;
  top: 20px; right: 20px;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  width: 32px; height: 32px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 11;
}

.modal-image {
  height: 400px;
  background-size: cover;
  background-position: center;
}

.modal-body {
  padding: 40px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.modal-admin-btns {
  display: flex;
  gap: 12px;
}

.edit-btn {
  background: var(--card-bg);
  border: 1px solid rgba(0,0,0,0.1);
  padding: 6px 16px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-btn:hover {
  background: #e5e5e7;
}

.delete-pill-btn {
  background: #fff1f0;
  color: #ff3b30;
  border: 1px solid #ffccc7;
  padding: 6px 16px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.delete-pill-btn:hover {
  background: #ff3b30;
  color: white;
  border-color: #ff3b30;
}

.modal-body h1 {
  font-size: 2.5rem;
  margin: 0 0 25px;
}

.modal-text {
  font-size: 1.1rem;
  line-height: 1.8;
  white-space: pre-wrap;
}

.loading-state {
  text-align: center;
  padding: 100px 0;
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
  .modal-image { height: 250px; }
  .modal-body h1 { font-size: 1.8rem; }
  .modal-header { flex-direction: column; align-items: flex-start; gap: 15px; }
}
</style>