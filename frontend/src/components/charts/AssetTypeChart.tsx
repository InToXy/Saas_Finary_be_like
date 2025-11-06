import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface AssetType {
  type: string;
  name: string;
  value: number;
  percentage: number;
  change: number;
  count: number;
  icon: any;
  color: string;
}

interface AssetTypeChartProps {
  data: AssetType[];
}

export function AssetTypeChart({ data }: AssetTypeChartProps) {
  // Convert Tailwind colors to hex for recharts
  const colorMap: Record<string, string> = {
    'bg-blue-500': '#3b82f6',
    'bg-purple-500': '#8b5cf6',
    'bg-amber-500': '#f59e0b',
    'bg-red-500': '#ef4444',
    'bg-green-500': '#10b981',
  };

  const chartData = data.map(asset => ({
    name: asset.name,
    value: asset.value,
    percentage: asset.percentage,
    color: colorMap[asset.color] || '#6b7280',
    count: asset.count,
    change: asset.change
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Valeur: €{data.value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            Part: {data.percentage.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">
            Assets: {data.count}
          </p>
          <p className={`text-sm font-medium ${
            data.change > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            Performance: {data.change > 0 ? '+' : ''}{data.change.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={120}
            dataKey="percentage"
            stroke="#ffffff"
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}