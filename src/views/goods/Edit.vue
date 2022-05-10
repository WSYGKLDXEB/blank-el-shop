<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="box-card">
      <!-- <h1>{{gid}}</h1> -->
      <!-- 页头 -->
      <!-- <el-page-header content="添加商品">
      </el-page-header> -->
      <!-- alert提示 -->
      <el-alert title="添加商品" type="info" center show-icon :closable="false"> </el-alert>
      <!-- 步骤条 -->
      <!-- activeIndex - 0 加0是拼接，减0转换成number类型 -->
      <!-- 加号是字符串的隐性类型转换方式 -->
      <el-steps :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息" :status="isFill ? 'error' : ''"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 表单 -->
      <el-form :model="editGoodForm" :rules="editGoodFormRules" ref="editGoodFormRef" class="demo-ruleForm" label-width="60px" label-position="top">
        <!-- tabs标签 -->
        <el-tabs tab-position="left" v-model="activeIndex" :before-leave="brforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="名称" prop="goods_name">
              <el-input v-model="editGoodForm.goods_name" autocomplete="off" clearable></el-input>
            </el-form-item>
            <el-form-item label="价格" prop="goods_price">
              <el-input v-model="editGoodForm.goods_price" autocomplete="off" clearable type="number"></el-input>
            </el-form-item>
            <el-form-item label="数量" prop="goods_number">
              <el-input v-model="editGoodForm.goods_number" autocomplete="off" clearable type="number"></el-input>
            </el-form-item>
            <el-form-item label="重量" prop="goods_weight">
              <el-input v-model="editGoodForm.goods_weight" autocomplete="off" clearable type="number"></el-input>
            </el-form-item>
            <!-- Cascader 级联选择器 -->
            <el-form-item label="分类" prop="goods_cat">
              <el-cascader :disabled="true" v-model="editGoodForm.goods_cat" clearable @change="cascadeCateChange" :options="cateList" :props="cascaderProps"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in paramsList.many" :key="item.attr_id">
              <!-- 复选框组 -->
              <template>
                <el-checkbox-group v-model="item.attr_vals">
                  <el-checkbox border :label="cb" v-for="(cb, i) in item.attr_vals" :key="i"></el-checkbox>
                </el-checkbox-group>
              </template>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in paramsList.only" :key="item.attr_id">
              <!-- 复选框组 -->
              <template>
                <el-checkbox-group v-model="item.attr_vals">
                  <el-checkbox border :label="cb" v-for="(cb, i) in item.attr_vals" :key="i"></el-checkbox>
                </el-checkbox-group>
              </template>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-form-item>
              <!-- 上传 -->
              <el-upload class="upload-demo" multiple :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" :headers="headerObj" list-type="picture" :on-success="handleSucess">
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传图片,且不超过500kb</div>
              </el-upload>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 多行文本编辑器 -->
            <quill-editor ref="myQuillEditor" v-model="editGoodForm.goods_introduce"></quill-editor>
            <el-button style="margin: 15px 0" type="primary" @click="editGoods">确定修改</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" center :visible.sync="isPicDialog" width="35%">
      <el-image class="previewImg" :src="picURL"></el-image>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'BlankStopEdit',
  props: ['gid'],
  data() {
    return {
      // 分类列表
      cateList: [],
      // 添加商品参数
      editGoodForm: {
        // 名称
        goods_name: '',
        // 以为','分割的分类列表
        goods_cat: [],
        // 价格
        goods_price: 66,
        // 数量
        goods_number: 66,
        // 重量
        goods_weight: 66,
        // 介绍
        goods_introduce: '',
        // 上传的图片临时路径（对象）
        pics: [],
        // 商品的参数（数组），包含 `动态参数` 和 `静态属性`
        attrs: []
      },
      // 商品参数规则
      editGoodFormRules: {
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
        // 次级菜单的展开方式
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
        // 是否严格的遵守父子节点不互相关联
        // checkStrictly: true
      },
      // 步骤条当前所处步骤
      // stepsActie: 0
      // // tab导航当前所导航
      // tabsActive: '0'
      activeIndex: '0',
      // 参数列表
      paramsList: {
        // 静态参数
        only: [],
        // 动态参数
        many: []
      },
      // 上传图片的地址
      // const uploadURL = `${process.env.VUE_APP_BASE_API}/upload`
      // const uploadURL = $axios.defaults.baseURL+'upload'
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 控制图片预览对话框显示与否
      isPicDialog: false,
      // 预览图片地址
      picURL: '',
      // 是否填写完成
      isFill: false
    }
  },
  created() {
    this.getGoodsData()
    this.getCateList()
  },
  mounted() {},
  computed: {
    cateId() {
      if (this.editGoodForm.goods_cat.length === 3) {
        return this.editGoodForm.goods_cat[2]
      }
      return null
    }
  },
  methods: {
    // 获取商品数据
    async getGoodsData() {
      const { data: res } = await this.$axios.get('shop/goods/' + this.gid)
      // (res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // res.data.goods_cat = res.data.goods_cat.split(',').map(str => parseInt(str))
      res.data.goods_cat = res.data.goods_cat.split(',').map(Number)
      this.editGoodForm = {
        // 名称
        goods_name: res.data.goods_name,
        // 以为','分割的分类列表
        goods_cat: res.data.goods_cat,
        // 价格
        goods_price: res.data.goods_price,
        // 数量
        goods_number: res.data.goods_number,
        // 重量
        goods_weight: res.data.goods_weight,
        // 介绍
        goods_introduce: res.data.goods_introduce,
        // 商品的参数（数组），包含 `动态参数` 和 `静态属性`
        attrs: res.data.attrs,
        pics: []
      }
      // res.data.pics.forEach((item) => {
      //   const newInfo = {
      //     pic: item.pics_big
      //   }
      //   this.editGoodForm.pics.push(newInfo)
      // })
      // (this.editGoodForm)
    },
    // 获取分类列表
    async getCateList() {
      const { data: res } = await this.$axios.get('shop/categories', {
        params: { type: 3 }
      })
      // // (res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data
    },
    // 获取参数列表
    async getParamsList(sels) {
      const { data: res } = await this.$axios.get(`shop/categories/${this.cateId}/attributes`, { params: { sel: sels } })
      // // (res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
      })
      if (sels === 'many') {
        this.paramsList.many = res.data
      } else {
        this.paramsList.only = res.data
      }
      // return res.data
    },
    // Cascader 级联选择器 选中变化触发
    cascadeCateChange() {
      // this.editGoodForm.goods_cat = this.cascaderValue.join()
      if (this.editGoodForm.goods_cat.length !== 3) {
        this.editGoodForm.goods_cat = []
      }
    },
    // 导航切换
    brforeTabLeave(activeName, oldActiveName) {
      // (activeName, oldActiveName)
      if (oldActiveName === '0' && this.editGoodForm.goods_cat.length !== 3) {
        this.$message.error('请先选择分类！')
        return false
      }
    },
    // 导航被点击
    async tabClicked() {
      // (this.activeIndex)
      // 获取参数列表
      if (this.activeIndex === '1') {
        this.getParamsList('many')
      } else if (this.activeIndex === '2') {
        this.getParamsList('only')
      }
      // (this.paramsList)
    },
    // 图片预览
    handlePreview(file) {
      // (this.editGoodForm)
      this.picURL = file.response.data.url
      this.isPicDialog = true
    },
    // 图片移除
    handleRemove(file) {
      // (file)
      // 获取将要删除图片的临时路径
      const filePath = file.response.data.tmp_path
      // 从pics数组中找到这个图片对应的索引值
      // indexOf()返回某个指定的字符串值在字符串中首次出现的位置
      // findIndex()可以执行箭头函数，indexOf()不能执行箭头函数
      // const i = this.editGoodForm.pics.findIndex(item => item.pic === filePath)
      // this.editGoodForm.pics.splice(i, 1)
      // 过滤
      this.editGoodForm.pics = this.editGoodForm.pics.filter((item) => item.pic !== filePath)
    },
    // 图片上传成功
    handleSucess(res) {
      // (res)
      // 拼接得到一个图片信息对象
      const picInfo = { pic: res.data.tmp_path }
      this.editGoodForm.pics.push(picInfo)
    },
    // 修改商品
    editGoods() {
      this.$refs.editGoodFormRef.validate(async (valid) => {
        if (!valid) {
          this.isFill = true
          return this.$message.error('请填写必要的表单项！')
        }
        // (valid)
        // 深拷贝 lodash cloneDeep(obj)
        // const from = JSON.parse(JSON.stringify(this.addGoodsFrom))
        // 对象复制是浅拷贝
        const form = _.cloneDeep(this.editGoodForm)
        // 分类拼接
        form.goods_cat = form.goods_cat.join()
        // 处理参数
        this.paramsList.many.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join()
          }
          this.editGoodForm.attrs.push(newInfo)
        })
        this.paramsList.only.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join()
          }
          this.editGoodForm.attrs.push(newInfo)
        })
        form.attrs = this.editGoodForm.attrs
        // delete form.goods_cat
        // (form)
        const { data: res } = await this.$axios.put('shop/goods' + this.gid, form)
        // (res)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success('修改商品成功！')
        this.$router.push('/goods')
      })
    }
  }
}
</script>

<style lang="less" scoped>
// .el-checkbox{
//   margin:0 10px 0 0 !important;
// }
.previewImg {
  width: 100%;
}
</style>
