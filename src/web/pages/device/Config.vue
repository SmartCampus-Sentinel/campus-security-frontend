<template>
  <div class="device-config-container">
    <h2>设备配置</h2>
    <el-form label-width="100px" :model="deviceInfo">
      <el-form-item label="设备ID">
        <el-input v-model="deviceInfo.id" disabled />
      </el-form-item>
      <el-form-item label="设备名称">
        <el-input v-model="deviceInfo.name" placeholder="请输入设备名称" />
      </el-form-item>
      <el-form-item label="设备类型">
        <el-select v-model="deviceInfo.type" placeholder="请选择设备类型">
          <el-option label="摄像头" value="camera" />
          <el-option label="报警器" value="alarm" />
        </el-select>
      </el-form-item>
      <el-form-item label="报警阈值">
        <el-input-number v-model="deviceInfo.threshold" min="0" max="100" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSave">保存配置</el-button>
        <el-button @click="$router.go(-1)">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';
import { ElMessage } from 'element-plus';

// 接收路由参数
const props = defineProps({
  deviceId: {
    type: String,
    required: true
  }
});

// 模拟设备信息
const deviceInfo = ref({
  id: props.deviceId,
  name: '',
  type: '',
  threshold: 50
});

// 保存配置（占位逻辑）
const handleSave = () => {
  ElMessage.success('设备配置保存成功');
};
</script>

<style scoped>
.device-config-container {
  padding: 20px;
}
.el-form {
  margin-top: 20px;
}
</style>