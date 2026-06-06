<template>
  <div class="tools-page">
    <div class="coming-soon">
      <div class="cs-icon">🛠️</div>
      <h1>도구 페이지 준비 중</h1>
      <p>연봉계산기 · QR코드 · MBTI 등 유용한 도구들이 곧 오픈됩니다!</p>
    </div>
  </div>
</template>

<script>
export default { name: 'ToolsView' }
</script>

<style scoped>
.tools-page {
  min-height: 100vh;
  background: #0d0d1a;
  display: flex;
  align-items: center;
  justify-content: center;
}
.coming-soon {
  text-align: center;
  color: #e0e0f0;
  padding: 40px;
}
.cs-icon { font-size: 4rem; margin-bottom: 20px; }
h1 { font-size: 2rem; color: #fff; margin-bottom: 12px; }
p  { color: rgba(255,255,255,0.5); font-size: 1rem; }
</style>
