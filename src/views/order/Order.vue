<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-row>
          <el-col :span="8">
            <el-input placeholder="请输入内容" v-model="params.query" class="input-with-select" clearable @clear="getOrderList">
              <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
            </el-input>
          </el-col>
        </el-row>
      </div>
      <!-- table表格 -->

      <el-table border stripe :data="orderList" @row-click="showSeeOrderDialog" style="width: 100%">
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号"> </el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="85"> </el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="85">
          <template slot-scope="scope">
            <!-- tag标签 -->
            <el-tag v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="85"> </el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="180">
          <template slot-scope="scope">{{ scope.row.create_time | dateFormat }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click.stop="showEditOrderDialog(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="地址" placement="top" :enterable="false">
              <el-button size="mini" type="success" icon="el-icon-location-outline" @click.stop="showSeeLogisticsDialog"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="params.pagenum"
        :page-sizes="[8, 16, 32, 64]"
        :page-size="params.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="margin: 15px 0 0"
      >
      </el-pagination>
    </el-card>
    <!-- 修改订单对话框 -->
    <el-dialog width="45%" center title="修改订单" :visible.sync="isEditOrderDialog">
      <el-form :model="editOrderForm" :rules="editOrderRules" ref="editOrderRef" label-width="85px">
        <el-form-item label="订单价格" prop="order_price">
          <el-input type="Number" v-model="editOrderForm.order_price" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="订单数量" prop="order_number">
          <el-input type="Number" v-model="editOrderForm.order_number" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="是否发货" prop="is_send">
          <el-select style="width: 100%" v-model="editOrderForm.is_send" placeholder="请选择">
            <el-option label="未发货" value="0"> </el-option>
            <el-option label="已发货" value="1"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="支付状态" prop="pay_status">
          <el-select style="width: 100%" v-model="editOrderForm.pay_status" placeholder="请选择">
            <el-option label="未付款" value="0"> </el-option>
            <el-option label="已付款" value="1"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式" prop="order_pay">
          <el-select style="width: 100%" v-model="editOrderForm.order_pay" placeholder="请选择">
            <el-option label="未支付" value="0"> </el-option>
            <el-option label="支付宝" value="1"> </el-option>
            <el-option label="微信" value="2"> </el-option>
            <el-option label="银行卡" value="3"> </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-form :model="editAddressForm" :rules="editOrderRules" ref="editAddressRef" label-width="85px">
        <el-form-item label="省市区/县" prop="address">
          <el-cascader v-model="editAddressForm.address" :options="cityData" clearable :props="cascaderProps" style="width: 100%"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="detailed">
          <el-input v-model="editAddressForm.detailed" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isEditOrderDialog = false">取 消</el-button>
        <el-button type="primary" @click="editOrder">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 查看物流进度对话框 -->
    <el-dialog center title="物流信息" :visible.sync="isSeeLogisticsDialog" width="45%">
      <!-- 时间线 -->
      <el-timeline :reverse="true">
        <el-timeline-item v-for="(item, index) in logisticsData.data" :key="index" :color="index === 0 ? '#0bbd87' : ''" :timestamp="item.time">
          {{ item.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
    <!-- 查看订单对话框 -->
    <el-dialog center title="订单信息" :visible.sync="isSeeorderDialog" width="60%">
      <!-- table表格 -->
      <el-table :data="orderInfoList" border style="width: 100%">
        <el-table-column label="#" type="index"> </el-table-column>
        <el-table-column prop="goods_id" label="ID" width="40"> </el-table-column>
        <el-table-column prop="goods_name" label="名称"> </el-table-column>
        <el-table-column prop="pay_status" label="支付方式" width="80">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status === 0">未支付</el-tag>
            <el-tag type="" v-else-if="scope.row.pay_status === 1">支付宝</el-tag>
            <el-tag type="success" v-else-if="scope.row.pay_status === 2">微信</el-tag>
            <el-tag type="warning" v-else>银行卡</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="goods_price" label="价格" width="80"> </el-table-column>
        <el-table-column prop="goods_number" label="数量" width="80"> </el-table-column>
      </el-table>
      <div class="numBox">
        <p>{{ goodsNum }}</p>
        <p>{{ goodsPrice }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import cityData from '@/assets/js/citydata.js'
import logisticsData from '@/assets/js/logisticsData.js'

export default {
  name: 'BlankStopOrder',

  data() {
    return {
      // 订单ID
      orderID: 0,
      // 订单列表
      orderList: [],
      // 订单信息列表
      orderInfoList: [],
      // 订单请求参数
      params: {
        query: '',
        pagenum: 1,
        pagesize: 8
      },
      // 请求返回数据条数
      total: 0,
      // 控制显示修改订单对话框显示与否
      isEditOrderDialog: false,
      // 控制查看物流对话框显示与否
      isSeeLogisticsDialog: false,
      // 控制查看订单对话框显示与否
      isSeeorderDialog: false,
      // 修改地址表单数据
      editOrderForm: {
        // 订单是否发货
        is_send: '',
        // 订单支付
        order_pay: '',
        // 订单价格
        order_price: 666,
        // 订单数量
        order_number: 6,
        // 支付状态
        pay_status: ''
      },
      // 修改地址表单数据
      editAddressForm: {
        // 详细地址
        detailed: '',
        address: []
      },
      // 规则
      editOrderRules: {
        address: [{ required: true, message: '请选择省市区/县', trigger: 'change' }],
        detailed: [
          { required: true, message: '请输入订单价格', trigger: 'blur' },
          {
            min: 2,
            max: 100,
            message: '长度在 2 到 100 个字符',
            trigger: 'blur'
          }
        ],
        order_price: [{ required: true, message: '请输入订单价格', trigger: 'blur' }],
        order_number: [{ required: true, message: '请输入订单数量', trigger: 'blur' }],
        is_send: [{ required: true, message: '请选择是否发货', trigger: 'change' }],
        pay_status: [{ required: true, message: '请选择支付状态', trigger: 'change' }],
        order_pay: [{ required: true, message: '请选择支付方式', trigger: 'change' }]
      },
      // Cascader 级联选择器 props规则
      cascaderProps: {
        // 次级菜单的展开方式
        expandTrigger: 'hover',
        value: 'value',
        label: 'label',
        children: 'children'
        // 是否严格的遵守父子节点不互相关联
        // checkStrictly: true
      },
      // 地址数据
      cityData,
      // 物流数据
      logisticsData
    }
  },
  created() {
    this.getOrderList()
  },
  mounted() {},
  computed: {
    goodsNum() {
      let num = 0
      this.orderInfoList.forEach((item) => {
        num += item.goods_number
      })
      return num
    },
    goodsPrice() {
      let price = 0
      this.orderInfoList.forEach((item) => {
        price += item.goods_number * item.goods_price
      })
      return price
    }
  },
  methods: {
    // 获取订单列表
    async getOrderList() {
      // (this.params)
      const { data: res } = await this.$axios.get('shop/orders', {
        params: this.params
      })
      // (res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 每页显示数据条数变化
    handleSizeChange(newSize) {
      this.params.pagesize = newSize
      this.getOrderList()
    },
    // 页数发生变化
    handleCurrentChange(newNum) {
      this.params.pagenum = newNum
      this.getOrderList()
    },
    // 控制修改地址框显示
    showEditOrderDialog(row) {
      this.orderID = row.order_id
      // (row)
      this.editOrderForm = {
        // 订单是否发货
        is_send: row.is_send,
        // 订单支付
        order_pay: row.order_pay,
        // 订单价格
        order_price: row.order_price,
        // 订单数量
        order_number: 6,
        // 支付状态
        pay_status: row.pay_status
      }
      this.isEditOrderDialog = true
      // // (this.cityData)
      this.$nextTick(() => {
        this.$refs.editAddressRef.resetFields()
        this.$refs.editOrderRef.resetFields()
      })
    },
    editOrder() {
      this.$refs.editOrderRef.validate((valid1) => {
        this.$refs.editAddressRef.validate(async (valid2) => {
          if (!valid1 || !valid2) return false
          const { data: res } = await this.$axios.put('shop/orders' + this.orderID, { params: this.editOrderForm })
          // (res)
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
          this.$message.success('修改订单成功！')
          this.isEditOrderDialog = false
          this.getOrderList()
        })
      })
    },
    // 控制物流查看框显示与否
    showSeeLogisticsDialog() {
      this.isSeeLogisticsDialog = true
      // const { data: res } = await this.$axios.get('shop/kuaidi/1106975712662')
      // if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // this.logisticsData = res.data
      // (this.logisticsData)
    },
    // 控制物流查看框显示与否
    async showSeeOrderDialog(row) {
      this.isSeeorderDialog = true
      const { data: orderRes } = await this.$axios.get('shop/orders/' + row.order_id)
      orderRes.data.goods.forEach(async (item) => {
        const { data: goodsRes } = await this.$axios.get('shop/goods/' + item.goods_id)
        item.goods_name = goodsRes.data.goods_name
      })
      if (orderRes.meta.status !== 200) {
        return this.$message.error(orderRes.meta.msg)
      }
      this.orderInfoList = orderRes.data.goods
      // (this.orderInfoList)
    }
  }
}
</script>

<style lang="less" scoped>
/deep/.el-table__row {
  cursor: pointer;
}
.numBox {
  // margin: 0 !important;
  // float: right;
  position: relative;
  top: 15px;
  left: 89%;
  width: 80px;
  // height: 80px;
  // border: 1px solid pink;
  p {
    margin: 0;
    font-weight: 700;
    color: #909399;
    &:first-of-type {
      border-bottom: 2px solid #c4c6cc;
    }
    &:last-of-type {
      text-align: right;
    }
  }
}
</style>
