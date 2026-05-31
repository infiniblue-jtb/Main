<template>
  <div class="blog-page">
    <!-- ═══ HERO ═══ -->
    <header class="blog-hero">
      <div class="hero-shapes">
        <div class="shape s1"></div>
        <div class="shape s2"></div>
        <div class="shape s3"></div>
      </div>
      <div class="hero-inner">
        <div class="hero-badge">✦ HappyDongtan</div>
        <h1 class="hero-title">{{ t.title }}</h1>
        <p class="hero-subtitle">{{ t.desc }}</p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-num">{{ posts.length }}</span>
            <span class="stat-label">{{ currentLang === 'ko' ? '게시글' : 'Posts' }}</span>
          </div>
          <div class="stat-div"></div>
          <div class="stat-item">
            <span class="stat-num">{{ categories.length }}</span>
            <span class="stat-label">{{ currentLang === 'ko' ? '카테고리' : 'Categories' }}</span>
          </div>
        </div>
      </div>

      <!-- 검색 + 글쓰기 -->
      <div class="blog-toolbar">
        <div class="search-wrap">
          <span class="si">🔍</span>
          <input
            v-model="searchQuery"
            :placeholder="currentLang === 'ko' ? '제목·내용·날짜 검색...' : 'Search...'"
            class="search-input"
          >
          <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">✕</button>
        </div>
        <button v-if="!showEditor" @click="openEditor()" class="write-btn">
          ✍️ {{ currentLang === 'ko' ? '글 작성하기' : 'Write' }}
        </button>
        <button v-else @click="closeEditor" class="cancel-btn">
          {{ currentLang === 'ko' ? '취소' : 'Cancel' }}
        </button>
      </div>
    </header>

    <!-- ═══ BODY ═══ -->
    <div class="blog-body">

      <!-- 에디터 폼 -->
      <transition name="slide-down">
        <div v-if="showEditor" class="editor-card">
          <h2 class="editor-title">
            {{ isEditing ? (currentLang === 'ko' ? '포스트 수정' : 'Edit Post') : (currentLang === 'ko' ? '새 포스트 작성' : 'New Post') }}
          </h2>
          <form @submit.prevent="submitPost" class="editor-form">
            <div class="form-row two-col">
              <div class="form-group">
                <label>{{ currentLang === 'ko' ? '제목' : 'Title' }}</label>
                <input v-model="newPost.title" required placeholder="글 제목을 입력하세요">
              </div>
              <div class="form-group">
                <label>{{ currentLang === 'ko' ? '구분 (카테고리)' : 'Category' }}</label>
                <input v-model="newPost.category" placeholder="예: 생활정보, 맛집, 육아...">
              </div>
            </div>
            <div class="form-group">
              <label>{{ currentLang === 'ko' ? '본문 내용' : 'Content' }}</label>
              <div class="rich-editor-wrap">
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
                  <button type="button" @mousedown.prevent="exec('justifyLeft')" title="왼쪽">≡</button>
                  <button type="button" @mousedown.prevent="exec('justifyCenter')" title="가운데">☰</button>
                  <button type="button" @mousedown.prevent="exec('justifyRight')" title="오른쪽">≡</button>
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
                  <div class="toolbar-sep"></div>
                  <span class="toolbar-label">이미지 배치:</span>
                  <button type="button" @mousedown.prevent="setImgLayout('100%')" :class="['layout-btn', { active: imgLayout === '100%' }]" title="전체 폭">■</button>
                  <button type="button" @mousedown.prevent="setImgLayout('48%')" :class="['layout-btn', { active: imgLayout === '48%' }]" title="2열 나란히">▪▪</button>
                  <button type="button" @mousedown.prevent="setImgLayout('30%')" :class="['layout-btn', { active: imgLayout === '30%' }]" title="3열 나란히">▫▫▫</button>
                </div>
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
                  <div
                    v-if="resizeHandle.visible"
                    class="img-resize-handle"
                    :style="resizeHandle.style"
                    @mousedown.prevent="startResize"
                    @mouseleave="onHandleMouseleave"
                  ></div>
                </div>
                <p v-if="imageUploading" class="upload-notice">📤 이미지 처리 중...</p>
              </div>
            </div>
            <div class="form-group">
              <label>{{ currentLang === 'ko' ? '관리자 비밀번호' : 'Admin Key' }}</label>
              <input v-model="adminKey" type="password" required placeholder="API SECRET을 입력하세요" autocomplete="new-password">
            </div>
            <div class="form-actions">
              <button type="button" @click="closeEditor" class="btn-secondary">취소</button>
              <button type="submit" class="btn-primary" :disabled="submitting">
                {{ submitting ? '처리 중...' : (currentLang === 'ko' ? '저장하기' : 'Save') }}
              </button>
            </div>
          </form>
        </div>
      </transition>

      <!-- 카테고리 필터 -->
      <div v-if="!loading && categories.length > 0" class="cat-filter-row">
        <button :class="['cat-chip', { active: activeCat === '' }]" @click="activeCat = ''">
          전체 <span class="chip-count">{{ posts.length }}</span>
        </button>
        <button
          v-for="cat in categories"
          :key="cat"
          :class="['cat-chip', { active: activeCat === cat }]"
          @click="activeCat = cat"
        >
          {{ cat }}
          <span class="chip-count">{{ posts.filter(p => p.category === cat).length }}</span>
        </button>
      </div>

      <!-- 로딩 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <!-- 빈 상태 -->
      <div v-else-if="filteredPosts.length === 0" class="empty-state">
        <div class="empty-icon">{{ searchQuery || activeCat ? '🔍' : '📝' }}</div>
        <p v-if="searchQuery || activeCat">
          {{ currentLang === 'ko' ? '검색 결과가 없습니다.' : 'No results found.' }}
        </p>
        <p v-else>{{ currentLang === 'ko' ? '아직 작성된 포스트가 없습니다.' : 'No posts yet.' }}</p>
        <button v-if="searchQuery || activeCat" @click="searchQuery = ''; activeCat = ''" class="btn-reset">
          초기화
        </button>
      </div>

      <!-- 포스트 목록 -->
      <div v-else class="post-list">
        <!-- 일괄선택 헤더 -->
        <div class="list-header">
          <label class="check-all-wrap">
            <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="apple-checkbox">
            <span>{{ currentLang === 'ko' ? '전체 선택' : 'Select All' }}</span>
          </label>
          <span class="list-count">{{ filteredPosts.length }}개</span>
        </div>

        <article
          v-for="post in safePaginatedPosts"
          :key="post.id"
          class="post-card"
          @click="viewPostById(post.id)"
        >
          <div class="post-check" @click.stop>
            <input type="checkbox" :value="post.id" v-model="selectedIds" class="apple-checkbox">
          </div>

          <div class="post-thumb-wrap">
            <div
              v-if="post.thumbnail"
              class="post-thumb"
              :style="{ backgroundImage: `url(${post.thumbnail})` }"
            ></div>
            <div v-else class="post-thumb post-thumb-empty">
              <span>{{ post.category ? post.category[0] : '✦' }}</span>
            </div>
          </div>

          <div class="post-body">
            <div class="post-meta">
              <span v-if="post.category" class="cat-badge" :style="catStyle(post.category)">{{ post.category }}</span>
              <span class="post-date">{{ post.date }}</span>
            </div>
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-excerpt">{{ post.excerpt }}</p>
          </div>

          <div class="post-right">
            <button class="del-btn" @click.stop="confirmDeleteById(post.id, post.title)" title="삭제">✕</button>
            <span class="go-arrow">→</span>
          </div>
        </article>

        <!-- 페이지네이션 -->
        <div v-if="totalPages > 1" class="pagination">
          <button class="pg-btn" :disabled="currentPage === 1" @click="setPage(currentPage - 1)">‹</button>
          <button
            v-for="p in totalPages" :key="p"
            :class="['pg-btn', { active: currentPage === p }]"
            @click="setPage(p)"
          >{{ p }}</button>
          <button class="pg-btn" :disabled="currentPage === totalPages" @click="setPage(currentPage + 1)">›</button>
        </div>
      </div>

      <!-- 일괄 삭제 바 -->
      <transition name="slide-up">
        <div v-if="selectedIds.length > 0" class="batch-bar">
          <span>{{ selectedIds.length }}개 선택됨</span>
          <button @click="confirmBatchDelete" class="batch-del-btn">선택 삭제</button>
          <button @click="selectedIds = []" class="batch-cancel-btn">해제</button>
        </div>
      </transition>

      <AdComponent slotId="9173007135" />
    </div>

    <!-- ═══ 포스트 모달 ═══ -->
    <transition name="modal-fade">
      <div v-if="selectedPost" class="modal-overlay" @click="selectedPost = null">
        <div class="modal-box" @click.stop>
          <button class="modal-close" @click="selectedPost = null">✕</button>
          <div class="modal-header">
            <div class="modal-meta">
              <span v-if="selectedPost.category" class="cat-badge" :style="catStyle(selectedPost.category)">
                {{ selectedPost.category }}
              </span>
              <span class="modal-date">{{ formatDate(selectedPost.created_at) }}</span>
            </div>
            <div class="modal-admin-btns">
              <button class="edit-btn" @click="startEdit(selectedPost)">{{ currentLang === 'ko' ? '수정하기' : 'Edit' }}</button>
              <button class="delete-pill-btn" @click="confirmDelete(selectedPost.id, selectedPost.title)">{{ currentLang === 'ko' ? '삭제하기' : 'Delete' }}</button>
            </div>
          </div>
          <h1 class="modal-title">{{ selectedPost.title }}</h1>
          <div class="modal-content" v-html="parseContent(selectedPost.content)"></div>
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
    desc: '동탄 주민들이 직접 쓰는 생생한 동네 이야기',
  },
  en: {
    title: 'Blog',
    desc: 'Real stories from Dongtan residents',
  }
};

const CAT_COLORS = [
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#dcfce7', text: '#15803d' },
  { bg: '#fef9c3', text: '#a16207' },
  { bg: '#fce7f3', text: '#be185d' },
  { bg: '#ede9fe', text: '#6d28d9' },
  { bg: '#ffedd5', text: '#c2410c' },
  { bg: '#cffafe', text: '#0e7490' },
  { bg: '#fee2e2', text: '#b91c1c' },
];

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
    const activeCat = ref('');
    const newPost = ref({ title: '', content: '', category: '' });

    const pageSize = ref(10);
    const currentPage = ref(1);

    // 카테고리 색상
    const catStyle = (cat) => {
      if (!cat) return {};
      let hash = 0;
      for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
      const c = CAT_COLORS[Math.abs(hash) % CAT_COLORS.length];
      return { backgroundColor: c.bg, color: c.text };
    };

    // 리치 에디터
    const editorEl = ref(null);
    const imageUploading = ref(false);
    const imgLayout = ref('100%'); // 이미지 배치 모드: 100% / 48% / 30%
    const setImgLayout = (v) => { imgLayout.value = v; };

    const exec = (cmd, val = null) => {
      document.execCommand(cmd, false, val);
      editorEl.value && (newPost.value.content = editorEl.value.innerHTML);
    };
    const execFontSize = (e) => { if (e.target.value) exec('fontSize', e.target.value); e.target.value = ''; };
    const execFormatBlock = (e) => { if (e.target.value) exec('formatBlock', e.target.value); e.target.value = ''; };

    let _savedColorRange = null;
    const saveColorRange = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) _savedColorRange = sel.getRangeAt(0).cloneRange();
    };
    const execColor = (e) => {
      if (!editorEl.value) return;
      editorEl.value.focus();
      if (_savedColorRange) { const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(_savedColorRange); }
      document.execCommand('foreColor', false, e.target.value);
      newPost.value.content = editorEl.value.innerHTML;
    };
    const onEditorInput = () => { newPost.value.content = editorEl.value ? editorEl.value.innerHTML : ''; };

    // 이미지: canvas 압축 → base64
    const compressImageToBase64 = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (ev) => {
        const img = new window.Image();
        img.onerror = reject;
        img.onload = () => {
          const MAX_W = 1000;
          let w = img.naturalWidth, h = img.naturalHeight;
          if (w > MAX_W) { h = Math.round(h * MAX_W / w); w = MAX_W; }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.72));
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

    const insertImgNode = (src, savedRange) => {
      const img = document.createElement('img');
      img.src = src;
      const w = imgLayout.value;
      const isWide = w === '100%';
      img.style.cssText = isWide
        ? 'width:100%;max-width:100%;border-radius:8px;margin:8px 0;display:block;cursor:default;'
        : `width:${w};max-width:100%;border-radius:8px;margin:4px 1%;display:inline-block;vertical-align:top;cursor:default;`;
      if (savedRange && editorEl.value && editorEl.value.contains(savedRange.commonAncestorContainer)) {
        savedRange.deleteContents();
        savedRange.insertNode(img);
        const br = document.createElement('br');
        img.after(br);
        savedRange.setStartAfter(br); savedRange.collapse(true);
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(savedRange);
      } else if (editorEl.value) { editorEl.value.appendChild(img); }
      newPost.value.content = editorEl.value ? editorEl.value.innerHTML : '';
      return img;
    };

    // R2 업로드 (백그라운드)
    const uploadToR2 = async (file) => {
      const ext = (file.type || 'image/png').split('/')[1] || 'png';
      const filename = (file.name && file.name.length > 6) ? file.name : `img-${Date.now()}.${ext}`;
      const fd = new FormData();
      fd.append('file', file, filename);
      const res = await fetch('https://dongtan-api.infiniblue.workers.dev/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.url) throw new Error(data.error || 'Upload failed');
      return data.url;
    };

    const handleImageInsert = async (file, savedRange) => {
      imageUploading.value = true;
      try {
        // 1) base64로 즉시 삽입 (바로 보임)
        const b64 = await compressImageToBase64(file);
        const imgEl = insertImgNode(b64, savedRange);
        // 2) R2 업로드 후 src 교체 + data-r2 속성 저장
        try {
          const r2Url = await uploadToR2(file);
          if (imgEl && imgEl.parentNode) {
            imgEl.dataset.r2 = r2Url;
          }
        } catch { /* R2 실패 시 base64 유지 */ }
      } catch (err) { alert('이미지 처리 오류: ' + err.message); }
      finally { imageUploading.value = false; }
    };

    // 저장 시 data-r2 → src로 교체 (DB에는 R2 URL 저장)
    const getContentForSave = () => {
      if (!editorEl.value) return newPost.value.content;
      const clone = editorEl.value.cloneNode(true);
      clone.querySelectorAll('img[data-r2]').forEach(img => {
        img.src = img.dataset.r2;
        img.removeAttribute('data-r2');
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
    const insertImageFile = (e) => { const f = e.target.files[0]; if (!f) return; handleImageInsert(f, null); e.target.value = ''; };

    // 리사이즈 핸들
    const resizeHandle = ref({ visible: false, style: {}, img: null, _resizing: false });
    const updateHandlePos = (img) => {
      if (!editorEl.value || !img) return;
      const pr = editorEl.value.parentElement.getBoundingClientRect();
      const ir = img.getBoundingClientRect();
      resizeHandle.value.style = { left: (ir.right - pr.left - 14) + 'px', top: (ir.bottom - pr.top - 14) + 'px' };
    };
    const onEditorMouseover = (e) => {
      if (e.target.tagName !== 'IMG') return;
      resizeHandle.value.img = e.target; resizeHandle.value.visible = true; updateHandlePos(e.target);
    };
    const onEditorMouseleave = (e) => {
      if (resizeHandle.value._resizing) return;
      const rt = e.relatedTarget;
      if (rt && rt.classList && rt.classList.contains('img-resize-handle')) return;
      resizeHandle.value.visible = false;
    };
    const onHandleMouseleave = (e) => {
      if (resizeHandle.value._resizing) return;
      if (e.relatedTarget === resizeHandle.value.img) return;
      resizeHandle.value.visible = false;
    };
    const startResize = (e) => {
      const img = resizeHandle.value.img; if (!img) return;
      resizeHandle.value._resizing = true;
      const startX = e.clientX, startW = img.getBoundingClientRect().width;
      const onMove = (mv) => { img.style.width = Math.max(40, startW + mv.clientX - startX) + 'px'; img.style.maxWidth = 'none'; updateHandlePos(img); };
      const onUp = () => { resizeHandle.value._resizing = false; resizeHandle.value.visible = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); if (editorEl.value) newPost.value.content = editorEl.value.innerHTML; };
      document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
    };

    // URL 정상화
    const normalizeImgUrl = (url) => url ? url.replace(/https?:\/\/images\.dongtan\.infiniblue\.com\//, 'https://dongtan-api.infiniblue.workers.dev/api/images/') : url;

    const getThumbnail = (post) => {
      if (!post.content) return null;
      const m = post.content.match(/src="([^"]+)"/);
      if (!m) return null;
      return m[1].startsWith('data:') ? m[1] : normalizeImgUrl(m[1]);
    };

    const parseContent = (content) => {
      if (!content) return '';
      return content.replace(/src="(https?:\/\/images\.dongtan\.infiniblue\.com\/[^"]+)"/g, (_, u) => `src="${normalizeImgUrl(u)}"`);
    };

    const fetchPosts = async () => {
      loading.value = true;
      try {
        const res = await fetch('https://dongtan-api.infiniblue.workers.dev/api/posts');
        if (!res.ok) throw new Error('Network error');
        posts.value = await res.json();
        selectedIds.value = [];
      } catch (e) { console.error(e); }
      finally { loading.value = false; }
    };

    const categories = computed(() => {
      const cats = new Set(posts.value.map(p => p.category).filter(Boolean));
      return [...cats].sort();
    });

    const filteredPosts = computed(() => {
      let result = posts.value || [];
      if (activeCat.value) result = result.filter(p => p.category === activeCat.value);
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(p => {
          if (!p) return false;
          return (p.title || '').toLowerCase().includes(q)
            || (p.content || '').toLowerCase().includes(q)
            || formatDate(p.created_at).toLowerCase().includes(q)
            || (p.category || '').toLowerCase().includes(q);
        });
      }
      return result;
    });

    const totalPages = computed(() => Math.ceil((filteredPosts.value || []).length / pageSize.value));

    const safePaginatedPosts = computed(() => {
      const list = filteredPosts.value || [];
      const start = (currentPage.value - 1) * pageSize.value;
      return list.slice(start, start + pageSize.value).map(post => {
        if (!post) return { id: 0, title: '', date: '', excerpt: '', thumbnail: null, category: '' };
        return {
          id: post.id || 0,
          title: post.title || '제목 없음',
          date: post.created_at ? formatDate(post.created_at) : '',
          excerpt: post.content ? post.content.replace(/<[^>]+>/g, '').trim().substring(0, 80) : '',
          thumbnail: getThumbnail(post),
          category: post.category || '',
        };
      });
    });

    const isAllSelected = computed(() =>
      safePaginatedPosts.value.length > 0 && safePaginatedPosts.value.every(p => selectedIds.value.includes(p.id))
    );

    const toggleSelectAll = () => {
      const ids = safePaginatedPosts.value.map(p => p.id);
      if (isAllSelected.value) selectedIds.value = selectedIds.value.filter(id => !ids.includes(id));
      else { const n = [...selectedIds.value]; ids.forEach(id => { if (!n.includes(id)) n.push(id); }); selectedIds.value = n; }
    };

    const setPage = (p) => { if (p >= 1 && p <= totalPages.value) { currentPage.value = p; window.scrollTo({ top: 0, behavior: 'smooth' }); } };

    const formatDate = (dateStr) => {
      const d = dateStr ? new Date(dateStr) : new Date();
      return d.toLocaleDateString(currentLang.value === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const openEditor = () => {
      isEditing.value = false; newPost.value = { title: '', content: '', category: '' }; adminKey.value = ''; showEditor.value = true;
      nextTick(() => { if (editorEl.value) editorEl.value.innerHTML = ''; });
    };
    const closeEditor = () => { showEditor.value = false; isEditing.value = false; editId.value = null; adminKey.value = ''; };
    const startEdit = (post) => {
      isEditing.value = true; editId.value = post.id;
      newPost.value = { title: post.title, content: post.content, category: post.category || '' };
      adminKey.value = ''; selectedPost.value = null; showEditor.value = true;
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
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminKey.value.trim()}` },
          body: JSON.stringify({ title: newPost.value.title, content: getContentForSave(), category: newPost.value.category })
        });
        if (res.ok) {
          alert(isEditing.value ? '수정되었습니다!' : '저장되었습니다!');
          newPost.value = { title: '', content: '', category: '' };
          if (editorEl.value) editorEl.value.innerHTML = '';
          adminKey.value = ''; showEditor.value = false; isEditing.value = false;
          await fetchPosts();
        } else {
          const text = await res.text();
          let msg = '비밀번호를 확인하세요.';
          try { msg = JSON.parse(text).error || msg; } catch { msg = text || msg; }
          alert('저장 실패: ' + msg);
        }
      } catch (e) { alert('네트워크 오류: ' + e.message); }
      finally { submitting.value = false; }
    };

    const confirmDelete = async (id, title) => {
      if (!adminKey.value) { const k = prompt('삭제를 위해 비밀번호를 입력하세요:'); if (!k) return; adminKey.value = k.trim(); }
      if (!confirm(`'${title}' 을 삭제하시겠습니까?`)) return;
      try {
        const res = await fetch(`https://dongtan-api.infiniblue.workers.dev/api/posts/${id}`, {
          method: 'DELETE', headers: { 'Authorization': `Bearer ${adminKey.value.trim()}` }
        });
        if (res.ok) { alert('삭제되었습니다.'); adminKey.value = ''; selectedPost.value = null; await fetchPosts(); }
        else { const t = await res.text(); let m = '비밀번호를 확인하세요.'; try { m = JSON.parse(t).error || m; } catch { m = t || m; } alert('삭제 실패: ' + m); adminKey.value = ''; }
      } catch (e) { alert('오류: ' + e.message); }
    };

    const confirmDeleteById = (id, title) => confirmDelete(id, title);

    const confirmBatchDelete = async () => {
      if (!adminKey.value) { const k = prompt(`${selectedIds.value.length}개 삭제를 위해 비밀번호를 입력하세요:`); if (!k) return; adminKey.value = k.trim(); }
      if (!confirm(`선택한 ${selectedIds.value.length}개를 삭제하시겠습니까?`)) return;
      try {
        const res = await fetch('https://dongtan-api.infiniblue.workers.dev/api/posts/batch-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminKey.value.trim()}` },
          body: JSON.stringify({ ids: selectedIds.value })
        });
        if (res.ok) { alert('삭제되었습니다.'); adminKey.value = ''; selectedIds.value = []; await fetchPosts(); }
        else { const t = await res.text(); let m = '비밀번호를 확인하세요.'; try { m = JSON.parse(t).error || m; } catch { m = t || m; } alert('삭제 실패: ' + m); adminKey.value = ''; }
      } catch (e) { alert('오류: ' + e.message); }
    };

    const viewPostById = (id) => { const p = posts.value.find(p => p.id === id); if (p) selectedPost.value = p; };

    onMounted(fetchPosts);

    return {
      currentLang, t, posts, loading, formatDate, viewPostById,
      showEditor, newPost, submitPost, submitting, adminKey, selectedPost,
      confirmDelete, isEditing, startEdit, openEditor, closeEditor,
      currentPage, totalPages, safePaginatedPosts, setPage, confirmDeleteById,
      selectedIds, confirmBatchDelete, isAllSelected, toggleSelectAll,
      searchQuery, activeCat, categories, filteredPosts,
      getThumbnail, parseContent, catStyle,
      editorEl, imageUploading, exec, execFontSize, execFormatBlock,
      saveColorRange, execColor,
      onEditorInput, onPaste, insertImageFile, imgLayout, setImgLayout,
      resizeHandle, onEditorMouseover, onEditorMouseleave, onHandleMouseleave, startResize
    };
  }
}
</script>

<style scoped>
/* ─── 전체 페이지 ─── */
.blog-page {
  min-height: 100vh;
  background: var(--page-bg);
}

/* ─── HERO ─── */
.blog-hero {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f2027 100%);
  padding: 60px 24px 0;
  position: relative;
  overflow: hidden;
}

.hero-shapes .shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
}
.shape.s1 { width: 400px; height: 400px; background: #60a5fa; top: -100px; right: -80px; }
.shape.s2 { width: 250px; height: 250px; background: #818cf8; bottom: 20px; left: -60px; }
.shape.s3 { width: 150px; height: 150px; background: #34d399; top: 30px; left: 40%; }

.hero-inner {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.hero-badge {
  display: inline-block;
  background: rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.8);
  border: 1px solid rgba(255,255,255,0.2);
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 0.82rem;
  letter-spacing: 0.05em;
  margin-bottom: 20px;
  backdrop-filter: blur(8px);
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 12px;
  letter-spacing: -0.02em;
  line-height: 1;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.65);
  margin: 0 0 32px;
}

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 4px;
}
.stat-item { text-align: center; }
.stat-num { display: block; font-size: 1.8rem; font-weight: 700; color: #fff; }
.stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.08em; }
.stat-div { width: 1px; height: 40px; background: rgba(255,255,255,0.2); }

/* 검색 + 글쓰기 툴바 */
.blog-toolbar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 760px;
  margin: 0 auto;
  padding: 20px 0 0;
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px 16px 0 0;
  padding: 16px 20px;
}

.search-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: 8px 14px;
}
.si { font-size: 1rem; opacity: 0.7; }
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 0.95rem;
}
.search-input::placeholder { color: rgba(255,255,255,0.4); }
.search-clear { background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; font-size: 0.9rem; }

.write-btn {
  background: #3b82f6;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}
.write-btn:hover { background: #2563eb; }

.cancel-btn {
  background: rgba(255,255,255,0.15);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.2);
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
}

/* ─── BODY ─── */
.blog-body {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 20px 100px;
}

/* ─── 에디터 ─── */
.editor-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 36px 40px;
  margin-bottom: 28px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.06);
  /* 에디터 1.3배 확장 */
  margin-left: -222px;
  margin-right: -222px;
}
@media (max-width: 1460px) {
  .editor-card { margin-left: -80px; margin-right: -80px; }
}
@media (max-width: 1160px) {
  .editor-card { margin-left: -20px; margin-right: -20px; }
}
.editor-title { font-size: 1.4rem; font-weight: 700; margin: 0 0 24px; }

.editor-form { display: flex; flex-direction: column; gap: 18px; }

.form-row.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
.form-group input:not([type=color]):not([type=file]):not([type=checkbox]) {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1.5px solid rgba(0,0,0,0.1);
  background: var(--page-bg);
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: border-color 0.2s;
}
.form-group input:focus { border-color: #3b82f6; outline: none; }

.form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 4px; }
.btn-primary {
  background: #3b82f6; color: #fff; border: none;
  padding: 12px 28px; border-radius: 10px; font-weight: 600; cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover:not(:disabled) { background: #2563eb; }
.btn-primary:disabled { opacity: 0.5; }
.btn-secondary {
  background: var(--card-bg); color: var(--text-secondary); border: 1.5px solid rgba(0,0,0,0.1);
  padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer;
}

/* 에디터 리치텍스트 */
.rich-editor-wrap {
  border: 1.5px solid rgba(0,0,0,0.1);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}
.rich-editor-wrap:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }

.editor-toolbar {
  display: flex; align-items: center; gap: 4px;
  padding: 8px 10px; background: #f5f5f7;
  border-bottom: 1px solid rgba(0,0,0,0.08); flex-wrap: wrap;
}
.editor-toolbar button {
  padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(0,0,0,0.12);
  background: #fff; cursor: pointer; font-size: 0.85rem; transition: all 0.15s; line-height: 1;
}
.editor-toolbar button:hover { background: #3b82f6; color: #fff; border-color: #3b82f6; }
.editor-toolbar select {
  padding: 5px 8px; border-radius: 6px; border: 1px solid rgba(0,0,0,0.12); background: #fff; font-size: 0.82rem; cursor: pointer;
}
.toolbar-sep { width: 1px; height: 20px; background: rgba(0,0,0,0.12); margin: 0 2px; }
.color-picker-wrap {
  display: inline-flex; align-items: center; gap: 5px; padding: 4px 8px;
  border-radius: 6px; border: 1px solid rgba(0,0,0,0.12); background: #fff;
  cursor: pointer; font-size: 0.82rem; transition: all 0.15s;
}
.color-picker-wrap:hover { background: #f0f0f0; }
.color-input { width: 22px; height: 22px; border: none; padding: 0; cursor: pointer; background: none; border-radius: 3px; }
.img-upload-btn {
  padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(0,0,0,0.12); background: #fff;
  cursor: pointer; font-size: 0.85rem; transition: all 0.15s; display: inline-flex; align-items: center;
}
.img-upload-btn:hover { background: #3b82f6; color: #fff; border-color: #3b82f6; }

.toolbar-label { font-size: 0.78rem; color: #666; white-space: nowrap; }
.layout-btn {
  padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(0,0,0,0.12);
  background: #fff; cursor: pointer; font-size: 0.8rem; transition: all 0.15s;
}
.layout-btn:hover, .layout-btn.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }

.rich-editor {
  min-height: 280px; padding: 16px; outline: none;
  font-size: 1rem; line-height: 1.75; color: var(--text-primary);
}
.rich-editor:empty::before { content: '본문을 입력하세요. Ctrl+V로 이미지를 붙여넣을 수 있습니다.'; color: #aaa; pointer-events: none; }
.rich-editor img { max-width: 100%; border-radius: 8px; margin: 8px 0; display: block; }
.upload-notice { padding: 6px 16px; font-size: 0.85rem; color: #3b82f6; background: rgba(59,130,246,0.06); margin: 0; }

.img-resize-handle {
  position: absolute; width: 14px; height: 14px;
  background: #3b82f6; border: 2px solid #fff; border-radius: 3px;
  cursor: se-resize; z-index: 10; box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}

/* ─── 카테고리 필터 ─── */
.cat-filter-row {
  display: flex; flex-wrap: wrap; gap: 8px;
  margin-bottom: 20px;
}
.cat-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 100px;
  border: 1.5px solid rgba(0,0,0,0.1);
  background: var(--card-bg); color: var(--text-secondary);
  font-size: 0.85rem; font-weight: 500; cursor: pointer;
  transition: all 0.2s;
}
.cat-chip:hover { border-color: #3b82f6; color: #3b82f6; }
.cat-chip.active { background: #3b82f6; color: #fff; border-color: #3b82f6; font-weight: 600; }
.chip-count { font-size: 0.75rem; background: rgba(0,0,0,0.1); padding: 1px 7px; border-radius: 100px; }
.cat-chip.active .chip-count { background: rgba(255,255,255,0.25); }

/* ─── 로딩 / 빈 상태 ─── */
.loading-state { text-align: center; padding: 80px 0; }
.spinner {
  width: 40px; height: 40px; margin: 0 auto;
  border: 3px solid rgba(0,0,0,0.08); border-radius: 50%;
  border-top-color: #3b82f6; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 80px 20px; }
.empty-icon { font-size: 3rem; margin-bottom: 16px; }
.empty-state p { color: var(--text-secondary); font-size: 1.05rem; }
.btn-reset {
  margin-top: 16px; padding: 9px 22px; border-radius: 10px;
  background: #3b82f6; color: #fff; border: none; cursor: pointer; font-weight: 600;
}

/* ─── 포스트 목록 ─── */
.list-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 4px 12px; margin-bottom: 4px;
}
.check-all-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; }
.list-count { font-size: 0.82rem; color: var(--text-secondary); }

.post-list { display: flex; flex-direction: column; gap: 12px; }

.post-card {
  display: flex; align-items: center; gap: 16px;
  background: var(--card-bg); border-radius: 16px;
  padding: 16px 20px; cursor: pointer;
  border: 1.5px solid rgba(0,0,0,0.05);
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  position: relative;
}
.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  border-color: rgba(59,130,246,0.3);
}

.post-check { flex-shrink: 0; }

.post-thumb-wrap { flex-shrink: 0; }
.post-thumb {
  width: 76px; height: 76px;
  border-radius: 12px;
  background-size: cover; background-position: center;
  background-color: #e5e5e7;
}
.post-thumb-empty {
  width: 76px; height: 76px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #e0e7ff, #dbeafe);
  font-size: 1.6rem; font-weight: 700;
  color: #3b82f6;
}

.post-body { flex: 1; min-width: 0; }
.post-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.cat-badge {
  font-size: 0.72rem; font-weight: 600; padding: 3px 10px;
  border-radius: 100px; letter-spacing: 0.02em;
}
.post-date { font-size: 0.78rem; color: var(--text-secondary); }
.post-title {
  font-size: 1.05rem; font-weight: 700;
  margin: 0 0 5px; line-height: 1.35;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.post-excerpt {
  font-size: 0.85rem; color: var(--text-secondary);
  margin: 0; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}

.post-right {
  flex-shrink: 0; display: flex; flex-direction: column;
  align-items: center; gap: 8px;
}
.del-btn {
  background: none; border: none; color: #ef4444;
  font-size: 0.9rem; cursor: pointer; opacity: 0; transition: opacity 0.2s;
  padding: 4px;
}
.post-card:hover .del-btn { opacity: 0.6; }
.del-btn:hover { opacity: 1 !important; }
.go-arrow { color: #3b82f6; font-weight: 600; font-size: 1.1rem; transition: transform 0.2s; }
.post-card:hover .go-arrow { transform: translateX(4px); }

/* 체크박스 */
.apple-checkbox {
  appearance: none; -webkit-appearance: none;
  width: 20px; height: 20px; border-radius: 6px;
  border: 2px solid rgba(0,0,0,0.15); background: #fff;
  cursor: pointer; position: relative; transition: all 0.2s;
}
.apple-checkbox:checked { background: #3b82f6; border-color: #3b82f6; }
.apple-checkbox:checked::after {
  content: '✓'; position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%); color: #fff; font-size: 12px; font-weight: 700;
}

/* ─── 페이지네이션 ─── */
.pagination { display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 32px; }
.pg-btn {
  width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid rgba(0,0,0,0.1);
  background: var(--card-bg); color: var(--text-primary); font-weight: 600;
  cursor: pointer; font-size: 0.9rem; transition: all 0.2s;
}
.pg-btn:hover:not(:disabled) { background: #3b82f6; color: #fff; border-color: #3b82f6; }
.pg-btn.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
.pg-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* ─── 일괄 삭제 바 ─── */
.batch-bar {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 14px;
  background: #1e293b; color: #fff; padding: 14px 24px;
  border-radius: 100px; box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  font-size: 0.9rem; font-weight: 500; z-index: 100;
}
.batch-del-btn { background: #ef4444; color: #fff; border: none; padding: 6px 16px; border-radius: 100px; font-weight: 600; cursor: pointer; }
.batch-cancel-btn { background: rgba(255,255,255,0.15); color: #fff; border: none; padding: 6px 14px; border-radius: 100px; cursor: pointer; }

/* ─── 모달 ─── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  backdrop-filter: blur(6px); z-index: 10000;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-box {
  background: var(--page-bg); border-radius: 24px;
  width: 100%; max-width: 780px; max-height: 88vh;
  overflow-y: auto; position: relative;
  padding: 36px 40px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.2);
}
.modal-close {
  position: absolute; top: 20px; right: 20px;
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(0,0,0,0.08); border: none; cursor: pointer;
  font-size: 0.85rem; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.modal-close:hover { background: rgba(0,0,0,0.15); }

.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.modal-meta { display: flex; align-items: center; gap: 10px; }
.modal-date { font-size: 0.85rem; color: var(--text-secondary); }
.modal-admin-btns { display: flex; gap: 10px; }
.edit-btn {
  background: var(--card-bg); border: 1.5px solid rgba(0,0,0,0.1);
  padding: 6px 16px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
}
.delete-pill-btn {
  background: #fee2e2; color: #dc2626; border: 1px solid #fecaca;
  padding: 6px 16px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.delete-pill-btn:hover { background: #dc2626; color: #fff; }

.modal-title { font-size: 2rem; font-weight: 800; margin: 0 0 24px; line-height: 1.25; }
.modal-content {
  font-size: 1.05rem; line-height: 1.85; word-break: break-word;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
}
.modal-content img { max-width: 100%; border-radius: 10px; margin: 12px 0; display: block; }

/* ─── 트랜지션 ─── */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-16px); }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translate(-50%, 20px); }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* ─── 반응형 ─── */
@media (max-width: 640px) {
  .hero-title { font-size: 2.8rem; }
  .blog-toolbar { flex-wrap: wrap; }
  .form-row.two-col { grid-template-columns: 1fr; }
  .post-thumb { width: 60px; height: 60px; }
  .post-thumb-empty { width: 60px; height: 60px; }
  .modal-box { padding: 24px 20px; }
  .modal-title { font-size: 1.5rem; }
  .modal-header { flex-direction: column; align-items: flex-start; gap: 12px; }
}
</style>
