<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" srcset="">
      </div>
      <!-- 登陆表单 -->
      <el-form ref="loginFormRef" :model='loginForm' :rules="loginFormRules" label-width="0px" class="formBox">
        <!-- 用户 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" prefix-icon="el-icon-lock" placeholder="请输入密码"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btnBox">
          <el-button type="primary" @click="login">登陆</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'myLogin',
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单验证对象规则
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 4, max: 8, message: '长度在 4 到 8 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$axios.post('/shop/login', this.loginForm)
        // (res)
        // // (res.data.token)
        // 登陆失败
        if (res.meta.status !== 200) {
          return this.$message({
            message: '登陆失败！！！',
            type: 'error'
            // 可关闭
            // showClose: true
            // 文字居中
            // center: true
          })
        }
        // 登陆成功
        this.$message({
          message: '登陆成功！！！',
          type: 'success'
          // 可关闭
          // showClose: true
          // 文字居中
          // center: true
        })
        // 存贮token
        window.sessionStorage.setItem('token', res.data.token)
        // localStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    },
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
      this.$refs.loginFormRef.validate(val => {
        // (val)
      })
    }
  }

}
</script>

<style lang='less' scoped>
  .login_container{
    height: 100%;
    background-color: #2b4b6b;
  }
  .login_box{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    // 头像
    .avatar_box{
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%,-50%);
      padding: 10px;
      height: 130px;
      width: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      box-shadow: 0 0 10px #ddd;
      // background-color: #fff;
      img{
        // padding-top: 10px;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
  }
  .btnBox{
    display: flex;
    justify-content: flex-end;
  }
  .formBox{
    padding: 10px;
    box-sizing: border-box;
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
  }
</style>
