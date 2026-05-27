<template>
  <div class="adsense-container" :style="containerStyle" ref="adContainer">
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';

export default {
  name: 'AdComponent',
  props: {
    slotId: {
      type: String,
      default: '9173007135'
    },
    format: {
      type: String,
      default: 'auto'
    },
    responsive: {
      type: String,
      default: 'true'
    },
    adStyle: {
      type: Object,
      default: () => ({ display: 'block' })
    },
    containerStyle: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const adContainer = ref(null);

    onMounted(() => {
      // 로컬 개발 환경에서는 광고 로드를 건너뜁니다.
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return;
      }

      // 동적으로 <ins> 태그 생성
      const ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      Object.assign(ins.style, props.adStyle);
      ins.setAttribute('data-ad-client', 'ca-pub-1969163891557217');
      ins.setAttribute('data-ad-slot', props.slotId);
      ins.setAttribute('data-ad-format', props.format);
      ins.setAttribute('data-full-width-responsive', props.responsive);

      if (adContainer.value) {
        adContainer.value.appendChild(ins);
        
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          console.error('AdSense error:', e);
        }
      }
    });

    return { adContainer };
  }
}
</script>

<style scoped>
.adsense-container {
  margin: 30px auto;
  text-align: center;
  overflow: hidden;
  min-height: 100px;
  max-width: 1024px;
  width: 100%;
}
</style>
