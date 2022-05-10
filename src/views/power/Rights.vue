<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="box-card">
      <!-- Table 表格 -->
      <el-table :data="rightsList" border style="width: 100%" max-height="500" stripe>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="authName" label="权限名称"> </el-table-column>
        <el-table-column prop="path" label="路径"> </el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level == 0">一级</el-tag>
            <el-tag v-if="scope.row.level == 1" type="success">二级</el-tag>
            <el-tag v-if="scope.row.level == 2" type="warning">三级</el-tag>
            <el-tag v-if="scope.row.level == 3" type="danger">四级</el-tag>
          </template>
          <!-- {{scope.row.level}} -->
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'myRights',
  data() {
    return {
      rightsList: []
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    // 获取权限列表
    async getRightsList() {
      const { data: res } = await this.$axios.get('shop/rights/list')
      // (res)
      this.rightsList = res.data
      if (res.meta.status !== 200) return this.$message.error('请求权限数据列表失败！')
    }
  }
}
</script>

<style lang="less" scoped>
.el-table__body {
  colgroup,
  tbody {
    // 隐藏滚动条
    overflow: auto !important;
    // overflow-y: auto;
    // overflow-x: hidden;
    // 解决隐藏滚动条无法滚动的问题
    &::-webkit-scrollbar {
      display: none;
    }
  }
}
</style>
