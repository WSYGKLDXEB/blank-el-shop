<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="box-card">
      <!-- alert警告 -->
      <el-alert v-if="isWarningAlert" show-icon :closable="false" title="注意: 只允许为第三级分类设置相关参数！" type="warning"> </el-alert>
      <el-row style="margin: 15px 0">
        <!-- <el-col :span="3"> -->
        <el-col>
          <span>选择商品分类: </span>
          <!-- 级联选择框 -->
          <el-cascader v-model="selectedKeys" :props="propsConf" :options="cateList" @change="casHandleChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- Tabs 标签页 -->
      <template>
        <el-tabs v-model="tabsActiveName" @tab-click="tabsHandleClick">
          <el-tab-pane label="动态参数" name="many">
            <el-button type="primary" size="mini" :disabled="isBtnDis" @click="showAddParamsDialog">添加参数</el-button>
          </el-tab-pane>
          <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" size="mini" :disabled="isBtnDis" @click="showAddParamsDialog">添加属性</el-button>
          </el-tab-pane>
        </el-tabs>
      </template>
      <!-- 动态table表格 -->
      <el-table border stripe :data="ParamsList" style="width: 100%; margin: 15px 0">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- Tag 标签 -->
            <!-- split(',') -->
            <el-tag :key="i" style="margin: 0 8px" v-for="(tag, i) in scope.row.attr_vals" closable @close="removeTag(scope.row, i)" :disable-transitions="false">
              {{ tag }}
            </el-tag>
            <el-input
              class="input-new-tag"
              @blur="handleInputConfirm(scope.row)"
              ref="saveTagInput"
              v-model="scope.row.addTagInputValue"
              size="small"
              v-if="scope.row.isAddTagInput"
              @keyup.enter.native="handleInputConfirm(scope.row)"
            ></el-input>
            <el-button v-else style="margin: 0 8px" class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="attr_name" label="名称"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditParamsDialog(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog :title="tabsActiveName == 'many' ? '添加参数' : '添加属性'" :visible.sync="isAddParamsDialog" width="60%" center>
      <el-form label-width="60px" ref="paramsFormRef" :model="paramsForm" :rules="paramsFormRules">
        <el-form-item label="名称" prop="attr_name">
          <el-input clearable v-model="paramsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isAddParamsDialog = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑参数对话框 -->
    <el-dialog title="编辑参数" :visible.sync="isEditParamsDialog" width="60%" center>
      <el-form label-width="60px" ref="paramsFormRef" :model="paramsForm" :rules="paramsFormRules">
        <el-form-item label="名称" prop="attr_name">
          <el-input clearable v-model="paramsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isEditParamsDialog = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'myParams',
  data() {
    return {
      // 分类列表
      cateList: [],
      // 参数列表
      ParamsList: [],
      // 标签列表
      tabsList: [],
      // 静态
      // onlyParamsList: [],
      // 动态
      // manyParamsList: [],
      // 级联选择器配置
      propsConf: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedKeys: [],
      // 控制警告提示的显示与否
      isWarningAlert: false,
      // 编辑参数对话框显示与否
      isEditParamsDialog: false,
      // 添加参数对话框显示与否
      isAddParamsDialog: false,
      // tab输入框的显示与否
      // isAddTagInput: false,
      // // 添加参数对话框显示与否
      // isAddManyDialog: false,
      // // 添加属性对话框显示与否
      // isAddOnlyDialog: false,
      // tabs选择页签值
      tabsActiveName: 'many',
      // 添加参数表单
      paramsForm: {
        // 参数名称
        attr_name: '',
        // [only,many]
        attr_sel: ''
      },
      // 添加参数表单规则
      paramsFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ]
      },
      // 当前分类
      rows: {}
      // 添加tag标签值
      // addTagInputValue: ''
    }
  },
  computed: {
    // 如果按钮需要禁用 返回true 否则返回false
    isBtnDis() {
      if (this.selectedKeys.length !== 3) return true
      return false
    },
    // 当前被选中的三级分类ID
    cateId() {
      return this.selectedKeys.length === 3 ? this.selectedKeys[this.selectedKeys.length - 1] : null
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取分类列表
    async getCateList() {
      const { data: res } = await this.$axios.get('shop/categories', { params: { type: 3 } })
      // // (res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data
    },
    // 获取参数列表
    async getParamsList(sels) {
      this.ParamsList = []
      const { data: res } = await this.$axios.get(`shop/categories/${this.cateId}/attributes`, { params: { sel: sels } })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败！')
      // this.ParamsList = res.data
      // (this.ParamsList)
      // tag分割
      res.data.forEach((item) => {
        // item.attr_vals = item.attr_vals ? item.attr_vals.split(/,| /) : []
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 自定属性
        // 控制文本框的显示与否
        item.isAddTagInput = false
        // 文本框中所输入的值
        item.addTagInputValue = ''
      })
      this.ParamsList = res.data
    },
    // 级联选择器数据变化触发
    casHandleChange() {
      this.ParamsList = []
      // (this.selectedKeys)
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.ParamsList = []
        this.isWarningAlert = true
      } else {
        this.isWarningAlert = false
        // 默认
        this.getParamsList(this.tabsActiveName)
      }
    },
    // tabs选择值变化触发
    tabsHandleClick() {
      this.getParamsList(this.tabsActiveName)
    },
    // 显示添加参数对话框
    showAddParamsDialog() {
      this.isAddParamsDialog = true
      this.$nextTick(() => {
        this.$refs.paramsFormRef.resetFields()
      })
    },
    // 添加参数
    addParams() {
      this.$refs.paramsFormRef.validate(async (valid) => {
        if (!valid) return
        this.paramsForm.attr_sel = this.tabsActiveName
        // (this.paramsForm)
        const { data: res } = await this.$axios.post(`shop/categories/${this.cateId}/attributes`, this.paramsForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success('添加参数成功！')
        // this.cateList
        this.getParamsList(this.tabsActiveName)
        this.isAddParamsDialog = false
      })
    },
    // 删除参数
    async removeParams(row) {
      // (row)
      const isDis = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (isDis === 'confirm') {
        const { data: res } = await this.$axios.delete(`shop/categories/${this.cateId}/attributes/${row.attr_id}`)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.getParamsList(this.tabsActiveName)
        return this.$message.success('删除参数成功！')
      } else {
        this.$message.warning('取消删除参数成功！')
      }
    },
    // 显示编辑参数对话框
    showEditParamsDialog(row) {
      this.rows = row
      this.isEditParamsDialog = true
      this.$nextTick(() => {
        this.$refs.paramsFormRef.resetFields()
      })
      this.paramsForm.attr_name = row.attr_name
    },
    // 编辑参数
    editParams() {
      // this.tabsList.splice
      this.$refs.paramsFormRef.validate(async (valid) => {
        if (!valid) return
        this.paramsForm.attr_sel = this.tabsActiveName
        const { data: res } = await this.$axios.put(`shop/categories/${this.cateId}/attributes/${this.rows.attr_id}`, this.paramsForm)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success('编辑参数成功！')
        // this.cateList
        this.getParamsList(this.tabsActiveName)
        this.isEditParamsDialog = false
      })
    },
    // 显示tag添加输入框
    showInput(rows) {
      rows.isAddTagInput = true
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 提交tag更改
    async submitTagChange(rows) {
      // // (rows.attr_vals.join(','))
      const { data: res } = await this.$axios.put(`shop/categories/${this.cateId}/attributes/${rows.attr_id}`, {
        attr_name: rows.attr_name,
        attr_sel: rows.attr_sel,
        attr_vals: rows.attr_vals.join(',')
      })
      // (res)
      // rows = res.data
      if (res.meta.status !== 200) return this.$message.error(res.meta.nsg)
      this.$message.success('更改属性成功！')
      // this.ParamsList = res.data
      this.getParamsList(rows.attr_sel)
    },
    // 隐藏tag添加输入框
    handleInputConfirm(rows) {
      // const inputValue = this.inputValue
      // if (rows.addTagInputValue) {
      if (rows.addTagInputValue.trim().length !== 0) {
        rows.attr_vals.push(rows.addTagInputValue.trim())
        // // (rows.tabsActiveName)
        this.submitTagChange(rows)
      }
      rows.isAddTagInput = false
      rows.addTagInputValue = ''
    },
    // 删除tag标签
    async removeTag(rows, i) {
      const isDis = await this.$confirm('此操作将永久删除该属性, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (isDis === 'confirm') {
        rows.attr_vals.splice(i, 1)
        this.submitTagChange(rows)
      } else {
        this.$message.warning('取消删除成功！')
      }
    }
  }
}
</script>

<style lang="less" scoped>
// div{
//   margin-bottom: 15px;
// }
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
