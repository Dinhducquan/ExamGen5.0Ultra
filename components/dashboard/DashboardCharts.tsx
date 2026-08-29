import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Activity, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

const monthlyActivityData = [
  { month: 'T1', exams: 6, aiGenerated: 4 },
  { month: 'T2', exams: 8, aiGenerated: 6 },
  { month: 'T3', exams: 14, aiGenerated: 11 },
  { month: 'T4', exams: 11, aiGenerated: 9 },
  { month: 'T5', exams: 18, aiGenerated: 16 },
  { month: 'T6', exams: 24, aiGenerated: 22 },
  { month: 'T7', exams: 19, aiGenerated: 17 },
  { month: 'T8', exams: 22, aiGenerated: 20 },
  { month: 'T9', exams: 31, aiGenerated: 29 },
  { month: 'T10', exams: 28, aiGenerated: 26 },
  { month: 'T11', exams: 36, aiGenerated: 34 },
  { month: 'T12', exams: 42, aiGenerated: 40 },
];

const cognitiveDistributionData = [
  { name: 'Nhận biết', value: 40, color: '#3B82F6', desc: '40% (4.0 điểm)' },
  { name: 'Thông hiểu', value: 30, color: '#6366F1', desc: '30% (3.0 điểm)' },
  { name: 'Vận dụng', value: 20, color: '#8B5CF6', desc: '20% (2.0 điểm)' },
  { name: 'Vận dụng cao', value: 10, color: '#EC4899', desc: '10% (1.0 điểm)' },
];

const subjectDistributionData = [
  { subject: 'Toán', count: 38 },
  { subject: 'Văn', count: 32 },
  { subject: 'Anh', count: 29 },
  { subject: 'KHTN', count: 24 },
  { subject: 'Vật lí', count: 21 },
  { subject: 'Hóa học', count: 19 },
  { subject: 'Sinh học', count: 15 },
  { subject: 'Lịch sử', count: 12 },
];

export const DashboardCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Monthly Activity Area Chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Tăng trưởng Đề thi & Lượt gọi AI năm 2026
            </CardTitle>
            <p className="text-xs text-stone-600 dark:text-slate-400">Xu hướng ra đề kiểm tra thường xuyên, giữa kỳ và cuối kỳ</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Tổng số đề
            </span>
            <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 dark:bg-cyan-400" /> AI Trợ giúp
            </span>
          </div>
        </CardHeader>
        <CardContent className="h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="examsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(140, 130, 115, 0.15)" />
              <XAxis dataKey="month" stroke="#78716C" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#78716C" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FAF8F5',
                  borderColor: '#E0D8CD',
                  borderRadius: '0.75rem',
                  color: '#1C1917',
                  fontSize: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}
              />
              <Area type="monotone" dataKey="exams" name="Tổng số đề" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#examsGradient)" />
              <Area type="monotone" dataKey="aiGenerated" name="AI Hỗ trợ" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#aiGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Donut Chart: Cognitive Level Distribution */}
      <Card className="lg:col-span-1 flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Tỉ lệ Mức độ Nhận thức
          </CardTitle>
          <p className="text-xs text-stone-600 dark:text-slate-400">Khung ma trận chuẩn Bộ GD&ĐT (4:3:2:1)</p>
        </CardHeader>
        <CardContent className="h-52 relative flex items-center justify-center pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={cognitiveDistributionData}
                innerRadius={52}
                outerRadius={78}
                paddingAngle={4}
                dataKey="value"
              >
                {cognitiveDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FAF8F5',
                  borderColor: '#E0D8CD',
                  borderRadius: '0.75rem',
                  color: '#1C1917',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-stone-900 dark:text-white">100%</span>
            <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold uppercase">GDPT 2018</span>
          </div>
        </CardContent>
        <div className="px-5 pb-5 grid grid-cols-2 gap-2 text-xs border-t border-[#EFEAE2] dark:border-white/[0.05] pt-3">
          {cognitiveDistributionData.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
              <div className="truncate">
                <span className="text-stone-800 dark:text-slate-200 font-semibold">{d.name}: </span>
                <span className="text-stone-500 dark:text-slate-400 font-mono font-medium">{d.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
