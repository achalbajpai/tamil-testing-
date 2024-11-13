import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SentimentChartProps {
  sentiments: {
    happy: number;
    sad: number;
    mixed: number;
  };
}

const COLORS = ['#4ade80', '#f87171', '#fbbf24'];

export const SentimentChart: React.FC<SentimentChartProps> = ({ sentiments }) => {
  const data = [
    { name: 'Happy', value: sentiments.happy },
    { name: 'Sad', value: sentiments.sad },
    { name: 'Mixed', value: sentiments.mixed },
  ];

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}