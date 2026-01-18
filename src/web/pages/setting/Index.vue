<template>
  <div class="user-center-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">个人中心</h2>
      <el-button
        type="primary"
        icon="Setting"
        @click="settingDialogVisible = true"
        size="small"
      >
        详细设置
      </el-button>
    </div>

    <!-- 页面主体内容：核心信息展示 -->
    <div class="content-wrapper">
      <!-- 1. 核心用户信息卡片 -->
      <el-card class="main-info-card">
        <div class="card-content">
          <!-- 头像 + 基础信息 -->
          <div class="avatar-info">
            <el-avatar :size="80" :src="userInfo.avatar" class="main-avatar">
              <User />
            </el-avatar>
            <div class="user-basic">
              <h3 class="username">{{ userInfo.username }}</h3>
              <el-tag type="primary" size="small">{{ userInfo.role }}</el-tag>
              <p class="login-desc">最后登录：{{ userInfo.lastLoginTime }} | {{ userInfo.loginIp }}</p>
            </div>
          </div>

          <!-- 核心统计 -->
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-num">{{ userStats.loginCount }}</span>
              <span class="stat-label">累计登录次数</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">{{ userStats.alarmHandled }}</span>
              <span class="stat-label">已处理报警数</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">{{ userStats.deviceManaged }}</span>
              <span class="stat-label">管理设备数</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 2. 快捷操作卡片 -->
      <el-card class="quick-op-card">
        <template #header>
          <span class="card-title">快捷操作</span>
        </template>
        <div class="quick-op-list">
          <el-button
            type="primary"
            icon="Key"
            @click="() => { activeTab = 'security'; settingDialogVisible = true }"
          >
            修改密码
          </el-button>
          <el-button
            type="info"
            icon="Clock"
            @click="() => { activeTab = 'loginLog'; settingDialogVisible = true }"
          >
            查看登录日志
          </el-button>
          <el-button
            type="warning"
            icon="Brush"
            @click="() => { activeTab = 'custom'; settingDialogVisible = true }"
          >
            个性化设置
          </el-button>
          <el-button
            type="danger"
            icon="Logout"
            @click="handleLogout"
          >
            退出登录
          </el-button>
        </div>
      </el-card>

      <!-- 3. 最近登录记录（简化版） -->
      <el-card class="recent-log-card">
        <template #header>
          <span class="card-title">最近登录记录</span>
          <el-button
            type="text"
            size="small"
            @click="() => { activeTab = 'loginLog'; settingDialogVisible = true }"
          >
            查看全部
          </el-button>
        </template>
        <el-table
          :data="recentLoginLogList"
          border
          hover
          size="small"
          :show-header="false"
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
    >
      <el-tabs v-model="activeTab" type="card" class="setting-tabs">
        <!-- 1. 基本信息标签页 -->
        <el-tab-pane label="基本信息" name="baseInfo">
          <div class="base-info-content">
            <div class="avatar-wrapper">
              <el-avatar :size="100" :src="userInfo.avatar" class="user-avatar">
                <User />
              </el-avatar>
              <el-button
                type="text"
                size="small"
                class="upload-btn"
                @click="uploadAvatarVisible = true"
              >
                更换头像
              </el-button>
            </div>
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">用户名：</span>
                <span class="info-value">{{ userInfo.username }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">角色：</span>
                <el-tag type="primary">{{ userInfo.role }}</el-tag>
              </div>
              <div class="info-item">
                <span class="info-label">最后登录时间：</span>
                <span class="info-value">{{ userInfo.lastLoginTime }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">登录IP：</span>
                <span class="info-value">{{ userInfo.loginIp }}</span>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 2. 安全设置标签页 -->
        <el-tab-pane label="安全设置" name="security">
          <el-form
            ref="pwdFormRef"
            :model="pwdForm"
            :rules="pwdRules"
            label-width="100px"
            class="pwd-form"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="pwdForm.oldPassword"
                type="password"
                placeholder="请输入原密码"
                show-password
                prefix-icon="Lock"
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="pwdForm.newPassword"
                type="password"
                placeholder="请输入6-18位新密码"
                show-password
                prefix-icon="Key"
              />
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="pwdForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
                prefix-icon="Key"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="handleUpdatePwd"
                :loading="updateLoading"
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
              :data="loginLogList"
              border
              hover
              v-loading="logLoading"
              size="small"
            >
              <el-table-column prop="id" label="日志ID" width="80" />
              <el-table-column prop="loginTime" label="登录时间" width="180" />
              <el-table-column prop="loginIp" label="登录IP" width="150" />
              <el-table-column prop="loginDevice" label="登录设备" width="200" />
              <el-table-column prop="loginLocation" label="登录地点" />
            </el-table>
            <el-pagination
              v-model:current-page="logPagination.pageNum"
              v-model:page-size="logPagination.pageSize"
              :total="logPagination.total"
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
            <el-form :model="customForm" class="custom-form">
              <el-form-item label="侧边栏折叠：">
                <el-switch
                  v-model="customForm.sidebarCollapse"
                  @change="saveCustomSetting"
                  active-text="折叠"
                  inactive-text="展开"
                />
              </el-form-item>
              <el-form-item label="主题风格：">
                <el-select
                  v-model="customForm.theme"
                  @change="saveCustomSetting"
                  style="width: 200px;"
                >
                  <el-option label="默认主题" value="default" />
                  <el-option label="暗黑主题" value="dark" />
                </el-select>
              </el-form-item>
              <el-form-item label="自动刷新看板：">
                <el-switch
                  v-model="customForm.autoRefresh"
                  @change="saveCustomSetting"
                  active-text="开启"
                  inactive-text="关闭"
                />
                <span class="custom-tips">（开启后5分钟刷新一次看板数据）</span>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="settingDialogVisible = false">
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
    >
      <el-upload
        class="avatar-uploader"
        action="/api/user/upload/avatar"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload"
      >
        <el-avatar :size="150" :src="userInfo.avatar">
          <User />
        </el-avatar>
      </el-upload>
      <div class="upload-tips">建议上传尺寸为200x200的图片，支持jpg/png格式</div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
// 接口导入
import { getUserInfo, updatePassword } from '@/api/user';
import { logout } from '@/api/login';
import { getLoginLogList, getRecentLoginLog } from '@/api/loginLog';
import { getUserStats } from '@/api/userStats'; // 新增：用户统计接口
// 图标
import { User, Lock, Key, SwitchButton, Setting, Clock, Brush } from '@element-plus/icons-vue';

// 路由实例
const router = useRouter();

// ======== 基础状态 ========
const settingDialogVisible = ref<boolean>(false);
const activeTab = ref<string>('baseInfo');
const uploadAvatarVisible = ref<boolean>(false);

// ======== 1. 页面核心展示数据 ========
// 用户基本信息
const userInfo = ref({
  avatar: '',
  username: '',
  role: '',
  lastLoginTime: '',
  loginIp: ''
});
// 用户核心统计
const userStats = ref({
  loginCount: 0, // 累计登录次数
  alarmHandled: 0, // 已处理报警数
  deviceManaged: 0 // 管理设备数
});
// 最近登录记录（简化版）
const recentLoginLogList = ref<any[]>([]);

// ======== 2. 弹窗内功能数据 ========
// 密码修改
const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' });
const pwdRules = ref<FormRules>({
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [{ required: true, min: 6, max: 18, message: '密码长度6-18位', trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: (_, val, cb) => val === pwdForm.newPassword ? cb() : cb(new Error('两次密码不一致')), trigger: 'blur' }]
});
const pwdFormRef = ref<FormInstance>();
const updateLoading = ref<boolean>(false);

// 登录日志（完整）
const loginLogList = ref<any[]>([]);
const logLoading = ref<boolean>(false);
const logPagination = reactive({ pageNum: 1, pageSize: 10, total: 0 });

// 个性化设置
const customForm = reactive({
  sidebarCollapse: localStorage.getItem('sidebarCollapse') === 'true',
  theme: localStorage.getItem('theme') || 'default',
  autoRefresh: localStorage.getItem('autoRefresh') === 'true'
});

// ======== 数据加载函数 ========
// 加载页面核心数据（仅展示，不影响其他页面）
const fetchPageData = async () => {
  try {
    // 1. 基本信息
    const infoRes = await getUserInfo();
    userInfo.value = infoRes.data;
    // 2. 核心统计
    const statsRes = await getUserStats();
    userStats.value = statsRes.data;
    // 3. 最近登录记录（前5条）
    const recentLogRes = await getRecentLoginLog();
    recentLoginLogList.value = recentLogRes.data;
  } catch (error) {
    console.error('加载用户中心核心数据失败：', error);
  }
};

// 加载完整登录日志（弹窗内）
const fetchLoginLogList = async () => {
  try {
    logLoading.value = true;
    const res = await getLoginLogList(logPagination);
    loginLogList.value = res.data.list;
    logPagination.total = res.data.total;
  } catch (error) {
    ElMessage.error('获取登录日志失败');
  } finally {
    logLoading.value = false;
  }
};

// ======== 功能函数 ========
// 修改密码
const handleUpdatePwd = async () => {
  if (!pwdFormRef.value) return;
  const valid = await pwdFormRef.value.validate();
  if (!valid) return;

  try {
    updateLoading.value = true;
    await updatePassword(pwdForm);
    ElMessage.success('密码修改成功，请重新登录');
    settingDialogVisible.value = false;
    handleLogout();
  } catch (error) {
    ElMessage.error('密码修改失败，请检查原密码');
  } finally {
    updateLoading.value = false;
  }
};

// 保存个性化设置（仅操作本地存储，不影响其他页面核心逻辑）
const saveCustomSetting = () => {
  localStorage.setItem('sidebarCollapse', customForm.sidebarCollapse.toString());
  localStorage.setItem('theme', customForm.theme);
  localStorage.setItem('autoRefresh', customForm.autoRefresh.toString());

  // 主题切换：仅添加class，不修改全局样式核心
  if (customForm.theme === 'dark') {
    document.documentElement.classList.add('dark-theme');
  } else {
    document.documentElement.classList.remove('dark-theme');
  }

  ElMessage.success('个性化设置已保存');
};

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定退出登录？', '提示', { type: 'warning' });
    await logout();
    localStorage.removeItem('token');
    router.push('/login');
    ElMessage.success('退出登录成功');
  } catch (error) {
    ElMessage.info('已取消退出');
  }
};

// 头像上传
const handleAvatarSuccess = (res: any) => {
  userInfo.value.avatar = res.data.avatarUrl;
  uploadAvatarVisible.value = false;
  ElMessage.success('头像上传成功');
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
  if (customForm.theme === 'dark') {
    document.documentElement.classList.add('dark-theme');
  }
});
</script>

<style scoped>
/* 页面整体布局 */
.user-center-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 页面标题 + 按钮 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 内容容器 */
.content-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 768px) {
  .content-wrapper {
    grid-template-columns: 2fr 1fr;
  }
  .main-info-card {
    grid-column: 1 / 3;
  }
}

/* 核心信息卡片 */
.main-info-card {
  padding: 20px;
}
.card-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.avatar-info {
  display: flex;
  align-items: center;
  gap: 20px;
}
.main-avatar {
  border: 2px solid #eee;
}
.user-basic {
  flex: 1;
}
.username {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}
.login-desc {
  color: #666;
  font-size: 14px;
  margin: 8px 0 0 0;
}
.user-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
.stat-item {
  text-align: center;
  flex: 1;
  min-width: 100px;
}
.stat-num {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 4px;
}
.stat-label {
  font-size: 14px;
  color: #666;
}

/* 快捷操作卡片 */
.quick-op-card {
  display: flex;
  flex-direction: column;
}
.quick-op-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 0;
}
.quick-op-list .el-button {
  width: 100%;
}

/* 最近登录记录卡片 */
.recent-log-card {
  grid-column: 1 / 3;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
}

/* 弹窗内样式（保留原有） */
.setting-tabs {
  margin-bottom: 20px;
}
.base-info-content, .pwd-form, .log-content, .custom-content {
  padding: 10px;
}
.log-pagination {
  margin-top: 15px;
  text-align: right;
}
.custom-tips {
  color: #999;
  font-size: 12px;
  margin-left: 10px;
}
.avatar-uploader {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}
.upload-tips {
  text-align: center;
  color: #999;
  font-size: 12px;
}

/* 响应式适配 */
@media (max-width: 576px) {
  .avatar-info {
    flex-direction: column;
    text-align: center;
  }
  .user-stats {
    gap: 10px;
  }
  .stat-num {
    font-size: 20px;
  }
}
</style>