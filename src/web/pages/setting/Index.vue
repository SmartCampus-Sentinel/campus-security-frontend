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
        class="setting-btn"
      >
        详细设置
      </el-button>
    </div>

    <!-- 核心信息卡片 -->
    <el-card class="main-info-card">
      <div class="card-content">
        <div class="avatar-info">
          <el-avatar :size="80" :src="userInfo.avatar" class="main-avatar">
            <User />
          </el-avatar>
          <div class="user-basic">
            <h3 class="username">{{ userInfo.username || '管理员' }}</h3>
            <p class="login-desc">最后登录：{{ userInfo.lastLoginTime || '暂无数据' }} | {{ userInfo.loginIp || '未知IP' }}</p>
          </div>
        </div>

        <div class="user-stats">
          <div class="stat-item">
            <span class="stat-num">{{ userStats.loginCount || 0 }}</span>
            <span class="stat-label">累计登录次数</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">{{ userStats.alarmHandled || 0 }}</span>
            <span class="stat-label">已处理报警数</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">{{ userStats.deviceManaged || 0 }}</span>
            <span class="stat-label">管理设备数</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 快捷操作卡片 -->
    <el-card class="quick-op-card">
      <template #header>
        <span class="card-title">快捷操作</span>
      </template>
      <div class="quick-op-list">
        <div class="op-item op-item-blue" @click="() => { activeTab = 'security'; settingDialogVisible = true }">
          <el-icon class="op-icon"><Key /></el-icon>
          <span class="op-text">修改密码</span>
        </div>
        <div class="op-item op-item-green" @click="() => { activeTab = 'loginLog'; settingDialogVisible = true }">
          <el-icon class="op-icon"><Clock /></el-icon>
          <span class="op-text">查看登录日志</span>
        </div>
        <div class="op-item op-item-orange" @click="() => { activeTab = 'custom'; settingDialogVisible = true }">
          <el-icon class="op-icon"><Brush /></el-icon>
          <span class="op-text">个性化设置</span>
        </div>
        <div class="op-item op-item-purple" @click="handleLogout">
          <el-icon class="op-icon"><Logout /></el-icon>
          <span class="op-text">退出登录</span>
        </div>
      </div>
    </el-card>

    <!-- 最近登录记录 -->
    <el-card class="recent-log-card">
      <template #header>
        <span class="card-title">最近登录记录</span>
        <el-button
          type="text"
          size="small"
          @click="() => { activeTab = 'loginLog'; settingDialogVisible = true }"
          class="view-all-btn"
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
        empty-text="暂无登录记录"
      >
        <el-table-column prop="loginTime" width="180" />
        <el-table-column prop="loginIp" width="150" />
        <el-table-column prop="loginDevice" />
      </el-table>
    </el-card>

    <!-- 详细设置弹窗 -->
    <el-dialog
      v-model="settingDialogVisible"
      title="个人中心详细设置"
      width="800px"
      top="20px"
      destroy-on-close
      :close-on-click-modal="false"
      class="setting-dialog"
    >
      <el-tabs v-model="activeTab" type="card" class="setting-tabs">
        <!-- 标签页内容（保持原有逻辑） -->
      </el-tabs>
      <template #footer>
        <el-button @click="settingDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 原有逻辑保持不变，无需修改
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getUserInfo, updatePassword } from '@/api/user';
import { logout } from '@/api/login';
import { getLoginLogList, getRecentLoginLog } from '@/api/loginLog';
import { getUserStats } from '@/api/userStats';
import { User, Lock, Key, Logout, Setting, Clock, Brush } from '@element-plus/icons-vue';

const router = useRouter();
const settingDialogVisible = ref(false);
const activeTab = ref('baseInfo');
const userInfo = ref({});
const userStats = ref({});
const recentLoginLogList = ref([]);
// ... 其他变量和方法
</script>

<style scoped>
/* 全局渐变背景 */
.user-center-container {
  padding: 24px;
  background: linear-gradient(135deg, #e0f7fa 0%, #fce4ec 100%);
  min-height: 100vh;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  background: linear-gradient(90deg, #4299e1, #ed64a6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.setting-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 核心信息卡片（玻璃拟态） */
.main-info-card {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin-bottom: 24px;
}
.avatar-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.main-avatar {
  border: 3px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.username {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px 0;
}
.login-desc {
  color: #718096;
  font-size: 14px;
  margin: 0;
}
.user-stats {
  display: flex;
  gap: 24px;
  justify-content: space-around;
}
.stat-item {
  text-align: center;
}
.stat-num {
  display: block;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(90deg, #4299e1, #ed64a6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 4px;
}
.stat-label {
  font-size: 14px;
  color: #718096;
}

/* 快捷操作卡片 */
.quick-op-card {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin-bottom: 24px;
}
.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}
.quick-op-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}
.op-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 16px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.op-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}
.op-item-blue {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
}
.op-item-green {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}
.op-item-orange {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
}
.op-item-purple {
  background: linear-gradient(135deg, #9f7aea 0%, #805ad5 100%);
}
.op-icon {
  font-size: 28px;
  margin-bottom: 8px;
}
.op-text {
  font-size: 14px;
  font-weight: 500;
}

/* 最近登录记录卡片 */
.recent-log-card {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  padding: 24px;
}
.view-all-btn {
  color: #4299e1;
  font-size: 14px;
  padding: 0;
}

/* 弹窗美化 */
.setting-dialog {
  border-radius: 16px;
  overflow: hidden;
}
.setting-tabs {
  margin-bottom: 24px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .user-stats {
    flex-direction: column;
    gap: 16px;
  }
  .quick-op-list {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 576px) {
  .avatar-info {
    flex-direction: column;
    text-align: center;
  }
  .quick-op-list {
    grid-template-columns: 1fr;
  }
}
</style>