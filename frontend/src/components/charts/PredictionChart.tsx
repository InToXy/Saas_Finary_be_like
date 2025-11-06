import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface PredictionChartProps {
  data: Array<{
    date: string;
    actual: number;
    predicted: number;
    confidence?: number;
  }>;
  currency?: string;
}

export function PredictionChart({ data, currency = '€' }: PredictionChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const actualData = payload.find((p: any) => p.dataKey === 'actual');
      const predictedData = payload.find((p: any) => p.dataKey === 'predicted');
      
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {actualData && (
            <p className="text-sm text-blue-600">
              Réel: {currency}{actualData.value?.toLocaleString()}
            </p>
          )}
          {predictedData && (
            <p className="text-sm text-purple-600">
              Prédit: {currency}{predictedData.value?.toLocaleString()}
            </p>
          )}
          {payload[0]?.payload?.confidence && (
            <p className="text-sm text-gray-600">
              Confiance: {payload[0].payload.confidence.toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${currency}${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${currency}${(value / 1000).toFixed(1)}K`;
    }
    return `${currency}${value}`;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={formatYAxis}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            name="Prix Réel"
          />
          
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
            name="Prix Prédit"
          />
          
          {/* Ligne verticale pour séparer historique et prédiction */}
          <ReferenceLine 
            x={data.length > 10 ? data[data.length - 5]?.date : data[Math.floor(data.length / 2)]?.date} 
            stroke="#6b7280" 
            strokeDasharray="2 2" 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}