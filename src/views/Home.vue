<template>
  <el-container class="home_container">
    <!-- 头部 -->
    <el-header>
      <div>
        <!-- <img src="../assets/images/touxiang.jpeg" alt=""> -->
        <img src="../assets/images/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logOut">退出</el-button></el-header
    >
    <!-- 主体 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- <div class="toggle_but" @click="toggleCollapse">|||</div> -->
        <div :class="isCollapse ? 'toggle_but el-icon-s-unfold' : 'toggle_but el-icon-s-fold'" @click="toggleCollapse"></div>
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="$router.path">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 内容主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'myHome',
  data() {
    return {
      menuList: [],
      iconsObj: {
        125: 'el-icon-user-solid',
        103: 'el-icon-set-up',
        101: 'el-icon-s-goods',
        102: 'el-icon-s-order',
        145: 'el-icon-s-marketing'
      },
      // 菜单展开与否
      isCollapse: false
    }
  },
  created() {
    this.getMenuList()
    // (this.$router.path)
  },
  methods: {
    logOut() {
      // window.sessionStorage.clear()
      window.sessionStorage.removeItem('token')
      // localStorage.removeItem('token');
      this.$router.push('/login')
    },
    // 获取菜单列表
    async getMenuList() {
      const { data: res } = await this.$axios.get('shop/menus')
      if (res.meta.status !== 200) return this.$message.error('res.meta.msg')
      this.menuList = res.data
      // (res)
    },
    // 菜单显示与否
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    // img{
    //   width: 60px;
    //   border-radius: 30px;
    // }
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  position: relative;
  background-color: #333744;
  .toggle_but {
    position: relative;
    top: 0;
    left: 50%;
    transform: translate(-50%, 0);
    width: 100%;
    background-color: #4a5064;
    font-size: 20px;
    // font-size: 10px;
    color: #fff;
    line-height: 24px;
    text-align: center;
    // 文字间隙
    letter-spacing: 0.2em;
    // 禁止文字选中
    user-select: none;
    cursor: pointer;
    &::before {
      // position: absolute;
      // top:50%;
      // left: 100%;
      // transform: translate(-50%,-50%);
      // content: '666';
      // width: 100% !important;
      // text-align: center;
    }
  }
  // .el-icon-s-fold:before{
  //     text-align: center;
  //   }
  .el-menu {
    border-right: 0;
  }
}
.el-main {
  background-color: #eaedf1;
}
</style>
