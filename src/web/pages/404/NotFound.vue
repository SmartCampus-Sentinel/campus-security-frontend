<template>
  <div class="not-found-container">
    <h1>404 - 页面不存在</h1>
    <el-button type="primary" @click="goBack">返回首页</el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();

const goBack = () => {
  router.push('/dashboard.ts');
};
</script>

<style scoped>
.not-found-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
}
</style>