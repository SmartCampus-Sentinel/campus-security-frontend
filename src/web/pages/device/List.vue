<template>
  <div class="device-list-container">
    <!-- 查询表单 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline @submit.prevent="fetchDeviceList">
        <el-form-item label="设备名称">
          <el-input v-model="searchForm.deviceName" placeholder="请输入设备名称" clearable />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="searchForm.deviceType" placeholder="请选择设备类型" clearable>
            <el-option label="摄像头" value="camera" />
            <el-option label="报警器" value="alarm" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备状态">
          <el-select v-model="searchForm.status" placeholder="请选择设备状态" clearable>
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchDeviceList">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="exportDeviceList">导出</el-button>
          <el-button type="warning" @click="goToAddDevice">添加设备</el-button> <!-- 新增：添加设备按钮 -->
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 设备列表 -->
    <el-card>
      <el-table :data="deviceList" border hover stripe>
        <el-table-column prop="id" label="设备ID" width="100" />
        <el-table-column prop="deviceName" label="设备名称" width="150" />
        <el-table-column prop="deviceType" label="设备类型" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.deviceType === 'camera'">摄像头</el-tag>
            <el-tag v-else>报警器</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.status === 'online'">在线</el-tag>
            <el-tag type="danger" v-else>离线</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="安装位置" width="200" />
        <el-table-column prop="lastOnlineTime" label="最后在线时间" width="180" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button type="primary" size="small" @click="goDeviceConfig(scope.row.id)">
              配置
            </el-button>
            <el-button type="success" size="small" @click="refreshDeviceStatus(scope.row.id)">
              刷新状态
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
        @size-change="fetchDeviceList"
        @current-change="fetchDeviceList"
        class="pagination"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getDeviceInfoList, refreshDeviceStatus, exportDeviceList } from '@/api/device';

// 路由实例
const router = useRouter();
// 查询表单
const searchForm = ref({
  deviceName: '',
  deviceType: '',
  status: ''
});
// 分页参数
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
});
// 设备列表
const deviceList = ref([]);

// 获取设备列表
const fetchDeviceList = async () => {
  try {
    const res = await getDeviceInfoList({
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize,
      deviceName: searchForm.value.deviceName,
      deviceType: searchForm.value.deviceType,
      status: searchForm.value.status === 'online' ? 1 : searchForm.value.status === 'offline' ? 0 : undefined
    });
    deviceList.value = res.data.list || res.data;
    pagination.value.total = res.data.total || res.data.length || 0;
  } catch (error) {
    console.error('获取设备列表失败：', error);
  }
};

// 重置查询
const resetSearch = () => {
  searchForm.value = {
    deviceName: '',
    deviceType: '',
    status: ''
  };
  pagination.value.pageNum = 1;
  fetchDeviceList();
};

// 跳设备配置页
const goDeviceConfig = (id: string) => {
  router.push({ name: 'DeviceConfig', params: { deviceId: id } });
};

// 跳转到添加设备页面
const goToAddDevice = () => {
  router.push({ name: 'DeviceAdd' });
};

// 刷新设备状态
const refreshDeviceStatus = async (id: string) => {
  try {
    await refreshDeviceStatus(id);
    ElMessage.success('状态刷新成功');
    fetchDeviceList();
  } catch (error) {
    ElMessage.error('状态刷新失败');
  }
};

// 导出设备列表
const exportDeviceList = async () => {
  try {
    const res = await exportDeviceList(searchForm.value);
    // 创建下载链接
    const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `设备列表_${new Date().getTime()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success('导出成功');
  } catch (error) {
    ElMessage.error('导出失败');
  }
};

// 页面挂载时加载列表
onMounted(() => {
  fetchDeviceList();
});
</script>

<style scoped>
.device-list-container {
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