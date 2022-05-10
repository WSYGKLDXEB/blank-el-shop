import Vue from 'vue'
import VueRouter from 'vue-router'
// 导入权限地址数组
import pathArr from './pathArr'
// 登陆组件
// import Login from '@/views/Login.vue'
import Login from '@/views/Login.vue'
// 主页
import Home from '@/views/Home.vue'
import User from '@/views/user/User.vue'
// 权限
import Roles from '@/views/power/Roles.vue'
import Rights from '@/views/power/Rights.vue'
// 商品
import Cate from '@/views/goods/Cate.vue'
import Params from '../views/goods/Params.vue'
import GoodsList from '@/views/goods/List.vue'
import Add from '@/views/goods/Add.vue'
import Edit from '@/views/goods/Edit.vue'
// 订单
import Order from '@/views/order/Order.vue'
// 报表
import Report from '@/views/report/Report.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/users',
    children: [
      { path: '/users', component: User },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Rights },
      { path: '/goods', component: GoodsList },
      { path: '/addGoods', component: Add },
      { path: '/editGoods:gid', component: Edit, props: true },
      { path: '/params', component: Params },
      { path: '/categories', component: Cate },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
// 路由导航守卫
router.beforeEach((to, from, next) => {
  // to将要访问的路径
  // from从何路径而来
  // next() 放行 next('/xxx')强制跳转
  // if(to.path === '/login')
  if (pathArr.indexOf(to.path) !== -1) {
    // const token = Window.sessionStorage.getItem('token')
    const token = sessionStorage.getItem('token')
    // const token = localStorage.getItem('token')
    if (token) {
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
})
export default router
