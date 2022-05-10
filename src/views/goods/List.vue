<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="box-card">
      <!-- 表头 -->
      <div slot="header" class="clearfix">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input clearable placeholder="请输入内容" v-model="params.query" @change="getGoodsList" @clear="getGoodsList">
              <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="goAddGoodsPath">添加商品</el-button>
          </el-col>
        </el-row>
      </div>
      <!-- table 表格 -->
      <template>
        <el-table border stripe :data="goodsList" style="width: 100%">
          <el-table-column type="index" label="#"> </el-table-column>
          <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
          <el-table-column prop="goods_price" label="商品价格(元)" width="102"> </el-table-column>
          <el-table-column prop="goods_number" label="商品数量" width="78"></el-table-column>
          <el-table-column prop="add_time" label="创建时间" width="160">
            <template slot-scope="scope">{{ scope.row.add_time | dateFormat }}</template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              <!-- 文字提示 -->
              <el-tooltip :enterable="false" class="item" effect="dark" content="编辑" placement="top">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="goEditGoodsPath(scope.row)"></el-button>
              </el-tooltip>
              <el-tooltip :enterable="false" class="item" effect="dark" content="删除" placement="top">
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeGoods(scope.row)"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <!-- 分页 -->
      <el-pagination
        style="margin-top: 15px"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="params.pagenum"
        :page-sizes="[8, 16, 32, 64]"
        :page-size="params.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
    <!-- 编辑商品对话框 -->
    <el-dialog @close="reset" center title="收货地址" :visible.sync="isEditGoodsDialog">
      <el-form :model="row" :rules="GoodFormRules" ref="editGoodFormRef" class="demo-ruleForm" label-width="60px">
        <el-form-item label="名称" prop="goods_name">
          <el-input v-model="row.goods_name" autocomplete="off" clearable></el-input>
        </el-form-item>
        <el-form-item label="价格" prop="goods_price">
          <el-input v-model="row.goods_price" autocomplete="off" clearable></el-input>
        </el-form-item>
        <el-form-item label="数量" prop="goods_number">
          <el-input v-model="row.goods_number" autocomplete="off" clearable></el-input>
        </el-form-item>
        <el-form-item label="重量" prop="goods_weight">
          <el-input v-model="row.goods_weight" autocomplete="off" clearable></el-input>
        </el-form-item>
        <!-- Cascader 级联选择器 -->
        <el-form-item label="分类" prop="goods_cat">
          <el-cascader v-model="row.goods_cat" clearable @change="cascadeCateChange" :options="cateList" :props="cascaderProps"></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isEditGoodsDialog = false">取 消</el-button>
        <el-button type="primary" @click="editGoods">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import { ElAlert } from 'element-ui/types/alert'
export default {
  name: 'MyList',

  data() {
    return {
      // 商品列表
      goodsList: [],
      // 分类列表
      cateList: [],
      // 当前选中对象信息
      row: [],
      // 级联选择器
      // cascaderValue: [],
      // 商品总数
      total: 0,
      // 请求参数
      params: {
        // 查询参数
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 8
      },
      // 商品参数规则
      GoodFormRules: {
        goods_name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          {
            min: 2,
            max: 100,
            message: '长度在 2 到 100 个字符',
            trigger: 'blur'
          }
        ],
        goods_price: [{ required: true, message: '请输入数量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入数量', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入数量', trigger: 'blur' }],
        goods_cat: [
          {
            // type: 'array',
            // type: 'string',
            required: true,
            message: '请至少选择一个活动性质',
            trigger: 'change'
            // trigger: 'blur'
          }
        ]
      },
      // Cascader 级联选择器 props规则
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: false
      },
      // 控制编辑商品对话框显示与否
      isEditGoodsDialog: false
    }
  },

  mounted() {},
  created() {
    this.getGoodsList()
  },
  methods: {
    // 请求商品列表
    async getGoodsList() {
      const { data: res } = await this.$axios.get('shop/goods', {
        params: this.params
      })
      // (res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 获取分类列表
    async getCateList() {
      const { data: res } = await this.$axios.get('shop/categories', {
        params: { type: 3 }
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data
    },
    // 页数改变
    handleCurrentChange(newPage) {
      // // (this.params)
      this.params.pagenum = newPage
      this.getGoodsList()
    },
    // 每页数据显示改变
    handleSizeChange(newSize) {
      // // (this.params)
      this.params.pagesize = newSize
      this.getGoodsList()
    },
    // 对话框关闭重置
    reset() {
      this.row = []
    },
    showEditGoods(row) {
      this.isEditGoodsDialog = true
      this.$nextTick(() => {
        this.$refs.editGoodFormRef.resetFields()
      })
      // (row)
      this.row = row
      this.getCateList()
    },
    // 编辑商品
    editGoods(row) {
      this.$refs.editGoodFormRef.validate(async (valid) => {
        // (this.row)
        if (!valid) return
        const { data: res } = await this.$axios.put('shop/goods/' + this.row.goods_id, { params: this.row })
        // (res)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success('修改商品成功！')
      })
    },
    // 删除商品
    async removeGoods(row) {
      // (row)
      const isdel = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (isdel === 'confirm') {
        const { data: res } = await this.$axios.delete('shop/goods/' + row.goods_id)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success('删除商品成功！')
        this.getGoodsList()
      } else {
        this.$message.info('取消操作成功！')
      }
    },
    // Cascader 级联选择器 选中变化触发
    cascadeCateChange() {
      // this.addGoodForm.goods_cat = this.cascaderValue.join()
      if (this.row.goods_cat.length !== 3) {
        this.row.goods_cat = []
      }
    },
    // 进入添加商品页面
    goAddGoodsPath() {
      this.$router.push('/addGoods')
    },
    // 进入编辑商品页面
    goEditGoodsPath(row) {
      this.$router.push('/editGoods' + row.goods_id)
    }
  }
}
</script>

<style lang="less" scoped>
// div{
//   margin: ;
// }
</style>
