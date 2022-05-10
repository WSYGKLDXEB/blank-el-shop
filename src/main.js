import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
// 网页加载插件 https://github.com/rstacruz/nprogress
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
// 多行文本插件 https://github.com/surmon-china/vue-quill-editor
import VueQuillEditor from 'vue-quill-editor'
// 导入表格插件 https://github.com/MisterTaki/vue-table-with-tree-grid
import TreeTable from 'vue-table-with-tree-grid'
// 多行文本插件样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
import './plugins/element.js'
// 导入字体图标
import '@/assets/fonts/iconfont.css'
// 导入全局样式表
import '@/assets/css/global.less'
// 请求拦截器
// 在request 拦截器中，显示进度条 NProgress.start();
axios.interceptors.request.use(config => {
  // console.log(config)
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 在response 拦截器中，隐藏进度条 NProgress.done();
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
Vue.prototype.$axios = axios
Vue.config.productionTip = false
// 多行文本插件全局注册
Vue.use(VueQuillEditor)
// 表格插件全局注册
Vue.component('tree-table', TreeTable)
// 全局过滤器
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
