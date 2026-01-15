<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>校园安防平台-管理员登录</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" class="login-btn">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, ElForm } from 'element-plus';
import { useRouter } from 'vue-router';
import { login } from '@/api/auth'; // 后续封装接口

// 表单相关
const formRef = ref<InstanceType<typeof ElForm>>();
const form = ref({
  username: '',
  password: '',
});
const rules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
});

// 路由实例
const router = useRouter();

// 登录方法
const handleLogin = async () => {
  if (!formRef.value) return;
  // 表单校验
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 调用登录接口
        const res = await login({
          username: form.value.username,
          password: form.value.password,
          type: 1, // 1=管理员
        });
        // 存储token和用户信息
        localStorage.setItem('token', res.data.token);
        ElMessage.success('登录成功');
        // 跳首页
        router.push('/dashboard');
      } catch (err) {
        ElMessage.error('登录失败，请检查账号密码');
      }
    }
  });
};
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
}
</style>