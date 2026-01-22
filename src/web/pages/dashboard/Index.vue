<template>
  <div class="dashboard-container">
    <!-- 新增：看板头部（含刷新按钮） -->
    <div class="dashboard-header">
      <h2 class="dashboard-title">校园安防数据看板</h2>
      <el-button
        type="primary"
        icon="Refresh"
        @click="handleRefresh"
        :loading="refreshLoading"
        size="small"
      >
        刷新数据
      </el-button>
    </div>

    <!-- 数据卡片行 -->
    <div class="card-row">
      <el-card class="stat-card">
        <div class="stat-item">
          <span class="stat-label">设备总数</span>
          <span class="stat-value">{{ deviceTotal }}</span>
          <el-icon class="stat-icon"><Monitor /></el-icon>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-item">
          <span class="stat-label">在线设备</span>
          <span class="stat-value text-success">{{ deviceOnline }}</span>
          <el-icon class="stat-icon"><CircleCheck /></el-icon>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-item">
          <span class="stat-label">今日报警</span>
          <span class="stat-value text-danger">{{ alarmToday }}</span>
          <el-icon class="stat-icon"><Warning /></el-icon>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-item">
          <span class="stat-label">待处理报警</span>
          <span class="stat-value text-warning">{{ alarmPending }}</span>
          <el-icon class="stat-icon"><Bell /></el-icon>
        </div>
      </el-card>
    </div>

    <!-- 图表行 -->
    <div class="chart-row">
      <el-card class="chart-card">
        <template #header>
          <span>今日报警趋势</span>
        </template>
        <div class="chart-container" ref="alarmTrendChart"></div>
      </el-card>
      <el-card class="chart-card">
        <template #header>
          <span>设备状态分布</span>
        </template>
        <div class="chart-container" ref="deviceStatusChart"></div>
      </el-card>
    </div>

    <!-- 待处理报警列表 -->
    <el-card class="alarm-list-card">
      <template #header>
        <span>待处理报警（最近10条）</span>
        <el-button type="text" @click="$router.push({ name: 'AlarmList' })">查看全部</el-button>
      </template>
      <el-table :data="pendingAlarmList" border hover>
        <el-table-column prop="id" label="报警ID" width="80" />
        <el-table-column prop="deviceName" label="设备名称" width="150" />
        <el-table-column prop="alarmType" label="报警类型" width="120" />
        <el-table-column prop="alarmTime" label="报警时间" width="180" />
        <el-table-column prop="location" label="位置" />
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="text" @click="goAlarmDetail(scope.row.id)">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus'; // 新增：导入消息提示
import { getDashboardData, DashboardData, PendingAlarmItem } from '@/api/dashboard';
import { Monitor, CircleCheck, Warning, Bell, Refresh } from '@element-plus/icons-vue'; // 新增：导入Refresh图标

const refreshTimer = ref<NodeJS.Timeout | null>(null);

// 新增：开启自动刷新（默认5分钟）
const startAutoRefresh = (interval = 300000) => {
  if (refreshTimer.value) clearInterval(refreshTimer.value);
  refreshTimer.value = setInterval(() => {
    fetchDashboardData();
  }, interval);
};

// 页面挂载时开启自动刷新
onMounted(() => {
  fetchDashboardData();
  window.addEventListener('resize', handleResize);
  startAutoRefresh(); // 开启自动刷新
});

// 组件销毁时清除定时器
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  trendChartInstance.value?.dispose();
  statusChartInstance.value?.dispose();
  if (refreshTimer.value) clearInterval(refreshTimer.value); // 清除定时器
});

// 路由实例
const router = useRouter();
// 统计数据（补充TS类型）
const deviceTotal = ref<number>(0);
const deviceOnline = ref<number>(0);
const alarmToday = ref<number>(0);
const alarmPending = ref<number>(0);
// 待处理报警列表（补充TS类型）
const pendingAlarmList = ref<PendingAlarmItem[]>([]);
// 图表容器（补充TS类型）
const alarmTrendChart = ref<HTMLDivElement | null>(null);
const deviceStatusChart = ref<HTMLDivElement | null>(null);
// 存储图表实例，用于销毁/resize/刷新
const trendChartInstance = ref<echarts.ECharts | null>(null);
const statusChartInstance = ref<echarts.ECharts | null>(null);
// 新增：刷新加载状态
const refreshLoading = ref<boolean>(false);

// 获取看板数据（抽离核心逻辑，供初始化和刷新复用）
const fetchDashboardData = async () => {
  try {
    refreshLoading.value = true; // 新增：开启加载状态
    const res = await getDashboardData();
    const data = res.data;
    // 赋值统计数据
    deviceTotal.value = data.deviceTotal;
    deviceOnline.value = data.deviceOnline;
    alarmToday.value = data.alarmToday;
    alarmPending.value = data.alarmPending;
    pendingAlarmList.value = data.pendingAlarmList;
    // 初始化/刷新图表
    initCharts(data);
    // 新增：刷新成功提示
    ElMessage.success('数据刷新成功');
  } catch (error) {
    console.error('获取看板数据失败：', error);
    // 新增：刷新失败提示
    ElMessage.error('数据刷新失败，请稍后重试');
  } finally {
    refreshLoading.value = false; // 新增：关闭加载状态（无论成功/失败）
  }
};

// 初始化/刷新图表（优化：先销毁旧图表，避免叠加）
const initCharts = (data: DashboardData) => {
  // 1. 今日报警趋势图（先销毁旧实例，再重新初始化）
  if (trendChartInstance.value) {
    trendChartInstance.value.dispose(); // 销毁旧图表
  }
  if (alarmTrendChart.value) {
    trendChartInstance.value = echarts.init(alarmTrendChart.value);
    trendChartInstance.value.setOption({
      xAxis: { type: 'category', data: data.alarmTrend.xAxis },
      yAxis: { type: 'value' },
      series: [{
        name: '报警数',
        type: 'line',
        data: data.alarmTrend.yAxis,
        itemStyle: { color: '#f56c6c' },
        smooth: true
      }],
      tooltip: { trigger: 'axis' },
      grid: { left: '10%', right: '5%', bottom: '10%', top: '10%' }
    });
  }

  // 2. 设备状态分布图（先销毁旧实例，再重新初始化）
  if (statusChartInstance.value) {
    statusChartInstance.value.dispose(); // 销毁旧图表
  }
  if (deviceStatusChart.value) {
    statusChartInstance.value = echarts.init(deviceStatusChart.value);
    statusChartInstance.value.setOption({
      series: [{
        name: '设备状态',
        type: 'pie',
        radius: ['40%', '70%'],
        data: data.deviceStatus,
        label: { show: true, position: 'outside' }
      }],
      tooltip: { trigger: 'item' }
    });
  }
};

// 新增：手动刷新函数
const handleRefresh = () => {
  fetchDashboardData(); // 复用数据获取逻辑
};

// 窗口resize处理函数（抽离以便移除）
const handleResize = () => {
  trendChartInstance.value?.resize();
  statusChartInstance.value?.resize();
};

// 跳报警详情（补充TS类型）
const goAlarmDetail = (id: string) => {
  router.push({ name: 'AlarmDetail', params: { id } });
};

// 页面挂载时加载数据 + 绑定resize事件
onMounted(() => {
  fetchDashboardData();
  window.addEventListener('resize', handleResize);
});

// 组件销毁时：移除resize事件 + 销毁图表实例
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  trendChartInstance.value?.dispose();
  statusChartInstance.value?.dispose();
});
</script>

<style scoped>
/* 新增：看板头部样式 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 2px;
}
.dashboard-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.dashboard-container {
  padding: 0;
}
.card-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.stat-card {
  flex: 1;
  min-width: 200px;
}
.stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
}
.stat-label {
  font-size: 14px;
  color: #666;
}
.stat-value {
  font-size: 24px;
  font-weight: 600;
}
.stat-icon {
  font-size: 20px;
  color: #409eff;
}
.text-success { color: #67c23a; }
.text-danger { color: #f56c6c; }
.text-warning { color: #e6a23c; }

.chart-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.chart-card {
  flex: 1;
  height: 300px;
  min-width: 300px;
}
.chart-container {
  width: 100%;
  height: 240px;
}

.alarm-list-card {
  margin-top: 20px;
}
:deep(.el-table) {
  overflow-x: auto;
}
</style>