<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/Welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-row :gutter="20">
          <el-col :span="10">
            <!-- 输入框 -->
            <el-input placeholder="请输入内容" class="input-with-select" clearable>
              <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="showAddUserDialog">添加角色</el-button>
          </el-col>
        </el-row>
      </div>
      <!-- table -->
      <el-table :data="rolesList" style="width: 100%" border stripe max-height="435">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- <pre>{{scope.row}}</pre> -->
            <el-row :class="['vcenter', 'bdbottom', i == 0 ? 'bdtop' : '']" v-for="(item, i) in scope.row.children" :key="item.id">
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag :closable="isShowRemove" @close="removeRightById(scope.row, item.id)">{{ item.authName + scope.row.id + rowId }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级权限与 三级权限 -->
              <el-col :span="19">
                <el-row :class="['vcenter', i1 == 0 ? '' : 'bdtop']" v-for="(hosItem, i1) in item.children" :key="hosItem.id">
                  <el-col :span="6">
                    <el-tag size="medium" :closable="isShowRemove" type="success" @close="removeRightById(scope.row, hosItem.id)">{{ hosItem.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag size="small" :closable="isShowRemove" type="warning" v-for="tags in hosItem.children" :key="tags.id" @close="removeRightById(scope.row, tags.id)">{{
                      tags.authName
                    }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
              <!-- 三级权限 -->
              <!-- <el-col :span="8">3</el-col> -->
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" width="180"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述" width="180"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" :enterable="false" content="编辑" placement="top">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="editRoles(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" :enterable="false" content="删除" placement="top">
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRoles(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" :enterable="false" content="分配权限" placement="top">
              <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限 -->
    <el-dialog title="分配权限" :visible.sync="isJurDialog" width="60%" @close="removeJurDialog">
      <!-- <span>这是一段信息</span> -->
      <!-- <pre>{{rightList}}</pre> -->
      <el-tree ref="treeRef" default-expand-all show-checkbox node-key="id" :default-checked-keys="defKeys" :data="rightList" :props="treeProps"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="removeJurDialog">取 消</el-button>
        <el-button type="primary" @click="allRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色 -->
    <el-dialog title="添加角色" :visible.sync="isAddUserDialog" width="60%" center>
      <el-form :model="addUserForm" :rules="addUserFormRules" ref="addUserFormRef" label-width="70px">
        <!-- <el-form :model='addForm' :rules='addFormRules' ref="addFormRef" label-width="70px"> -->
        <el-form-item label="名称" prop="roleName">
          <el-input v-model="addUserForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="addUserForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isAddUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'myRoles',
  data() {
    return {
      rolesList: [],
      rightList: [],
      // tree 列表规则
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点id数值集合
      defKeys: [],
      // 当前分配角色的id
      rolesId: '',
      isShowRemove: false,
      isJurDialog: false,
      isAddUserDialog: false,
      rowId: 0,
      // 添加用户
      addUserForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加用户规则
      addUserFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$axios.get('shop/roles')
      if (res.meta.status !== 200) return this.$message.error('请求角色列表失败！')
      // // (res)
      this.rolesList = res.data
    },
    // 删除权限
    async removeRightById(row, rightId) {
      const isopen = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      // // (isopen)
      if (isopen === 'confirm') {
        const { data: res } = await this.$axios.delete(`shop/roles/${row.id}/rights/${rightId}`)
        // const { data: res } = await this.$axios.delete('shop/roles/' + roleId + '/rights/' + rightId)
        // // (row)
        // // (roleId, rightId)
        if (res.meta.status !== 200) return this.$message.error('删除角色权限失败！')
        this.$message.success('删除角色权限成功！')
        // this.getRolesList()
        row.children = res.data
      } else {
        this.$message.warning('取消删除角色权限成功！')
      }
    },
    // 编辑
    editRoles(row) {
      // (row.id)
      this.isShowRemove = !this.isShowRemove
      this.id = row.id
    },
    // 删除角色
    async removeRoles(roleId) {
      const isopen = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      // // (isopen)
      if (isopen === 'confirm') {
        const { data: res } = await this.$axios.delete('shop/roles/' + roleId)
        // (res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getRolesList()
      } else {
        this.$message.warning('取消删除角色成功！')
      }
    },
    // 分配权限对话框
    async showSetRightDialog(role) {
      this.rolesId = role.id
      const { data: res } = await this.$axios.get('shop/rights/tree')
      // // (res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.rightList = res.data
      this.getLeafKeys(role, this.defKeys)
      this.isJurDialog = true
    },
    // 通过递归的形式，获取角色下所有三级的id值，并保存的到defKeys数组中
    getLeafKeys(node, arr) {
      // 如果节点下不含children 说明该节点为第三级
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => this.getLeafKeys(item, arr))
    },
    // 关闭分配对话框
    removeJurDialog() {
      this.isJurDialog = false
      this.defKeys = []
    },
    // 为角色分配权限
    async allRights() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',')
      const { data: res } = await this.$axios.post(`shop/roles/${this.rolesId}/rights`, { rids: idStr })
      // (res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.isJurDialog = false
      this.getRolesList()
    },
    // 显示添加角色对话框
    showAddUserDialog() {
      this.isAddUserDialog = true
    },
    // 确定添加角色
    addUser() {
      this.$refs.addUserFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('请按要求输入角色！')
        // (this.addUserForm)
        const { data: res } = await this.$axios.post('shop/roles', this.addUserForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.isAddUserDialog = false
        this.getRolesList()
        // (valid)
      })
    }
  }
}
</script>

<style lang="less" scoped>
// body{
//   margin: ;
// }
.el-tag {
  margin: 5px;
}
// 为标签添加边框
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
  margin-left: 48px;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
