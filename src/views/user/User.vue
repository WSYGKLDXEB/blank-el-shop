<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-row :gutter="20">
          <el-col :span="10">
            <!-- 输入框 -->
            <el-input placeholder="请输入内容" v-model="params.query" class="input-with-select" clearable @clear="getUserList">
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="addDialogUser = true">添加用户</el-button>
          </el-col>
        </el-row>
      </div>
      <!-- tab标签 -->
      <el-table :data="userList" style="width: 100%" border stripe="">
        <el-table-column label="#" type="index"> </el-table-column>
        <el-table-column prop="username" label="用户" width=""> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="权限"> </el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" :enterable="false" content="编辑" placement="top">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEdit(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" :enterable="false" content="删除" placement="top">
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteUser(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" :enterable="false" content="分配角色" placement="top">
              <el-button size="mini" type="warning" icon="el-icon-setting" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="params.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="params.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="margin-top: 15px"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" @close="addFormClosed" :visible.sync="addDialogUser" width="60%" center>
      <!-- <span>这是一段信息</span> -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <!-- <el-form :model='addForm' :rules='addFormRules' ref="addFormRef" label-width="70px"> -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogUser = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="editDialogUser" width="60%" center @close="editDialogClose">
      <!-- <span>这是一段信息</span> -->
      <el-form :model="eaitForm" :rules="addFormRules" ref="eaitFormRef" label-width="70px">
        <!-- <el-form :model='addForm' :rules='addFormRules' ref="addFormRef" label-width="70px"> -->
        <el-form-item label="用户名">
          <el-input v-model="eaitForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="eaitForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="eaitForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogUser = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRoleDialogVisible" width="60%" center @close="closeRoleDialog">
      <template>
        <div>
          <p>当前的用户：{{ userInfo.username }}</p>
          <p>当前的角色：{{ userInfo.role_name }}</p>
          <p>
            <span>分配角色：</span>
            <!-- Select 选择器 -->
            <el-select v-model="selsctUserId" placeholder="请选择">
              <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id"> </el-option>
            </el-select>
          </p>
        </div>
        <pre>{{ userInfo }}</pre>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="setRoleInfo">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'myUser',
  data() {
    // 邮箱验证
    const checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      // const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 手机号验证
    const checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        // 合法的手机号
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表参数
      params: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示数据量
        pagesize: 2
      },
      userList: [],
      // 数据总数
      total: 0,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 查询的用户对象
      eaitForm: {},
      // 表单验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        email: [
          // { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          // { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          // { required: true, message: '请输入电话', trigger: 'blur' },
          // { min: 6, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur' }
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制对话框是否显示
      addDialogUser: false,
      editDialogUser: false,
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 角色列表
      roleList: [],
      // 当前选中的角色
      selsctUserId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$axios.get('shop/users', { params: this.params })
      // // (res)
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败！')
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 权限按钮改变
    async userStateChange(userInfo) {
      // userInfo.mg_state = !userInfo.mg_state
      const { data: res } = await this.$axios.put(`shop/users/${userInfo.id}/state/${userInfo.mg_state}`)
      // // (res)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态是吧！！！')
      }
      this.$message.success('更新用户状态成功！！！')
    },
    // 监听页码值改变
    handleCurrentChange(newPage) {
      // // (newPage)
      this.params.pagenum = newPage
      // this.$options.mounted.getUserList.bind(this)()
      this.getUserList()
    },
    // 每页显示数据数量改变
    handleSizeChange(newSize) {
      this.params.pagesize = newSize
      // this.$options.methods.getUserList.bind(this)()
      this.getUserList()
    },
    // 监听对话框的关闭
    addFormClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户
    addUser() {
      // // (this.$refs.addFormRef)
      this.$refs.addFormRef.validate(async (valid) => {
        // // (valid)
        if (!valid) return Error()
        const { data: res } = await this.$axios.post('shop/users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        this.$message.success('添加用户成功')
        // 对话框隐藏
        this.addDialogUser = false
        // 刷新列表
        this.getUserList()
      })
    },
    // 修改用户的当前信息
    async showEdit(id) {
      const { data: res } = await this.$axios.get(`shop/users/${id}`)
      // // (res.data)
      this.eaitForm = res.data
      this.editDialogUser = !this.editDialogUser
      if (res.meta.status !== 200) return this.$message.error('查询用户失败！')
    },
    // 确定修改
    editUser() {
      this.$refs.eaitFormRef.validate(async (valid) => {
        const id = this.eaitForm.id
        const email = this.eaitForm.email
        const mobile = this.eaitForm.mobile
        if (!valid) return
        const { data: res } = await this.$axios.put('shop/users/' + id, { email: email, mobile: mobile })
        if (res.meta.status !== 200) return this.$message.error('修改用户数据失败！')
        this.editDialogUser = false
        this.getUserList()
        this.$message.success('修改用户数据成功！')
      })
    },
    editDialogClose() {
      this.$refs.eaitFormRef.resetFields()
    },
    // 删除用户
    async deleteUser(id) {
      // 弹框询问
      const isdeleteUser = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (isdeleteUser === 'confirm') {
        const { data: res } = await this.$axios.delete('shop/users/' + id)
        if (res.meta.status !== 200) return this.$message.error('删除用户失败！')
        this.getUserList()
        this.$message.success('删除用户成功！')
      } else {
        this.$message.info('取消成功！')
      }
      // // (isdeleteUser)
    },
    // 显示分配角色框
    async setRole(userInfo) {
      this.userInfo = userInfo
      // 获取角色列表
      const { data: res } = await this.$axios.get('shop/roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.roleList = res.data
      // // (this.roleList)
      this.setRoleDialogVisible = true
    },
    // 分配角色
    async setRoleInfo() {
      // // (this.userInfo)
      if (!this.selsctUserId) return this.$message.error('请选择要分配的角色！')
      const { data: res } = await this.$axios.put(`shop/users/${this.userInfo.id}/role`, { rid: this.selsctUserId })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.setRoleDialogVisible = false
      this.getUserList()
    },
    // 关闭对话框
    closeRoleDialog() {
      this.selsctUserId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less"></style>
