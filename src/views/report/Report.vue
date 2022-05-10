<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="box-card">
      <!-- 为 ECharts 准备一个定义了宽高的 DOM -->
      <div id="main" style="width: 80%; height: 400px"></div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import _ from 'lodash'

export default {
  name: 'BlankStopReport',

  data() {
    return {
      // 图表设置
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },

  mounted() {
    this.init()
  },

  methods: {
    async init() {
      // 基于准备好的dom，初始化echarts实例
      const myChart = echarts.init(document.getElementById('main'))

      const { data: res } = await this.$axios.get('shop/reports/type/1')
      // // (res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // Object.assign(this.options, res.data)
      // let a = { this.options, res.data}
      const result = _.merge(res.data, this.options)
      // 绘制图表
      myChart.setOption(result)
    }
  }
}
</script>

<style lang="less" scoped></style>
