import React from 'react';

interface PieChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  size?: number;
  showLabels?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  size = 200, 
  showLabels = true 
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">No data</p>
        </div>
      </div>
    );
  }

  let cumulativePercentage = 0;
  const radius = (size - 20) / 2;
  const centerX = size / 2;
  const centerY = size / 2;

  const createPath = (percentage: number, startPercentage: number) => {
    const startAngle = (startPercentage * 360 - 90) * (Math.PI / 180);
    const endAngle = ((startPercentage + percentage) * 360 - 90) * (Math.PI / 180);
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = percentage > 0.5 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="drop-shadow-lg">
        {data.map((item, index) => {
          const percentage = item.value / total;
          const path = createPath(percentage, cumulativePercentage);
          const currentCumulative = cumulativePercentage;
          cumulativePercentage += percentage;
          
          return (
            <g key={index}>
              <path
                d={path}
                fill={item.color}
                className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              />
            </g>
          );
        })}
        
        {/* Center circle for donut effect */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.6}
          fill="white"
          className="dark:fill-gray-800"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
          }}
        />
        
        {/* Center text */}
        <text
          x={centerX}
          y={centerY - 5}
          textAnchor="middle"
          className="text-sm font-bold fill-gray-900 dark:fill-white"
        >
          Total
        </text>
        <text
          x={centerX}
          y={centerY + 10}
          textAnchor="middle"
          className="text-xs fill-gray-600 dark:fill-gray-400"
        >
          ${total.toLocaleString()}
        </text>
      </svg>
      
      {showLabels && (
        <div className="mt-4 space-y-2 w-full max-w-xs">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  ${item.value.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {((item.value / total) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};