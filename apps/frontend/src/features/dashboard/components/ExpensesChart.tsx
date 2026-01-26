import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { ChartData } from '../types';
import { formatCurrency } from '../../../utils/formatters';

interface Props {
  data: ChartData[];
  isLoading: boolean;
}

export const ExpensesChart = ({ data, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="h-75 flex items-center justify-center bg-white rounded-xl border border-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-75 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 text-gray-400">
        <p>No hay gastos registrados en este período.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Distribución de Gastos
      </h3>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60} // Esto lo hace tipo "Dona"
              outerRadius={80}
              paddingAngle={5}
              dataKey="total"
              nameKey="categoryName"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  strokeWidth={0}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value: number | string | undefined) =>
                formatCurrency(Number(value || 0))
              }
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />

            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
