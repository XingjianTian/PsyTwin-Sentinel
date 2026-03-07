"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Lock,
  Power,
  Users,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  teacherId?: string;
  role: string;
  status: string;
  department?: string;
  title?: string;
  lastLoginAt?: string;
  createdAt: string;
  qualifications?: string[];
  _count?: {
    appointments: number;
    warnings: number;
  };
}

const roleLabels: Record<string, string> = {
  ADMIN: "管理员",
  COUNSELOR: "咨询师",
  ASSISTANT: "助理",
  TEACHER: "教师",
};

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-800",
  COUNSELOR: "bg-blue-100 text-blue-800",
  ASSISTANT: "bg-green-100 text-green-800",
  TEACHER: "bg-gray-100 text-gray-800",
};

export function UserManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("teachers");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: "",
    teacherId: "",
    phone: "",
    email: "",
    password: "",
    department: "心理咨询中心",
    title: "咨询师",
    role: "TEACHER",
    qualifications: [] as string[],
  });

  // 加载用户列表
  const loadUsers = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "teachers" ? "/api/teachers" : "/api/users";
      const queryParams = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : "";
      const response = await fetch(`${endpoint}${queryParams}`);
      const result = await response.json();
      
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载用户列表",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [activeTab, searchQuery]);

  // 创建用户
  const handleCreate = async () => {
    try {
      const endpoint = activeTab === "teachers" ? "/api/teachers" : "/api/users";
      const body = activeTab === "teachers" ? {
        teacherId: formData.teacherId,
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        department: formData.department,
        title: formData.title,
        role: formData.role,
        qualifications: formData.qualifications,
      } : {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "创建成功",
          description: `${formData.name} 已创建`,
        });
        setIsCreateDialogOpen(false);
        resetForm();
        loadUsers();
      } else {
        toast({
          title: "创建失败",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "创建失败",
        description: "网络错误",
        variant: "destructive",
      });
    }
  };

  // 删除用户
  const handleDelete = async (user: User) => {
    if (!confirm(`确定要删除 ${user.name} 吗？`)) return;

    try {
      const endpoint = activeTab === "teachers" ? `/api/teachers/${user.id}` : `/api/users/${user.id}`;
      const response = await fetch(endpoint, { method: "DELETE" });
      const result = await response.json();

      if (result.success) {
        toast({
          title: "删除成功",
          description: `${user.name} 已删除`,
        });
        loadUsers();
      } else {
        toast({
          title: "删除失败",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "删除失败",
        description: "网络错误",
        variant: "destructive",
      });
    }
  };

  // 切换状态
  const handleToggleStatus = async (user: User) => {
    try {
      const endpoint = activeTab === "teachers" 
        ? `/api/teachers/${user.id}/actions?action=toggle-status`
        : `/api/users/${user.id}/actions?action=toggle-status`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentStatus: user.status }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "状态更新",
          description: result.message,
        });
        loadUsers();
      }
    } catch (error) {
      toast({
        title: "操作失败",
        description: "网络错误",
        variant: "destructive",
      });
    }
  };

  // 重置密码
  const handleResetPassword = async (user: User) => {
    const newPassword = prompt(`请输入 ${user.name} 的新密码：`);
    if (!newPassword) return;

    try {
      const endpoint = activeTab === "teachers"
        ? `/api/teachers/${user.id}/actions?action=reset-password`
        : `/api/users/${user.id}/actions?action=reset-password`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "密码重置成功",
          description: `${user.name} 的密码已更新`,
        });
      } else {
        toast({
          title: "重置失败",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "重置失败",
        description: "网络错误",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      teacherId: "",
      phone: "",
      email: "",
      password: "",
      department: "心理咨询中心",
      title: "咨询师",
      role: "TEACHER",
      qualifications: [],
    });
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      teacherId: user.teacherId || "",
      phone: user.phone || "",
      email: user.email || "",
      password: "",
      department: user.department || "心理咨询中心",
      title: user.title || "咨询师",
      role: user.role,
      qualifications: user.qualifications || [],
    });
    setIsEditDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          用户管理
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="teachers" className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              教师/咨询师
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              系统用户
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索姓名、工号、手机号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  新建{activeTab === "teachers" ? "教师" : "用户"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>新建{activeTab === "teachers" ? "教师" : "用户"}</DialogTitle>
                  <DialogDescription>
                    填写以下信息创建新{activeTab === "teachers" ? "教师" : "用户"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>姓名 *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="请输入姓名"
                    />
                  </div>
                  {activeTab === "teachers" ? (
                    <>
                      <div className="space-y-2">
                        <Label>工号 *</Label>
                        <Input
                          value={formData.teacherId}
                          onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                          placeholder="如：T0001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>手机号 *</Label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="请输入手机号"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>部门 *</Label>
                        <Input
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          placeholder="如：心理咨询中心"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>职称 *</Label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="如：高级心理咨询师"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label>邮箱 *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="请输入邮箱"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>密码 *</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="请输入密码"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>角色 *</Label>
                    <select
                      className="w-full h-9 px-3 rounded-md border border-input bg-background"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="TEACHER">教师</option>
                      <option value="COUNSELOR">咨询师</option>
                      <option value="ASSISTANT">助理</option>
                      {activeTab === "users" && <option value="ADMIN">管理员</option>}
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleCreate}>创建</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="teachers">
            <UserTable
              users={users}
              loading={loading}
              onEdit={openEditDialog}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onResetPassword={handleResetPassword}
              showDepartment
            />
          </TabsContent>

          <TabsContent value="users">
            <UserTable
              users={users}
              loading={loading}
              onEdit={openEditDialog}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onResetPassword={handleResetPassword}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface UserTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onResetPassword: (user: User) => void;
  showDepartment?: boolean;
}

function UserTable({
  users,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  onResetPassword,
  showDepartment,
}: UserTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        暂无用户数据
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>姓名</TableHead>
            {showDepartment && <TableHead>部门</TableHead>}
            <TableHead>角色</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>最近登录</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.teacherId || user.email || user.phone}
                  </div>
                </div>
              </TableCell>
              {showDepartment && (
                <TableCell>
                  <div>
                    <div>{user.department}</div>
                    <div className="text-sm text-muted-foreground">{user.title}</div>
                  </div>
                </TableCell>
              )}
              <TableCell>
                <Badge className={roleColors[user.role] || "bg-gray-100"}>
                  {roleLabels[user.role] || user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={user.status === "ACTIVE" ? "default" : "secondary"}
                  className={user.status === "ACTIVE" ? "bg-green-100 text-green-800" : ""}
                >
                  {user.status === "ACTIVE" ? "启用" : "禁用"}
                </Badge>
              </TableCell>
              <TableCell>
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString()
                  : "从未登录"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleStatus(user)}
                    title={user.status === "ACTIVE" ? "禁用" : "启用"}
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onResetPassword(user)}
                    title="重置密码"
                  >
                    <Lock className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(user)}
                    title="编辑"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(user)}
                    title="删除"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}