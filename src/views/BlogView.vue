<template>
  <div class="apple-page">
    <header class="hero-section">
      <h1 class="hero-title">{{ t.title }}</h1>
      <p class="hero-subtitle">{{ t.desc }}</p>
      
      <!-- 글쓰기 버튼 및 일괄 작업 -->
      <div class="admin-controls">
        <div class="search-bar glass-card">
          <span class="search-icon">🔍</span>
          <input 
            v-model="searchQuery" 
            :placeholder="currentLang === 'ko' ? '날짜, 제목, 내용으로 검색...' : 'Search by date, title, content...'"
            class="search-input"
          >
          <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">✕</button>
        </div>

        <div class="control-group">
          <button v-if="!showEditor" @click="openEditor()" class="write-btn">
            <span>✍️</span> {{ currentLang === 'ko' ? '글 작성하기' : 'Write Post' }}
          </button>
          <button v-else @click="closeEditor" class="cancel-btn">
            {{ currentLang === 'ko' ? '취소' : 'Cancel' }}
          </button>
        </div>
        
        <transition name="apple-fade">
          <div v-if="selectedIds.length > 0" class="batch-actions glass-card">
            <span class="selected-count">
              {{ currentLang === 'ko' ? `${selectedIds.length}개 선택됨` : `${selectedIds.length} selected` }}
            </span>
            <button @click="confirmBatchDelete" class="batch-delete-btn">
              {{ currentLang === 'ko' ? '선택 삭제' : 'Delete Selected' }}
            </button>
            <button @click="selectedIds = []" class="clear-selection-btn">
              {{ currentLang === 'ko' ? '선택 해제' : 'Deselect All' }}
            </button>
          </div>
        </transition>
      </div>
    </header>

    <section class="content-section">
      <!-- 글쓰기/수정 에디터 폼 -->
      <transition name="apple-fade">
        <div v-if="showEditor" class="editor-container glass-card">
          <h2>{{ isEditing ? (currentLang === 'ko' ? '포스트 수정하기' : 'Edit Post') : (currentLang === 'ko' ? '새로운 포스트 작성' : 'Write New Post') }}</h2>
          <form @submit.prevent="submitPost" class="apple-form">
            <div class="form-group">
              <label>{{ currentLang === 'ko' ? '제목' : 'Title' }}</label>
              <input v-model="newPost.title" required placeholder="글 제목을 입력하세요">
            </div>
            <div class="form-group">
              <label>{{ currentLang === 'ko' ? '본문 내용' : 'Content' }}</label>
              <textarea v-model="newPost.content" required rows="10" placeholder="본문에 [IMG:url] 형식으로 이미지를 넣으세요"></textarea>
            </div>
            <div class="form-group admin-key">
              <label>{{ currentLang === 'ko' ? '관리자 비밀번호' : 'Admin Key' }}</label>
              <input v-model="adminKey" type="password" required placeholder="API SECRET 입력 (저장 후 자동 삭제)">
            </div>
            <button type="submit" class="submit-btn" :disabled="submitting">
              {{ submitting ? (currentLang === 'ko' ? '처리 중...' : 'Processing...') : (currentLang === 'ko' ? '저장' : 'Save') }}
            </button>
          </form>
        </div>
      </transition>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>
      
      <div v-else class="blog-content-wrapper">
        <!-- 검색 결과 없음 상태 (검색어가 있는데 결과가 없을 때만) -->
        <div v-if="filteredPosts.length === 0 && searchQuery.trim()" class="no-results glass-card">
          <span class="no-results-icon">🔍</span>
          <p>{{ currentLang === 'ko' ? '검색 결과가 없습니다.' : 'No results found.' }}</p>
          <button @click="searchQuery = ''" class="clear-search-link">
            {{ currentLang === 'ko' ? '검색 초기화' : 'Clear search' }}
          </button>
        </div>

        <!-- 포스트가 아예 없는 상태 (검색어 없이 포스트가 0개일 때) -->
        <div v-else-if="filteredPosts.length === 0 && !searchQuery.trim()" class="no-results glass-card">
          <span class="no-results-icon">📝</span>
          <p>{{ currentLang === 'ko' ? '아직 작성된 포스트가 없습니다.' : 'No posts yet.' }}</p>
        </div>

        <!-- 표 리스트 -->
        <div v-if="filteredPosts.length > 0" class="other-posts-section">
          <div class="table-container glass-card">
            <table class="info-table">
              <thead>
                <tr>
                  <th class="col-check">
                    <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="apple-checkbox">
                  </th>
                  <th class="col-thumb">{{ currentLang === 'ko' ? '사진' : 'Thumb' }}</th>
                  <th class="col-date">{{ currentLang === 'ko' ? '날짜' : 'Date' }}</th>
                  <th class="col-title">{{ currentLang === 'ko' ? '제목' : 'Title' }}</th>
                  <th class="col-action"></th>
                </tr>
              </thead>
              <tbody>
                <template v-for="post in paginatedPosts" :key="post.id">
                  <tr v-if="post" @click="viewPost(post)">
                    <td class="col-check" @click.stop>
                      <input type="checkbox" :value="post.id" v-model="selectedIds" class="apple-checkbox">
                    </td>
                    <td class="col-thumb">
                      <div v-if="getThumbnail(post)" class="thumb-img" :style="{ backgroundImage: `url(${getThumbnail(post)})` }"></div>
                      <div v-else class="thumb-placeholder">✨</div>
                    </td>
                    <td class="col-date">{{ formatDate(post.created_at) }}</td>
                    <td class="col-title">
                      <div class="title-wrapper">
                        <span class="title-text">{{ post.title || '제목 없음' }}</span>
                        <span class="excerpt-hint">{{ post.content ? post.content.substring(0, 50) + '...' : '' }}</span>
                      </div>
                    </td>
                    <td class="col-action">
                      <div class="action-btns">
                        <button class="table-delete-btn" @click.stop="confirmDelete(post.id, post.title)">✕</button>
                        <span class="arrow">→</span>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <!-- Pagination UI -->
          <div v-if="totalPages > 1" class="pagination">
            <button 
              class="page-btn nav-btn" 
              :disabled="currentPage === 1" 
              @click="setPage(currentPage - 1)"
            >
              &lt;
            </button>
            <div class="page-numbers">
              <button 
                v-for="page in totalPages" 
                :key="page" 
                class="page-btn" 
                :class="{ active: currentPage === page }"
                @click="setPage(page)"
              >
                {{ page }}
              </button>
            </div>
            <button 
              class="page-btn nav-btn" 
              :disabled="currentPage === totalPages" 
              @click="setPage(currentPage + 1)"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom Ad Unit -->
      <AdComponent slotId="9173007135" />
    </section>

    <!-- 포스트 상세 모달 -->
    <transition name="apple-fade">
      <div v-if="selectedPost" class="modal-overlay" @click="selectedPost = null">
        <div class="modal-content glass-card" @click.stop>
          <button class="close-btn" @click="selectedPost = null">✕</button>
          <div v-if="getThumbnail(selectedPost)" class="modal-image" :style="{ backgroundImage: `url(${getThumbnail(selectedPost)})` }"></div>
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
            <div class="modal-text" v-html="parseContent(selectedPost.content)"></div>
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
    title: 'blog',
    desc: '동탄 생활에 도움이 되는 유용한 정보와 소식을 직접 공유하세요.',
  },
  en: {
    title: 'Blog',
    desc: 'Share and explore useful information for life in Dongtan.',
  }
};

export default {
  name: 'BlogView',
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
    const selectedIds = ref([]);
    const searchQuery = ref('');

    const newPost = ref({
      title: '',
      content: ''
    });

    // Pagination
    const currentPage = ref(1);
    const pageSize = 10;

    const t = computed(() => TRANSLATIONS[currentLang.value] || TRANSLATIONS['ko']);

    // eslint-disable-next-line no-unused-vars
    const getThumbnail = (post) => {
      if (!post.content) return null;
      const match = post.content.match(/\[IMG:(.*?)\]/);
      return match ? match[1] : null;
    };

    const parseContent = (content) => {
      if (!content) return '';
      // [IMG:url] -> <img src="url" loading="lazy" style="max-width:100%; border-radius:12px; margin: 15px 0; display: block;">
      return content.replace(/\[IMG:(.*?)\]/g, '<img src="$1?auto=format,compress" loading="lazy" style="max-width:100%; border-radius:12px; margin: 15px 0; display: block;">');
    };
    };

    const fetchPosts = async () => {
      loading.value = true;
      try {
        const response = await fetch('https://dongtan-api.infiniblue.workers.dev/api/posts');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        // Ensure posts have image_urls array
        posts.value = data.map(post => ({
          ...post,
          image_urls: post.image_urls || (post.image_url ? [post.image_url] : [])
        }));
        selectedIds.value = [];
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        loading.value = false;
      }
    };

    const filteredPosts = computed(() => {
      if (!searchQuery.value.trim()) return posts.value || [];
      const q = searchQuery.value.toLowerCase();
      return (posts.value || []).filter(post => {
        if (!post) return false;
        const title = (post.title || '').toLowerCase();
        const content = (post.content || '').toLowerCase();
        const date = formatDate(post.created_at).toLowerCase();
        return title.includes(q) || content.includes(q) || date.includes(q);
      });
    });

    const totalPages = computed(() => {
      const posts = filteredPosts.value || [];
      return Math.ceil(posts.length / pageSize);
    });
    
    const paginatedPosts = computed(() => {
      const posts = filteredPosts.value || [];
      const start = (currentPage.value - 1) * pageSize;
      const end = start + pageSize;
      return posts.slice(start, end);
    });

    // Multi-select logic (Update for table)
    const isAllSelected = computed(() => {
      if (paginatedPosts.value.length === 0) return false;
      return paginatedPosts.value.every(post => selectedIds.value.includes(post.id));
    });

    const toggleSelectAll = () => {
      const currentIds = paginatedPosts.value.map(p => p.id);
      if (isAllSelected.value) {
        selectedIds.value = selectedIds.value.filter(id => !currentIds.includes(id));
      } else {
        const newIds = [...selectedIds.value];
        currentIds.forEach(id => {
          if (!newIds.includes(id)) newIds.push(id);
        });
        selectedIds.value = newIds;
      }
    };

    const setPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const openEditor = () => {
      isEditing.value = false;
      newPost.value = { title: '', content: '' };
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
      newPost.value = { title: post.title, content: post.content };
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
            'Authorization': `Bearer ${adminKey.value.trim()}`
          },
          body: JSON.stringify(newPost.value)
        });

        if (response.ok) {
          alert(isEditing.value ? '수정되었습니다!' : '성공적으로 저장되었습니다!');
          newPost.value = { title: '', content: '' };
          adminKey.value = ''; // 비밀번호 자동 삭제
          showEditor.value = false;
          isEditing.value = false;
          await fetchPosts();
        } else {
          let errorMessage = '비밀번호를 확인하세요.';
          const text = await response.text();
          try {
            const err = JSON.parse(text);
            errorMessage = err.error || errorMessage;
          } catch (e) {
            errorMessage = text || `에러 코드: ${response.status}`;
          }
          alert('저장 실패: ' + errorMessage);
        }
      } catch (error) {
        alert('네트워크 오류: ' + error.message);
      } finally {
        submitting.value = false;
      }
    };

    const confirmDelete = async (id, title) => {
      console.log(`Attempting to delete post: ID=${id}, Title=${title}`);
      if (!adminKey.value) {
        const key = prompt('삭제를 위해 관리자 비밀번호를 입력해주세요:');
        if (!key) return;
        adminKey.value = key.trim();
      }

      const ok = confirm(`'${title}' 글을 정말 삭제하시겠습니까?`);
      if (!ok) return;

      try {
        const response = await fetch(`https://dongtan-api.infiniblue.workers.dev/api/posts/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminKey.value.trim()}`
          }
        });

        if (response.ok) {
          alert('삭제되었습니다.');
          adminKey.value = ''; 
          selectedPost.value = null;
          await fetchPosts();
        } else {
          let errorMessage = '비밀번호를 확인하세요.';
          const text = await response.text();
          try {
            const err = JSON.parse(text);
            errorMessage = err.error || errorMessage;
          } catch (e) {
            errorMessage = text || `에러 코드: ${response.status}`;
          }
          alert('삭제 실패: ' + errorMessage);
          adminKey.value = ''; 
        }
      } catch (error) {
        alert('삭제 중 오류 발생: ' + error.message);
      }
    };

    const confirmBatchDelete = async () => {
      if (!adminKey.value) {
        const key = prompt(`${selectedIds.value.length}개의 글을 삭제하기 위해 관리자 비밀번호를 입력해주세요:`);
        if (!key) return;
        adminKey.value = key.trim();
      }

      const ok = confirm(`선택한 ${selectedIds.value.length}개의 글을 정말 모두 삭제하시겠습니까?`);
      if (!ok) return;

      try {
        const response = await fetch('https://dongtan-api.infiniblue.workers.dev/api/posts/batch-delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminKey.value.trim()}`
          },
          body: JSON.stringify({ ids: selectedIds.value })
        });

        if (response.ok) {
          alert('모두 삭제되었습니다.');
          adminKey.value = '';
          selectedIds.value = [];
          await fetchPosts();
        } else {
          let errorMessage = '비밀번호를 확인하세요.';
          const text = await response.text();
          try {
            const err = JSON.parse(text);
            errorMessage = err.error || errorMessage;
          } catch (e) {
            errorMessage = text || `에러 코드: ${response.status}`;
          }
          alert('삭제 실패: ' + errorMessage);
          adminKey.value = '';
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
      confirmDelete, isEditing, startEdit, openEditor, closeEditor,
      currentPage, totalPages, paginatedPosts, setPage,
      selectedIds, confirmBatchDelete, isAllSelected, toggleSelectAll,
      searchQuery, filteredPosts,
      getThumbnail, parseContent
    };
  }
}
</script>

<style scoped>
.no-results {
  padding: 60px;
  text-align: center;
  margin: 40px auto;
  max-width: 600px;
}

.no-results-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 20px;
  opacity: 0.3;
}

.no-results p {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.clear-search-link {
  background: var(--accent);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.clear-search-link:hover {
  opacity: 0.8;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 20px;
  max-width: 500px;
  width: 100%;
  margin-bottom: 10px;
}

.search-icon {
  font-size: 1.2rem;
  opacity: 0.5;
}

.search-input {
  flex-grow: 1;
  border: none;
  background: transparent;
  padding: 10px 0;
  font-size: 1rem;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.search-clear {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 5px;
  font-size: 1rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.search-clear:hover {
  opacity: 1;
}

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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  position: relative;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 20px;
  border-radius: 20px;
  background: var(--card-bg);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  animation: apple-fade 0.3s ease-out;
}

.selected-count {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.batch-delete-btn {
  background: #ff3b30;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.batch-delete-btn:hover {
  background: #d70015;
}

.clear-selection-btn {
  background: none;
  border: 1px solid rgba(0,0,0,0.1);
  color: var(--text-secondary);
  padding: 7px 14px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.clear-selection-btn:hover {
  background: rgba(0,0,0,0.05);
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

.selection-overlay {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
}

.apple-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.info-table .apple-checkbox {
  border-color: rgba(0, 0, 0, 0.1);
  background: white;
}

.apple-checkbox:checked {
  background-color: var(--accent);
  border-color: var(--accent);
}

.apple-checkbox:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
  font-weight: 700;
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

/* 추가된 테이블 스타일 */
.other-posts-section {
  margin-top: 60px;
  animation: apple-fade 0.8s ease-out;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0;
  text-align: left;
}

.select-all-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
}

.table-container {
  overflow: hidden;
  padding: 0;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.info-table th {
  padding: 16px 24px;
  background: rgba(0,0,0,0.02);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.info-table td {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  cursor: pointer;
  transition: background 0.2s;
}

.info-table tr:last-child td {
  border-bottom: none;
}

.info-table tr:hover td {
  background: rgba(0,0,0,0.01);
}

.col-thumb {
  width: 80px;
}

.thumb-img {
  width: 50px;
  height: 50px;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  background-color: #e5e5e7;
}

.thumb-placeholder {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: rgba(0,0,0,0.05);
  border-radius: 8px;
}

.col-date {
  width: 150px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-text {
  font-weight: 600;
  font-size: 1.1rem;
}

.excerpt-hint {
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: block;
}

.col-action {
  width: 80px;
  text-align: right;
}

.action-btns {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 15px;
}

.table-delete-btn {
  background: none;
  border: none;
  color: #ff3b30;
  font-size: 1.1rem;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

tr:hover .table-delete-btn {
  opacity: 0.6;
}

.table-delete-btn:hover {
  opacity: 1 !important;
  transform: scale(1.2);
}

.arrow {
  color: var(--accent);
  font-weight: 600;
  transition: transform 0.2s;
}

tr:hover .arrow {
  transform: translateX(5px);
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
  gap: 15px;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--card-bg);
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  background: #e5e5e7;
  transform: scale(1.05);
}

.page-btn.active {
  background: var(--accent);
  color: white;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-btn {
  font-size: 1.2rem;
}

@media (max-width: 734px) {
  .hero-title { font-size: 2.5rem; }
  .modal-image { height: 250px; }
  .modal-body h1 { font-size: 1.8rem; }
  .modal-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  
  .col-date { width: 100px; font-size: 0.8rem; }
  .title-text { font-size: 1rem; }
  .excerpt-hint { display: none; }
  .info-table td, .info-table th { padding: 16px; }
  
  .batch-actions {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    justify-content: center;
    z-index: 100;
  }
}
</style>