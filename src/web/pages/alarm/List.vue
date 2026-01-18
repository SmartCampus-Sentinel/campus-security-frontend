<template>
  <div class="alarm-list-container">
    <!-- 查询表单 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline @submit.prevent="fetchAlarmList">
        <el-form-item label="报警ID">
          <el-input v-model="searchForm.alarmId" placeholder="请输入报警ID" clearable />
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input v-model="searchForm.deviceName" placeholder="请输入设备名称" clearable />
        </el-form-item>
        <el-form-item label="报警状态">
          <el-select v-model="searchForm.status" placeholder="请选择报警状态" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="已处理" value="processed" />
            <el-option label="已忽略" value="ignored" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchAlarmList">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 报警列表 -->
    <el-card>
      <el-table :data="alarmList" border hover stripe>
        <el-table-column prop="id" label="报警ID" width="100" />
        <el-table-column prop="deviceName" label="设备名称" width="150" />
        <el-table-column prop="alarmType" label="报警类型" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag type="warning" v-if="scope.row.status === 'pending'">待处理</el-tag>
            <el-tag type="success" v-if="scope.row.status === 'processed'">已处理</el-tag>
            <el-tag type="info" v-if="scope.row.status === 'ignored'">已忽略</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="alarmTime" label="报警时间" width="180" />
        <el-table-column prop="location" label="报警位置" width="200" />
        <el-table-column label="操作" width="220">
          <template #default="scope">
            <el-button type="primary" size="small" @click="goAlarmDetail(scope.row.id)">
              详情
            </el-button>
            <el-button
              v-if="scope.row.status === 'pending'"
              type="success"
              size="small"
              @click="updateAlarmStatus(scope.row.id, 'processed')"
            >
              标记已处理
            </el-button>
            <el-button
              v-if="scope.row.status === 'pending'"
              type="info"
              size="small"
              @click="updateAlarmStatus(scope.row.id, 'ignored')"
            >
              忽略
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchAlarmList"
        @current-change="fetchAlarmList"
        class="pagination"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getAlarmList, updateAlarmStatus } from '@/api/alarm';

// 路由实例
const router = useRouter();
// 查询表单
const searchForm = ref({
  alarmId: '',
  deviceName: '',
  status: '',
  timeRange: []
});
// 分页参数
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
});
// 报警列表
const alarmList = ref([]);

// 获取报警列表
const fetchAlarmList = async () => {
  // 处理时间范围
  const params = {
    ...searchForm.value,
    startTime: searchForm.value.timeRange[0]?.format('YYYY-MM-DD HH:mm:ss') || '',
    endTime: searchForm.value.timeRange[1]?.format('YYYY-MM-DD HH:mm:ss') || '',
    pageNum: pagination.value.pageNum,
    pageSize: pagination.value.pageSize
  };
  try {
    const res = await getAlarmList(params);
    alarmList.value = res.data.list;
    pagination.value.total = res.data.total;
  } catch (error) {
    console.error('获取报警列表失败：', error);
  }
};

// 重置查询
const resetSearch = () => {
  searchForm.value = {
    alarmId: '',
    deviceName: '',
    status: '',
    timeRange: []
  };
  pagination.value.pageNum = 1;
  fetchAlarmList();
};

// 跳报警详情
const goAlarmDetail = (id: string) => {
  router.push({ name: 'AlarmDetail', params: { id } });
};

// 更新报警状态
const updateAlarmStatus = async (id: string, status: string) => {
  try {
    await updateAlarmStatus(id, status);
    ElMessage.success(`报警已${status === 'processed' ? '标记为已处理' : '忽略'}`);
    fetchAlarmList();
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

// 页面挂载时加载列表
onMounted(() => {
  fetchAlarmList();
});
</script>

<style scoped>
.alarm-list-container {
  padding: 0;
}
.search-card {
  margin-bottom: 20px;
}
.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>