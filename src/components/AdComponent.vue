<template>
  <div class="adsense-container" :style="containerStyle">
    <ins class="adsbygoogle"
         :style="adStyle"
         data-ad-client="ca-pub-1969163891557217"
         :data-ad-slot="slotId"
         :data-ad-format="format"
         :data-full-width-responsive="responsive"></ins>
  </div>
</template>

<script>
import { onMounted, nextTick } from 'vue';

export default {
  name: 'AdComponent',
  props: {
    slotId: {
      type: String,
      default: '9173007135' // Default slot ID or placeholder
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
  setup() {
    onMounted(() => {
      // 로컬 개발 환경에서는 광고 로드를 건너뜁니다.
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('AdSense blocked in local development environment');
        return;
      }

      nextTick(() => {
        try {
          if (window.adsbygoogle) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          }
        } catch (e) {
          console.error('AdSense error:', e);
        }
      });
    });
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
