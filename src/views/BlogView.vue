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
      <div v-show="showEditor" class="editor-container glass-card">
        <h2>{{ isEditing ? (currentLang === 'ko' ? '포스트 수정하기' : 'Edit Post') : (currentLang === 'ko' ? '새로운 포스트 작성' : 'Write New Post') }}</h2>
        <form @submit.prevent="submitPost" class="apple-form">
          <div class="form-group">
            <label>{{ currentLang === 'ko' ? '제목' : 'Title' }}</label>
            <input v-model="newPost.title" required placeholder="글 제목을 입력하세요">
          </div>
          <div class="form-group">
            <label>{{ currentLang === 'ko' ? '본문 내용' : 'Content' }}</label>
            <div class="rich-editor-wrap">
              <!-- 서식 툴바 -->
              <div class="editor-toolbar">
                <button type="button" @mousedown.prevent="exec('bold')" title="굵게"><b>B</b></button>
                <button type="button" @mousedown.prevent="exec('italic')" title="기울임"><i>I</i></button>
                <button type="button" @mousedown.prevent="exec('underline')" title="밑줄"><u>U</u></button>
                <div class="toolbar-sep"></div>
                <select @mousedown.stop @change="execFontSize($event)" title="글자 크기">
                  <option value="">크기</option>
                  <option value="1">매우 작게</option>
                  <option value="2">작게</option>
                  <option value="3">보통</option>
                  <option value="4">크게</option>
                  <option value="5">매우 크게</option>
                  <option value="6">특대</option>
                </select>
                <select @mousedown.stop @change="execFormatBlock($event)" title="단락 형식">
                  <option value="">형식</option>
                  <option value="p">본문</option>
                  <option value="h1">제목 1</option>
                  <option value="h2">제목 2</option>
                  <option value="h3">제목 3</option>
                </select>
                <div class="toolbar-sep"></div>
                <button type="button" @mousedown.prevent="exec('justifyLeft')" title="왼쪽 정렬">≡</button>
                <button type="button" @mousedown.prevent="exec('justifyCenter')" title="가운데 정렬">☰</button>
                <button type="button" @mousedown.prevent="exec('justifyRight')" title="오른쪽 정렬">≡</button>
                <div class="toolbar-sep"></div>
                <label class="color-picker-wrap" title="글자 색">
                  <span>색상</span>
                  <input type="color" value="#000000" @mousedown="saveColorRange" @input="execColor($event)" class="color-input">
                </label>
                <div class="toolbar-sep"></div>
                <label class="img-upload-btn" title="이미지 첨부">
                  그림 첨부
                  <input type="file" accept="image/*" style="display:none" @change="insertImageFile($event)">
                </label>
              </div>
              <!-- 본문 입력 영역 -->
              <div style="position:relative">
                <div
                  ref="editorEl"
                  contenteditable="true"
                  class="rich-editor"
                  @input="onEditorInput"
                  @paste="onPaste"
                  @mouseover="onEditorMouseover"
                  @mouseleave="onEditorMouseleave"
                ></div>
                <!-- 이미지 리사이즈 핸들 -->
                <div
                  v-if="resizeHandle.visible"
                  class="img-resize-handle"
                  :style="resizeHandle.style"
                  @mousedown.prevent="startResize"
                  @mouseleave="onHandleMouseleave"
                ></div>
              </div>
              <p v-if="imageUploading" class="upload-notice">📤 이미지 업로드 중...</p>
            </div>
          </div>
          <div class="form-group admin-key">
            <label>{{ currentLang === 'ko' ? '관리자 비밀번호' : 'Admin Key' }}</label>
            <input v-model="adminKey" type="password" required placeholder="API SECRET을 입력하세요" autocomplete="new-password">
          </div>
          <button type="submit" class="submit-btn" :disabled="submitting">
            {{ submitting ? (currentLang === 'ko' ? '처리 중...' : 'Processing...') : (currentLang === 'ko' ? '저장' : 'Save') }}
          </button>
        </form>
      </div>

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
              <tbody v-if="!loading && safePaginatedPosts && safePaginatedPosts.length > 0">
                <tr v-for="post in safePaginatedPosts" :key="post.id" @click="viewPostById(post.id)">
                  <td class="col-check" @click.stop>
                    <input type="checkbox" :value="post.id" v-model="selectedIds" class="apple-checkbox">
                  </td>
                  <td class="col-thumb">
                    <div v-if="post.thumbnail" class="thumb-img" :style="{ backgroundImage: `url(${post.thumbnail})` }"></div>
                    <div v-else class="thumb-placeholder">✨</div>
                  </td>
                  <td class="col-date">{{ post.date }}</td>
                  <td class="col-title">
                    <div class="title-wrapper">
                      <span class="title-text">{{ post.title }}</span>
                      <span class="excerpt-hint">{{ post.excerpt }}</span>
                    </div>
                  </td>
                  <td class="col-action">
                    <div class="action-btns">
                      <button class="table-delete-btn" @click.stop="confirmDeleteById(post.id, post.title)">✕</button>
                      <span class="arrow">→</span>
                    </div>
                  </td>
                </tr>
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
import { ref, computed, inject, onMounted, nextTick } from 'vue';

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
    const t = computed(() => TRANSLATIONS[currentLang.value]);
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
    const newPost = ref({ title: '', content: '' });

    const pageSize = ref(10);
    const currentPage = ref(1);

    // 리치 에디터
    const editorEl = ref(null);
    const imageUploading = ref(false);

    const exec = (cmd, val = null) => {
      document.execCommand(cmd, false, val);
      editorEl.value && (newPost.value.content = editorEl.value.innerHTML);
    };

    const execFontSize = (e) => {
      if (e.target.value) exec('fontSize', e.target.value);
      e.target.value = '';
    };

    const execFormatBlock = (e) => {
      if (e.target.value) exec('formatBlock', e.target.value);
      e.target.value = '';
    };

    // 글자색: color picker 열기 전 selection 저장
    let _savedColorRange = null;
    const saveColorRange = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) _savedColorRange = sel.getRangeAt(0).cloneRange();
    };
    const execColor = (e) => {
      if (!editorEl.value) return;
      editorEl.value.focus();
      if (_savedColorRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(_savedColorRange);
      }
      document.execCommand('foreColor', false, e.target.value);
      newPost.value.content = editorEl.value.innerHTML;
    };

    const onEditorInput = () => {
      newPost.value.content = editorEl.value ? editorEl.value.innerHTML : '';
    };

    const uploadToR2 = async (file) => {
      const ext = (file.type || 'image/png').split('/')[1] || 'png';
      const filename = (file.name && file.name.length > 4) ? file.name : `paste-${Date.now()}.${ext}`;
      const formData = new FormData();
      formData.append('file', file, filename);
      const res = await fetch('https://dongtan-api.infiniblue.workers.dev/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!data.url) throw new Error(data.error || '업로드 실패');
      return data.url;
    };

    // 에디터에 포커스+커서를 복원한 뒤 execCommand로 img 삽입
    const insertImgHtml = (src, savedRange) => {
      if (!editorEl.value) return null;

      // 포커스 명시적 복원
      editorEl.value.focus();

      // 커서 복원 (없으면 끝으로)
      const sel = window.getSelection();
      if (savedRange) {
        sel.removeAllRanges();
        sel.addRange(savedRange);
      } else {
        const r = document.createRange();
        r.selectNodeContents(editorEl.value);
        r.collapse(false);
        sel.removeAllRanges();
        sel.addRange(r);
      }

      const marker = `img-${Date.now()}`;
      const html = `<img data-marker="${marker}" src="${src}" style="max-width:100%;display:block;border-radius:8px;margin:8px 0;">`;
      document.execCommand('insertHTML', false, html);
      newPost.value.content = editorEl.value.innerHTML;

      return editorEl.value.querySelector(`[data-marker="${marker}"]`);
    };

    // 1) base64로 즉시 표시 → 2) R2 업로드 후 src 교체
    const handleImageInsert = (file, savedRange) => {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        // base64로 즉시 삽입 — src는 절대 교체하지 않음 (항상 보임)
        const imgEl = insertImgHtml(ev.target.result, savedRange);
        imageUploading.value = true;
        try {
          const r2Url = await uploadToR2(file);
          if (imgEl && imgEl.parentNode) {
            // src는 그대로 두고, R2 URL은 data 속성에만 저장
            imgEl.dataset.r2 = r2Url;
            imgEl.removeAttribute('data-marker');
          }
        } catch {
          if (imgEl) imgEl.removeAttribute('data-marker');
        } finally {
          imageUploading.value = false;
          if (editorEl.value) newPost.value.content = editorEl.value.innerHTML;
        }
      };
      reader.readAsDataURL(file);
    };

    // 저장 직전에 base64 src → R2 URL로 교체한 content 반환
    const getContentForSave = () => {
      if (!editorEl.value) return newPost.value.content;
      const clone = editorEl.value.cloneNode(true);
      clone.querySelectorAll('img[data-r2]').forEach(img => {
        img.src = img.dataset.r2;
        img.removeAttribute('data-r2');
        img.removeAttribute('data-marker');
      });
      return clone.innerHTML;
    };

    const onPaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) return;
          const sel = window.getSelection();
          const savedRange = (sel && sel.rangeCount > 0) ? sel.getRangeAt(0).cloneRange() : null;
          handleImageInsert(file, savedRange);
          return;
        }
      }
    };

    const insertImageFile = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      handleImageInsert(file, null);
      e.target.value = '';
    };

    // 이미지 리사이즈 핸들
    const resizeHandle = ref({ visible: false, style: {}, img: null });

    const updateHandlePos = (img) => {
      if (!editorEl.value || !img) return;
      const edRect = editorEl.value.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();
      resizeHandle.value.style = {
        right: (edRect.right - imgRect.right + 2) + 'px',
        bottom: (edRect.bottom - imgRect.bottom + 2) + 'px',
      };
    };

    const onEditorMouseover = (e) => {
      if (e.target.tagName !== 'IMG') return;
      resizeHandle.value.img = e.target;
      resizeHandle.value.visible = true;
      updateHandlePos(e.target);
    };

    const onEditorMouseleave = () => {
      if (resizeHandle.value._resizing) return;
      resizeHandle.value.visible = false;
    };

    const onHandleMouseleave = (e) => {
      if (resizeHandle.value._resizing) return;
      // 이미지로 다시 들어갔으면 유지
      if (e.relatedTarget === resizeHandle.value.img) return;
      resizeHandle.value.visible = false;
    };

    const startResize = (e) => {
      const img = resizeHandle.value.img;
      if (!img) return;
      resizeHandle.value._resizing = true;
      const startX = e.clientX;
      const startWidth = img.getBoundingClientRect().width;

      const onMove = (mv) => {
        const w = Math.max(40, startWidth + mv.clientX - startX);
        img.style.width = w + 'px';
        img.style.maxWidth = '100%';
        updateHandlePos(img);
      };

      const onUp = () => {
        resizeHandle.value._resizing = false;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        newPost.value.content = editorEl.value ? editorEl.value.innerHTML : '';
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    };

    // ... Pagination etc ...

    const getThumbnail = (post) => {
      if (!post.content) return null;
      const match = post.content.match(/src="([^"]+)"/);
      return match ? match[1] : null;
    };

    const parseContent = (content) => {
        return content; // Tiptap content is already HTML
    };

    const fetchPosts = async () => {
      loading.value = true;
      try {
        const response = await fetch('https://dongtan-api.infiniblue.workers.dev/api/posts');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
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
      return Math.ceil(posts.length / pageSize.value);
    });
    
    const safePaginatedPosts = computed(() => {
      const posts = filteredPosts.value || [];
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return posts.slice(start, end).map(post => {
        if (!post) return { id: 0, title: '', date: '', excerpt: '', thumbnail: null };
        return {
          id: post.id || 0,
          title: post.title || '제목 없음',
          date: post.created_at ? formatDate(post.created_at) : '',
          excerpt: post.content ? post.content.substring(0, 50) + '...' : '',
          thumbnail: getThumbnail(post)
        };
      });
    });

    // Multi-select logic (Update for table)
    const isAllSelected = computed(() => {
      if (safePaginatedPosts.value.length === 0) return false;
      return safePaginatedPosts.value.every(post => selectedIds.value.includes(post.id));
    });

    const toggleSelectAll = () => {
      const currentIds = safePaginatedPosts.value.map(p => p.id);
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
      adminKey.value = '';
      showEditor.value = true;
      nextTick(() => { if (editorEl.value) editorEl.value.innerHTML = ''; });
    };

    const closeEditor = () => {
      showEditor.value = false;
      isEditing.value = false;
      editId.value = null;
      adminKey.value = '';
    };

    const startEdit = (post) => {
      isEditing.value = true;
      editId.value = post.id;
      newPost.value = { title: post.title, content: post.content };
      adminKey.value = '';
      selectedPost.value = null;
      showEditor.value = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      nextTick(() => { if (editorEl.value) editorEl.value.innerHTML = post.content || ''; });
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
          body: JSON.stringify({ title: newPost.value.title, content: getContentForSave() })
        });

        if (response.ok) {
          alert(isEditing.value ? '수정되었습니다!' : '성공적으로 저장되었습니다!');
          newPost.value = { title: '', content: '' };
          if (editorEl.value) editorEl.value.innerHTML = '';
          adminKey.value = '';
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

    const viewPostById = (id) => {
      const post = posts.value.find(p => p.id === id);
      if (post) selectedPost.value = post;
    };

    const confirmDeleteById = (id, title) => {
      confirmDelete(id, title);
    };

    onMounted(fetchPosts);

    return {
      currentLang, t, posts, loading, formatDate, viewPostById,
      showEditor, newPost, submitPost, submitting, adminKey, selectedPost,
      confirmDelete, isEditing, startEdit, openEditor, closeEditor,
      currentPage, totalPages, safePaginatedPosts, setPage, confirmDeleteById,
      selectedIds, confirmBatchDelete, isAllSelected, toggleSelectAll,
      searchQuery, filteredPosts,
      getThumbnail, parseContent,
      editorEl, imageUploading, exec, execFontSize, execFormatBlock,
      saveColorRange, execColor,
      onEditorInput, onPaste, insertImageFile,
      resizeHandle, onEditorMouseover, onEditorMouseleave, onHandleMouseleave, startResize
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
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  flex: 1;
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

.rich-editor-wrap {
  border: 1.5px solid rgba(0,0,0,0.12);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.rich-editor-wrap:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0,122,255,0.12);
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  background: #f5f5f7;
  border-bottom: 1px solid rgba(0,0,0,0.08);
  flex-wrap: wrap;
}

.editor-toolbar button {
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.12);
  background: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.15s;
  line-height: 1;
}

.editor-toolbar button:hover {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.editor-toolbar select {
  padding: 5px 8px;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.12);
  background: #fff;
  font-size: 0.82rem;
  cursor: pointer;
}

.toolbar-sep {
  width: 1px;
  height: 20px;
  background: rgba(0,0,0,0.12);
  margin: 0 2px;
}

.img-upload-btn {
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.12);
  background: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
}

.img-upload-btn:hover {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.color-picker-wrap {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.12);
  background: #fff;
  cursor: pointer;
  font-size: 0.82rem;
  transition: all 0.15s;
}

.color-picker-wrap:hover {
  background: #f0f0f0;
}

.color-input {
  width: 22px;
  height: 22px;
  border: none;
  padding: 0;
  cursor: pointer;
  background: none;
  border-radius: 3px;
}

.rich-editor {
  min-height: 260px;
  padding: 16px;
  outline: none;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-primary);
  overflow-y: auto;
}

.rich-editor:empty::before {
  content: '본문을 입력하세요. 이미지는 복사 후 Ctrl+V로 붙여넣기 할 수 있습니다.';
  color: #aaa;
  pointer-events: none;
}

.rich-editor img {
  max-width: 100%;
  border-radius: 8px;
  margin: 8px 0;
  display: block;
}

.upload-notice {
  padding: 6px 16px;
  font-size: 0.85rem;
  color: var(--accent);
  background: rgba(0,122,255,0.06);
  margin: 0;
}

.img-resize-handle {
  position: absolute;
  width: 14px;
  height: 14px;
  background: var(--accent);
  border: 2px solid #fff;
  border-radius: 3px;
  cursor: se-resize;
  z-index: 10;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
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

/* Tiptap 에디터 */
.tiptap-editor {
  border: 1.5px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  min-height: 250px;
  padding: 16px;
  background: #ffffff;
  cursor: text;
}

.tiptap-editor:focus-within {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
}

/* Tiptap 내부 ProseMirror div */
.tiptap-editor .ProseMirror {
  min-height: 220px;
  outline: none;
  line-height: 1.7;
  font-size: 1rem;
  color: var(--text-primary);
}

.tiptap-editor .ProseMirror p {
  margin: 0 0 10px;
}

.tiptap-editor .ProseMirror img {
  max-width: 100%;
  height: auto !important;
  border-radius: 10px;
  margin: 10px 0;
  display: block !important;
  cursor: default;
}

.tiptap-editor .ProseMirror img.ProseMirror-selectednode {
  outline: 3px solid var(--accent);
}

.editor-toolbar {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
    padding: 8px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #eee;
}

.editor-toolbar button {
    padding: 4px 12px;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
    border-radius: 4px;
}

.editor-toolbar button.is-active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
}

/* placeholder */
.tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
  content: '본문을 입력하세요...';
  color: #aaa;
  pointer-events: none;
  float: left;
  height: 0;
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