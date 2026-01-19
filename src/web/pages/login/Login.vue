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
import { login } from '@/api/login'; // 使用真实的登录API

// ========== 2. 表单相关配置（添加初始密码） ==========
const formRef = ref<InstanceType<typeof ElForm>>();
// 配置初始账号密码（默认填充admin/123456，方便测试）
const form = ref({
  username: 'admin', // 初始用户名
  password: '123456' // 初始密码
});
// 表单校验规则
const rules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
});

// ========== 3. 路由实例 ==========
const router = useRouter();

// ========== 4. 登录方法（修正表单校验逻辑） ==========
const handleLogin = async () => {
  if (!formRef.value) return;

  // 修正：ElForm的validate回调不是async，改用Promise形式的校验
  try {
    // 表单校验（Promise形式，更符合TS异步逻辑）
    await formRef.value.validate();

    // 校验通过，调用登录接口
    const res = await login({
      username: form.value.username,
      password: form.value.password,
      type: 1, // 1=管理员
    });

    // 存储token和用户信息
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('username', form.value.username);
    ElMessage.success('登录成功！即将跳转到首页');

    // 跳转到首页
    setTimeout(() => {
      router.push('/dashboard').catch(err => console.warn('路由跳转失败:', err));
    }, 1000);

  } catch (err: any) {
    // 区分校验失败和登录失败
    if (err.message === 'Validation failed') {
      ElMessage.warning('请完善表单信息');
    } else {
      ElMessage.error(err.message || '登录失败，请检查账号密码');
    }
  }
};
</script>

<style scoped>
/* 补充缺失的样式，保证页面美观 */
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
}
.login-card {
  width: 420px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.login-title {
  text-align: center;
  margin-bottom: 20px;
  color: #1989fa;
  font-size: 20px;
}
.login-btn {
  width: 100%;
  height: 40px;
  font-size: 16px;
}
</style>>