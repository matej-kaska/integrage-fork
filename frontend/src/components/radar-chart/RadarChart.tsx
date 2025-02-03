import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartEvent,
  type LegendItem,
  type LegendElement,
  type ChartOptions,
  type ChartData,
} from 'chart.js';
import { _DeepPartialObject } from 'chart.js/dist/types/utils';
import { useLayoutEffect, useState } from 'react';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

type RadarChartProps = {
  survey: SurveyResult[];
};

const RadarChart = ({survey}: RadarChartProps) => {
  const [data, setData] = useState<ChartData<'radar'> | null>(null);
  const [options, setOptions] = useState<ChartOptions<'radar'> | null>(null);

  const borderColors = [
    "rgba(218, 92, 87, 1.0)",
    "rgba(0, 173, 220, 1.0)",
    "rgba(154, 202, 60, 1.0)",
    "rgba(246, 138, 66, 1.0)",
    "rgba(0, 51, 153, 1.0)"
  ];
  const backgroundColors = [
    "rgba(218, 92, 87, 0.2)",
    "rgba(0, 173, 220, 0.2)",
    "rgba(154, 202, 60, 0.2)",
    "rgba(246, 138, 66, 0.2)",
    "rgba(0, 51, 153, 0.2)"
  ];

  useLayoutEffect(() => {
		const subTopics = [...new Set(survey[0].results.map((result) => result.sub_topic.name))];

    const datasets = survey.map((survey, index) => {
      return {
        label: new Date(survey.updated_at).toLocaleDateString("cs-CZ", {hour: '2-digit',minute: '2-digit'}),
        data: survey.results.map((result) => (result.actual_points / result.total_points) * 100),
        backgroundColor: backgroundColors[index],
        pointBackgroundColor: borderColors[index],
        borderColor: borderColors[index],
        borderWidth: 1,
        hidden: index !== 0 && true
      };
    });

    const data: ChartData<'radar'> = {
      labels: subTopics,
      datasets: datasets,
    };

    const options: ChartOptions<'radar'>  = {
      responsive: true,
      scales: {
        r: {
          angleLines: {
            display: true,
          },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: {
            stepSize: 20,
            callback: (value: string | number) => {
              if (Number(value) % 20 === 0) return value;
            },
          },
          pointLabels: {
            font: {
              size: 15
            },
            callback: (label: string) => {
              const maxChar = 15;
              let currentSliceEnd = 0;
              let nextSliceStart = 0;
              const result = [];

              while (nextSliceStart < label.length) {
                currentSliceEnd = label.indexOf(' ', nextSliceStart + maxChar);
                if (currentSliceEnd === -1 || currentSliceEnd - nextSliceStart > maxChar) {
                  if (nextSliceStart + maxChar >= label.length) {
                    currentSliceEnd = label.length;
                  } else {
                    const lastSpaceBeforeLimit = label.lastIndexOf(' ', nextSliceStart + maxChar);
                    if (lastSpaceBeforeLimit > nextSliceStart) {
                      currentSliceEnd = lastSpaceBeforeLimit;
                    } else {
                      currentSliceEnd = nextSliceStart + maxChar;
                    }
                  }
                }
                const currentSlice = label.slice(nextSliceStart, currentSliceEnd).trim();
                if (currentSlice) result.push(currentSlice);
                nextSliceStart = currentSliceEnd + 1;
              }

              return result.length > 0 ? result : label;
            },
          },
        },
      },
      animation: {
        duration: 300
      },
      plugins: {
        legend: {
          position: "bottom",
          onHover: (e: ChartEvent, legendItem: LegendItem, legend: LegendElement<"radar">) => {
            const target = e.native?.target as HTMLElement;
            if (target.style) {
              target.style.cursor = legendItem ? "pointer" : "default";
            }
            if (!legendItem || !legend) return;
            const dataset = legend.chart.data.datasets?.[0];
            if (dataset) {
                for (let index = 0; index < legend.chart.data.datasets.length; index++) {
                const dataset = legend.chart.data.datasets[index];
                const backgroundColor = dataset?.backgroundColor as string;
                const borderColor = dataset?.borderColor as string;
                if (index !== legendItem.datasetIndex) {
                  dataset.backgroundColor = `${backgroundColor?.slice(0, backgroundColor.length - 2)}1)`;
                  dataset.borderColor = `${borderColor?.slice(0, borderColor.length - 4)}0.2)`;
                }
              }
            }
            legend.chart.update();
          },
          onLeave: (e: ChartEvent, legendItem: LegendItem, legend: LegendElement<"radar">) => {
            const target = e.native?.target as HTMLElement;
            if (target.style) target.style.cursor = "default";
            if (!legendItem || !legend) return;
            const dataset = legend.chart.data.datasets?.[0];
            if (dataset) {
              for (let i = 0; i < legend.chart.data.datasets.length; i++) {
                const dataset = legend.chart.data.datasets[i];
                const backgroundColor = dataset?.backgroundColor as string;
                const borderColor = dataset?.borderColor as string;
                dataset.backgroundColor = `${backgroundColor?.slice(0, backgroundColor.length - 2)}2)`;
                dataset.borderColor = `${borderColor?.slice(0, borderColor.length - 4)}1.0)`;
              }
            }
            legend.chart.update();
          }
        },
      },
    };

    setOptions(options);
    setData(data);
	}, [survey]);

  if (!data || !options || survey.length === 0) return null;

  return (
    <Radar className="radar-chart" data={data} options={options}/>
  );
};

export default RadarChart;
