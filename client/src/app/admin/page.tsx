'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts'
import { 
  Users, FileText, TrendingUp, Shield, 
  Eye, Download, RefreshCw, AlertTriangle 
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalUsers: number
  totalPrompts: number
  todayPrompts: number
  successRate: number
  avgResponseTime: number
  topInputTypes: Array<{ name: string, value: number }>
  dailyUsage: Array<{ date: string, prompts: number, users: number }>
  recentActivity: Array<{
    id: string
    type: string
    timestamp: string
    status: 'success' | 'error'
    userAgent: string
  }>
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'logs'>('overview')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      setStats(response.data)
    } catch (error) {
      toast.error('获取数据失败')
      console.error('Dashboard fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = async (type: 'users' | 'prompts' | 'logs') => {
    try {
      const response = await axios.get(`/api/admin/export/${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${type}_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.success('数据导出成功')
    } catch (error) {
      toast.error('导出失败')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">数据加载失败</h2>
          <button onClick={fetchDashboardData} className="btn-primary">
            重新加载
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: '概览', icon: BarChart },
    { id: 'security', label: '安全', icon: Shield },
    { id: 'logs', label: '日志', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
              <p className="text-sm text-gray-600">Veo3 Prompt Generator 数据统计</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchDashboardData}
                className="btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>刷新</span>
              </button>
              <a href="/" className="btn-primary">
                返回首页
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">总用户数</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">总 Prompt 数</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPrompts.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">今日生成</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.todayPrompts.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">成功率</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Usage Chart */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">每日使用情况</h3>
                  <button
                    onClick={() => exportData('prompts')}
                    className="btn-secondary flex items-center space-x-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>导出</span>
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.dailyUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="prompts" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Input Types Distribution */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">输入类型分布</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.topInputTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.topInputTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">最近活动</h3>
                <button
                  onClick={() => exportData('logs')}
                  className="btn-secondary flex items-center space-x-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>导出日志</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        类型
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        用户代理
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentActivity.map((activity) => (
                      <tr key={activity.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(activity.timestamp).toLocaleString('zh-CN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {activity.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            activity.status === 'success' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {activity.status === 'success' ? '成功' : '失败'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {activity.userAgent}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">安全状态</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">防护状态</h4>
                  <p className="text-green-600">正常运行</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">监控状态</h4>
                  <p className="text-blue-600">实时监控</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">威胁等级</h4>
                  <p className="text-yellow-600">低风险</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">安全配置</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">速率限制</h4>
                    <p className="text-sm text-gray-600">每分钟最多 10 次请求</p>
                  </div>
                  <span className="text-green-600 font-medium">已启用</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">CSRF 保护</h4>
                    <p className="text-sm text-gray-600">跨站请求伪造防护</p>
                  </div>
                  <span className="text-green-600 font-medium">已启用</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">输入验证</h4>
                    <p className="text-sm text-gray-600">恶意内容过滤</p>
                  </div>
                  <span className="text-green-600 font-medium">已启用</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">系统日志</h3>
              <div className="flex space-x-2">
                <button className="btn-secondary text-sm">筛选</button>
                <button
                  onClick={() => exportData('logs')}
                  className="btn-secondary flex items-center space-x-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>导出</span>
                </button>
              </div>
            </div>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              <div className="space-y-1">
                {stats.recentActivity.map((log, index) => (
                  <div key={index} className="flex space-x-4">
                    <span className="text-gray-500">{new Date(log.timestamp).toISOString()}</span>
                    <span className={log.status === 'success' ? 'text-green-400' : 'text-red-400'}>
                      [{log.status.toUpperCase()}]
                    </span>
                    <span>{log.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}