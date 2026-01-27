/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect } from "react";
import * as echarts from 'echarts';

interface VendasGraficoProps {
  dados: any;
}

export const VendasGrafico: React.FC<VendasGraficoProps> = ({
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
          grid: {
            left: '8%',
            right: '8%',
            bottom: '15%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: dados?.meses,
            axisLabel: {
              rotate: 45
            }
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              data: dados?.valores,
              type: 'line',
              smooth: false,
              // symbol: 'circle',
              symbolSize: 8,
              lineStyle: {
                width: 4,
                color: '#004b75'
              },
              itemStyle: {
                color: '#004b75'
              },
            }
          ]
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