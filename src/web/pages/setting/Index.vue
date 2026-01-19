<template>
  <div class="user-center-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">个人中心</h2>
      <el-button
        type="primary"
        :icon="Setting"
        @click="settingDialogVisible = true"
        size="small"
        class="transition-all"
      >
        详细设置
      </el-button>
    </div>

    <!-- 页面主体内容：核心信息展示 -->
    <div class="content-wrapper">
      <!-- 1. 核心用户信息卡片 -->
      <el-card class="main-info-card transition-all fade-in" :style="{ animationDelay: '0.1s' }">
        <div class="card-content">
          <!-- 头像 + 基础信息 -->
          <div class="avatar-info">
            <el-avatar :size="80" :src="userInfo.avatar" class="main-avatar hover-scale">
              <User />
            </el-avatar>
            <div class="user-basic">
              <h3 class="username">{{ userInfo.username }}</h3>
              <el-tag type="primary" size="small" class="transition-all hover-scale">
                {{ userInfo.role }}
              </el-tag>
              <p class="login-desc">最后登录：{{ userInfo.lastLoginTime }} | {{ userInfo.loginIp }}</p>
            </div>
          </div>

          <!-- 核心统计 -->
          <div class="user-stats">
            <div class="stat-item transition-all" :style="{ animationDelay: '0.2s' }">
              <span class="stat-num">
                <span class="counter">{{ pageData.userStats.loginCount }}</span>
              </span>
              <span class="stat-label">累计登录次数</span>
            </div>
            <div class="stat-item transition-all" :style="{ animationDelay: '0.3s' }">
              <span class="stat-num">
                <span class="counter">{{ pageData.userStats.alarmHandled }}</span>
              </span>
              <span class="stat-label">已处理报警数</span>
            </div>
            <div class="stat-item transition-all" :style="{ animationDelay: '0.4s' }">
              <span class="stat-num">
                <span class="counter">{{ pageData.userStats.deviceManaged }}</span>
              </span>
              <span class="stat-label">管理设备数</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 2. 快捷操作卡片 -->
      <el-card class="quick-op-card transition-all fade-in" :style="{ animationDelay: '0.5s' }">
        <template #header>
          <span class="card-title">快捷操作</span>
        </template>
        <div class="quick-op-list">
          <div class="quick-op-grid">
            <div class="quick-op-item quick-op-primary" @click="() => { activeTab = 'security'; settingDialogVisible = true }">
              <div class="quick-op-icon"><Key /></div>
              <div class="quick-op-text">修改密码</div>
            </div>
            <div class="quick-op-item quick-op-info" @click="() => { activeTab = 'loginLog'; settingDialogVisible = true }">
              <div class="quick-op-icon"><Clock /></div>
              <div class="quick-op-text">查看登录日志</div>
            </div>
            <div class="quick-op-item quick-op-warning" @click="() => { activeTab = 'custom'; settingDialogVisible = true }">
              <div class="quick-op-icon"><Brush /></div>
              <div class="quick-op-text">个性化设置</div>
            </div>
            <div class="quick-op-item quick-op-danger" @click="handleLogout">
              <div class="quick-op-icon"><SwitchButton /></div>
              <div class="quick-op-text">退出登录</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 3. 最近登录记录（简化版） -->
      <el-card class="recent-log-card transition-all fade-in" :style="{ animationDelay: '0.6s' }">
        <template #header>
          <span class="card-title">最近登录记录</span>
          <el-button
            type="text"
            size="small"
            @click="() => { activeTab = 'loginLog'; settingDialogVisible = true }"
            class="transition-all"
          >
            查看全部
          </el-button>
        </template>
        <el-table
          :data="pageData.recentLoginLogList"
          border
          hover
          size="small"
          :show-header="false"
          row-class-name="table-row-hover"
        >
          <el-table-column prop="loginTime" width="180" />
          <el-table-column prop="loginIp" width="150" />
          <el-table-column prop="loginDevice" />
        </el-table>
      </el-card>
    </div>

    <!-- 详细设置弹窗（包含所有设置功能） -->
    <el-dialog
      v-model="settingDialogVisible"
      title="个人中心详细设置"
      width="800px"
      top="20px"
      destroy-on-close
      :close-on-click-modal="false"
      transition="el-dialog-fade"
    >
      <el-tabs v-model="activeTab" type="card" class="setting-tabs">
        <!-- 1. 基本信息标签页 -->
        <el-tab-pane label="基本信息" name="baseInfo">
          <div class="base-info-content">
            <div class="avatar-wrapper">
              <el-avatar :size="100" :src="userInfo.avatar" class="user-avatar hover-scale">
                <User />
              </el-avatar>
              <el-button
                type="text"
                size="small"
                class="upload-btn transition-all"
                @click="uploadAvatarVisible = true"
              >
                更换头像
              </el-button>
            </div>
            
            <!-- 编辑按钮 -->
            <div class="edit-btn-container" v-if="!editState.isEditMode">
              <el-button type="primary" size="small" @click="enterEditMode">
                编辑个人资料
              </el-button>
            </div>
            
            <!-- 查看模式 -->
            <div v-if="!editState.isEditMode" class="info-list">
              <div class="info-item transition-all hover-bg" v-for="(item, index) in userInfoDisplay" :key="index">
                <span class="info-label">{{ item.label }}：</span>
                <span v-if="!item.isTag" class="info-value">{{ item.value }}</span>
                <el-tag v-else type="primary">{{ item.value }}</el-tag>
              </div>
            </div>
            
            <!-- 编辑模式 -->
            <el-form
              v-else
              ref="editState.formRef"
              :model="editState.form"
              :rules="editState.rules"
              label-width="100px"
              class="edit-form transition-all fade-in"
            >
              <el-form-item label="用户名" disabled>
                <el-input v-model="userInfo.username" placeholder="用户名" disabled />
              </el-form-item>
              <el-form-item label="昵称" prop="nickname">
                <el-input
                  v-model="editState.form.nickname"
                  placeholder="请输入昵称"
                  maxlength="20"
                  show-word-limit
                  class="transition-all"
                />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input
                  v-model="editState.form.email"
                  type="email"
                  placeholder="请输入邮箱"
                  maxlength="50"
                  show-word-limit
                  class="transition-all"
                />
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input
                  v-model="editState.form.phone"
                  placeholder="请输入手机号"
                  maxlength="11"
                  show-word-limit
                  class="transition-all"
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  @click="saveEdit"
                  :loading="editState.loading"
                  class="transition-all"
                >
                  保存修改
                </el-button>
                <el-button @click="cancelEdit" class="transition-all">
                  取消
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 2. 安全设置标签页 -->
        <el-tab-pane label="安全设置" name="security">
          <el-form
            ref="passwordState.formRef"
            :model="passwordState.form"
            :rules="pwdRules"
            label-width="100px"
            class="pwd-form"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="passwordState.form.oldPassword"
                type="password"
                placeholder="请输入原密码"
                show-password
                :prefix-icon="Lock"
                class="transition-all"
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordState.form.newPassword"
                type="password"
                placeholder="请输入6-18位新密码"
                show-password
                :prefix-icon="Key"
                class="transition-all"
              />
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="passwordState.form.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
                :prefix-icon="Key"
                class="transition-all"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="handleUpdatePwd"
                :loading="passwordState.loading"
                class="transition-all"
              >
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 3. 登录日志标签页 -->
        <el-tab-pane label="登录日志" name="loginLog">
          <div class="log-content">
            <el-table
              :data="pageData.loginLogList"
              border
              hover
              v-loading="pageData.logLoading"
              size="small"
              row-class-name="table-row-hover"
            >
              <el-table-column prop="id" label="日志ID" width="80" />
              <el-table-column prop="loginTime" label="登录时间" width="180" />
              <el-table-column prop="loginIp" label="登录IP" width="150" />
              <el-table-column prop="loginDevice" label="登录设备" width="200" />
              <el-table-column prop="loginLocation" label="登录地点" />
            </el-table>
            <el-pagination
              v-model:current-page="pageData.logPagination.pageNum"
              v-model:page-size="pageData.logPagination.pageSize"
              :total="pageData.logPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="fetchLoginLogList"
              @current-change="fetchLoginLogList"
              class="log-pagination"
            />
          </div>
        </el-tab-pane>

        <!-- 4. 个性化设置标签页 -->
        <el-tab-pane label="个性化设置" name="custom">
          <div class="custom-content">
            <el-form :model="customState.form" class="custom-form">
              <el-form-item label="侧边栏折叠：">
                <el-switch
                  v-model="customState.form.sidebarCollapse"
                  @change="saveCustomSetting"
                  active-text="折叠"
                  inactive-text="展开"
                  class="transition-all"
                />
              </el-form-item>
              <el-form-item label="主题风格：">
                <el-select
                  v-model="customState.form.theme"
                  @change="saveCustomSetting"
                  style="width: 200px;"
                  class="transition-all"
                >
                  <el-option label="默认主题" value="default" />
                  <el-option label="暗黑主题" value="dark" />
                </el-select>
              </el-form-item>
              <el-form-item label="自动刷新看板：">
                <el-switch
                  v-model="customState.form.autoRefresh"
                  @change="saveCustomSetting"
                  active-text="开启"
                  inactive-text="关闭"
                  class="transition-all"
                />
                <span class="custom-tips">（开启后5分钟刷新一次看板数据）</span>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="settingDialogVisible = false" class="transition-all">
          关闭
        </el-button>
      </template>
    </el-dialog>

    <!-- 头像上传弹窗 -->
    <el-dialog
      v-model="uploadAvatarVisible"
      title="更换头像"
      width="400px"
      destroy-on-close
      transition="el-dialog-fade"
    >
      <el-upload
        class="avatar-uploader"
        :action="''"
        :http-request="handleAvatarUpload"
        :show-file-list="false"
        :before-upload="beforeAvatarUpload"
      >
        <el-avatar :size="150" :src="userInfo.avatar" class="hover-scale">
          <User />
        </el-avatar>
      </el-upload>
      <div class="upload-tips">建议上传尺寸为200x200的图片，支持jpg/png格式</div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
// 接口导入
import { getUserInfo, updatePassword, uploadAvatar, updateUserInfo } from '@/api/user';
import { logout } from '@/api/login';
import { getLoginLogList, getRecentLoginLog } from '@/api/loginLog';
import { getUserStats } from '@/api/userStats'; // 新增：用户统计接口
// 图标
import { User, Lock, Key, SwitchButton, Setting, Clock, Brush } from '@element-plus/icons-vue';

// 路由实例
const router = useRouter();

// ======== 页面状态管理 ========
// 对话框状态
const settingDialogVisible = ref<boolean>(false);
const activeTab = ref<string>('baseInfo');
const uploadAvatarVisible = ref<boolean>(false);

// 1. 用户信息状态
const userInfo = ref({
  id: '',
  avatar: '',
  username: '',
  nickname: '',
  email: '',
  phone: '',
  role: '',
  lastLoginTime: '',
  loginIp: '',
  createdAt: '',
  updatedAt: ''
});

// 2. 个人资料编辑状态
const editState = reactive({
  isEditMode: false,
  form: {
    nickname: '',
    email: '',
    phone: ''
  },
  formRef: ref<FormInstance>(),
  loading: false,
  rules: ref<FormRules>({
    nickname: [
      { max: 20, message: '昵称长度不能超过20个字符', trigger: 'blur' }
    ],
    email: [
      { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
      { max: 50, message: '邮箱长度不能超过50个字符', trigger: 'blur' }
    ],
    phone: [
      { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
    ]
  })
});

// 3. 页面统计和日志数据
const pageData = reactive({
  userStats: {
    loginCount: 0, // 累计登录次数
    alarmHandled: 0, // 已处理报警数
    deviceManaged: 0 // 管理设备数
  },
  recentLoginLogList: [] as any[],
  loginLogList: [] as any[],
  logLoading: false,
  logPagination: {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
});

// 4. 密码修改相关
const passwordState = reactive({
  form: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  },
  formRef: ref<FormInstance>(),
  loading: false
});

// 定义密码验证规则（在passwordState定义之后）
const pwdRules = ref<FormRules>({
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [{ required: true, min: 6, max: 18, message: '密码长度6-18位', trigger: 'blur' }],
  confirmPassword: [
    { required: true, validator: (_, val, cb) => {
      if (val !== passwordState.form.newPassword) {
        cb(new Error('两次密码不一致'));
      } else {
        cb();
      }
    }, trigger: 'blur' }
  ]
});

// 5. 个性化设置
const customState = reactive({
  form: {
    sidebarCollapse: localStorage.getItem('sidebarCollapse') === 'true',
    theme: localStorage.getItem('theme') || 'default',
    autoRefresh: localStorage.getItem('autoRefresh') === 'true'
  }
});

// ======== 计算属性 ========
// 格式化用户信息用于展示
const userInfoDisplay = computed(() => [
  { label: '用户名', value: userInfo.value.username, isTag: false },
  { label: '昵称', value: userInfo.value.nickname || '未设置', isTag: false },
  { label: '邮箱', value: userInfo.value.email || '未设置', isTag: false },
  { label: '手机号', value: userInfo.value.phone || '未设置', isTag: false },
  { label: '角色', value: userInfo.value.role, isTag: true },
  { label: '注册时间', value: userInfo.value.createdAt, isTag: false },
  { label: '最后登录时间', value: userInfo.value.lastLoginTime, isTag: false },
  { label: '登录IP', value: userInfo.value.loginIp, isTag: false }
]);

// ======== 数据加载函数 ========
// 加载页面核心数据（仅展示，不影响其他页面）
const fetchPageData = async () => {
  try {
    // 1. 基本信息
    const infoRes = await getUserInfo();
    userInfo.value = infoRes.data;
    // 2. 核心统计
    const statsRes = await getUserStats();
    pageData.userStats = statsRes.data;
    // 3. 最近登录记录（前5条）
    const recentLogRes = await getRecentLoginLog();
    pageData.recentLoginLogList = recentLogRes.data;
  } catch (error) {
    console.error('加载用户中心核心数据失败：', error);
  }
};

// 加载完整登录日志（弹窗内）
const fetchLoginLogList = async () => {
  try {
    pageData.logLoading = true;
    const res = await getLoginLogList(pageData.logPagination);
    pageData.loginLogList = res.data.list;
    pageData.logPagination.total = res.data.total;
  } catch (error) {
    ElMessage.error('获取登录日志失败');
  } finally {
    pageData.logLoading = false;
  }
};

// ======== 个人资料编辑功能 ========
// 进入编辑模式
const enterEditMode = () => {
  // 填充表单数据
  editState.form = {
    nickname: userInfo.value.nickname || '',
    email: userInfo.value.email || '',
    phone: userInfo.value.phone || ''
  };
  editState.isEditMode = true;
};

// 保存编辑
const saveEdit = async () => {
  if (!editState.formRef.value) return;
  const valid = await editState.formRef.value.validate();
  if (!valid) return;

  try {
    editState.loading = true;
    await updateUserInfo(editState.form);
    // 更新本地数据
    userInfo.value.nickname = editState.form.nickname;
    userInfo.value.email = editState.form.email;
    userInfo.value.phone = editState.form.phone;
    editState.isEditMode = false;
    ElMessage.success('个人资料已更新');
  } catch (error) {
    ElMessage.error('更新失败，请重试');
    console.error('更新个人资料失败:', error);
  } finally {
    editState.loading = false;
  }
};

// 取消编辑
const cancelEdit = () => {
  editState.isEditMode = false;
};

// ======== 功能函数 ========
// 修改密码
const handleUpdatePwd = async () => {
  if (!passwordState.formRef.value) return;
  const valid = await passwordState.formRef.value.validate();
  if (!valid) return;

  try {
    passwordState.loading = true;
    await updatePassword(passwordState.form);
    ElMessage.success('密码修改成功，请重新登录');
    settingDialogVisible.value = false;
    // 密码修改后直接登出，无需确认
    await directLogout();
  } catch (error) {
    ElMessage.error('密码修改失败，请检查原密码');
  } finally {
    passwordState.loading = false;
  }
};

// 直接登出（无需确认）
const directLogout = async () => {
  try {
    // 调用后端登出接口
    await logout();
    
    // 清理本地存储的数据
    localStorage.removeItem('token');
    localStorage.removeItem('sidebarCollapse');
    localStorage.removeItem('theme');
    localStorage.removeItem('autoRefresh');
    
    // 清理会话存储的数据（如果有的话）
    sessionStorage.clear();
    
    // 重定向到登录页
    router.push('/login');
    
    // 显示成功消息
    ElMessage.success('密码修改成功，请重新登录');
  } catch (error) {
    // 即使登出API调用失败，也要清除本地数据并跳转到登录页
    localStorage.removeItem('token');
    localStorage.removeItem('sidebarCollapse');
    localStorage.removeItem('theme');
    localStorage.removeItem('autoRefresh');
    sessionStorage.clear();
    router.push('/login');
    ElMessage.warning('密码修改成功，但登出时出现问题，请重新登录');
  }
};

// 保存个性化设置（仅操作本地存储，不影响其他页面核心逻辑）
const saveCustomSetting = () => {
  localStorage.setItem('sidebarCollapse', customState.form.sidebarCollapse.toString());
  localStorage.setItem('theme', customState.form.theme);
  localStorage.setItem('autoRefresh', customState.form.autoRefresh.toString());

  // 应用主题设置
  applyTheme(customState.form.theme);

  ElMessage.success('个性化设置已保存');
};

// 应用主题设置
const applyTheme = (theme: string) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark-theme');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark-theme');
    document.documentElement.setAttribute('data-theme', 'light');
  }
};

// 监听 localStorage 变化，同步主题设置
window.addEventListener('storage', (e) => {
  if (e.key === 'theme' && e.newValue) {
    applyTheme(e.newValue);
  }
});

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？您需要重新验证身份才能访问系统。',
      '确认退出', 
      {
        confirmButtonText: '确定退出',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
    );
    
    // 调用后端登出接口
    await logout();
    
    // 清理本地存储的数据
    localStorage.removeItem('token');
    localStorage.removeItem('sidebarCollapse');
    localStorage.removeItem('theme');
    localStorage.removeItem('autoRefresh');
    
    // 清理会话存储的数据（如果有的话）
    sessionStorage.clear();
    
    // 重定向到登录页
    router.push('/login');
    
    // 显示成功消息
    ElMessage.success('已安全退出登录');
  } catch (error) {
    // 用户取消登出操作
    if (error !== 'cancel') {
      ElMessage.error('登出过程中发生错误');
    } else {
      ElMessage.info('已取消退出操作');
    }
  }
};

// 头像上传
const handleAvatarUpload = async (options: any) => {
  const file = options.file;
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const res = await uploadAvatar(formData);
    userInfo.value.avatar = res.data.avatarUrl;
    uploadAvatarVisible.value = false;
    ElMessage.success('头像上传成功');
  } catch (error) {
    ElMessage.error('头像上传失败，请重试');
    console.error('头像上传失败:', error);
  }
};

const beforeAvatarUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isJPG) ElMessage.error('仅支持JPG/PNG格式');
  if (!isLt2M) ElMessage.error('图片大小不超过2MB');
  return isJPG && isLt2M;
};

// ======== 生命周期 ========
onMounted(() => {
  // 仅加载当前页面展示数据，不触发其他页面逻辑
  fetchPageData();
  // 初始化主题（不影响其他页面）
  applyTheme(customState.form.theme);
});
</script>

<style scoped>
/* 页面整体布局 */
.user-center-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* 装饰性元素 */
.user-center-container::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
  z-index: 0;
}

.user-center-container::after {
  content: '';
  position: absolute;
  bottom: -80px;
  left: -80px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(118, 75, 162, 0.08) 0%, transparent 70%);
  z-index: 0;
}

.user-center-container > * {
  position: relative;
  z-index: 1;
}

/* 页面标题 + 按钮 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 0 8px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}
.page-title {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
  letter-spacing: -0.5px;
}

/* 内容容器 */
.content-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
  margin-bottom: 20px;
}
@media (min-width: 768px) {
  .content-wrapper {
    grid-template-columns: 2fr 1fr;
  }
  .main-info-card {
    grid-column: 1 / 3;
  }
}

/* 卡片通用样式 */
.main-info-card, .quick-op-card, .recent-log-card {
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}


/* 核心信息卡片 */
.main-info-card {
  padding: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
}
.main-info-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  transform: rotate(30deg);
}
.card-content {
  display: flex;
  flex-direction: column;
  gap: 28px;
  position: relative;
  z-index: 1;
}
.avatar-info {
  display: flex;
  align-items: center;
  gap: 28px;
}
.main-avatar {
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}
.main-avatar:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.6);
}
.user-basic {
  flex: 1;
}
.username {
  font-size: 26px;
  font-weight: 800;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.login-desc {
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  margin: 10px 0 0 0;
  opacity: 0.9;
}
.user-stats {
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
  padding-top: 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
}
.stat-item {
  text-align: center;
  flex: 1;
  min-width: 120px;
  padding: 16px;
  border-radius: 12px;
}

.stat-num {
  display: block;
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* 快捷操作卡片 */
.quick-op-card {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.quick-op-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 16px;
}
.quick-op-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.quick-op-item {
  aspect-ratio: 1/1;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  text-align: center;
  color: white;
  font-weight: 600;
}
.quick-op-item:hover {
  transform: translateY(-5px) scale(1.03);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}
.quick-op-primary {
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
}
.quick-op-info {
  background: linear-gradient(135deg, #909399 0%, #a8abb2 100%);
}
.quick-op-warning {
  background: linear-gradient(135deg, #E6A23C 0%, #eebe5c 100%);
}
.quick-op-danger {
  background: linear-gradient(135deg, #F56C6C 0%, #f78989 100%);
}
.quick-op-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  font-size: 20px;
}
.quick-op-text {
  font-size: 14px;
  line-height: 1.4;
}

/* 最近登录记录卡片 */
.recent-log-card {
  grid-column: 1 / 3;
  background: rgba(255, 255, 255, 0.9);
}
.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  padding-bottom: 4px;
}

/* 弹窗内样式（增强视觉效果） */
.setting-tabs {
  margin-bottom: 24px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}
.setting-tabs .el-tabs__header {
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
  border-bottom: 1px solid #e2e8f0;
  border-radius: 16px 16px 0 0;
  padding: 8px;
}
.setting-tabs .el-tabs__nav-wrap::after {
  display: none;
}
.setting-tabs .el-tabs__item {
  border-radius: 8px;
  padding: 12px 20px !important;
  transition: all 0.3s ease;
}
.setting-tabs .el-tabs__item.is-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}
.base-info-content, .pwd-form, .log-content, .custom-content {
  padding: 28px;
  background: linear-gradient(135deg, #ffffff 0%, #fbfdff 100%);
  border-radius: 16px;
  margin-top: 20px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.02);
  border: 1px solid #e6eeff;
}
.log-pagination {
  margin-top: 24px;
  text-align: right;
  padding: 16px 0 0;
}
.custom-tips {
  color: #6c757d;
  font-size: 13px;
  margin-left: 12px;
  font-style: italic;
}
.avatar-uploader {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}
.upload-tips {
  text-align: center;
  color: #6c757d;
  font-size: 13px;
  font-style: italic;
  padding: 12px;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  margin-top: 8px;
}

/* 基本信息样式增强 */
.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
  border-radius: 16px;
}
.user-avatar {
  border: 4px solid #e0e7ff;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  background: white;
}
.user-avatar:hover {
  transform: scale(1.08);
  box-shadow: 0 12px 25px rgba(102, 126, 234, 0.25);
  border-color: #667eea;
}
.upload-btn {
  color: #667eea;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 6px 16px;
  border-radius: 20px;
  background: rgba(102, 126, 234, 0.1);
}
.upload-btn:hover {
  color: #764ba2;
  background: rgba(118, 75, 162, 0.15);
  transform: translateY(-2px);
  text-decoration: none;
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.15);
}
.info-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 18px;
}
.info-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(to right, #ffffff, #fdfefe);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid #eef2ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}
.info-item:hover {
  background: linear-gradient(to right, #f8fafc, #f0f4ff);
  border-color: #dbeafe;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.1);
}
.info-label {
  font-weight: 600;
  color: #4f46e5;
  width: 110px;
  flex-shrink: 0;
  font-size: 14px;
}
.info-value {
  color: #1e293b;
  font-weight: 500;
  flex: 1;
  font-size: 15px;
}

/* 编辑功能样式 */
.edit-btn-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  margin-bottom: 12px;
}

.edit-form {
  background: linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%);
  padding: 28px;
  border-radius: 16px;
  margin-top: 20px;
  border: 1px solid #e0e7ff;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.02);
}
.edit-form .el-form-item {
  margin-bottom: 24px;
}
.edit-form .el-input {
  width: 100%;
  max-width: 420px;
  border-radius: 10px;
}
.edit-form .el-input__wrapper {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03) inset;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .content-wrapper {
    gap: 16px;
  }
  .main-info-card {
    padding: 20px;
  }
  .avatar-info {
    flex-direction: column;
    text-align: center;
  }
  .user-stats {
    gap: 16px;
  }
  .stat-num {
    font-size: 24px;
  }
  .recent-log-card {
    grid-column: 1 / 2;
  }
  .edit-form .el-input {
    max-width: 100%;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes counter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 过渡效果类 */
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
}

/* 动画类 */
.fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

/* 悬停效果类 */
.hover-scale {
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
}
.hover-scale:hover {
  transform: scale(1.05) !important;
}

.hover-bg {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
}
.hover-bg:hover {
  background: linear-gradient(135deg, #f0f4ff, #e6f0ff) !important;
  backdrop-filter: blur(2px) !important;
}

/* 表格样式优化 */
.el-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.table-row-hover {
  transition: all 0.3s ease;
}
.table-row-hover:hover {
  background-color: #f0f7ff !important;
  transform: scale(1.01);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}
.el-table__row {
  transition: all 0.3s ease;
}
.el-table th {
  background: linear-gradient(135deg, #f8fafc, #eef2ff);
  font-weight: 600;
  color: #4f46e5;
}
.el-table td, .el-table th {
  border-color: #e2e8f0;
  padding: 12px 0;
}

/* 数字动画 */
.counter {
  animation: counter 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 0.2s;
  opacity: 0;
  display: inline-block;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .content-wrapper {
    gap: 16px;
  }
  .main-info-card {
    padding: 20px;
  }
  .avatar-info {
    flex-direction: column;
    text-align: center;
  }
  .user-stats {
    gap: 16px;
  }
  .stat-num {
    font-size: 24px;
  }
  .recent-log-card {
    grid-column: 1 / 2;
  }
  .quick-op-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .user-center-container {
    padding: 16px;
  }
  .page-title {
    font-size: 20px;
  }
  .avatar-info {
    gap: 20px;
  }
  .username {
    font-size: 20px;
  }
  .user-stats {
    gap: 12px;
  }
  .stat-item {
    min-width: 100px;
  }
  .stat-num {
    font-size: 22px;
  }
  .quick-op-list .el-button {
    height: 42px;
    font-size: 13px;
  }
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .info-label {
    width: auto;
  }
}
</style>