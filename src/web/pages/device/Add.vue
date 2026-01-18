<template>
  <div class="add-device-container">
    <el-card class="add-device-card">
      <template #header>
        <div class="card-header">
          <span>添加新设备</span>
        </div>
      </template>

      <el-form
        :model="deviceForm"
        :rules="deviceRules"
        ref="deviceFormRef"
        label-width="120px"
        class="device-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备名称" prop="deviceName">
              <el-input
                v-model="deviceForm.deviceName"
                placeholder="请输入设备名称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备类型" prop="deviceType">
              <el-select
                v-model="deviceForm.deviceType"
                placeholder="请选择设备类型"
                style="width: 100%"
              >
                <el-option label="摄像头" value="camera" />
                <el-option label="报警器" value="alarm" />
                <el-option label="门禁系统" value="access_control" />
                <el-option label="传感器" value="sensor" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="安装位置" prop="location">
              <el-input
                v-model="deviceForm.location"
                placeholder="请输入设备安装位置"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备IP地址" prop="ipAddress">
              <el-input
                v-model="deviceForm.ipAddress"
                placeholder="请输入设备IP地址"
                maxlength="15"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="设备配置" prop="config">
          <el-input
            v-model="deviceForm.configStr"
            type="textarea"
            :rows="4"
            placeholder='请输入设备配置（JSON格式，例如：{"username": "admin", "password": "123456"}）'
          />
          <div class="config-tip">
            提示：请按照JSON格式输入设备配置参数
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            {{ submitting ? '提交中...' : '提交' }}
          </el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { addDevice, AddDeviceParams } from '@/api/device';

// 定义API响应类型
interface ApiResponse<T = any> {
  code: number;
  msg?: string;
  data: T;
}

// 路由实例
const router = useRouter();

// 表单数据
const deviceForm = reactive({
  deviceName: '',
  deviceType: '',
  location: '',
  ipAddress: '',
  configStr: '' // JSON字符串形式的配置
});

// 表单验证规则
const deviceRules = {
  deviceName: [
    { required: true, message: '请输入设备名称', trigger: 'blur' },
    { min: 1, max: 50, message: '设备名称长度应在1-50个字符之间', trigger: 'blur' }
  ],
  deviceType: [
    { required: true, message: '请选择设备类型', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请输入安装位置', trigger: 'blur' },
    { min: 1, max: 100, message: '安装位置长度应在1-100个字符之间', trigger: 'blur' }
  ],
  ipAddress: [
    { required: true, message: '请输入设备IP地址', trigger: 'blur' },
    {
      pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
      message: '请输入正确的IP地址格式',
      trigger: 'blur'
    }
  ]
};

// 提交按钮状态
const submitting = ref(false);
const deviceFormRef = ref();

// 提交表单
const submitForm = async () => {
  // 验证表单
  if (!deviceFormRef.value) return;

  try {
    await deviceFormRef.value.validate();
  } catch (error) {
    console.error('表单验证失败：', error);
    return;
  }

  // 解析配置字符串
  let config = {};
  if (deviceForm.configStr.trim()) {
    try {
      config = JSON.parse(deviceForm.configStr);
    } catch (error) {
      ElMessage.error('设备配置JSON格式不正确，请检查格式');
      return;
    }
  }

  // 准备提交数据
  const submitData: AddDeviceParams = {
    deviceName: deviceForm.deviceName,
    deviceType: deviceForm.deviceType,
    location: deviceForm.location,
    ipAddress: deviceForm.ipAddress,
    config: Object.keys(config).length > 0 ? config : undefined
  };

  // 设置提交状态
  submitting.value = true;

  try {
    // 使用类型断言来处理API响应
    const response = (await addDevice(submitData)) as ApiResponse;

    if (response.code === 200) {
      ElMessage.success('设备添加成功！');

      // 询问是否继续添加
      try {
        await ElMessageBox.confirm(
          '设备添加成功！是否继续添加新设备？',
          '操作成功',
          {
            confirmButtonText: '继续添加',
            cancelButtonText: '返回列表',
            type: 'success'
          }
        );
        // 用户选择继续添加，清空表单
        resetForm();
      } catch (error) {
        // 用户选择返回列表
        router.push({ name: 'DeviceList' });
      }
    } else {
      ElMessage.error(response.msg || '设备添加失败');
    }
  } catch (error: any) {
    console.error('添加设备失败：', error);
    ElMessage.error(error.message || '设备添加失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};

// 重置表单
const resetForm = () => {
  deviceForm.deviceName = '';
  deviceForm.deviceType = '';
  deviceForm.location = '';
  deviceForm.ipAddress = '';
  deviceForm.configStr = '';
};

// 返回设备列表
const goBack = () => {
  router.push({ name: 'DeviceList' });
};
</script>

<style scoped>
.add-device-container {
  padding: 20px;
}

.add-device-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.device-form {
  margin-top: 20px;
}

.config-tip {
  margin-top: 5px;
  color: #909399;
  font-size: 12px;
}
</style>
