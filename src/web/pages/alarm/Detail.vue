<template>
  <div class="alarm-detail-container">
    <h2>报警详情</h2>
    <el-form label-width="100px" :model="alarmInfo">
      <el-form-item label="报警ID">
        <el-input v-model="alarmInfo.id" disabled />
      </el-form-item>
      <el-form-item label="报警类型">
        <el-input v-model="alarmInfo.type" disabled />
      </el-form-item>
      <el-form-item label="报警时间">
        <el-input v-model="alarmInfo.time" disabled />
      </el-form-item>
      <el-form-item label="报警位置">
        <el-input v-model="alarmInfo.location" disabled />
      </el-form-item>
      <el-form-item label="处理状态">
        <el-select v-model="alarmInfo.status" placeholder="请选择处理状态">
          <el-option label="未处理" value="0" />
          <el-option label="已处理" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSave">保存</el-button>
        <el-button @click="$router.go(-1)">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';
import { ElMessage } from 'element-plus';

// 接收路由参数（props已在路由中开启）
const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

// 模拟报警信息
const alarmInfo = ref({
  id: props.id,
  type: '设备异常',
  time: new Date().toLocaleString(),
  location: '教学楼A栋3层',
  status: '0'
});

// 保存处理状态（占位逻辑）
const handleSave = () => {
  ElMessage.success('处理状态保存成功');
};
</script>

<style scoped>
.alarm-detail-container {
  padding: 20px;
}
.el-form {
  margin-top: 20px;
}
</style>