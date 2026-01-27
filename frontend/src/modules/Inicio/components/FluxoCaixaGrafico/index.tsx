/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect } from "react";
import * as echarts from 'echarts';

interface FluxoCaixaGraficoProps {
  dados: any;
}

export const FluxoCaixaGrafico: React.FC<FluxoCaixaGraficoProps> = ({
  dados
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const myChart = echarts.init(chartRef.current);

      const option: echarts.EChartsOption = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['Ago 2023', 'Set 2023', 'Out 2023', 'Nov 2023', 'Dec 2023', 'Jan 2024']
        },
        yAxis: {
          type: 'value',
          axisLabel: {
              formatter: 'RS {value}'
          }
        },
        series: [{
            data: [35000, 10000, 0, -500, -1000, -1000], // Valores em Reais
            type: 'line',
            smooth: true,
            lineStyle: {
                color: '#5470C6',
                width: 3
            },
            itemStyle: {
                color: '#5470C6'
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(84, 112, 198, 0.5)' },
                    { offset: 1, color: 'rgba(84, 112, 198, 0.1)' }
                ])
            }
        }]
      };

      myChart.setOption(option);

      const handleResize = () => myChart.resize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        myChart.dispose();
      };
    }
  }, [dados]);

  return <div ref={chartRef} className="w-full h-[250px]"></div>;
}