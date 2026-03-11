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

      // Se não tiver dados, coloca um mockup ou array vazio
      const safeData = Array.isArray(dados) && dados.length > 0 ? dados : [
          { data: '01/01', valor: 0 }, { data: '02/01', valor: 0 }
      ];

      const xLabels = safeData.map(d => d.data);
      const yValues = safeData.map(d => d.valor);

      const option: echarts.EChartsOption = {
        tooltip: {
          trigger: 'axis',
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '10%',
            containLabel: true
        },
        xAxis: {
          type: 'category',
          data: xLabels,
          axisLine: { lineStyle: { color: '#ddd' } },
          axisLabel: { color: '#666' }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
              formatter: 'R$ {value}',
              color: '#666'
          },
          splitLine: { lineStyle: { color: '#f5f5f5' } }
        },
        series: [{
            data: yValues,
            type: 'line',
            smooth: true,
            lineStyle: {
                color: '#6B00A1',
                width: 3
            },
            itemStyle: {
                color: '#6B00A1'
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(107, 0, 161, 0.4)' },
                    { offset: 1, color: 'rgba(107, 0, 161, 0.0)' }
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