<template>
  <div class="about-container">
    <section class="about-hero">
      <h1>About Happy Dongtan</h1>
      <p class="subtitle">동탄 부모님들을 위한 최고의 생활 가이드</p>
    </section>

    <section class="about-content">
      <div class="content-card">
        <h2>우리의 목표</h2>
        <p>
          Happy Dongtan은 동탄 신도시에 거주하거나 방문하는 가족들을 위해 기획되었습니다. 
          아이와 함께 소중한 시간을 보낼 수 있는 장소부터, 신뢰할 수 있는 병원 정보까지 
          한 곳에서 편리하게 확인하실 수 있도록 돕는 것이 우리의 미션입니다.
        </p>
      </div>

      <div class="content-card">
        <h2>제공하는 정보</h2>
        <ul>
          <li><strong>아이와 뭐하지:</strong> 동탄의 공원, 체험 시설, 유/무료 놀이터 정보</li>
          <li><strong>오늘 뭐먹지:</strong> 아이와 함께 가기 좋은 검증된 맛집 리스트</li>
          <li><strong>키즈 가베/카페:</strong> 부모님과 아이 모두가 즐거운 테마 공간</li>
          <li><strong>병원/약국:</strong> 야간 진료 병원 및 공휴일 운영 약국 정보</li>
        </ul>
      </div>

      <div class="content-card">
        <h2>신뢰할 수 있는 데이터</h2>
        <p>
          우리는 실제 방문 후기와 최신 정보를 바탕으로 데이터를 관리합니다. 
          사용자들에게 정확하고 가치 있는 정보를 제공하기 위해 정기적으로 업데이트를 수행하고 있습니다.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-container {
  padding-bottom: 100px;
}
.about-hero {
  background-color: var(--card-bg);
  padding: 100px 22px;
  text-align: center;
}
.about-hero h1 {
  font-size: 3rem;
  margin-bottom: 20px;
}
.subtitle {
  font-size: 1.5rem;
  color: var(--text-secondary);
}
.about-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 22px;
}
.content-card {
  margin-bottom: 40px;
  line-height: 1.8;
}
.content-card h2 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--accent);
  display: inline-block;
  padding-bottom: 5px;
}
.content-card ul {
  list-style: none;
  padding: 0;
}
.content-card li {
  margin-bottom: 10px;
}
</style>
