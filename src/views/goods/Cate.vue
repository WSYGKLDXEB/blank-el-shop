<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- Card 卡片 -->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-row :gutter="20">
          <el-col :span="10">
            <!-- 输入框 -->
            <el-input v-model="queryInput" placeholder="输入ID查询分类" class="input-with-select" clearable @clear="getCateList">
              <el-button slot="append" icon="el-icon-search" @click="getIdQueryCate"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="showAddClassDialog">添加分类</el-button>
          </el-col>
        </el-row>
      </div>
      <!-- tree-table插件 -->
      <tree-table border show-index max-height="300" index-text="#" :data="cateList" :columns="columns" :selection-type="false" :show-row-hover="false" :expand-type="false">
        <!-- 是否有效列 -->
        <template slot="isok" slot-scope="scope">
          <i v-if="!scope.row.cat_deleted" class="el-icon-success" style="color: #67c23a"></i>
          <i v-if="scope.row.cat_deleted" class="el-icon-error" style="color: #f56c6c"></i>
        </template>
        <!-- 排序列 -->
        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-if="scope.row.cat_level === 2" type="warning">三级</el-tag>
        </template>
        <!-- 操作列 -->
        <template slot="operation" slot-scope="scope">
          <el-button size="medium" type="primary" icon="el-icon-edit" @click="openEditClassDialog(scope.row)">编辑</el-button>
          <el-button size="medium" type="danger" icon="el-icon-delete" @click="removeClass(scope.row)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="params.pagenum"
        :page-size="params.pagesize"
        :page-sizes="[5, 10, 15, 20]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="margin-top: 15px"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="isaddClassDialog" width="60%" center>
      <el-form ref="addClassformRef" @close="addCateDialogClose" :rules="formRules" :model="addClassform" label-width="80px">
        <el-form-item label="名称:" prop="cat_name">
          <el-input v-model="addClassform.cat_name" clearable></el-input>
        </el-form-item>
        <el-form-item label="级别:">
          <!-- Cascader 级联选择器 -->
          <!-- options数据源 -->
          <el-cascader v-model="selectedKeys" :options="fatherCateList" @change="cascadeCateChange" :props="cascaderProps" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isaddClassDialog = false">取 消</el-button>
        <el-button type="primary" @click="addClass">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog title="编辑分类" :visible.sync="isEditClassDialog" width="60%" center>
      <!-- <span>这是一段信息</span> -->
      <el-form ref="editClassformRef" :rules="formRules" :model="rows" label-width="80px">
        <el-form-item label="ID:">
          <el-input disabled v-model="rows.cat_id"></el-input>
        </el-form-item>
        <el-form-item label="名称:" prop="cat_name">
          <el-input clearable v-model="rows.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isEditClassDialog = false">取 消</el-button>
        <el-button type="primary" @click="editClass">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'myCate',
  data() {
    return {
      // 商品列表
      cateList: [],
      // 父级分类列表
      fatherCateList: [],
      // table索引规则
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          // 表示该行为自定模板列
          type: 'template',
          // 模板名称
          template: 'isok'
        },
        {
          label: '排序',
          prop: 'cat_level',
          // 表示该行为自定模板列
          type: 'template',
          // 模板名称
          template: 'sort'
        },
        {
          label: '操作',
          prop: '',
          // 表示该行为自定模板列
          type: 'template',
          // 模板名称
          template: 'operation'
        }
      ],
      // 请求商品列表参数
      params: {
        // [1,2,3]
        type: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 5
      },
      // 请求数据条数
      total: 0,
      // 添加分类对话框显示与否
      isaddClassDialog: false,
      // 编辑分类对话框显示与否
      isEditClassDialog: false,
      // 添加分类规则
      formRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        cat_level: [{ required: true, message: '请选择分类级别', trigger: 'change' }]
      },
      // 添加分类表单数据
      addClassform: {
        // 分类父 ID
        cat_pid: 0,
        // 分类名称
        cat_name: '',
        // 分类层级 默认为一级
        cat_level: 0
      },
      // Cascader 级联选择器 props规则
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 选中的父级ID数组
      selectedKeys: [],
      // 当前分类对象
      rows: {},
      queryInput: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品列表
    async getCateList() {
      const { data: res } = await this.$axios.get('shop/categories', { params: this.params })
      // (res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 根据ID查询分类
    async getIdQueryCate() {
      const { data: res } = await this.$axios.get('shop/categories/' + this.queryInput)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.cateList = [...res.data]
      // (this.cateList)
    },
    // 每页显示数据数量改变
    handleSizeChange(newSize) {
      this.params.pagesize = newSize
      this.getCateList()
    },
    // 监听页码值改变
    handleCurrentChange(newPage) {
      this.params.pagenum = newPage
      this.getCateList()
    },
    // 显示添加分类对话框
    showAddClassDialog() {
      // this.$nextTick(() => {
      //   this.$refs.addClassformRef.resetFields()
      // })
      // // (row)
      this.getFatherCateList()
      this.isaddClassDialog = true
    },
    // 关闭添加分类对话框
    addCateDialogClose() {
      this.$refs.addClassformRef.resetFields()
      this.selectedKeys = []
      this.addClassform.cat_pid = 0
      this.addClassform.cat_level = 0
    },
    // 添加分类
    addClass() {
      this.$refs.addClassformRef.validate(async (valid) => {
        // (valid)
        if (!valid) return
        const { data: res } = await this.$axios.post('shop/categories', this.addClassform)
        // (this.addClassform)
        // (res)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.isaddClassDialog = false
        this.getCateList()
      })
    },
    // 获取父级分类的数据列表
    async getFatherCateList() {
      const { data: res } = await this.$axios.get('shop/categories', { params: { type: 2 } })
      // (res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.fatherCateList = res.data
    },
    // Cascader 级联选择器 选中变化触发
    cascadeCateChange() {
      if (this.selectedKeys.length > 0) {
        // this.addClassform.cat_pid = this.selectedKeys[0]
        // if (this.selectedKeys[1]) this.addClassform.cat_level = this.selectedKeys[1]
        // 分类父级ID
        this.addClassform.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为分类等级赋值
        this.addClassform.cat_level = this.selectedKeys.length
      } else {
        // 分类父级ID
        this.addClassform.cat_pid = 0
        // 为分类等级赋值
        this.addClassform.cat_level = 0
      }
    },
    // 打开编辑分类对话框
    async openEditClassDialog(row) {
      // (row)
      this.rows = row
      this.isEditClassDialog = true
    },
    // 提交更改后的分类
    editClass() {
      this.$refs.editClassformRef.validate(async (valid) => {
        // // (vaild)
        if (!valid) return
        const { data: res } = await this.$axios.put('shop/categories/' + this.rows.cat_id, { cat_name: this.rows.cat_name })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getCateList()
        // this.rows = res.data
        this.isEditClassDialog = false
      })
    },
    // 删除分类
    async removeClass(row) {
      const isRemove = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (isRemove === 'confirm') {
        const { data: res } = await this.$axios.delete('shop/categories/' + row.cat_id)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getCateList()
      } else {
        this.$message.warning('取消删除分类成功！')
      }
    }
  }
}
</script>

<style lang="less" scoped>
// 文字与输入框平齐
.inputRight {
  // display: flex;
  // justify-content: space-between;
  float: right;
  width: 80%;
}
.el-result {
  width: 15px;
  height: 15px;
}
// div{
//   margin: 6px;
// }
</style>
