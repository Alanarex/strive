/**
 * Monthly Stats Line Chart Component
 * Single chart with multiple series and filters
 */
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Line, Polyline, Text as SvgText } from 'react-native-svg';
import globalStyles from '../constants/globalStyles';
import { COLORS } from '../constants/theme';
import { ActivitySummary } from '../types';
import { getMonthlyStats } from '../utils/chartUtils';

interface Props {
  activities: ActivitySummary[];
}

type SeriesKey = 'count' | 'distance' | 'speed' | 'pace';

export default function StatsLineChart({ activities }: Props) {
  const monthlyStats = useMemo(() => getMonthlyStats(activities), [activities]);
  const [chartWidth, setChartWidth] = useState(0);
  const [visibleKeys, setVisibleKeys] = useState<SeriesKey[]>(['count', 'distance', 'speed', 'pace']);

  const series = useMemo(() => {
    const paceValues = monthlyStats.map((s) => (s.speed > 0 ? 60 / s.speed : 0));

    return [
      {
        key: 'count' as SeriesKey,
        label: 'Activités',
        color: COLORS.error,
        data: monthlyStats.map((s) => s.count),
      },
      {
        key: 'distance' as SeriesKey,
        label: 'Distance (km)',
        color: COLORS.warning,
        data: monthlyStats.map((s) => s.distance),
      },
      {
        key: 'speed' as SeriesKey,
        label: 'Vitesse (km/h)',
        color: COLORS.success,
        data: monthlyStats.map((s) => s.speed),
      },
      {
        key: 'pace' as SeriesKey,
        label: 'Allure (min/km)',
        color: COLORS.secondary,
        data: paceValues,
      },
    ];
  }, [monthlyStats]);

  const visibleSeries = series.filter((s) => visibleKeys.includes(s.key));
  const allValues = visibleSeries.flatMap((s) => s.data);
  const maxValue = Math.max(...allValues, 1);

  const chartHeight = 220;
  const padding = { top: 16, right: 16, bottom: 28, left: 36 };
  const innerWidth = Math.max(chartWidth - padding.left - padding.right, 0);
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const xStep = monthlyStats.length > 1 ? innerWidth / (monthlyStats.length - 1) : 0;

  const toggleSeries = (key: SeriesKey) => {
    setVisibleKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const getX = (index: number) => padding.left + index * xStep;
  const getY = (value: number) =>
    padding.top + innerHeight - (value / maxValue) * innerHeight;

  return (
    <View style={globalStyles.card}>
      <Text style={globalStyles.card_title}>Évolution Mensuelle</Text>

      <ScrollView
        horizontal
        style={globalStyles.tags_scrollview}
        contentContainerStyle={globalStyles.tags_container}
        showsHorizontalScrollIndicator={false}
      >
        {series.map((s) => {
          const active = visibleKeys.includes(s.key);
          return (
            <TouchableOpacity
              key={s.key}
              style={[
                globalStyles.tag_chip,
                active && { backgroundColor: s.color }
              ]}
              onPress={() => toggleSeries(s.key)}
            >
              <Text
                style={[{
                  fontSize: 12,
                  fontWeight: active ? '600' : '400',
                  color: active ? COLORS.background : s.color,
                }]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View
        style={globalStyles.chart_container}
        onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
      >
        {chartWidth > 0 && (
          <Svg width={chartWidth} height={chartHeight}>
            {/* Axes */}
            <Line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + innerHeight}
              stroke={COLORS.border}
              strokeWidth={1}
            />
            <Line
              x1={padding.left}
              y1={padding.top + innerHeight}
              x2={padding.left + innerWidth}
              y2={padding.top + innerHeight}
              stroke={COLORS.border}
              strokeWidth={1}
            />

            {/* Y axis labels & grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
              const y = padding.top + innerHeight - innerHeight * t;
              const value = Math.round(maxValue * t);
              return (
                <React.Fragment key={`y-${i}`}>
                  <Line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + innerWidth}
                    y2={y}
                    stroke={COLORS.border}
                    strokeWidth={0.5}
                  />
                  <SvgText
                    x={padding.left - 6}
                    y={y + 4}
                    fill={COLORS.textMuted}
                    fontSize={10}
                    textAnchor="end"
                  >
                    {value}
                  </SvgText>
                </React.Fragment>
              );
            })}

            {/* X axis labels */}
            {monthlyStats.map((stat, i) => (
              <SvgText
                key={`x-${i}`}
                x={getX(i)}
                y={padding.top + innerHeight + 18}
                fill={COLORS.textMuted}
                fontSize={10}
                textAnchor="middle"
              >
                {stat.month}
              </SvgText>
            ))}

            {/* Series lines */}
            {visibleSeries.map((s) => {
              const points = s.data
                .map((value, i) => `${getX(i)},${getY(value)}`)
                .join(' ');
              return (
                <Polyline
                  key={s.key}
                  points={points}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                />
              );
            })}
          </Svg>
        )}
      </View>
    </View>
  );
}
